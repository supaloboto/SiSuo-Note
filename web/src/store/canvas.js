/**
 * 画布变量store
 *
 * @author 刘志栋
 * @version 1.0
 * @since 2023/05/23
 */
import {defineStore} from "pinia";

export const useCanvasStore = defineStore('canvas', {
    state: () => ({
        // 当前指针位置
        currentPointer: {x: 0, y: 0, selected: []},
        // 其他用户指针位置 {user: '', x: 0, y: 0, selected: []]}
        pointers: [],
        // 组件列表
        components: [{
            type: 'note',
            id: 'test',
            pos: {x: 100, y: 120},
            rect: {width: 100, height: 100},
            data: {}
        }],
    }),
    actions: {
        // 选中/反选中组件
        selectComponent(id, removeOthers = true) {
            if (removeOthers) {
                this.currentPointer.selected = [];
            }
            this.currentPointer.selected.push(id);
        }
    },
    getters: {},
})
