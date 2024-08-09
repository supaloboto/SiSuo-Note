/**
 * 组件注册插件
 *
 * @author 刘志栋
 * @since 2024/07/10
 */
import {markRaw, ref, watch} from 'vue'
// 引入组件
import {Note} from "@/components/blocks/note/Note";
import NoteRaw from "./blocks/note/Note.vue";

// 注册组件
export const compRegis = ref({
    // 笔记
    note: {
        name: 'note',
        icon: 'component-note',
        class: Note,
        raw: markRaw(NoteRaw),
        defaultRect: {
            width: 300,
            height: 300,
        }
    },
    // 表格
    grid: {
        name: 'grid',
        icon: 'component-grid',
        class: Note,
        raw: markRaw(NoteRaw),
        defaultRect: {
            width: 300,
            height: 300,
        }
    },
    // 图表
    chart: {
        name: 'chart',
        icon: 'component-chart',
        class: Note,
        raw: markRaw(NoteRaw),
        defaultRect: {
            width: 300,
            height: 300,
        }
    },
});
