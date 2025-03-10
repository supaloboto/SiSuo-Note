/**
 * 画布store
 *
 * @author 刘志栋
 * @since 2023/07/23
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import { roundOff } from "@/assets/utils/math";
import type { Component } from "@/components/Component";
import type { BoardShapeCommand } from "@/frame/board/shape/BoardShapeCommand";

/**
 * 指针状态
 */
export enum PointerState {
    // 指针
    POINTING,
    // 框选
    SELECTING,
    // 拖动
    DRAGGING,
    // 创建连线
    LINKING,
    // 创建组件
    CREATING,
}

/**
 * 指针对象
 */
export class Pointer {
    // 用户
    user!: string;
    // 对于画布的x坐标
    x!: number;
    // 对于画布的y坐标
    y!: number;
    // 对于视窗的x坐标
    clientX!: number;
    // 对于视窗的y坐标
    clientY!: number;
    // 选中的组件
    selected: any[] = [];
    // 悬浮的组件
    hover: string[] = [];
    // 是否聚焦在画布上 影响画布上的鼠标事件或快捷键是否触发
    focusOnCanvas: boolean = true;
    // 状态
    state: PointerState = PointerState.POINTING;
}

/**
 * 定义画布store
 */
export const useCanvasStore = defineStore('canvas', () => {
    // 当前指针位置
    const currentPointer = ref<Pointer>(new Pointer());
    // 其他用户的指针位置
    const pointers = ref<Pointer[]>([]);
    // 组件添加时的占位组件
    const tempComponent = ref<Component<any>>(null as any);

    /**
     * 选中对象
     * @param target 选中对象
     * @param removeOthers 是否移除其他选中
     * @param reverse 是否反选
     */
    const selectComponent = (target: any, removeOthers: boolean = true, reverse: boolean = false) => {
        if (removeOthers) {
            currentPointer.value.selected = [];
        }
        if (!target) {
            return;
        }
        const index = currentPointer.value.selected.indexOf(target);
        if (reverse && index > -1) {
            currentPointer.value.selected.splice(index, 1);
        } else if (index === -1) {
            currentPointer.value.selected.push(target);
        }
    };
    /**
     * 取消选中对象
     * @param target 取消选中对象
     */
    const unSelectComponent = (target: any) => {
        if (!target) {
            return;
        }
        const index = currentPointer.value.selected.indexOf(target);
        if (index > -1) {
            currentPointer.value.selected.splice(index, 1);
        }
    }

    // 缩放比例
    const scale = ref<number>(100);
    // 缩放上限
    const scaleMax = 200;
    // 缩放下限
    const scaleMin = 20;
    /**
     * 缩放
     * @param step 缩放步长
     * @param addStep 增加几步
     */
    const zoom = (step: number, addStep: number) => {
        // 按当前的步长先将缩放值四舍五入到最接近的整数
        let newScale = roundOff(Math.round(scale.value / step) * step, 0);
        // 如果舍入方向与增加方向相同则直接使用舍入值 否则对舍入值做增加
        const sameDirection = addStep > 0 ? newScale > scale.value : newScale < scale.value;
        if (!sameDirection) {
            newScale += addStep * step;
        }
        newScale = roundOff(newScale, 0);
        // 检查是否超出限制
        if (newScale > scaleMax) {
            scale.value = scaleMax;
        } else if (newScale < scaleMin) {
            scale.value = scaleMin;
        } else {
            scale.value = newScale;
        }
    }

    // 当前视图大小和位置 坐标为中心点坐标
    const currentViewRect = ref<{
        x: number,
        y: number,
        width: number,
        height: number,
        clientWidth: number,
        clientHeight: number
    }>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        clientWidth: 0,
        clientHeight: 0
    });

    // 画板上的图形渲染指令
    const boardShapeCmds = ref<BoardShapeCommand[]>([]);

    return {
        // 指针
        currentPointer,
        selectComponent,
        unSelectComponent,
        pointers,
        tempComponent,
        // 缩放
        scale,
        scaleMax,
        scaleMin,
        zoom,
        // 视图
        currentViewRect,
        // 图形渲染
        boardShapeCmds,
        // 重置方法
        reset: () => {
            currentPointer.value = new Pointer();
            pointers.value = [];
            tempComponent.value = null as any;
            scale.value = 100;
            currentViewRect.value.x = 0;
            currentViewRect.value.y = 0;
            boardShapeCmds.value = [];
        }
    };
});
