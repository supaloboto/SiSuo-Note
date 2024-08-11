/**
 * 组件store
 *
 * @author 刘志栋
 * @since 2023/07/23
 */
import {defineStore} from "pinia";
import {ref} from "vue";
import {type Component} from "@/components/Component";
import {Note} from "@/components/blocks/note/Note";

export const useComponentStore = defineStore('component', () => {
    // 组件列表
    const components = ref<Component[]>([
        new Note({
            id: 'test',
            pos: {x: -200, y: -200},
            rect: {width: 400, height: 400},
            data: {}
        }),
        new Note({
            id: 'test2',
            pos: {x: 300, y: 320},
            rect: {width: 100, height: 100},
            data: {}
        })
    ]);

    return {components};
});
