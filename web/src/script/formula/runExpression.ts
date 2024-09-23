/**
 * 数学算式执行逻辑
 *
 * @author 刘志栋
 * @since 2024-09-08
 */

// math和logic模块暂时以JS格式保留
// @ts-ignore
import * as Math from "./math";

// // 获取math.js中的所有函数名称，用于判断公式中是否包含函数
// let functionNames = [];
// import("./math.js").then(res => {
//     functionNames = Object.keys(res);
// });

/**
 *
 * 判断运算符号，转化为求值方法求值
 */
export function runFormula(operator: string, args: any[]): any {
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
            return args[0] < args[1];
        case '<=':
            return args[0] <= args[1];
        case '>':
            return args[0] > args[1];
        case '>=':
            return args[0] >= args[1];
        case '=':
        case '==':
            return args[0] == args[1];
        case '!=':
        case '<>':
            return args[0] != args[1];
        case '&&':
            return args[0] && args[1];
        case '||':
            return args[0] || args[1];
        default:
            // TODO 运算符未识别提示方式
            console.error('未识别的运算符: ', operator);
            throw new Error('未识别的运算符: ' + operator);
    }
}
