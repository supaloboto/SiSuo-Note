/**
 * 画布store
 *
 * @author 刘志栋
 * @since 2023/07/23
 */
import {defineStore} from "pinia";
import {ref} from "vue";

/**
 * 指针对象
 */
export class Pointer {
    // 用户
    user: string;
    // 对于画布的x坐标
    x: number;
    // 对于画布的y坐标
    y: number;
    // 对于视窗的x坐标
    clientX: number;
    // 对于视窗的y坐标
    clientY: number;
    // 选中的组件
    selected: string[] = [];
    // 是否聚焦在画布上 影响画布上的鼠标事件或快捷键是否触发
    focusOnCanvas: boolean = true;
    // 状态
    state: string = 'pinter';
}

/**
 * 定义画布store
 */
export const useCanvasStore = defineStore('canvas', () => {
    // 当前指针位置
    const currentPointer = ref<Pointer>(new Pointer());
    // 其他用户的指针位置
    const pointers = ref<Pointer[]>([]);

    /**
     * 选中组件
     * @param id 组件id
     * @param removeOthers 是否移除其他选中
     * @param reverse 是否反选
     */
    const selectComponent = (id: string, removeOthers: boolean, reverse: boolean) => {
        if (removeOthers) {
            currentPointer.value.selected = [];
        }
        if (!id) {
            return;
        }
        const index = currentPointer.value.selected.indexOf(id);
        if (reverse && index > -1) {
            currentPointer.value.selected.splice(index, 1);
        } else if (index === -1) {
            currentPointer.value.selected.push(id);
        }
    };
    /**
     * 取消选中组件
     * @param id 组件id
     */
    const unSelectComponent = (id: string) => {
        if (!id) {
            return;
        }
        const index = currentPointer.value.selected.indexOf(id);
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
        // 按当前的步长先将缩放值四舍五入到最接近的整数倍
        let newScale = Math.round(scale.value / step) * step;
        // 如果舍入方向与增加方向相同则直接使用舍入值 否则对舍入值做增加
        const sameDirection = addStep > 0 ? newScale > scale.value : newScale < scale.value;
        if (!sameDirection) {
            newScale += addStep * step;
        }
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
    //todo 处理视图宽高数据
    const currentViewRect = ref<{ x: number, y: number, width: number, height: number }>({
        x: 0,
        y: 0,
        width: 0,
        height: 0
    });

    return {
        // 指针
        currentPointer,
        selectComponent,
        unSelectComponent,
        pointers,
        // 缩放
        scale,
        scaleMax,
        scaleMin,
        zoom,
        // 视图
        currentViewRect
    };
});
