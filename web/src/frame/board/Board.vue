<!--
 - 画布
 -
 - @author 刘志栋
 - @since 2024/07/10
 -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, type StyleValue } from "vue";
import { useGlobalStore } from "@/stores/global";
import { useCanvasStore } from "@/stores/canvas";
import { useKanbanStore } from "@/stores/kanban";
import { Hotkeys } from "@/frame/board/hotkeys";
import Toolbar from "@/frame/board/toolbar/Toolbar.vue";
import SisuoComp from "@/components/Component.vue";
import Scale from "@/frame/board/scale/Scale.vue";
import BoardPainter from "@/frame/board/painter/BoardPainter.vue";
import BoardShapeSvg from "@/frame/board/shape/BoardShapeSvg.vue";

const canvasStore = useCanvasStore();
const kanbanStore = useKanbanStore();
const globalStore = useGlobalStore();

// 获取组件列表
const tempComponent = computed(() => canvasStore.tempComponent);
const components = computed(() => kanbanStore.components);

// 鼠标拖拽移动开关
const viewDragging = ref<boolean>(false);
// 获取当前视图参数
const scale = computed(() => canvasStore.scale / 100);
const viewRect = computed(() => canvasStore.currentViewRect);
/**
 * 记录视图宽高数据
 */
const updateRectSize = () => {
  const rect = document.getElementById("sisuo-canvas").getBoundingClientRect();
  canvasStore.currentViewRect.clientWidth = rect.width;
  canvasStore.currentViewRect.clientHeight = rect.height;
  canvasStore.currentViewRect.width = rect.width / scale.value;
  canvasStore.currentViewRect.height = rect.height / scale.value;
}
onMounted(() => {
  updateRectSize();
  window.addEventListener('resize', updateRectSize);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateRectSize);
});

/**
 * 监听鼠标位置 同步到store
 * @param evt
 */
const mouseMove = (evt: MouseEvent) => {
  // 当正在拖拽视图时 不更新鼠标位置 避免触发各种事件
  if (viewDragging.value) {
    canvasStore.currentViewRect.x -= evt.movementX / scale.value;
    canvasStore.currentViewRect.y -= evt.movementY / scale.value;
    return;
  }
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
/**
 * 当鼠标按下时 检查是否是鼠标右键 是右键则进入拖拽移动视图模式
 * @param evt
 */
const onMouseDown = (evt: MouseEvent) => {
  if (evt.button !== 2) {
    return;
  }
  evt.preventDefault();
  viewDragging.value = true;
  // 在document上监听鼠标抬起事件
  document.addEventListener('mouseup', onMouseUp);
}
/**
 * 当鼠标抬起时 若当前正处于拖拽移动视图模式 则退出
 */
const onMouseUp = () => {
  viewDragging.value = false;
  document.removeEventListener('mouseup', onMouseUp);
}

/**
 * 左键点击空白处 取消选中
 */
const clickBlank = () => {
  canvasStore.currentPointer.selected = [];
}
/**
 * 右键点击空白处 弹出右键菜单
 */
const rightClickBlank = (evt: MouseEvent) => {
  evt.preventDefault();
  if (viewDragging.value) {
    return;
  }
  // todo 弹出右键菜单
}

// 监听键盘事件
Hotkeys.init();

// 鼠标是否处于组件创建状态
const cursorCreatingMode = computed(() => canvasStore.currentPointer.state.startsWith('creating'));
// 鼠标状态
const cursorState = computed(() => {
  if (viewDragging.value) {
    return 'grabbing';
  }
  if (cursorCreatingMode.value) {
    return 'creating';
  }
});

// 背景类型
const boardBgType = computed(() => globalStore.sysConfig.boardBgType);
// 背景样式
const boardBgStyle = computed<StyleValue>(() => {
  if (boardBgType.value === 'none') {
    return {};
  }
  // 背景类型
  switch (boardBgType.value) {
    // 简单辅助线网格背景
    case 'lattice1':
      const latticeSize = 60 * scale.value;
      return {
        backgroundImage: 'linear-gradient(#e1e1e1 2px, transparent 0), linear-gradient(90deg, #e1e1e1 1px, transparent 0)',
        backgroundSize: `${latticeSize}px ${latticeSize}px`,
      }
    // 细致辅助线网格背景
    case 'lattice2':
      const latticeOuterSize = 150 * scale.value;
      const latticeInnerSize = 30 * scale.value;
      return {
        backgroundImage: 'linear-gradient(#e1e1e1 2px, transparent 0), linear-gradient(90deg, #e1e1e1 1px, transparent 0), linear-gradient(#ededed 1px, transparent 0), linear-gradient(90deg, #ededed 1px, transparent 0)',
        backgroundSize: `${latticeOuterSize}px ${latticeOuterSize}px, ${latticeOuterSize}px ${latticeOuterSize}px, ${latticeInnerSize}px ${latticeInnerSize}px, ${latticeInnerSize}px ${latticeInnerSize}px`,
      }
    // 点阵背景
    case 'dot1':
      const dotSize = 30 * scale.value;
      return {
        backgroundImage: 'radial-gradient(circle, #c1c1c1 1px, transparent 0)',
        backgroundSize: `${dotSize}px ${dotSize}px`,
      }
  }
});
// 背景位置
const boardBgPos = computed(() => {
  // 因为背景位置定义的是背景的左上角 所以需要结合视图中心和大小计算背景位置
  const x = viewRect.value.x * scale.value - viewRect.value.clientWidth / 2;
  const y = viewRect.value.y * scale.value - viewRect.value.clientHeight / 2;
  return {
    backgroundPosition: `${-x}px ${-y}px`,
  }
});

</script>

<template>
  <div class="board-div">
    <!-- 侧边栏 -->
    <Toolbar v-show="!cursorCreatingMode"></Toolbar>
    <!-- 组件 -->
    <div id="sisuo-canvas" :class="[cursorState]" :style="[boardBgStyle, boardBgPos]" @mousemove="mouseMove"
      @click="clickBlank" @mousedown="onMouseDown" @mouseup="onMouseUp" @contextmenu="rightClickBlank">
      <!-- 定位居中 为了计算缩放方便 视图采用中心点为坐标原点的定位方式 因此需要让所有组件的渲染以窗口中心为原点 -->
      <div class="canvas-center">
        <!-- 渲染组件 -->
        <sisuo-comp v-for="(comp, index) in components" :key="comp.id" :compData="comp"></sisuo-comp>
        <!-- 渲染组件占位符 -->
        <sisuo-comp v-if="tempComponent" :key="tempComponent.id" :compData="tempComponent"></sisuo-comp>
      </div>
    </div>
    <!-- 缩放工具 -->
    <Scale></Scale>
    <!-- 绘图工具 -->
    <BoardPainter></BoardPainter>
    <!-- 形状绘制器 -->
    <BoardShapeSvg></BoardShapeSvg>
  </div>
</template>

<style lang="scss" scoped>
#sisuo-canvas {
  position: absolute;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: var(--board-background-color);
}

.grabbing {
  cursor: grabbing;
}

.creating {
  cursor: none !important;
}

.canvas-center {
  position: absolute;
  top: 50%;
  left: 50%;
}
</style>
