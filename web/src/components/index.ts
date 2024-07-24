/**
 * 组件注册插件
 *
 * @author 刘志栋
 * @since 2024/07/10
 */
import {markRaw} from 'vue'
// 引入组件
import SisuoComp from "./sisuo-comp.vue";
import Note from "./blocks/note/index.vue";

// 注册组件
export const compRegis = {
    note: markRaw(Note),
}

// 导出插件
export default {
    install(app) {
        const globalProperties = app.config.globalProperties;
        globalProperties.$comp = (type) => {
            return compRegis[type];
        }
        app.component('sisuo-comp', SisuoComp);
    },
};
