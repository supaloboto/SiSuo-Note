/**
 * @deprecated 为了保持兼容性而留存
 * @description 数学算式执行工具 将算式拆解为二叉树 然后递归执行 以使手写算式也能套用DecimalJs以保证精度
 * @author 刘志栋
 * @version 1.0
 * @since 23.02.02
 */
import * as Math from './math';
import * as Logic from './logic';

// 获取math.js中的所有函数名称，用于判断公式中是否包含函数
let functionNames = [];
import("./math.js").then(res => {
    functionNames = Object.keys(res);
});

/**
 *
 * 判断运算符号，转化为求值方法求值
 */
export function runFormula(operator, args) {
    // 判断运算符号，转化为求值方法求值 可处理的计算符号 + - * / %
    switch (operator) {
        case '+':
            return Math.ADD(...args);
        case '-':
            return Math.SUB(...args);
        case '*':
            return Math.MUL(...args);
        case '/':
            return Math.DIV(...args);
        case '%':
            return Math.MOD(...args);
        case '<':
            return Logic.LESS(...args);
        case '<=':
            return Logic.LESSEQUAL(...args);
        case '>':
            return Logic.GREATER(...args);
        case '>=':
            return Logic.GREATEREQUAL(...args);
        case '=':
        case '==':
            return Logic.EQUAL(...args);
        case '!=':
        case '<>':
            return !Logic.EQUAL(...args);
        default:
            // TODO 运算符未识别提示方式
            console.error('未识别的运算符: ', operator);
    }
}
