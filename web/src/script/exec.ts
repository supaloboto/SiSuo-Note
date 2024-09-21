import { LogicNode, Calc, Constant, Variable } from "./logicTree";
import { runFormula } from "./formula/runExpression";
import { getShortID } from "@/assets/utils/idworker";

/**
 * 执行逻辑节点树
 * 
 * @author 刘志栋
 * @since 2024-09-08
 */

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
        // 更新此变量值的获取流程 并直接触发值更新
        this._getValue.push(func);
        this.update();
    }

    update() {
        this._getValue.forEach((func) => {
            this.value = func();
        });
    }

    get value(): any {
        return this._value;
    }

    set value(value: any) {
        this._value = value;
        this._onValueChange.forEach(evt => evt(this));
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
        // 递归逻辑树 整理变量的变化过程
        this.walkThroughLogic(logicTreeRoot);
        // 整理输出变量
        const outputs = logicTreeRoot.variables.map((define: Variable): ExecutedVariable => {
            return this.variableMap[define.name];
        });
        // 如果是引用类变量 给逻辑树上的所有节点添加值变化事件
        //TODO 检查循环引用
        outputs.forEach(output => {
            if (output.type !== 'ref') {
                return;
            }
            this.setupRefer(output);
        });
        // 返回
        return outputs;
    }

    // 递归逻辑树 整理变量的变化过程
    walkThroughLogic(node: LogicNode): any {
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
                // 如果是返回节点则返回值
                return this.getValue(node.params[0]);
            }
        }
        // 递归
        if (node.execNodes) {
            let result = null;
            node.execNodes.forEach((child) => {
                result = this.walkThroughLogic(child);
            });
            return result;
        }
        return null;
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
            let result = null;
            node.execNodes.forEach((child) => {
                // 逐行运行
                result = this.walkThroughLogic(child);
            });
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
