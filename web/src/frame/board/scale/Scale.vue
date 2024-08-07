<!--
 - 画布缩放控制
 -
 - @author 刘志栋
 - @since 2024/08/07
 -->
<script setup lang="ts">

// 画布缩放
import {computed} from "vue";
import {useCanvasStore} from "@/stores/canvas";

const canvasStore = useCanvasStore();

// 当前缩放比例
const currentScale = computed(() => canvasStore.scale);

// 缩放限度
const scaleMax = canvasStore.scaleMax;
const scaleMin = canvasStore.scaleMin;
// 缩放步长
const scaleStep = 5;
/**
 * 缩放
 * @param addStep
 */
const scale = (addStep: number) => {
  canvasStore.zoom(scaleStep, addStep);
}

// 计算缩放按钮位置
const scaleBtnStyle = computed(() => {
  // 总宽度(用样式表决定 .scale-scroller的宽度减去.scale-btn的宽度)
  const totalWidth = 104;
  // 获取每份的宽度
  const scaleWidth = totalWidth / (scaleMax - scaleMin);
  return {
    'margin-left': `${(currentScale.value - scaleMin) * scaleWidth}px`,
  }
})

</script>

<template>
  <div class="scale-bar">
    <div class="scale-current">
      {{ currentScale }}%
    </div>
    <div class="scale-minus" @click="scale(-1)">-</div>
    <div class="scale-scroller">
      <div class="scale-btn" :style="scaleBtnStyle"></div>
    </div>
    <div class="scale-plus" @click="scale(1)">+</div>
  </div>
</template>

<style scoped lang="scss">
.scale-bar {
  position: absolute;
  display: flex;
  bottom: 10px;
  right: 10px;
  width: 220px;
  height: 20px;
  background-color: #fff;
  border: 1px solid #c7c7c7;
  border-radius: 5px;
  z-index: 100;
  user-select: none;
}

.scale-current {
  width: 60px;
  text-align: center;
  line-height: 20px;
  font-size: 14px;
  color: #8c8c8c;
}

.scale-plus, .scale-minus {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  color: #5c5c5c;
  background-color: #f0f0f0;
  border-radius: 15px;
  text-align: center;
  line-height: 14px;
  cursor: pointer;
}

.scale-plus {
  margin-right: 10px;
  margin-left: 2px;
}

.scale-minus {
  margin-right: 2px;
}

.scale-plus:hover, .scale-minus:hover {
  background-color: #b8b6b6;
}

.scale-scroller {
  height: 3px;
  margin-top: 8px;
  width: 114px;
  background-color: #d5d5d5;
}

.scale-btn {
  width: 10px;
  height: 11px;
  margin-top: -4px;
  border-radius: 10px;
  background-color: #8e8e8e;
  cursor: pointer;
}

.scale-btn:hover {
  background-color: #606060;
}
</style>
