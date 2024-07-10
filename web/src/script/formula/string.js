import {removeEmptyArgs} from './runExpressionCommon'

/**
 * 从第一个字符开始截取指定长度的字符
 */
export function LEFT() {
    const args= removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    return args[0].substring(0, args[1]);
}

/**
 * 从最后一个字符开始向前截取指定长度的字符
 */
export function RIGHT() {
    const args= removeEmptyArgs(arguments);
    if (args.length !== 2 || !Number(args[1])) {
        return '';
    }
    return args[0].substring(args[0].length - args[1]);
}

/**
 * 从指定字符开始截取指定长度的字符
 */
export function MID() {
    const args= removeEmptyArgs(arguments);
    if (args.length !== 3 || !Number(args[2])) {
        return '';
    }
    return args[0].substring(args[1] - 1, args[1] - 1 + Number(args[2]));
}

/**
 * 返回指定字符串的长度
 */
export function LEN() {
    const args= removeEmptyArgs(arguments);
    if (args.length !== 1) {
        return '';
    }
    return args[0].length;
}

/**
 * 返回指定字符串的拼接
 */
export function CONCAT() {
    const args= removeEmptyArgs(arguments);
    if (args.length === 0) {
        return '';
    }
    let result = '';
    for (const element of args) {
        // 过滤掉undefined null和NaN
        if (element === undefined || element === null || Number.isNaN(element)) {
            continue;
        }
        result += element;
    }
    return result;
}

/**
 * 查找字符串
 */
export function FIND() {
    const args= removeEmptyArgs(arguments);
    if (args.length !== 3 && args.length !== 2) {
        return '';
    }
    if (args[0] === undefined || args[0] === null || !args[1]) {
        throw new Error();
    }
    // 开始位置
    let startNum = args[2] === undefined ? 1 : args[2];
    return args[0].indexOf(args[1], startNum - 1) === -1 ? '' : args[0].indexOf(args[1], startNum - 1) + 1;
}
