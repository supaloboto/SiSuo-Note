/**
 * 日期相关公式
 */

import {argsToNumber, removeEmptyArgs} from "./runExpressionCommon";

/**
 * 日期公式
 */
export function DATE() {
    const args = removeEmptyArgs(arguments);
    // 日期公式至少包括年月日三个参数
    if (args.length < 3) {
        return '';
    }
    // 防止配置完公式还没有选择时间时，出现默认时间
    if (args[0] === 0 || args[1] === 0 || args[2] === 0) {
        return '';
    }
    // 获取日期格式
    const dateFormat = args[3] || 'yyyy-MM-dd';
    // 年必须是四位
    if (args[0] < 1000) return '';
    const newDate = new Date();
    newDate.setFullYear(args[0]);
    newDate.setMonth(args[1]);
    newDate.setDate(args[2]);
    return parseTime(new Date(newDate), dateFormat);
}

/**
 * 时间公式
 */
export function TIME() {
    const args = removeEmptyArgs(arguments);
    // 时间公式至少包括时分秒三个参数
    if (args.length < 3) {
        return '';
    }
    // 防止配置完公式还没有选择时间时，出现默认时间
    if (args[0] === 0 && args[1] === 0 && args[2] === 0) {
        return '';
    }
    // 获取时间格式
    const timeFormat = args[3] || 'HH:mm:ss';
    const newDate = new Date();
    newDate.setHours(args[0]);
    newDate.setMinutes(args[1]);
    newDate.setSeconds(args[2]);
    return parseTime(newDate, timeFormat);
}

/**
 * 获取日期年份
 */
export function YEAR() {
    const args = removeEmptyArgs(arguments);
    // 获取年份公式只有一个参数
    if (args.length !== 1) {
        return '';
    }
    const originDate = args[0];
    if (originDate === 0) {
        return '';
    }
    return toDate(originDate).getFullYear();
}

/**
 * 获取月份公式
 */
export function MONTH() {
    const args = removeEmptyArgs(arguments);
    // 获取月份公式只有一个参数
    if (args.length !== 1) {
        return '';
    }
    const originDate = args[0];
    if (originDate === 0) {
        return '';
    }
    return toDate(originDate).getMonth();
}

/**
 * 获取天数公式
 */
export function DAY() {
    const args = removeEmptyArgs(arguments);
    // 获取天数公式只有一个参数
    if (args.length !== 1) {
        return '';
    }
    const originDate = args[0];
    if (originDate === 0) {
        return '';
    }
    return toDate(originDate).getDate();
}

/**
 * 获取小时公式
 */
export function HOUR() {
    const args = removeEmptyArgs(arguments);
    // 获取小时公式只有一个参数
    if (args.length !== 1) {
        return '';
    }
    let originDate = args[0];
    if (originDate === 0) {
        return '';
    }
    return toDate(isOnlyTime(originDate)).getHours();
}

/**
 * 获取分钟公式
 */
export function MINUTE() {
    const args = removeEmptyArgs(arguments);
    // 获取分钟公式只有一个参数
    if (args.length !== 1) {
        return '';
    }
    let originDate = args[0];
    if (originDate === 0) {
        return '';
    }
    return toDate(isOnlyTime(originDate)).getMinutes();
}

/**
 * 获取秒数公式
 */
export function SECOND() {
    const args = removeEmptyArgs(arguments);
    // 获取秒数公式只有一个参数
    if (args.length !== 1) {
        return '';
    }
    let originDate = args[0];
    if (originDate === 0) {
        return '';
    }
    return toDate(isOnlyTime(originDate)).getSeconds();
}

/**
 * 日期计算函数
 */
