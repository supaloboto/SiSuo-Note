/**
 * 组件store
 *
 * @author 刘志栋
 * @since 2023/07/23
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { type Component } from "@/components/Component";
import * as kanbanApi from "@/assets/api/kanban";

export const useKanbanStore = defineStore('kanban', () => {
    // 看板id
    const kanbanId = ref('');
    // 看板标题
    const kanbanTitle = ref('');

    // 组件列表
    const components = ref<Component<any>[]>([]);
    // 添加组件
    function addComponent(component: Component<any>): Promise<any> {
        // todo 组件更新队列
        components.value.push(component);
        // 保存组件 只取出组件中可以序列化的部分进行传输
        return kanbanApi.addComponent({
            compType: component.compType,
            id: component.id,
            pos: component.pos,
            rect: component.rect,
            data: component.data
        } as Component<any>).then(() => {
            console.log("组件添加成功");
        });
    }
    // 更新组件
    function updateComponent(component: Component<any>): Promise<any> {
        // todo 组件更新队列
        return kanbanApi.updateComponent({
            compType: component.compType,
            id: component.id,
            pos: component.pos,
            rect: component.rect,
            data: component.data
        } as Component<any>).then(() => {
            console.log("组件更新成功");
        });
    }
    // 删除组件
    function deleteComponent(componentId: string): Promise<any> {
        const index = components.value.findIndex((component) => component.id === componentId);
        if (index !== -1) {
            components.value[index].unselect();
            components.value.splice(index, 1);
        }
        // todo 组件更新队列
        // 调用删除接口
        return kanbanApi.deleteComponent(componentId).then(() => {
            console.log("组件删除成功");
        });
    }

    return {
        // 看板信息
        kanbanId,
        kanbanTitle,
        // 组件列表
        components, addComponent, updateComponent, deleteComponent,
        // 重置方法
        reset: () => {
            kanbanId.value = '';
            components.value = [];
        }
    };
});
