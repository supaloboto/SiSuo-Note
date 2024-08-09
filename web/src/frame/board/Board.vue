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
import Scale from "@/frame/board/scale/Scale.vue";

const canvasStore = useCanvasStore();
const componentStore = useComponentStore();

// 获取组件列表
const components = computed(() => componentStore.components);

// 监听鼠标位置 同步到store
const scale = computed(() => canvasStore.scale / 100);
const viewRect = computed(() => canvasStore.currentViewRect);
const mouseMove = (evt: MouseEvent) => {
  // 获取画布的上边距和左边距
  const canvas = document.getElementById("sisuo-canvas");
  const canvasRect = canvas.getBoundingClientRect();
  // 记录鼠标在视图中的位置
  canvasStore.currentPointer.clientX = evt.clientX - canvasRect.left;
  canvasStore.currentPointer.clientY = evt.clientY - canvasRect.top;
  // 计算鼠标在画布上的坐标
  // 求画布dom中心的客户端坐标
  const clientCenter = {
    clientX: canvasRect.left + canvasRect.width / 2,
    clientY: canvasRect.top + canvasRect.height / 2,
  }
  // 求鼠标位置与此中心坐标的差 并除以缩放比例
  const mousePosOffset = {
    x: (evt.clientX - clientCenter.clientX) / scale.value,
    y: (evt.clientY - clientCenter.clientY) / scale.value,
  }
  // 将差值修约至小数点后三位 以抹去js浮点数计算精度问题导致的误差
  mousePosOffset.x = Math.round(mousePosOffset.x * 1000) / 1000;
  mousePosOffset.y = Math.round(mousePosOffset.y * 1000) / 1000;
  // 差值与当前画布中心点坐标叠加 求得鼠标在画布上的位置
  canvasStore.currentPointer.x = viewRect.value.x + mousePosOffset.x;
  canvasStore.currentPointer.y = viewRect.value.y + mousePosOffset.y;
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
      <!-- 定位居中 -->
      <div class="canvas-center">
        <sisuo-comp v-for="(comp,index) in components" :key="comp.id" :compData="comp"></sisuo-comp>
      </div>
    </div>
    <!-- 缩放工具 -->
    <Scale></Scale>
  </div>
</template>

<style lang="scss" scoped>
#sisuo-canvas {
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: var(--board-background-color);

  // 简单辅助线网格背景
  //background-image: linear-gradient(#dddddd 1px, transparent 0), linear-gradient(90deg, #dddddd 1px, transparent 0);
  //background-size: 30px 30px;

  // 细致辅助线网格背景
  background-image: linear-gradient(#dddddd 1px, transparent 0), linear-gradient(90deg, #dddddd 1px, transparent 0),
  linear-gradient(#ededed 1px, transparent 0), linear-gradient(90deg, #ededed 1px, transparent 0);
  background-size: 75px 75px, 75px 75px, 15px 15px, 15px 15px;

  // 点阵背景
  //background-image: radial-gradient(circle, #dddddd 1px, transparent 0);
  //background-size: 30px 30px;

}

.canvas-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

</style>
