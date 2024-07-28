/**
 * 全局变量store
 *
 * @author 刘志栋
 * @since 2023/05/23
 */
import {defineStore} from "pinia";

export const useGlobalStore = defineStore('global', {
    state: () => ({
        // 系统设置
        sysConfig: {
            theme: 'default'
        },
        // 用户信息
        userInfo: {id: null, name: null, sessionId: null},
        // 协议模式 http/https 协议影响到页面与系统剪切板的互动
        protocol: 'http',
    }),
    actions: {},
    getters: {},
})
