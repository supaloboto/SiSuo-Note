/**
 * 组件store
 *
 * @author 刘志栋
 * @since 2023/07/23
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { type Component } from "@/components/Component";

export const useKanbanStore = defineStore('kanban', () => {
    // 看板id
    const kanbanId = ref('kanban1');
    // 组件列表
    const components = ref<Component<any>[]>([]);

    return { kanbanId, components };
});
