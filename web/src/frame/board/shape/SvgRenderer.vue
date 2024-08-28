<!--
 - 看板图形绘制插件-SVG渲染
 -
 - @author 刘志栋
 - @since 2024/08/23
 -->
<script setup lang="ts">
import { BoardShape, BoardShapeSvg } from '@/frame/board/shape/BoardShape';
import { useCanvasStore } from '@/stores/canvas';
import { computed, onMounted, ref, watch } from 'vue';

const canvasStore = useCanvasStore();

// 图形绘制指令集合
const canvasCmds = computed(() => canvasStore.boardShapeCmds.filter((cmd) => cmd.type === 'svg'));
// svg列表
const svgList = ref<{
    id: string,
    shape: BoardShapeSvg,
}[]>([]);

/**
 * 图形绘制方法
 */
const drawShapes = () => {
    // 遍历执行绘图指令
    canvasCmds.value.forEach((cmd) => {
        // 获取图形数据
        const shape = cmd.doRender() as BoardShapeSvg;
        if (!shape) return;
        // 拼接svg数据
        const svg = {
            id: cmd.id,
            shape
        };
        // 检查是否已存在
        const index = svgList.value.findIndex((item) => item.id === svg.id);
        if (index === -1) {
            svgList.value.push(svg);
        } else {
            svgList.value[index] = svg;
        }
    });
}

// 挂载时绘制图形
onMounted(() => {
    drawShapes();
});

// 监听视图窗口位置和缩放变化 触发重绘
const viewRect = computed(() => canvasStore.currentViewRect);
const scale = computed(() => canvasStore.scale);
watch([viewRect, scale], () => {
    drawShapes();
}, { deep: true });

// 监听图形数据变化 触发重绘
watch(() => canvasCmds, () => {
    drawShapes();
}, { deep: true });

// 监听图形点击事件 选中图形
const shapeClick = (target: {
    id: string,
    shape: BoardShape,
}) => {
    canvasStore.selectComponent(target.id);
}

</script>

<template>
    <svg v-for="svg in svgList" :key="svg.id" :id="svg.id" xmlns="http://www.w3.org/2000/svg" version="1.1"
        class="board-shape-svg" :width="svg.shape.width" :height="svg.shape.height" :viewBox="svg.shape.viewBox"
        :style="{ left: svg.shape.clientPos.x + 'px', top: svg.shape.clientPos.y + 'px' }">
        <path v-for="path in svg.shape.paths" :key="path.path" :d="path.path" v-bind="path.attrs"
            @click="shapeClick(svg as any)" />
    </svg>
</template>

<style lang="scss" scoped>
.board-shape-svg {
    position: absolute;
    --line-stroke: #3a3d3f81;
    // 鼠标事件穿透
    pointer-events: none;

    path {
        pointer-events: painted;
    }

    path:hover {
        cursor: pointer;
        stroke-width: 12;
    }
}
</style>