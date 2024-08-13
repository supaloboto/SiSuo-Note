import type {AxiosResponse} from "axios";
import {getRequest, postRequest} from '@/assets/api/api';

export function getKanbanList(param: { account: string }): Promise<any> {
    return getRequest('/kanban/list', param);
}

export function getKanban(kanbanId: string): Promise<any> {
    return getRequest(`/kanban/${kanbanId}`, null as any);
}

export function saveComponent(): Promise<any> {
    return postRequest('/kanban/component/save', null as any);
}
