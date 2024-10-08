<!--
 - 看板图形绘制插件-Canvas渲染
 -
 - @author 刘志栋
 - @since 2024/08/23
 -->
<script setup lang="ts">
    import { BoardShapeCanvas } from '@/frame/board/shape/BoardShape';
    import { useCanvasStore } from '@/stores/canvas';
    import { computed, ref, watch } from 'vue';

    const canvasStore = useCanvasStore();

    // canvas ref
    const canvasRef = ref(null);

    // 图形绘制指令集合
    const canvasCmds = computed(() => canvasStore.boardShapeCmds.filter((cmd) => cmd.type === 'canvas'));

    /**
      * 图形绘制方法
      */
    const drawShapes = () => {
        // 清空画布
        const canvas = canvasRef.value;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 设置画布尺寸
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        // 遍历执行绘图指令
        canvasCmds.value.forEach((cmd) => {
            // 获取图形数据
            const shape: BoardShapeCanvas = cmd.render() as BoardShapeCanvas;
            if (!shape) return;
            // 绘制图形
            shape.attachToCtx(ctx);
            shape.print();
            // 在命令中记录此图形的更新方式
            cmd.update = () => {
                drawShapes();
            };
        });
    }

    // 监听绘图命令数组的变化 当命令增加或减少时触发重绘
    const cmdIds = computed(() => canvasCmds.value.map((cmd) => cmd.id));
    watch(() => cmdIds, () => {
        drawShapes();
    }, { deep: true });

    // 监听视图窗口位置和缩放变化 触发重绘
    const viewRect = computed(() => useCanvasStore().currentViewRect);
    const scale = computed(() => useCanvasStore().scale);
    watch([viewRect, scale], () => {
        drawShapes();
    }, { deep: true });

</script>

<template>
    <canvas class="board-canvas" ref="canvasRef"></canvas>
</template>

<style lang="scss" scoped>
    .board-canvas {
        position: absolute;
        width: 100%;
        height: 100%;
        // 不与用户的鼠标产生交互
        pointer-events: none;
    }
</style>