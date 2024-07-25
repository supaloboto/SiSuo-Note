/**
 * 画布store
 *
 * @author 刘志栋
 * @since 2023/07/23
 */
import {defineStore} from "pinia";
import {ref} from "vue";

/**
 * 指针状态
 */
export class Pointer {
    // 用户
    user: string;
    // x坐标
    x: number;
    // y坐标
    y: number;
    // 选中的组件
    selected: string[] = [];
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

    return {currentPointer, selectComponent, unSelectComponent, pointers};
});
