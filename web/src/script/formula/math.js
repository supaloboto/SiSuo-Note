import {Decimal} from 'decimal.js'
import {alertEmptyArgs, argsToNumber, removeEmptyArgs} from "./runExpressionCommon";

/**
 * 获取Decimal对象
 * @param num
 */
function getDecimal(num) {
    return new Decimal(num + '');
}

/**
 * 四舍五入
 * @param value       修约之前的值
 * @param decimal     修约精度
 * @returns {string}  修约结果
 */
export function calcRoundOff(value, decimal) {
    if (decimal === undefined) decimal = 2;
    alertEmptyArgs([value, decimal]);
    const a = new Decimal(value);
    const b = new Decimal(Math.pow(10, decimal));
    const result = new Decimal(Math.round(a.mul(b).toNumber())).div(b).toNumber();
    return fillZero(result, decimal);
}

/**
 * 四舍六入五成双(bankers rounding)
 * 四舍六入五成双和四舍五入的唯一区别在于 当需要修约掉的数是5时 两种算法处理方式不同(比如12.345保留两位小数时 对这个5的处理两种算法不一样)
 * 四舍六入五成双追求数据总和的误差更小 因此会在被修约掉的5后面没有大于0的数字时 将前一位凑成双数(12.345->12.34 12.335->12.34 12.34501->12.35)
 * 特殊情况下 如果出现0.50这样的值 实际上是仪器抹去了0后面的数 所以直接使用四舍五入算法(原本是12.3450->12.34 但我们要让12.3450->12.35)
 * 但任何情况下 只要是0.5这样的值 使用四舍六入五成双算法都是没问题的
 * @param value       原始值
 * @param decimal     修约精度
 * @returns {string}  修约结果
 */
export function calcRoundFix(value, decimal) {
    if (decimal === undefined) decimal = 2;
    alertEmptyArgs([value, decimal]);
    const x = new Decimal(value).mul(new Decimal(Math.pow(10, decimal)));
    const r = new Decimal(Math.round(x.toNumber()));
    const br = (((x > 0) ? x : (-x)) % 1) === 0.5 ? ((0 === (r % 2)) ? r : r.sub(1)) : r;
    const result = br.div(Math.pow(10, decimal)).toNumber();
    return fillZero(result, decimal);
}

/**
 * 给数据补0
 * @param value      原始值
 * @param decimalSize 保留小数位数
 */
export function fillZero(value, decimalSize) {
    let valueStr = value + '';
    if (decimalSize <= 0) {
        return valueStr;
    }
    if (valueStr.indexOf('.') > 0) {
        const strSplit = valueStr.split('.');
        const decimalLength = strSplit[1].length;
        if (decimalLength < decimalSize) {
            for (let i = 0; i < (decimalSize - decimalLength); i++) {
                strSplit[1] += '0';
            }
        }
        valueStr = strSplit[0] + '.' + strSplit[1];
    } else {
        valueStr += '.';
        for (let i = 0; i < decimalSize; i++) {
            valueStr += '0';
        }
    }
    return valueStr;
}

/**
 * 求和
 */
export function SUM() {
    const args = removeEmptyArgs(arguments);
    if (args.length === 0) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    let result = new Decimal(0);
    for (let i = 0; i < argsConverted.length; i++) {
        result = result.add(getDecimal(argsConverted[i]));
    }
    return result.toNumber();
}

/**
 * 加法
 */
export function ADD() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    const result = getDecimal(argsConverted[0]).add(getDecimal(argsConverted[1]));
    return result.toNumber();
}

/**
 * 求差
 */
export function SUB() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    const result = getDecimal(argsConverted[0]).sub(getDecimal(argsConverted[1]));
    return result.toNumber();
}

/**
 *  求积
 */
export function MUL() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    const result = getDecimal(argsConverted[0]).mul(getDecimal(argsConverted[1]));
    return result.toNumber();
}

/**
 *  求商
 */
export function DIV() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    // 除数不能是0
    if (argsConverted[1] === 0) {
        return '';
    }
    let result = getDecimal(argsConverted[0]).div(getDecimal(argsConverted[1]));
    return result.toNumber();
}

/**
 * 求平均
 */
export function AVERAGE() {
    const args = removeEmptyArgs(arguments);
    if (args.length === 0) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    const average = getDecimal(SUM(...argsConverted)).div(argsConverted.length);
    return average.toNumber();
}

/**
 * 求最大值
 */
export function MAX() {
    const args = removeEmptyArgs(arguments);
    if (args.length === 0) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    let result = argsConverted[0];
    for (let i = 1; i < argsConverted.length; i++) {
        if (argsConverted[i] > result) {
            result = argsConverted[i];
        }
    }
    return result;
}

