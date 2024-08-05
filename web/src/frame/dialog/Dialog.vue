<!--
 - 对话框组件
 -
 - @author 刘志栋
 - @since 2024/07/31
 -->
<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  StyleValue, toRef, watch,
} from "vue";
import type {Dialog} from "@/frame/dialog/Dialog";
import {useDialogStore} from "@/stores/dialog";

const dialogStore = useDialogStore();

const props = defineProps<{
  dialog: Dialog;
  dialogIndex: number;
}>();

// 对话框位置和尺寸
const pos = toRef(props.dialog, 'pos');
const rect = toRef(props.dialog, 'rect');
// 对话框堆叠索引 越小越靠上
const dialogStackIndex = computed(() => dialogStore.dialogStack.indexOf(props.dialog.id));

// 对话框位置样式
const posStyle = computed<StyleValue>(() => {
  return {
    position: 'absolute',
    left: `${pos.value.clientX}px`,
    top: `${pos.value.clientY}px`,
    // 预留的z-index为200-299 (dialogStackIndex越小越靠上 可能为-1)
    'z-index': 298 - dialogStackIndex.value,
    width: `${rect.value.width}px`,
    height: `${rect.value.height}px`,
    opacity: props.dialog.animation.opacity,
  }
});

/*------ 对话框拖拽逻辑 ------*/
const dragStartPos = ref(null);
/**
 * 开始拖拽
 */
const dragStart = (evt: MouseEvent) => {
  // 记录鼠标位置 用于计算运动距离
  dragStartPos.value = {
    clientX: evt.clientX,
    clientY: evt.clientY,
  };
  // 拖拽开始时给document添加监听
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);
}
/**
 * 处理拖拽
 */
const drag = (evt: MouseEvent) => {
  if (!dragStartPos.value) {
    return;
  }
  // 计算运动距离 添加至对话框位置
  // 此处的evt.movementX和evt.movementY会固定为0 所以需要手动根据记录的位置来计算
  pos.value.clientX += evt.clientX - dragStartPos.value.clientX;
  pos.value.clientY += evt.clientY - dragStartPos.value.clientY;
  dragStartPos.value = {
    clientX: evt.clientX,
    clientY: evt.clientY,
  };
}
/**
 * 结束拖拽
 */
