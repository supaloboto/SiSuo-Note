<!--
 - 组件连接线操作点
 -
 - @author 刘志栋
 - @since 2024/08/23
 -->
<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
/*------ 四个触发点 ------*/
const handlers = ref<string[]>(['n', 'e', 'w', 's']);
const linkWatch = ref(null);
import { Component } from "@/components/Component";
import { useCanvasStore } from "@/stores/canvas";

const props = defineProps({
    compData: { type: Component, required: true },
});

// 获取鼠标位置
const canvasStore = useCanvasStore();
const mousePos = computed(() => canvasStore.currentPointer);

/**
 * 仅点击触发点
 */
const clickHandler = () => {
    // todo 寻找最近的组件并连接 或创建新的组件
}

/**
 * 开始拖动连线
 */
const linkStart = (evt: MouseEvent, handler: string) => {
    // todo 生成连线
    // todo 选中连线
}

</script>

<template>
    <div v-for="handler in handlers" :key="handler" :class="`link-handler ${handler}`"
        @dragstart.stop.prevent="linkStart($event, handler)" @click.stop="clickHandler" draggable="true"></div>
</template>

<style lang="scss" scoped>
$handler-size: 14px;
$handler-margin: 24px;
$handler-expand-size: 26px;
$handler-expand-margin: 36px;

/* 触发点样式 */
.link-handler {
    position: absolute;
    width: $handler-size;
    height: $handler-size;
    background-color: var(--link-line-handler-fill-color);
    border: 1px solid var(--link-line-handler-border-color);
    border-radius: 40%;
    transition: all 0.1s;
}

.link-handler:hover {
    width: $handler-expand-size;
    height: $handler-expand-size;
    cursor: pointer;
}

.w {
    top: calc(50% - $handler-size / 2);
    left: -$handler-margin;
}

.w:hover {
    top: calc(50% - $handler-expand-size / 2);
    left: -$handler-expand-margin;
}

.e {
    top: calc(50% - $handler-size / 2);
    right: -$handler-margin;
}

.e:hover {
    top: calc(50% - $handler-expand-size / 2);
    right: -$handler-expand-margin;
}

.n {
    top: -$handler-margin;
    left: calc(50% - $handler-size / 2);
}

.n:hover {
    top: -$handler-expand-margin;
    left: calc(50% - $handler-expand-size / 2);
}

.s {
    bottom: -$handler-margin;
    left: calc(50% - $handler-size / 2);
}

.s:hover {
    bottom: -$handler-expand-margin;
    left: calc(50% - $handler-expand-size / 2);
}
</style>
