/**
 * 全局变量store
 *
 * @author 刘志栋
 * @version 1.0
 * @since 2023/05/23
 */
import {defineStore} from "pinia";

export const useGlobalStore = defineStore('global', {
    state: () => ({
        // 系统设置 在index.html中引入的sysConfig.js文件中定义
        sysConfig: null,
        // 用户信息
        userInfo: {id: null, name: null, sessionId: null},
        // 页面模式 edit/view/check/test
        pageMode: 'edit',
    }),
    actions: {
    },
    getters: {
    },
})
