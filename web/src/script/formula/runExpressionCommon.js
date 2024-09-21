import {runFormula as executeFormula} from './runExpression'
import * as Math from './math.js';
import * as Date from './date.js';
import * as String from './string.js';
// 获取math.js中的所有函数名称，用于判断公式中是否包含函数
let functionNames = [];
import("./math.js").then(res => {
    functionNames = Object.keys(res);
});
// 获取日期相关计算公式
let dateFunctionNames = [];
import("./date").then(res => {
    dateFunctionNames = Object.keys(res);
});
// 获取字符串相关公式
let stringFunctionNames = [];
import("./string").then(res => {
    stringFunctionNames = Object.keys(res);
});

/**
 * 运行公式
 */
export const runFormula = (operator, ...args) => {
    // 此处有两种情况，普通运算符号和函数运算 函数运算不止两个参数
    // 函数运算
    if (functionNames.includes(operator)) {
        return Math[operator](...args);
    } else if (dateFunctionNames.includes(operator)) {
        // 进行日期运算
        return Date[operator](...args);
    } else if (stringFunctionNames.includes(operator)) {
        // 进行字符串运算
        return String[operator](...args);
    } else if (logicFunctionNames.includes(operator)) {
        // 进行逻辑运算
        return Logic[operator](...args);
    } else if (['X', 'Y', 'x', 'y'].includes(operator)) {
        // 用于计算斜率和截距公式, 直接返回X值集合和Y值集合
        return args;
    }
    // 以下普通运算符运算必须有两个参数，如果不是两个参数，则提示公式错误
    if (args.length !== 2) {
        // TODO 公式错误提示方式
        console.error('公式错误');
        return NaN;
    }
    // 普通运算符运算
    return executeFormula(operator, args);
}

/**
 * 把参数列表中的undefined null 空字符串 NaN从参数中去掉
 */
export function removeEmptyArgs(args) {
    // 隐式传参的arguments并非数组,在此转换为数组
    const argArray = [...args];
    return argArray.filter(arg => arg !== undefined && arg !== null && arg !== '' && !Number.isNaN(arg));
}

/**
 * 检查参数列表中是否存在undefined null 空字符串 存在则报错
 */
export function alertEmptyArgs(args) {
    const argArray = [...args];
    if (argArray.some(arg => arg === undefined || arg === null || arg === '')) {
        console.error('公式参数存在空值');
        throw new Error();
    }
}

/**
 * 把参数全部转为数字 遇到非数字报错
 */
export function argsToNumber(args) {
    const argArray = [...args];
    return argArray.map(arg => {
        if (isNaN(Number(arg))) {
            console.error('公式参数非数字');
            throw new Error();
        }
        return Number(arg);
    });
}
