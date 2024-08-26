<!--
 - 组件连接线
 -
 - @author 刘志栋
 - @since 2024/08/23
 -->
<script setup lang="ts">
import { LinkLine, LinkLinePrintCmd } from '@/components/plugins/link/LinkLine';
import { useCanvasStore } from '@/stores/canvas';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
    lineData: { type: LinkLine, required: true },
});

const canvasStore = useCanvasStore();

/**
 * 注册绘图指令方法
 */
const addLineRenderCmd = () => {
    const lineRenderCmd = new LinkLinePrintCmd(props.lineData);
    canvasStore.boardCanvasCmds.push(lineRenderCmd);
}

onMounted(() => {
    addLineRenderCmd();
});

</script>

<template>
</template>

<style lang="scss" scoped></style>
