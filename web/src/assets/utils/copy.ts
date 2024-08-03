/**
 * 拷贝相关方法
 * @author 刘志栋
 * @since 2024/08/03
 */

/**
 * 深拷贝
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 * @author 刘志栋
 * @since 2024/08/03
 */
export function deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}
