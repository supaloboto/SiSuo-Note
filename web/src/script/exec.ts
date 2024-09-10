import { LogicNode, Calc, Constant, Variable } from "./logicTree";
import { runFormula } from "./formula/runExpression";

/**
 * 执行逻辑节点树
 * 
 * @author 刘志栋
 * @since 2024-09-08
 */

/**
 * 获取逻辑输出的变量
 * @param defines 变量定义列表 所有的定义都会被转为输出
 * @param inputs 输入数据列表
 */
export function getOutputs(defines: Variable[], inputs: Variable[]): Variable[] {
    // 整理全部变量信息
    const variableMap: { [key: string]: Variable } = {};
    inputs.forEach((param) => {
        variableMap[param.name] = param;
    });
    // 生成引用
    return defines.map((define: Variable): Variable => {
        const varRef = new Variable(define.name, define.type, getValue(define.value, variableMap));
        // 处理引用类型的变量 使其具备响应式的更新
        if (define.type === 'ref') {
            if (define.value instanceof Variable) {
                // 当引用源是变量时 如果引用源的值变化则触发引用变量的值变化
                const sourceVar = define.value as Variable;
                sourceVar.addChangeEvt(() => {
                    varRef.value = getValue(sourceVar, variableMap);
                });
            } else if (define.value instanceof Calc) {
                //TODO 计算节点
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
function getValue(node: LogicNode, variableMap: { [key: string]: Variable }): LogicNode {
    if (node instanceof Calc) {
        const calcNode = node as Calc;
        //TODO 计算节点
        // return runFormula(calcNode.func, calcNode.params.map(param => getValue(param)));
        return new Constant(null);
    } else if (node instanceof Constant) {
        // 常量节点如果是数字则进行转化
        const constant = node as Constant;
        if (!isNaN(constant.value)) {
            return new Constant(Number(constant.value));
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
            return new Constant(NaN);
        }
    }
    return new Constant(null);
}
