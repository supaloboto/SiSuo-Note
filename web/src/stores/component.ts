/**
 * 组件store
 *
 * @author 刘志栋
 * @since 2023/07/23
 */
import {defineStore, StoreDefinition} from "pinia";
import {computed, ComputedRef, ref} from "vue";
import {type Component, ComponentAction} from "@/components/Component";

export const useComponentStore = defineStore('component', () => {
    // 组件列表
    const components = ref<Component[]>([{
        type: 'note',
        id: 'test',
        pos: {x: 100, y: 120},
        rect: {width: 100, height: 100},
        data: {}
    }, {
        type: 'note',
        id: 'test2',
        pos: {x: 300, y: 320},
        rect: {width: 100, height: 100},
        data: {}
    }]);
    // 组件列表整理为map
    const componentMap = computed(() => {
        const map = new Map<string, Component>();
        components.value.forEach(component => {
            map.set(component.id, component);
        });
        return map;
    });
    // 组件行为map
    const componentActionMap = ref<Map<string, ComponentAction>>(new Map<string, ComponentAction>());

    return {components, componentMap, componentActionMap};
});