export function CALC_TIME() {
    const args = removeEmptyArgs(arguments);
    if (args.length !== 3) {
        return '';
    }
    // 原始日期
    let originDate = args[0];
    // 变化值
    const addValue = args[1];
    // 变化类型
    const addType = args[2];
    // 如果原始日期只包括: , 并且不包括-和/， 说明当前时间格式为时分或时分秒
    let onlyTime = false;
    // 原始日期没有选择或者变化类型不存在，终止计算
    if (!originDate) {
        return '';
    }
    argsToNumber([addValue]);
    if (!['year', 'month', 'day', 'hour', 'minute', 'second'].includes(addType.toLowerCase())) {
        throw new Error('日期计算类型错误');
    }
    if (originDate.includes(':') && !originDate.includes('-') && !originDate.includes('/')) {
        // 标记只有时间
        onlyTime = true;
        const date = new Date();
        // 补全年月日信息，使其可以转换成Date格式
        let month = date.getMonth();
        // 月份和天数补全成两位
        if (month.toString().length === 1) {
            month = '0' + month;
        }
        let day = date.getDate();
        if (day.toString().length === 1) {
            day = '0' + day;
        }
        originDate = date.getFullYear() + '-' + month + '-' + day + ' ' + originDate;
    }
    if (addType.toLowerCase() === 'year') {
        const currentDate = toDate(originDate);
        const newDate = currentDate.setFullYear(currentDate.getFullYear() + parseInt(addValue, 10), currentDate.getMonth(), currentDate.getDate());
        return parseTime(newDate, getDateFormat(originDate));
    } else if (addType.toLowerCase() === 'month') {
        const currentDate = toDate(originDate);
        const newDate = currentDate.setMonth(currentDate.getMonth() + parseInt(addValue, 10), currentDate.getDate());
        return parseTime(newDate, getDateFormat(originDate));
    } else if (addType.toLowerCase() === 'day') {
        const currentDate = toDate(originDate);
        const newDate = currentDate.setDate(currentDate.getDate() + parseInt(addValue, 10));
        return parseTime(newDate, getDateFormat(originDate));
    } else if (addType.toLowerCase() === 'hour') {
        const currentDate = toDate(originDate);
        const newDate = currentDate.setHours(currentDate.getHours() + parseInt(addValue, 10), currentDate.getMinutes(), currentDate.getSeconds());
        if (onlyTime) {
            return parseTime(newDate, getDateFormat(originDate)).split(' ')[1]
        }
        return parseTime(newDate, getDateFormat(originDate));
    } else if (addType.toLowerCase() === 'minute') {
        const currentDate = toDate(originDate);
        const newDate = currentDate.setMinutes(currentDate.getMinutes() + parseInt(addValue, 10), currentDate.getSeconds());
        if (onlyTime) {
            return parseTime(newDate, getDateFormat(originDate)).split(' ')[1]
        }
        return parseTime(newDate, getDateFormat(originDate));
    } else if (addType.toLowerCase() === 'second') {
        const currentDate = toDate(originDate);
        const newDate = currentDate.setSeconds(currentDate.getSeconds() + parseInt(addValue, 10));
        if (onlyTime) {
            return parseTime(newDate, getDateFormat(originDate)).split(' ')[1]
        }
        return parseTime(newDate, getDateFormat(originDate));
    }
}

/**
 * 检查日期字符串是否只包含时间
 * @param dateStr
 * @returns {string}
 */
function isOnlyTime(dateStr) {
    // 如果原始日期只包括: , 并且不包括-和/， 说明当前时间格式为时分或时分秒
    if (dateStr.includes(':') && !dateStr.includes('-') && !dateStr.includes('/')) {
        const date = new Date();
        // 补全年月日信息，使其可以转换成Date格式
        dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + dateStr;
    }
    return dateStr;
}

/**
 * 日期格式化
 * @param date
 * @param format
 * @returns {*}
 */
function parseTime(date, format) {
    let dateObject;
    if (typeof date === 'object') {
        dateObject = date;
    } else {
        if ((typeof date === 'string') && (/^[0-9]+$/.test(date))) {
            // eslint-disable-next-line radix
            dateObject = parseInt(date);
        } else if (typeof date === 'string') {
            dateObject = date.replace(new RegExp(/-/gm), '/');
        }
        // 时间戳位数为13位 为毫秒直接转date 10位为秒需要乘1000 暂无其他类型
        if ((typeof date === 'number')) {
            if (date.toString().length === 10) {
                dateObject = date * 1000;
            } else if (date.toString().length === 13) {
                dateObject = date
            }
        }
        dateObject = new Date(dateObject);
    }
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1;
    const day = dateObject.getDate();
    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    const seconds = dateObject.getSeconds();

    return format
        .replace('yyyy', year)
        .replace('MM', String(month).padStart(2, '0'))
        .replace('dd', String(day).padStart(2, '0'))
        .replace('HH', String(hours).padStart(2, '0'))
        .replace('mm', String(minutes).padStart(2, '0'))
        .replace('ss', String(seconds).padStart(2, '0'));
}

/**
 * 判断日期字符串格式
 * @param dateStr
 * @returns {string}
 */
function getDateFormat(dateStr) {
    const formatArr = [{
        format: 'HH:mm',
        testReg: /^\d{2}:\d{2}$/
    }, {
        format: 'HH:mm:ss',
        testReg: /^\d{2}:\d{2}:\d{2}$/
    }, {
        format: 'yyyy-MM-dd',
        testReg: /^\d{4}-\d{2}-\d{2}$/
    }, {
        format: 'yyyy-MM-dd HH:mm',
        testReg: /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/
    }, {
        format: 'yyyy-MM-dd HH:mm:ss',
        testReg: /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/
    }, {
        format: 'yyyy/MM/dd',
        testReg: /^\d{4}\/\d{2}\/\d{2}$/
    }, {
        format: 'yyyy/MM/dd HH:mm',
        testReg: /^\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}$/
    }, {
        format: 'yyyy/MM/dd HH:mm:ss',
        testReg: /^\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}$/
    }];
    for (let i = 0; i < formatArr.length; i++) {
        const item = formatArr[i];
        if (item.testReg.test(dateStr)) {
            return item.format;
        }
    }
    return 'yyyy-MM-dd HH:mm:ss';
}

// 判断转换日期是否成功
function toDate(dateStr) {
    const date = new Date(dateStr);
    if (date.toString() !== 'Invalid Date') {
        return date;
    }
    throw new Error('Invalid Date');
}
