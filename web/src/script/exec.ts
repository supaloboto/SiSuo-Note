import { LogicNode, Calc, Constant, Variable, Branch, Loop } from "./logicTree";
import { runFormula } from "./formula/runExpression";

/**
 * 执行逻辑节点树
 * 
 * @author 刘志栋
 * @since 2024-09-08
 */

// 逻辑树执行状态
const STATE_GO = 0;
const STATE_RETURN = 1;
const STATE_BREAK = 2;
const STATE_CONTINUE = 3;

/**
 * 经过函数执行后生成的变量 可以直接获取值
 */
export class ExecutedVariable {
    // 变量名
    private _name: string;
    // 变量类型 var|ref
    private _type: string = 'var';
    // 变量的值
    private _getValue: Function[] = [];
    private _value: any;
    // 变量变化时触发的事件
    private _onValueChange: Function[] = [];
    // 值更新中的标识 当值处于更新过程中 依赖的变化不会再次触发值更新 防止循环引用导致的死循环
    private _updating: boolean = false;

    constructor(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value;
    }

    addChangeEvt(event: Function) {
        this._onValueChange.push(event);
    }

    addValueFlow(func: Function) {
        // 更新此变量值的获取流程 并更新值
        this._getValue.push(func);
        this.value = func();
    }

    update() {
        // 更新值
        if (this._updating) {
            return;
        }
        this._updating = true;
        // 将值置为null 将整个获取流程重新执行一遍
        this._value = null;
        this._getValue.forEach((func) => {
            this._value = func();
        });
        // 值更新完成后触发事件
        this._onValueChange.forEach(evt => evt(this));
        this._updating = false;
    }

    get value(): any {
        return this._value;
    }

    set value(value: any) {
        if (this._updating) {
            return;
        }
        this._updating = true;
        this._value = value;
        this._onValueChange.forEach(evt => evt(this));
        this._updating = false;
    }
}

/**
 * 逻辑树执行工具
 */
export class Exec {
    // 变量映射表 逻辑中出现的所有变量都会在这里记录
    private variableMap: { [key: string]: ExecutedVariable } = {};
    // 变量收集缓存 在设置响应计算时会用到 用来追踪所有与目标变量有关的数据 为null代表不启用
    private relatedValueCacheSet: Set<ExecutedVariable> | null = null;

    constructor() {
    }

    /**
     * 获取逻辑输出的变量
     * @param logicTreeRoot 逻辑树的根节点
     * @param inputs 输入数据列表
     */
    getOutputs(logicTreeRoot: LogicNode, inputs: ExecutedVariable[]): ExecutedVariable[] {
        // 整理全部变量信息
        this.variableMap = {};
        inputs.forEach((param) => {
            this.variableMap[param.name] = param;
        });
        // 遍历逻辑树根部 整理变量的变化过程
        this.walkThroughLogic(logicTreeRoot);
        // 整理输出变量
        const outputs = logicTreeRoot.variables.map((define: Variable): ExecutedVariable => {
            return this.variableMap[define.name];
        });
        // 如果是引用类变量 给逻辑树上的所有节点添加值变化事件
        outputs.forEach(output => {
            if (output.type !== 'ref') {
                return;
            }
            this.setupRefer(output);
        });
        // 返回
        return outputs;
    }

