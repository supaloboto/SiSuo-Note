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

// 连线指令
const shapeCmd = ref<BoardShapeCommand>(null);
const currentLink = ref<LinkLine | null>(null);
const linkWatch = ref(null);
/**
 * 开始拖动连线
 */
const linkStart = (evt: MouseEvent, handler: string) => {
    // 计算起始点位置
    const compPos = props.compData.pos;
    const handlerPos = {
        n: { x: compPos.x + props.compData.rect.width / 2, y: compPos.y },
        e: { x: compPos.x + props.compData.rect.width, y: compPos.y + props.compData.rect.height / 2 },
        w: { x: compPos.x, y: compPos.y + props.compData.rect.height / 2 },
        s: { x: compPos.x + props.compData.rect.width / 2, y: compPos.y + props.compData.rect.height },
    }[handler];
    // 生成临时连线
    currentLink.value = new LinkLine([handlerPos]);
    shapeCmd.value = new LinkLineRenderCmd(currentLink.value).useCanvas();
    // 监听鼠标移动
    linkWatch.value = watch(mousePos, (newVal) => {
        if (currentLink.value) {
            // 移除起始点外的点
            currentLink.value.path.splice(1);
            // 添加新的点
            if (handler === 'w' || handler === 'e') {
                // 如果是左右的handler 则从横向的中点切分为折线
                const midX = (handlerPos.x + newVal.x) / 2;
                // 当垂直距离小于5时，不切分为折线
                if (Math.abs(handlerPos.y - newVal.y) < 5) {
                    currentLink.value.path.push({ x: newVal.x, y: handlerPos.y });
                    return;
                }
                // 添加中点和终点
                currentLink.value.path.push(
                    { x: midX, y: handlerPos.y },
                    { x: midX, y: newVal.y },
                    { x: newVal.x, y: newVal.y }
                );
            } else {
                // 如果是上下的handler 则从纵向的中点切分为折线
                const midY = (handlerPos.y + newVal.y) / 2;
                // 当横向距离小于5时，不切分为折线
                if (Math.abs(handlerPos.x - newVal.x) < 5) {
                    currentLink.value.path.push({ x: handlerPos.x, y: newVal.y });
                    return;
                }
                // 添加中点和终点
                currentLink.value.path.push(
                    { x: handlerPos.x, y: midY },
                    { x: newVal.x, y: midY },
                    { x: newVal.x, y: newVal.y }
                );
            }
        }
    }, { deep: true });
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
    props.compData.links.push(currentLink.value);
    // 移除临时连线
    currentLink.value = null;
    shapeCmd.value.erase();
    shapeCmd.value = null;
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
