/**
 * 组件注册插件
 *
 * @author 刘志栋
 * @since 2024/07/10
 */
import {markRaw, ref, watch} from 'vue'
// 引入组件
import Note from "./blocks/note/Note.vue";

// 注册组件
export const compRegis = ref({
    // 笔记
    note: {
        name: 'note',
        icon: 'component-note',
        raw: markRaw(Note),
    },
    // 表格
    grid: {
        name: 'grid',
        icon: 'component-grid',
        raw: markRaw(Note),
    },
    // 图表
    chart: {
        name: 'chart',
        icon: 'component-chart',
        raw: markRaw(Note),
    },
});
