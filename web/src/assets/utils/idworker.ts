/**
 * ID生成相关方法
 * @author 刘志栋
 * @since 2024/08/03
 */

/**
 * 生成四位随机字符
 */
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

/**
 * 生成长ID 长度类似UUID为32位
 * @returns ID字符串
 * @author 刘志栋
 * @since 2024/08/03
 */
export function getLongID(): string {
    return S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4();
}

/**
 * 生成短ID 长度为8位
 * @returns ID字符串
 * @author 刘志栋
 * @since 2024/08/03
 */
export function getShortID(): string {
    return S4() + S4();
}
