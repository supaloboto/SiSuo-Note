/**
 * 组件注册插件
 *
 * @author 刘志栋
 * @since 2024/07/10
 */
import {markRaw} from 'vue'
// 引入组件
import Note from "./blocks/note/note.vue";

// 注册组件
export const compRegis = {
    // 笔记
    note: {
        name: 'note',
        icon: 'component-note',
        raw: markRaw(Note),
    },
}
