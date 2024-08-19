import { getRequest, postRequest } from '@/assets/api/api';
import type { Component } from "@/components/Component";
import { useKanbanStore } from '@/stores/kanban';

/**
 * 获取看板列表
 * @param param { userId: string } 用户id
 */
export function getKanbanList(param: { userId: string }): Promise<any> {
    return getRequest('/kanban/list', param);
}

/**
 * 创建看板
 * @param kanban 看板信息
 */
export function createKanban(kanban: { userId: string, title: string, componentList: [] }): Promise<any> {
    return postRequest('/kanban/add', { kanban });
}

/**
 * 更新看板
 * @param kanban 看板信息
 */
export function updateKanban(kanban: { kanbanId: string, title: string }): Promise<any> {
    return postRequest('/kanban/update', { kanban });
}

/**
 * 删除看板
 * @param kanbanId 看板ID 
 */
export function deleteKanban(kanbanId: string): Promise<any> {
    return postRequest('/kanban/delete', { kanbanId });
}

/**
 * 获取看板
 * @param kanbanId 看板ID 
 */
export function getKanban(kanbanId: string): Promise<any> {
    return getRequest(`/kanban/${kanbanId}`, null as any);
}

/**
 * 添加组件
 * @param component 组件
 */
export function addComponent(component: Component<any>): Promise<any> {
    return postRequest('/kanban/component/add', {
        kanbanId: useKanbanStore().kanbanId,
        component,
    });
}

/**
 * 更新组件
 * @param component 组件
 */
export function updateComponent(component: Component<any>): Promise<any> {
    return postRequest('/kanban/component/update', {
        kanbanId: useKanbanStore().kanbanId,
        component,
    });
}

/**
 * 删除组件
 * @param componentId 组件ID
 */
export function deleteComponent(componentId: string): Promise<any> {
    const kanbanStore = useKanbanStore();
    return postRequest('/kanban/component/delete', {
        kanbanId: useKanbanStore().kanbanId,
        componentId,
    });
}
