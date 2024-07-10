import {computed, ref} from "vue";
import {Calc, Constant, Param} from "@/ScriptExecDemo/treeRender";
import {runFormula} from "@/ScriptExecDemo/formula/runExpression";

/**
 * 获取变量引用
 * @param varDefineList 变量定义列表
 * @param inputList 输入数据列表
 */
export function getValueRefs(varDefineList, inputList) {
    // 整理参数输入
    const inputMap = {};
    inputList.forEach(input => {
        inputMap[input.name] = input;
    });
    // 整理输出列表
    const refs = {};
    const getValue = (calcNode) => {
        if (calcNode instanceof Calc) {
            // 计算节点向下递归
            return runFormula(calcNode.func, calcNode.params.map(param => getValue(param)));
        } else if (calcNode instanceof Constant) {
            // 常量节点如果是数字则进行转化
            if (!isNaN(calcNode.value)) {
                return Number(calcNode.value);
            } else {
                return calcNode.value;
            }
        } else if (calcNode instanceof Param) {
            // 参数节点从入参和定义中分别寻找
            if (inputMap[calcNode.name]) {
                const inputRef = inputMap[calcNode.name];
                return inputRef.value;
            } else if (refs[calcNode.name]) {
                const refObj = refs[calcNode.name].refObj;
                return refObj.value;
            } else {
                return NaN;
            }
        }
    }
    // 生成引用
    return varDefineList.map(define => {
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
            refs[define.name] = varRef;
        }
        return varRef;
    });
}