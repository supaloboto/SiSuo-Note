<!--
 - 组件连接线操作点
 -
 - @author 刘志栋
 - @since 2024/08/23
 -->
<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { Component } from "@/components/Component";
import { useCanvasStore } from "@/stores/canvas";
import { LinkLine, LinkLineRenderCmd } from "./LinkLine";
import { BoardShapeCommand } from "@/frame/board/shape/BoardShape";
import { useKanbanStore } from "@/stores/kanban";

/*------ 四个触发点 ------*/
const handlers = ref<string[]>(['n', 'e', 'w', 's']);

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

/*------ 新建连线逻辑 ------*/
const currentLink = ref<LinkLine | null>(null);
const linkWatch = ref(null);
/**
 * 开始拖动连线
 */
const linkStart = (evt: MouseEvent, handler: string) => {
    // 计算起始点位置 由于组件边框样式影响 需要根据handler位置稍微调整
    const compPos = props.compData.pos;
    const handlerPos = {
        n: { x: compPos.x + props.compData.rect.width / 2, y: compPos.y + 1, direct: 'n' },
        e: { x: compPos.x + props.compData.rect.width - 1, y: compPos.y + props.compData.rect.height / 2, direct: 'e' },
        w: { x: compPos.x + 1, y: compPos.y + props.compData.rect.height / 2, direct: 'w' },
        s: { x: compPos.x + props.compData.rect.width / 2, y: compPos.y + props.compData.rect.height + 1, direct: 's' },
    }[handler];
    // 生成临时连线
    currentLink.value = new LinkLine(props.compData.id, '', handlerPos, null);
    currentLink.value.active();
    // 监听鼠标移动
    linkWatch.value = watch(mousePos, (newVal) => {
        if (!currentLink.value) {
            return;
        }
        currentLink.value.changeEndPos(newVal);
    }, { deep: true });
    // 更改鼠标状态
    canvasStore.currentPointer.state = 'linking';
    // 监听鼠标抬起
    document.addEventListener('mouseup', linkEnd);
}

/**
 * 结束拖动连线
 */
const linkEnd = () => {
    if (linkWatch.value) {
        linkWatch.value();
        linkWatch.value = null;
    }
    // 记录连线数据
    props.compData.links.push(new LinkLine(props.compData.id, currentLink.value.targetCompId, currentLink.value.startPos, currentLink.value.endPos));
    // 移除临时连线
    currentLink.value.erase();
    currentLink.value = null;
    // 更改鼠标状态
    canvasStore.currentPointer.state = 'pointer';
    // 移除监听
    document.removeEventListener('mouseup', linkEnd);
}

// 组件移除时移除监听
onBeforeUnmount(() => {
    document.removeEventListener('mouseup', linkEnd);
});

</script>

<template>
    <div style="display: contents;">
        <div v-for="handler in handlers" v-show="!linkWatch" :key="handler" :class="`link-handler ${handler}`"
            @dragstart.stop.prevent="linkStart($event, handler)" draggable="true"></div>
    </div>
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
