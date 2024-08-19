/**
 * 全局变量store
 *
 * @author 刘志栋
 * @since 2023/05/23
 */
import { defineStore } from "pinia";

export const useGlobalStore = defineStore('global', {
    state: () => ({
        // 系统设置
        sysConfig: {
            // default/dark
            theme: 'default',
            // none/lattice1/lattice2/dot1
            boardBgType: 'lattice2',
        },
        // 用户信息
        user: { id: null, account: null, name: null, token: null, wsSession: null },
        // 协议模式 http/https 协议影响到页面与系统剪切板的互动
        protocol: 'http',
    }),
    actions: {},
    getters: {},
})
