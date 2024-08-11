<!--
 - 画布缩放控制
 -
 - @author 刘志栋
 - @since 2024/08/07
 -->
<script setup lang="ts">

// 画布缩放
import {computed, onBeforeUnmount, ref} from "vue";
import {useCanvasStore} from "@/stores/canvas";
import {roundOff} from "@/assets/utils/math";

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

// 控制条总宽度
const scrollBarWidth = 114;
// 控制按钮宽度
const scrollBtnWidth = 10;
// 按钮可移动的总宽度和移动每像素的缩放比例
const totalWidth = scrollBarWidth - scrollBtnWidth;
const scaleChangePerPixel = totalWidth / (scaleMax - scaleMin);
// 计算缩放按钮位置
const scaleBtnStyle = computed(() => {
  return {
    'margin-left': `${(currentScale.value - scaleMin) * scaleChangePerPixel}px`,
  }
})

/*------ 拖拽修改缩放比例逻辑 ------*/
const dragStartClientX = ref(null);
const dragStartScale = ref(null);
/**
 * 开始拖拽
 */
const dragStart = (evt: DragEvent) => {
  dragStartClientX.value = evt.clientX;
  dragStartScale.value = currentScale.value;
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
}
/**
 * 拖拽中
 */
const drag = (evt: MouseEvent) => {
  if (dragStartClientX.value === null) {
    return;
  }
  // 计算当前鼠标挪动距离应当造成多大的缩放变化
  const mouseOffsetX = evt.clientX - dragStartClientX.value;
  // 适当放大缩放比例变化 使得拖拽更加灵敏跟手
  const scaleChange = mouseOffsetX * scaleChangePerPixel * 3;
  const newScale = roundOff(dragStartScale.value + scaleChange, 0);
  // 当缩放比例超出限度时 使用最大或最小值
  if (newScale > scaleMax) {
    canvasStore.scale = scaleMax;
    return;
  }
  if (newScale < scaleMin) {
    canvasStore.scale = scaleMin;
    return;
  }
  canvasStore.scale = newScale;
}
/**
 * 结束拖拽
 */
const dragEnd = () => {
  dragStartClientX.value = null;
  dragStartScale.value = null;
  // 移除监听
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', dragEnd);
}
/**
 * 组件移除时移除监听
 */
onBeforeUnmount(() => {
  dragEnd();
});

</script>

<template>
  <div class="scale-bar" @mouseleave="dragEnd">
    <!-- 显示当前缩放比例 -->
    <div class="scale-current">
      {{ currentScale }}%
    </div>
    <!-- 缩放控制条 -->
    <div class="scale-minus" @click="scale(-1)">-</div>
    <div class="scale-scroller">
      <!-- 缩放控制滑钮 -->
      <div class="scale-btn" :style="scaleBtnStyle"
           draggable="true" @dragstart.stop.prevent="dragStart"></div>
    </div>
    <div class="scale-plus" @click="scale(1)">+</div>
  </div>
</template>

<style scoped>
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
  /* 注意使用scss会使此处的拼接无效 如果要使用scss可以另外构建一个computed变量 */
  width: v-bind(scrollBarWidth+ 'px');
  background-color: #d5d5d5;
}

.scale-btn {
  /* 注意使用scss会使此处的拼接无效 如果要使用scss可以另外构建一个computed变量 */
  width: v-bind(scrollBtnWidth+ 'px');
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
