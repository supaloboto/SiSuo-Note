/**
 * 逻辑公式
 *
 * @author 刘志栋
 * @since 2023/12/22
 */
import {argsToNumber, removeEmptyArgs} from "./runExpressionCommon";

/**
 * 如果正确
 * IF（判断条件，满足条件的值，不满足条件的值）
 */
export function IF() {
    // 第一个参数为公式分步计算的方法
    const [calcStep, ...args] = arguments;
    // 至少有两个参数，第三个参数可省略，第三个参数省略时不满足条件的值返回false
    if (args.length < 2) {
        return '';
    }
    // 传过来的是公式
    const [conditionFormula, trueFormula, errorFormula] = args;
    // 计算条件公式的结果
    const conditionValue = calcStep(conditionFormula);
    const isEmpty = (val) => val === null || val === undefined;
    // 如果没有传入条件则不进行逻辑判断
    if (!conditionValue) return '';
    // 第一个参数为真时返回第二个参数，为假时返回第三个参数，第三个参数未定义时返回false
    if (Boolean(conditionValue) && conditionValue !== '0' && conditionValue !== 'false') {
        const trueValue = calcStep(trueFormula);
        return isEmpty(trueValue) ? '' : trueValue; // 将undfined替换成空字符串返回
    } else if (errorFormula === undefined) { // 第三个参数没配时返回false
        return false;
    } else {
        const errorValue = calcStep(errorFormula);
        return isEmpty(errorValue) ? '' : errorValue; // 将undfined替换成空字符串返回
    }
}

/**
 * 如果错误
 * IFERROR(需要计算的公式，当公式错误指定返回的值)
 */
export function IFERROR() {
    // 第一个参数为公式分步计算的方法
    const [calcStep, ...args] = arguments;
    if (args.length !== 2) {
        return '';
    }
    // 传过来的是公式
    const [conditionFormula, errorFormula] = args;
    // 计算条件公式的结果
    const conditionValue = calcStep(conditionFormula);
    // 当公式计算出错时，返回第二个参数
    if (!Boolean(conditionValue)) {
        const errorValue = calcStep(errorFormula);
        const isEmpty = (val) => val === null || val === undefined;
        return isEmpty(errorValue) ? '' : errorValue; // 将undfined替换成空字符串返回
    }
    return conditionValue;
}

/**
 * 逻辑与
 * AND(多个条件，全为true时返回true，否则返回false)
 */
export function AND() {
    // 第一个参数为公式分步计算的方法
    const [calcStep, ...args] = arguments;
    if (args.length === 0) {
        return false;
    }
    // 传过来的参数是公式
    let hasEmptyStr = false;
    for (let i = 0; i < args.length; i++) {
        const value = calcStep(args[i]);
        if (value === '') return '';
        if (!value && value !== '0' && value !== 'false') {
            return false;
        }
    }
    return true;
}

/**
 * 逻辑或
 * OR(多个条件，有一个为true时就返回true，全为false则返回false)
 */
export function OR() {
    // 第一个参数为公式分步计算的方法
    const [calcStep, ...args] = arguments;
    if (args.length === 0) {
        return false;
    }
    // 传过来的参数是公式
    let hasEmptyStr = false;
    for (let i = 0; i < args.length; i++) {
        const value = calcStep(args[i]);
        if (value === '') {
            hasEmptyStr = true;
        }
        if (value && value !== '0' && value !== 'false') {
            return true;
        }
    }
    if (hasEmptyStr) return '';
    return false;
}

/**
 * 小于
 */
export function LESS() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    return argsConverted[0] < argsConverted[1];
}

/**
 * 小于等于
 */
export function LESSEQUAL() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    return argsConverted[0] <= argsConverted[1];
}

/**
 * 大于
 */
export function GREATER() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    return argsConverted[0] > argsConverted[1];
}

/**
 * 大于等于
 */
export function GREATEREQUAL() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    return argsConverted[0] >= argsConverted[1];
}

/**
 * 等于
 */
export function EQUAL() {
    // 将undefined视为空串
    if (arguments[0] === undefined || arguments[0] === null) {
        arguments[0] = '';
    }
    if (arguments[1] === undefined || arguments[1] === null) {
        arguments[1] = '';
    }
    return arguments[0] === arguments[1];
}