/**
 * 求最小值
 */
export function MIN() {
    const args = removeEmptyArgs(arguments);
    if (args.length === 0) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    let result = argsConverted[0];
    for (let i = 1; i < argsConverted.length; i++) {
        if (argsConverted[i] < result) {
            result = argsConverted[i];
        }
    }
    return result;
}

/**
 * 求绝对值
 */
export function ABS() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 1) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    const decimal = getDecimal(argsConverted[0]);
    let result = decimal.abs();
    return result.toNumber();
}

/**
 * 求对数
 */
export function LOG() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    // 底数大于0且不能是1
    if (argsConverted[1] <= 0 || argsConverted[1] === 1) {
        return '';
    }
    // 利用换底公式
    const arg1 = getDecimal(argsConverted[0]);
    const arg2 = getDecimal(argsConverted[1]);
    let result = arg1.log().div(arg2.log());
    return result.toNumber();
}

/**
 * 求余数
 */
export function MOD() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    // 除数不能是0
    if (argsConverted[1] === 0) {
        return '';
    }
    let result = getDecimal(argsConverted[0]).mod(getDecimal(argsConverted[1]));
    return result.toNumber();
}

/**
 * 求乘幂
 */
export function POWER() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    const arg1 = getDecimal(argsConverted[0]);
    const arg2 = getDecimal(argsConverted[1]);
    let result = arg1.pow(arg2);
    return result.toNumber();
}

/**
 * 求立方根
 */
export function CBRT() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 1) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    const arg1 = getDecimal(argsConverted[0]);
    return arg1.cbrt().toNumber();
}

/**
 * 计算斜率方法
 * @author zhaopeipei
 */
export function SLOPE() {
    if (arguments.length !== 2) {
        return '';
    }
    const args = [removeEmptyArgs(arguments[0]), removeEmptyArgs(arguments[1])];
    const arrx = argsToNumber(args[0]);
    const arry = argsToNumber(args[1]);
    // 已知两个数组,斜率公式为:(x-x的平均数)*(y-y的平均数)的和/(x-x的平均数)的平方的和;
    let sumX = new Decimal(0); // x的和
    let sumY = new Decimal(0); // y的和
    let lengthX = arrx.length; // x的长度
    let lengthY = arry.length; // y的长度
    for (let i = 0; i < lengthY; i++) {
        sumY = sumY.add(getDecimal(arry[i]));
        sumX = sumX.add(getDecimal(arrx[i]));
    }
    let sumUp = new Decimal(0); // (x-x的平均数)*(y-y的平均数)的和
    let sumDown = new Decimal(0); // (x-x的平均数)的平方的和
    let averageX = sumX.div(lengthX); // x的平均数
    let averageY = sumY.div(lengthY); // Y的平均数
    for (let i = 0; i < lengthY; i++) {
        // sumUp += (arrx[i] - averageX) * (arry[i] - averageY)
        sumUp = sumUp.add(
            getDecimal(arrx[i]).sub(getDecimal(averageX))
                .mul(getDecimal(arry[i]).sub(getDecimal(averageY)))
        )
        // sumDown += (arrx[i] - averageX) * (arrx[i] - averageX)
        sumDown = sumDown.add(
            getDecimal(arrx[i]).sub(getDecimal(averageX))
                .mul(getDecimal(arrx[i]).sub(getDecimal(averageX)))
        )
    }
    let sumResult = sumUp.div(sumDown);
    return sumResult.toNumber();
}

/**
 * 计算截距方法
 * @author zhaopeipei
 */
export function INTERCEPT() {
    if (arguments.length !== 2) {
        return '';
    }
    const args = [removeEmptyArgs(arguments[0]), removeEmptyArgs(arguments[1])];
    const arrx = argsToNumber(args[0]);
    const arry = argsToNumber(args[1]);
    // 已知两个数组,截距的公式：y的平均数 - 斜率*x的平均数;
    let b = SLOPE(arrx, arry); // 获取斜率
    let sumX = new Decimal(0); // x的和
    let sumY = new Decimal(0); // y的和
    let lengthX = arrx.length; // x的长度
    let lengthY = arry.length; // y的长度
    for (let i = 0; i < lengthY; i++) {
        sumX = sumX.add(getDecimal(arrx[i]));
        sumY = sumY.add(getDecimal(arry[i]));
    }
    let averageX = sumX.div(lengthX); // x的平均数
    let averageY = sumY.div(lengthY); // y的平均数
    let result = averageY.sub(averageX.mul(b)); // 截距取小数点后pointlength位数;
    return result.toNumber();
}

