import { getRequest, postRequest } from '@/assets/api/api';
import type { Component } from "@/components/Component";
import { useKanbanStore } from '@/stores/kanban';

export function getKanbanList(param: { account: string }): Promise<any> {
    return getRequest('/kanban/list', param);
}

export function getKanban(kanbanId: string): Promise<any> {
    return getRequest(`/kanban/${kanbanId}`, null as any);
}

export function saveComponent(component: Component<any>): Promise<any> {
    const kanbanStore = useKanbanStore();
    return postRequest('/kanban/component/save', {
        kanbanId: kanbanStore.kanbanId,
        component,
    });
}
