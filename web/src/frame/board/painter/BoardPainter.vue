<!--
 - 看板图形绘制插件
 -
 - @author 刘志栋
 - @since 2024/08/23
 -->
<script setup lang="ts">
// import { BoardCanvasShape } from '@/frame/board/boardcanvas/BoardCanvasShape';
// import { useCanvasStore } from '@/stores/canvas';
// import { computed, onMounted, ref, watch } from 'vue';

// const canvasStore = useCanvasStore();

// // canvas ref
// const canvasRef = ref(null);

// // 图形绘制指令集合
// const canvasCmds = computed(() => useCanvasStore().boardCanvasCmds);
// /**
//  * 图形绘制方法
//  */
// const drawShapes = () => {
//     // 清空画布
//     const canvas = canvasRef.value;
//     const ctx = canvas.getContext('2d');
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     // 设置画布尺寸
//     canvas.width = canvas.clientWidth;
//     canvas.height = canvas.clientHeight;
//     // 遍历执行绘图指令
//     canvasCmds.value.forEach((cmd) => {
//         cmd.render(new BoardCanvasShape(ctx));
//     });
//     // 点击选中的图形时在控制台打印图形数据
//     canvas.addEventListener('click', (e) => {
//         const x = e.offsetX;
//         const y = e.offsetY;
//         console.log(`click at (${x}, ${y})`);
        
//     });
// }

// // 挂载时绘制图形
// onMounted(() => {
//     drawShapes();
// });

// // 监听视图窗口位置和缩放变化 触发重绘
// const viewRect = computed(() => useCanvasStore().currentViewRect);
// const scale = computed(() => useCanvasStore().scale);
// watch([viewRect, scale], () => {
//     drawShapes();
// }, { deep: true });

// // 监听图形数据变化 触发重绘
// watch(() => canvasCmds, () => {
//     drawShapes();
// }, { deep: true });

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
