import { getRequest, postRequest } from '@/assets/api/api';
import type { Component } from "@/components/Component";
import { useKanbanStore } from '@/stores/kanban';

export function getKanbanList(param: { account: string }): Promise<any> {
    return getRequest('/kanban/list', param);
}

export function getKanban(kanbanId: string): Promise<any> {
    return getRequest(`/kanban/${kanbanId}`, null as any);
}

export function addComponent(component: Component<any>): Promise<any> {
    return postRequest('/kanban/component/add', {
        kanbanId: useKanbanStore().kanbanId,
        component,
    });
}

export function updateComponent(component: Component<any>): Promise<any> {
    return postRequest('/kanban/component/update', {
        kanbanId: useKanbanStore().kanbanId,
        component,
    });
}

export function deleteComponent(componentId: string): Promise<any> {
    const kanbanStore = useKanbanStore();
    return postRequest('/kanban/component/delete', {
        kanbanId: useKanbanStore().kanbanId,
        componentId,
    });
}
