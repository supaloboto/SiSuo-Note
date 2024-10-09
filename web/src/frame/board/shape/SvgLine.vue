<!--
 - SVG线条图形 用于提供与图形的交互
 -
 - @author 刘志栋
 - @since 2024/10/07
 -->

<script setup lang="ts">
    import { BoardShapeSvg } from '@/frame/board/shape/BoardShape';
    import { useCanvasStore } from '@/stores/canvas';
    import { computed, ref, watch } from 'vue';

    const canvasStore = useCanvasStore();

    const props = defineProps<{
        id: string,
        shape: BoardShapeSvg
    }>();

    // 悬浮状态标识
    const hovering = ref(false);

    // 处理图形点击事件
    const clickTimer = ref<number | null>(null);
    // 监听图形点击事件
    const shapeClick = () => {
        // 延时以区分单击和双击
        if (clickTimer.value) {
            clearTimeout(clickTimer.value);
            clickTimer.value = null;
            return;
        }
        clickTimer.value = setTimeout(() => {
            canvasStore.boardShapeCmds.find((cmd) => cmd.id === props.id)?.click();
            clickTimer.value = null;
        }, 200) as unknown as number;
    }
    // 监听图形双击事件
    const shapeDblclick = () => {
        canvasStore.boardShapeCmds.find((cmd) => cmd.id === props.id)?.dblclick();
    }

    /*------ 拖拽逻辑 ------*/
    // 从store中获取鼠标位置
    const mousePos = computed(() => canvasStore.currentPointer);
    // 拖拽监听
    const dragWatch = ref(null);
    // 拖拽事件 拖拽事件本来记录在path中 但随着拖拽进行path往往发生变化 所以在拖拽开始时记录拖拽事件
    let dragStartEvent = null;
    let dragEvent = null;
    let dragEndEvent = null;
    /**
     * 开始拖拽方法
     */
    const dragStart = (path) => {
        // 记录拖动事件
        dragStartEvent = path.dragStart;
        dragEvent = path.dragTo;
        dragEndEvent = path.dragEnd;
        // 触发拖动开始事件
        dragStartEvent?.();
        // 建立监听 在拖拽中移动组件
        dragWatch.value = watch(mousePos, (pos) => {
            dragEvent(pos);
        }, { deep: true });
        // 因为有时候鼠标移动太快会导致监听不到mouseup事件 所以在document上建立监听
        document.addEventListener('mouseup', dragEnd);
    }
    /**
     * 结束拖拽方法
     * 因为dragStart需要preventDefault 所以dragEnd不能被自动触发 因此将停止拖拽的逻辑放在mouseUp上处理
     */
    const dragEnd = () => {
        dragWatch.value && dragWatch.value();
        dragWatch.value = null;
        // 触发拖动结束事件
        dragEndEvent?.();
        // 清空拖动相关事件
        dragStartEvent = null;
        dragEvent = null;
        dragEndEvent = null;
        // 移除document上的监听
        document.removeEventListener('mouseup', dragEnd);
    }

</script>

<template>
    <div v-for="path in shape.paths" :draggable="path.dragTo !== null" @dragstart.stop.prevent="dragStart(path)">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
            :class="{ 'board-shape-svg': true, 'board-shape-svg-hover': hovering }" :viewBox="shape.viewBox"
            :width="shape.width" :height="shape.height"
            :style="{ left: shape.clientPos.x + 'px', top: shape.clientPos.y + 'px' }" @mousedown="shapeClick()"
            @dblclick="shapeDblclick()" @mouseover="hovering = true" @mouseleave="hovering = false">
            <path :key="path.id" :d="path.pathStr" v-bind="path.attrs" />
        </svg>
    </div>
</template>

<style lang="scss" scoped>
    .board-shape-svg {
        position: absolute;
        // 鼠标事件穿透
        pointer-events: none;

        path {
            pointer-events: painted;
            // 可使用的颜色变量
            --line-stroke: v-bind('props.shape.stroke');
            --line-fill-endpoint: var(--comp-link-end-point-color);
        }
    }

    .board-shape-svg-hover {
        path {
            cursor: pointer;
            --line-stroke: v-bind('props.shape.hoverStroke');
            --line-fill-endpoint: var(--comp-link-end-point-color);
        }
    }
</style>