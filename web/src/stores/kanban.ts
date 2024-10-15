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
import { LinkLine } from "@/components/plugins/link/LinkLine";

/**
 * 位置对象 用于表示组件和组件连线的位置
 * 包含目标左上角和右下角的坐标 用于快速查找坐标范围内的组件和连线
 */
export class Location {
    // 左上角坐标
    startPos: { x: number, y: number };
    // 右下角坐标
    endPos: { x: number, y: number };
    // 对应的组件或连线
    target: Component<any> | LinkLine;

    constructor(startPos: { x: number, y: number }, endPos: { x: number, y: number }, target: Component<any> | LinkLine) {
        this.startPos = startPos;
        this.endPos = endPos;
        this.target = target;
    }
}

export const useKanbanStore = defineStore('kanban', () => {
    // 看板id
    const kanbanId = ref('');
    // 看板标题
    const kanbanTitle = ref('');

    // 组件列表
    const components = ref<Component<any>[]>([]);
    // 添加组件
    function addComponent(component: Component<any>): Promise<any> {
        components.value.push(component);
        updatePosMatrix();
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

    // 组件更新队列
    const componentSaveQueue = ref<Component<any>[]>([]);
    // 更新组件
    function updateComponent(component: Component<any>): Promise<any> {
        // 进入组件更新队列
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

    // 组件和组件连线的坐标矩阵 用于快速查找坐标范围内的组件和连线
    // 为二维数组 按照组件的左上角坐标进行排序
    const posMatrix = ref<Location[][]>([]);
    // 重新计算坐标矩阵方法 使用定时器避免频繁调用
    const updatePosMatrixTimer = ref<any>(null);
    function updatePosMatrix() {
        updatePosMatrixTimer.value && clearTimeout(updatePosMatrixTimer.value);
        updatePosMatrixTimer.value = setTimeout(() => {
            // 清空坐标矩阵
            posMatrix.value = [];
            // 将组件和连线进行横纵排序
            const sortedComponents: { x: number, y: number, target: Component<any> | LinkLine }[] = [];
            // 遍历组件 添加到排序数组中
            components.value.forEach((component) => {
                sortedComponents.push({ x: 0, y: 0, target: component as Component<any> });
                component.links.forEach((link) => {
                    sortedComponents.push({ x: 0, y: 0, target: link as LinkLine });
                });
            });
            // 排序
            sortedComponents.sort((a, b) => {
                const aPosX = a.target instanceof LinkLine ? (a.target as LinkLine).pos.x : (a.target as Component<any>).pos.x;
                const bPosX = b.target instanceof LinkLine ? (b.target as LinkLine).pos.x : (b.target as Component<any>).pos.x;
                return aPosX - bPosX;
            });
            sortedComponents.forEach((item, index) => {
                item.x = index;
            });
            sortedComponents.sort((a, b) => {
                const aPosY = a.target instanceof LinkLine ? (a.target as LinkLine).pos.y : (a.target as Component<any>).pos.y;
                const bPosY = b.target instanceof LinkLine ? (b.target as LinkLine).pos.y : (b.target as Component<any>).pos.y;
                return aPosY - bPosY;
            });
            sortedComponents.forEach((item, index) => {
                item.y = index;
            });
            // 生成坐标矩阵
            sortedComponents.forEach((item) => {
                const startPos = {
                    x: item.target instanceof LinkLine ? (item.target as LinkLine).pos.x : (item.target as Component<any>).pos.x,
                    y: item.target instanceof LinkLine ? (item.target as LinkLine).pos.y : (item.target as Component<any>).pos.y
                };
                const endPos = {
                    x: startPos.x + (item.target instanceof LinkLine ? (item.target as LinkLine).rect.width : (item.target as Component<any>).rect.width),
                    y: startPos.y + (item.target instanceof LinkLine ? (item.target as LinkLine).rect.height : (item.target as Component<any>).rect.height)
                }
                if (!posMatrix.value[item.y]) {
                    posMatrix.value[item.y] = [];
                }
                posMatrix.value[item.y][item.x] = new Location(startPos, endPos, item.target);
            });
            console.log("坐标矩阵更新", posMatrix.value);
        }, 100);
    }

    return {
        // 看板信息
        kanbanId,
        kanbanTitle,
        // 组件列表相关
        components,
        addComponent,
        updateComponent,
        deleteComponent,
        posMatrix,
        updatePosMatrix,
        // 重置方法
        reset: () => {
            kanbanId.value = '';
            components.value = [];
        }
    };
});
