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
    // 变量的值
    private _excutedValue: any;
    // 变量变化时触发的事件
    private _onValueChange: { id: string, event: Function }[] = [];

    constructor(name: string, value: any) {
        this._name = name;
        this._excutedValue = value;
    }

    addChangeEvt(event: Function): string {
        const id = getShortID();
        this._onValueChange.push({ id, event });
        return id;
    }

    removeChangeEvt(evt: string | Function) {
        if (typeof evt === 'string') {
            this._onValueChange = this._onValueChange.filter(e => e.id !== evt);
        } else {
            this._onValueChange = this._onValueChange.filter(e => e.event !== evt);
        }
    }

    triggerChangeEvt() {
        this._onValueChange.forEach(e => e.event(this));
    }

    get name(): string {
        return this._name;
    }

    get value(): any {
        return this._excutedValue;
    }

    set value(newValue: any) {
        this._excutedValue = newValue;
        this.triggerChangeEvt();
    }
}

/**
 * 获取逻辑输出的变量
 * @param defines 变量定义列表 所有的定义都会被转为输出
 * @param inputs 输入数据列表
 */
export function getOutputs(defines: Variable[], inputs: ExecutedVariable[]): ExecutedVariable[] {
    // 整理全部变量信息
    const variableMap: { [key: string]: ExecutedVariable } = {};
    inputs.forEach((param) => {
        variableMap[param.name] = param;
    });
    // 生成引用
    return defines.map((define: Variable): ExecutedVariable => {
        const varRef = new ExecutedVariable(define.name, getValue(define.value, variableMap));
        // 处理引用类型的变量 使其具备响应式的更新
        if (define.type === 'ref') {
            if (define.value instanceof Variable) {
                // 当引用源是变量时 如果引用源的值变化则触发引用变量的值变化
                const sourceVar = define.value as Variable;
                //TODO 处理变量找不到时的情况
                variableMap[sourceVar.name].addChangeEvt((self: ExecutedVariable) => {
                    varRef.value = self.value;
                });
            } else if (define.value instanceof Calc) {
                // 当引用源为计算时 如果整个计算逻辑树中有任何一个变量更新了则重新计算
                setupCalc(varRef, define.value as Calc, variableMap);
            }
        }
        // 记录值 用于值的相互引用
        variableMap[define.name] = varRef;
        return varRef;
    });
}

/**
 * 获取节点值的方法
 */
function getValue(node: LogicNode, variableMap: { [key: string]: ExecutedVariable }): any {
    if (node instanceof Calc) {
        const calcNode = node as Calc;
        // 计算节点进行递归计算
        return runFormula(calcNode.func, calcNode.params.map(param => getValue(param, variableMap)));
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
        if (variableMap[variable.name]) {
            return variableMap[variable.name].value;
        } else {
            //TODO 未定义的变量
            return NaN;
        }
    }
    return null;
}

/**
 * 设置响应式计算的方法
 */
function setupCalc(calcResult: ExecutedVariable, calcNode: Calc, variableMap: { [key: string]: ExecutedVariable }) {
    // 向下递归 给Calc树中所有对应了变量的节点添加值变化事件
    const giveAllVariableChildEvt = (calcParent: Calc) => {
        calcParent.params.forEach(param => {
            if (param instanceof Variable) {
                //TODO 处理变量找不到时的情况
                variableMap[param.name].addChangeEvt(() => {
                    calcResult.value = getValue(calcNode, variableMap);
                });
            } else if (param instanceof Calc) {
                giveAllVariableChildEvt(param as Calc);
            }
        });
    }
    // 执行递归
    giveAllVariableChildEvt(calcNode);
}
