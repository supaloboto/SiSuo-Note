import { computed, ref, type ComputedRef, type Ref } from "vue";
import { LogicNode, Calc, Constant, Reference, Variable } from "./treeRender";
import { runFormula } from "./formula/runExpression";

/**
 * 执行逻辑节点树
 * 
 * @author 刘志栋
 * @since 2024-09-08
 */

/**
 * 获取变量引用
 * @param varDefineList 变量定义列表
 * @param inputList 输入数据列表
 */
export function getValueRefs(defines: Variable[], params: { name: string, value: Ref | ComputedRef }[]) {
    // 整理参数输入
    const inputRefsMap: { [key: string]: Ref | ComputedRef } = {};
    params.forEach(param => {
        inputRefsMap[param.name] = param.value;
    });
    // 整理输出列表
    const outputRefsMap: { [key: string]: { name: string, refObj: Ref | ComputedRef } } = {};
    // 获取节点值的方法
    const getValue = (node: LogicNode): any => {
        if (node instanceof Calc) {
            const calcNode = node as Calc;
            //TODO 计算节点
            return runFormula(calcNode.func, calcNode.params.map(param => getValue(param)));
        } else if (node instanceof Constant) {
            // 常量节点如果是数字则进行转化
            const constant = node as Constant;
            if (!isNaN(constant.value)) {
                return Number(constant.value);
            } else {
                return constant.value;
            }
        } else if (node instanceof Variable) {
            // 处理内部定义的变量
            const variable = node as Variable;
            if (outputRefsMap[variable.name]) {
                return outputRefsMap[variable.name].refObj.value;
            } else {
                //TODO 未定义的变量
                return NaN;
            }
        } else if (node instanceof Reference) {
            // 处理外部引用的变量
            const reference = node as Reference;
            if (inputRefsMap[reference.name]) {
                return inputRefsMap[reference.name].value;
            } else {
                //TODO 未定义的变量
                return NaN;
            }
        }
    }
    // 生成引用
    return defines.map((define: Variable) => {
        let varRef = null;
        if (define.type === 'var') {
            varRef = {
                name: define.name, refObj: ref(getValue(define.value))
            };
        } else if (define.type === 'ref') {
            varRef = {
                name: define.name, refObj: computed(() => getValue(define.value))
            };
        }
        // 记录值 用于值的相互引用
        if (varRef) {
            outputRefsMap[define.name] = varRef;
        }
        return varRef;
    });
}
