<!--
 - 看板图形绘制插件-SVG渲染
 -
 - @author 刘志栋
 - @since 2024/08/23
 -->
<script setup lang="ts">
    import { BoardShapeSvg } from '@/frame/board/shape/BoardShape';
    import { useCanvasStore } from '@/stores/canvas';
    import { computed, ref, watch } from 'vue';
    import SvgLine from './SvgLine.vue';

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
        // 清空现有svg列表
        svgList.value = [];
        // 遍历执行绘图指令
        canvasCmds.value.forEach((cmd) => {
            // 获取图形数据
            const shape: BoardShapeSvg = cmd.render() as BoardShapeSvg;
            if (!shape) return;
            // 拼接svg数据
            const svg = {
                id: cmd.id,
                shape
            };
            // 检查是否已存在
            let index = svgList.value.findIndex((item) => item.id === svg.id);
            if (index === -1) {
                svgList.value.push(svg);
                index = svgList.value.length - 1;
            } else {
                svgList.value[index] = svg;
            }
            // 在命令中记录此图形的更新方式
            cmd.update = () => {
                svgList.value[index].shape = cmd.render() as BoardShapeSvg;
            };
        });
    }

    // 监听绘图命令数组的变化 当命令增加或减少时触发重绘
    const cmdIds = computed(() => canvasCmds.value.map((cmd) => cmd.id));
    watch(() => cmdIds, () => {
        drawShapes();
    }, { deep: true });

    // 监听视图窗口位置和缩放变化 触发重绘
    const viewRect = computed(() => canvasStore.currentViewRect);
    const scale = computed(() => canvasStore.scale);
    watch([viewRect, scale], () => {
        drawShapes();
    }, { deep: true });

</script>

<template>
    <SvgLine v-for="svg in svgList" :key="svg.id" :id="svg.id" :shape="(svg.shape as any)">
    </SvgLine>
</template>

<style lang="scss" scoped></style>