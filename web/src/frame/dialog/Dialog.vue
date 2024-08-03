<!--
 - 对话框组件
 -
 - @author 刘志栋
 - @since 2024/07/31
 -->
<script setup lang="ts">
import {computed, onBeforeUnmount, ref, StyleValue, toRef, watch} from "vue";
import {useCanvasStore} from "@/stores/canvas";
import {useDialogStore} from "@/stores/dialog";
import type {Dialog} from "@/frame/dialog/Dialog";

const props = defineProps<{
  id: string;
}>();

// 获取对话框数据
const dialogStore = useDialogStore();
const dialog = computed<Dialog<any>>(() => dialogStore.dialogs.find(d => d.id === props.id));
const dialogIndex = computed<number>(() => dialogStore.dialogs.findIndex(d => d.id === props.id));

// 对话框位置样式
const posStyle = computed<StyleValue>(() => {
  return {
    position: 'absolute',
    left: `${dialog.value.pos.clientX}px`,
    top: `${dialog.value.pos.clientY}px`,
    'z-index': 200 + dialogIndex.value,
    width: `${dialog.value.rect.width}px`,
    height: `${dialog.value.rect.height}px`,
  }
});

// 对话框是否可见
const visible = toRef(dialog.value, 'visible');

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
  dialog.value.pos.clientX += evt.clientX - dragStartPos.value.clientX;
  dialog.value.pos.clientY += evt.clientY - dragStartPos.value.clientY;
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

</script>

<template>
  <div class="dialog-div" :class="{moving:!!dragStartPos}" :style="posStyle" v-show="visible">
    <div class="dialog-title" draggable="true" @dragstart.stop.prevent="dragStart">
      <div class="dialog-title-text">{{ dialog.title }}</div>
      <button class="dialog-btn close" @click="dialog.close">
        <icon name="system-close"/>
      </button>
      <button class="dialog-btn expand" @click="dialog.fullscreen">
        <icon v-if="!dialog.maximized" name="system-expand"/>
        <icon v-else name="system-shrink"/>
      </button>
      <button class="dialog-btn minimize" @click="dialog.minimize">
        <icon name="system-minimize"/>
      </button>
    </div>
    <div class="dialog-content">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$dialog-title-height: 29px;

// 对话框整体样式
.dialog-div {
  border: 1px solid var(--dialog-border-color);
  border-radius: 5px;
  background-color: var(--dialog-background-color);
  // 动画效果
  transition: top 0.2s, left 0.2s, width 0.2s, height 0.2s;
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
  border-bottom: 1px solid var(--dialog-title-border-color);
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
</style>