const dragEnd = () => {
  dragStartPos.value = null;
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

/*------ 对话框尺寸拖动逻辑 ------*/
const wrappers = ref<string[]>(['n', 'e', 'w', 's', 'nw', 'ne', 'sw', 'se']);
const resizingWrapper = ref(null);
/**
 * 开始调整大小
 */
const resizeStart = (evt: MouseEvent, wrapper: string) => {
  resizingWrapper.value = wrapper;
  // 因为@dragstart会在鼠标已经做了一定位移之后才触发 所以这里先手动调用一次 避免出现鼠标移动较快时定位点不跟手的情况
  resizeComp(evt);
  // 建立监听
  document.addEventListener('mousemove', resizeComp);
  document.addEventListener('mouseup', resizeEnd);
}

/**
 * 组件大小调整方法
 */
const resizeComp = (evt: MouseEvent) => {
  const wrapper = resizingWrapper.value;
  if (!wrapper) {
    return;
  }
  // 获取当前由[选中定位点的对角点]与[鼠标位置]构成的矩阵宽高
  const currentRect = {
    width: wrapper.includes('w') ? (pos.value.clientX + rect.value.width - evt.clientX) : (evt.clientX - pos.value.clientX),
    height: wrapper.includes('n') ? (pos.value.clientY + rect.value.height - evt.clientY) : (evt.clientY - pos.value.clientY),
  };
  if (wrapper.includes('w') || wrapper.includes('e')) {
    // 以50px为最小宽度 调整组件宽度
    const widthOffset = currentRect.width - rect.value.width;
    if (rect.value.width + widthOffset > 50) {
      rect.value.width += widthOffset;
      // 如果是调整了左边的两个点 则需要调整位置
      if (wrapper.includes('w')) {
        pos.value.clientX -= widthOffset;
      }
    }
  }
  if (wrapper.includes('n') || wrapper.includes('s')) {
    // 以50px为最小高度 调整组件高度
    const heightOffset = currentRect.height - rect.value.height;
    if (rect.value.height + heightOffset > 50) {
      rect.value.height += heightOffset;
      // 如果是调整了上边的两个点 则需要调整位置
      if (wrapper.includes('n')) {
        pos.value.clientY -= heightOffset;
      }
    }
  }
}

/**
 * 结束调整大小
 */
const resizeEnd = () => {
  resizingWrapper.value = null;
  // 移除document上的监听
  document.removeEventListener('mousemove', resizeComp);
  document.removeEventListener('mouseup', resizeEnd);
}

</script>

<template>
  <div class="dialog-div" :class="{focus:dialogStackIndex===0, moving:!!dragStartPos || !!resizingWrapper}"
       :style="posStyle"
       v-show="dialog.visible" @click="dialog.focus()">
    <!-- 标题栏 -->
    <div class="dialog-title" draggable="true" @dragstart.stop.prevent="dragStart">
      <!-- 标题文字 -->
      <div class="dialog-title-text">{{ dialog.title }}</div>
      <!-- 按钮 -->
      <button class="dialog-btn close" @click="dialog.close">
        <icon name="system-close"/>
      </button>
      <button class="dialog-btn expand" @click="dialog.fullscreen">
        <icon v-if="!dialog.maximized" name="system-expand"/>
        <icon v-else name="system-shrink"/>
      </button>
      <button class="dialog-btn minimize" @click="dialog.minimize(null)">
        <icon name="system-minimize"/>
      </button>
    </div>
    <!-- 内容 -->
    <div class="dialog-content" v-show="!dialog.animation.animating">
      <slot></slot>
    </div>
    <!-- 四角定位 -->
    <div v-for="wrapper in wrappers" :key="wrapper"
         :class="`resize-wrapper ${wrapper}`"
         draggable="true"
         @dragstart.stop.prevent="resizeStart($event,wrapper)"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
$dialog-title-height: 29px;

// 对话框整体样式
.dialog-div {
  border: 1px solid var(--dialog-border-color);
  border-radius: 5px;
  background-color: var(--dialog-background-color);
  box-shadow: 0 0 15px 5px var(--dialog-shadow-color);;
  // 动画效果
  transition: top 0.2s, left 0.2s, width 0.2s, height 0.2s, opacity 0.2s;
}

// 聚焦效果
.dialog-div.focus {
  border-color: var(--dialog-focus-border-color);

  .dialog-title {
    background-color: var(--dialog-focus-title-background-color);
    border-bottom-color: var(--dialog-focus-border-color);
  }
}

// 拖动时取消动画效果
.dialog-div.moving {
  cursor: move;
  transition: none;
}

// 对话框标题样式
.dialog-title {
  height: $dialog-title-height;
  align-content: center;
  user-select: none;
  background-color: var(--dialog-title-background-color);
  border-bottom: 1px solid var(--dialog-border-color);
  border-radius: 5px 5px 0 0;

  .dialog-title-text {
    color: var(--dialog-title-text-color);
    float: left;
    margin-left: 10px;
    height: 25px;
    width: calc(100% - 200px);
    // 避免文字溢出
    line-height: 26px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

// 对话框内容样式
.dialog-content {
  // 高度为总高度减去标题栏高度和边框高度
  height: calc(100% - #{$dialog-title-height} - 1);
}

// 对话框按钮样式
.dialog-btn {
  float: right;
  margin-right: 5px;
  width: 24px;
  height: 24px;
  padding: 0;
  cursor: pointer;
  border: 1px solid var(--dialog-btn-border-color);
  border-radius: 2px;

  svg {
    --path-fill: var(--dialog-btn-icon-color);
    margin: 1px;
    width: 20px;
    height: 20px;
  }

  &.close {
    margin-right: 10px;
    background-color: var(--dialog-btn-close-color);
  }

  &.close:hover {
    background-color: var(--dialog-btn-close-hover-color);
  }

  &.expand {
    background-color: var(--dialog-btn-expand-color);
  }

  &.expand:hover {
    background-color: var(--dialog-btn-expand-hover-color);
  }

  &.minimize {
    background-color: var(--dialog-btn-minimize-color);
  }

  &.minimize:hover {
    background-color: var(--dialog-btn-minimize-hover-color);
  }
}

// 四角定位样式
.resize-wrapper {
  position: absolute;
  width: 10px;
  height: 10px;
}

.n {
  width: calc(100% - 16px);
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: n-resize;
}

.e {
  height: calc(100% - 16px);
  top: 50%;
  right: -5px;
  transform: translateY(-50%);
  cursor: e-resize;
}

.w {
  height: calc(100% - 16px);
  top: 50%;
  left: -5px;
  transform: translateY(-50%);
  cursor: w-resize;
}

.s {
  width: calc(100% - 16px);
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: s-resize;
}

.nw {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}

.ne {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}

.sw {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}

.se {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}

</style>
