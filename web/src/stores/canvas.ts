/**
 * 画布变量store
 *
 * @author 刘志栋
 * @version 1.0
 * @since 2023/05/23
 */
import {defineStore} from "pinia";
import {ref} from "vue";

export const useCanvasStore = defineStore('canvas', () => {
    // 组件列表
    const components = ref([{
        type: 'note',
        id: 'test',
        pos: {x: 100, y: 120},
        rect: {width: 100, height: 100},
        data: {}
    }]);

    // 当前指针位置
    const currentPointer = ref({x: 0, y: 0, selected: [] as string[], state: 'pointer' as string});
    // 选中/反选中组件
    const selectComponent = (id: string, removeOthers: boolean = true) => {
        if (removeOthers) {
            currentPointer.value.selected = [];
        }
        if (id) {
            currentPointer.value.selected.push(id);
        }
    };


    // 其他用户的指针位置
    const pointers: string[] = ref([]);

    return {currentPointer, selectComponent, pointers, components};
});