/**
 * 计算平方根方法
 * @author zhaopeipei
 */
export function SQRT() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 1) {
        return '';
    }
    const argsConverted = argsToNumber(args);
    const number = new Decimal(argsConverted[0]);
    let squarer = number.sqrt();
    return squarer.toNumber();
}

/**
 * 计算标准偏差方法
 * @author zhaopeipei
 */
export function STDEV() {
    const arry = removeEmptyArgs(arguments);
    // 已知一个数组; 标准偏差的公式：开根号(数组长度*x平方和 - x和的平方/数组长度*(数组长度-1))
    let lengthY = arry.length; // 数组长度
    let sumYLeft = new Decimal(0); // x平方的和
    let sumYRight = new Decimal(0); // x的和
    for (let i = 0; i < lengthY; i++) {
        sumYLeft = sumYLeft.add(getDecimal(arry[i]).pow(2));
        sumYRight = sumYRight.add(getDecimal(arry[i]));
    }
    sumYLeft = sumYLeft.mul(lengthY); // x平方的和*数组长度
    sumYRight = sumYRight.pow(2); // x和的平方
    let sumDown = getDecimal(lengthY * (lengthY - 1)); // 数组长度*（数组长度-1）
    let sumResult = sumYLeft.sub(sumYRight).div(sumDown).sqrt(); // 计算标准偏差 数组长度*x平方和 - x和的平方/数组长度*(数组长度-1)
    return sumResult.toNumber();
}

/**
 * 四舍五入
 */
export function ROUND_HALF_UP() {
    if (isNaN(arguments[1])) {
        return arguments[0];
    }
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    argsToNumber([args[0]]);
    return calcRoundOff(parseFloat(args[0]), args[1]);
}

/**
 * 四舍六入五成双(bankers rounding)
 */
export function ROUND_HALF_EVEN() {
    if (isNaN(arguments[1])) {
        return arguments[0];
    }
    const args = removeEmptyArgs(arguments);
    if (args.length !== 2) {
        return '';
    }
    argsToNumber([args[0]]);
    return calcRoundFix(parseFloat(args[0]), args[1]);
}

/**
 * 向上取整
 */
export function CEIL() {
    const args = removeEmptyArgs(arguments);
    if (args.length < 1) {
        return '';
    }
    const a = getDecimal(args[0]);
    const b = args[1] ? Math.pow(10, args[1]) : 0;
    const result = b === 0 ? Math.ceil(a.toNumber()) : new Decimal(Math.ceil(a.mul(b).toNumber())).div(b).toNumber();
    return fillZero(result, args[1]);
}

/**
 * 向下取整
 */
export function FLOOR() {
    const args = removeEmptyArgs(arguments);
    if (args.length < 1) {
        return '';
    }
    const a = getDecimal(args[0]);
    const b = args[1] ? Math.pow(10, args[1]) : 0;
    const result = b === 0 ? Math.floor(a.toNumber()) : new Decimal(Math.floor(a.mul(b).toNumber())).div(b).toNumber();
    return fillZero(result, args[1]);
}

/**
 * 保留有效位数
 * @returns {string}
 * @constructor
 */
export function ROUND() {
    const args = removeEmptyArgs(arguments);
    if (args.length < 2) {
        return '';
    }
    const originNum = getDecimal(args[0]);
    const precisionNum = getDecimal(args[1]);
    const result = originNum.toPrecision(precisionNum.toNumber());
    // 如果结果为科学计数法形式，转换科学计数法的表示形式
    if (result.indexOf('e+') > -1 && result.split('e+').length === 2) {
        const tempArr = result.split('e+');
        return `${tempArr[0]}*10^${tempArr[1]}`
    } else {
        return originNum.toPrecision(precisionNum.toNumber());
    }
}
/**
 * 求中间值
 */
export function MEDIAN() {
    const args = removeEmptyArgs(arguments);
    if (args.length === 0) {
        return '';
    }
    let argsConverted = argsToNumber(args);
    // 先把数组从小到大排序
    argsConverted = argsConverted.sort((a,b) => {
        return a - b;
    });
    // 获取数组中间位置
    const middleIndex = Math.floor(argsConverted.length / 2);
    // 数组长度为偶数，计算数组中间两个数的平均值，数组长度为奇数，直接返回数组中间的数值
    if (argsConverted.length % 2 === 0) {
        return getDecimal(argsConverted[middleIndex - 1]).add(getDecimal(argsConverted[middleIndex])).div(2).toNumber();
    } else {
        return argsConverted[middleIndex];
    }
}