    /**
     * 递归逻辑树 整理变量的变化过程
     * @returns [返回值, 执行状态 0/1/2]
     */
    walkThroughLogic(node: LogicNode): [any, number] {
        // 执行当前逻辑节点
        if (node instanceof Variable) {
            // 如果是变量声明节点 则记录逻辑和变量之间的关系
            const variable = node as Variable;
            const executedVariable = new ExecutedVariable(variable.name);
            executedVariable.type = variable.type;
            executedVariable.addValueFlow(() => this.getValue(variable.value));
            this.variableMap[variable.name] = executedVariable;
        } else if (node instanceof Calc) {
            if (node.func === '=') {
                // 如果是计算节点则执行计算
                const variable = node.params[0] as Variable;
                const executedVariable = this.variableMap[variable.name];
                if (!executedVariable) {
                    //TODO 未定义的变量
                    throw new Error(`未定义的变量:${variable.name}`);
                }
                executedVariable.addValueFlow(() => this.getValue(node.params[1]));
            } else if (node.func === 'return') {
                // 如果是返回节点则返回值 并结束执行
                return [this.getValue(node.params[0]), STATE_RETURN];
            } else if (node.func === 'break') {
                // break节点打断执行
                return [null, STATE_BREAK];
            } else if (node.func === 'continue') {
                // continue节点跳过当前循环
                return [null, STATE_CONTINUE];
            }
        } else if (node instanceof Branch) {
            // 如果是分支节点则检查分支条件 并执行对应分支
            const branch = node as Branch;
            const conditions: LogicNode[] = branch.conditions;
            for (let i = 0; i < conditions.length; i++) {
                const condition = conditions[i];
                if (this.getValue(condition)) {
                    return this.walkThroughLogic(branch.branches[i]);
                }
            }
        } else if (node instanceof Loop) {
            // 如果是循环节点则根据循环类型执行循环
            const loop = node as Loop;
            if (loop.type === 'for') {
                const { cursor, condition, cursorChange, execNodes } = loop;
                // 初始化循环变量
                this.walkThroughLogic(cursor!);
                // 执行循环体
                while (this.getValue(condition!)) {
                    const [result, end] = this.walkThroughLogic(execNodes[0]);
                    // break和return都会跳出循环 但对外层来说 RETURN需要传递出去而BREAK不需要
                    if (end && end !== STATE_CONTINUE) {
                        if (end === STATE_BREAK) {
                            return [null, STATE_GO];
                        }
                        return [result, STATE_RETURN];
                    }
                    // 更新循环变量
                    this.walkThroughLogic(cursorChange!);
                }
                // 正常结束循环的话是不会有返回值的
                return [null, STATE_GO];
            } else if (loop.type === 'while') {
                const { condition, execNodes } = loop;
                // 执行循环体
                while (this.getValue(condition!)) {
                    const [result, end] = this.walkThroughLogic(execNodes[0]);
                    if (end) {
                        if (end === STATE_BREAK) {
                            return [null, STATE_GO];
                        }
                        return [result, STATE_RETURN];
                    }
                }
                return [null, STATE_GO];
            }
        } else if (node.execNodes) {
            // 递归
            for (let i = 0; i < node.execNodes.length; i++) {
                const child = node.execNodes[i];
                const [result, end] = this.walkThroughLogic(child);
                if (end) {
                    return [result, end];
                } else if (i === node.execNodes.length - 1) {
                    return [result, STATE_GO];
                }
            }
        }
        return [null, STATE_GO];
    }

    /**
     * 获取节点值的方法
     */
    getValue(node: LogicNode): any {
        if (node instanceof Calc) {
            const calcNode = node as Calc;
            // 计算节点进行递归计算
            return runFormula(calcNode.func, calcNode.params.map(param => this.getValue(param)));
        } else if (node instanceof Constant) {
            // 常量节点如果是数字则进行转化
            const constant = node as Constant;
            if (!isNaN(constant.value)) {
                return Number(constant.value);
            } else {
                return constant.value;
            }
        } else if (node instanceof Variable) {
            // 处理变量
            const variable = node as Variable;
            if (this.variableMap[variable.name]) {
                // 记录此变量的依赖关系
                const executedVariable = this.variableMap[variable.name];
                if (this.relatedValueCacheSet) {
                    this.relatedValueCacheSet.add(executedVariable);
                }
                return executedVariable.value;
            } else {
                //TODO 未定义的变量
                return NaN;
            }
        } else if (node.execNodes.length > 0) {
            // 处理值为函数返回值的情况
            const [result, end] = this.walkThroughLogic(node);
            return result;
        }
        return null;
    }

    /**
     * 设置响应式计算的方法
     */
    setupRefer(refValue: ExecutedVariable) {
        // 触发值的更新 在这个过程中收集依赖
        this.relatedValueCacheSet = new Set();
        refValue.update();
        // 从收集到的依赖中去掉自己
        this.relatedValueCacheSet.delete(refValue);
        // 给所有关联的变量添加修改事件
        this.relatedValueCacheSet.forEach((relatedValue) => {
            relatedValue.addChangeEvt(() => {
                refValue.update();
            });
        });
        // 清空缓存
        this.relatedValueCacheSet = null;
    }

}
