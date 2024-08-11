/**
 * 数学相关方法
 * @author 刘志栋
 * @since 2024/08/11
 */

/**
 * 四舍五入
 * @param num 数字
 * @param decimal 小数位数
 */
export function roundOff(num: number, decimal: number = 1000): number {
    if (decimal <= 0) {
        return Math.round(num);
    }
    return Math.round(num * decimal) / decimal;
}
