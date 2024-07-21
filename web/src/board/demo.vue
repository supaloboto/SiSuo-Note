/**
* 画布
*
* @author 刘志栋
* @version 1.0
* @since 2024/07/10
*/
<script setup>
import {computed, ref} from "vue";
import {useCanvasStore} from "@/store/canvas";

const canvasStore = useCanvasStore();

// 获取组件列表
const components = computed(() => canvasStore.components);

// 监听鼠标位置 同步到store
const mouseMove = (evt) => {
  canvasStore.currentPointer.x = evt.clientX;
  canvasStore.currentPointer.y = evt.clientY;
}

</script>

<template>
  <div id="sisuo-canvas" @mousemove="mouseMove">
    <sisuo-comp v-for="(comp,index) in components" :key="comp.id" :component="comp"></sisuo-comp>
  </div>
</template>

<style scoped>
#sisuo-canvas {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
