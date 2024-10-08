<!--
 - SVG线条图形 用于提供与图形的交互
 -
 - @author 刘志栋
 - @since 2024/10/07
 -->

<script setup lang="ts">
    import { BoardShapeSvg } from '@/frame/board/shape/BoardShape';
    import { useCanvasStore } from '@/stores/canvas';
    import { ref } from 'vue';

    const canvasStore = useCanvasStore();

    const props = defineProps<{
        id: string,
        shape: BoardShapeSvg
    }>();

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

</script>

<template>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="board-shape-svg" :viewBox="shape.viewBox"
        :width="shape.width" :height="shape.height"
        :style="{ left: shape.clientPos.x + 'px', top: shape.clientPos.y + 'px' }" @click="shapeClick()"
        @dblclick="shapeDblclick()">
        <path v-for="path in shape.paths" :key="path.path" :d="path.path" v-bind="path.attrs" />
    </svg>
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

    .board-shape-svg:hover {
        path {
            cursor: pointer;
            --line-stroke: v-bind('props.shape.hoverStroke');
            --line-fill-endpoint: var(--comp-link-end-point-color);
        }
    }
</style>