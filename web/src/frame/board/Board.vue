<!--
 - 画布
 -
 - @author 刘志栋
 - @since 2024/07/10
 -->
<script setup lang="ts">
import {computed} from "vue";
import {useCanvasStore} from "@/stores/canvas";
import {useComponentStore} from "@/stores/component";
import {Hotkeys} from "@/frame/board/hotkeys";
import Toolbar from "@/frame/board/toolbar/Toolbar.vue";
import SisuoComp from "@/components/Component.vue";

const canvasStore = useCanvasStore();
const componentStore = useComponentStore();

// 获取组件列表
const components = computed(() => componentStore.components);

// 监听鼠标位置 同步到store
const mouseMove = (evt: MouseEvent) => {
  // 获取画布的上边距和左边距
  const canvas = document.getElementById("sisuo-canvas");
  const canvasRect = canvas.getBoundingClientRect();
  // todo 计算画布缩放
  canvasStore.currentPointer.x = evt.clientX - canvasRect.left;
  canvasStore.currentPointer.y = evt.clientY - canvasRect.top;
  canvasStore.currentPointer.clientX = evt.clientX - canvasRect.left;
  canvasStore.currentPointer.clientY = evt.clientY - canvasRect.top;
}

// 点击空白处 取消选中
const clickBlank = () => {
  canvasStore.currentPointer.selected = [];
}

// 监听键盘事件
Hotkeys.init();

</script>

<template>
  <div class="board-div">
    <!-- 侧边栏 -->
    <toolbar></toolbar>
    <!-- 组件 -->
    <div id="sisuo-canvas" @mousemove="mouseMove" @click="clickBlank">
      <sisuo-comp v-for="(comp,index) in components" :key="comp.id" :compData="comp"></sisuo-comp>
    </div>
  </div>
</template>

<style scoped>
#sisuo-canvas {
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: var(--board-background-color);
}
</style>
