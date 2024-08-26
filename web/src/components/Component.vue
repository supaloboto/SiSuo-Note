<!--
 - 基础组件
 -
 - @author 刘志栋
 - @since 2024/07/10
 -->
<script setup lang="ts">
import { StyleValue, computed, ref, watch, type ComputedRef, onBeforeUnmount } from "vue";
import { useCanvasStore } from "@/stores/canvas";
import i18n from "@/assets/lang";
import { Component } from "@/components/Component";
import { compRegis } from "@/components/index";
import WrapperPlugin from "./plugins/wrapper/Wrapper.vue";
import LinkLinePlugin from "./plugins/link/LinkLine.vue";
import { LinkLine } from "./plugins/link/LinkLine";
import LinkLineHandler from "./plugins/link/LinkLineHandler.vue";

const props = defineProps({
  compData: { type: Component, required: true },
});

// 使用$t获取国际化文本
const $t = i18n.global.t;

// 组件ref
const compRef = ref(null);

// 获取store
const canvasStore = useCanvasStore();

// 获取组件选中状态
const selected: ComputedRef<boolean> = computed(() => canvasStore.currentPointer.selected.includes(props.compData.id));

// 获取视图
const viewRect = computed(() => canvasStore.currentViewRect);
// 获取缩放比例
const scale = computed(() => canvasStore.scale / 100);
// 组件位置样式
const compDivStyle = computed<StyleValue>(() => {
  // 计算组件大小和位置
  const rect = {
    x: (props.compData.pos.x - viewRect.value.x) * scale.value,
    y: (props.compData.pos.y - viewRect.value.y) * scale.value,
    width: props.compData.rect.width * scale.value,
    height: props.compData.rect.height * scale.value,
  }
  // 修约至小数点后三位 以抹去js浮点数计算精度问题导致的误差
  rect.x = Math.round(rect.x * 1000) / 1000;
  rect.y = Math.round(rect.y * 1000) / 1000;
  rect.width = Math.round(rect.width * 1000) / 1000;
  rect.height = Math.round(rect.height * 1000) / 1000;
  return {
    position: 'absolute',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    marginTop: `${rect.y}px`,
    marginLeft: `${rect.x}px`,
  }
});

/*------ 拖拽逻辑 ------*/
// 从store中获取鼠标位置
const mousePos = computed(() => canvasStore.currentPointer);
// 拖拽监听
const dragWatch = ref(null);
/**
 * 开始拖拽方法
 */
const dragStart = () => {
  // 如果当前选中了多个组件则一起移动 选中了一个组件则改为选中当前组件
  if (canvasStore.currentPointer.selected.length > 1) {
    props.compData.select(false);
    // todo 多个组件一起移动
  } else {
    props.compData.select(true);
  }
  // 拖拽开始 计算鼠标偏移量
  const dragMouseOffset = {
    x: mousePos.value.x - props.compData.pos.x,
    y: mousePos.value.y - props.compData.pos.y,
  };
  // 建立监听 在拖拽中移动组件
  dragWatch.value = watch(mousePos, (pos) => {
    props.compData.pos.x = pos.x - dragMouseOffset.x;
    props.compData.pos.y = pos.y - dragMouseOffset.y;
  }, { deep: true });
  // 因为有时候鼠标移动太快会导致监听不到mouseup事件 所以在document上建立监听
  document.addEventListener('mouseup', dragEnd);
}
/**
 * 结束拖拽方法
 * 因为dragStart需要preventDefault 所以dragEnd不能被自动触发 因此将停止拖拽的逻辑放在mouseUp上处理
 */
const dragEnd = () => {
  dragWatch.value && dragWatch.value();
  dragWatch.value = null;
  // 移除document上的监听
  document.removeEventListener('mouseup', dragEnd);
  // 更新组件数据
  props.compData.update();
}

/*------ 鼠标动作交互 ------*/
/**
 * 点击事件
 */
const click = (evt: MouseEvent) => {
  // 如果按下ctrl键则多选
  if (evt.ctrlKey) {
    props.compData.select(false, true);
    return;
  }
  // 因为拖拽动作也会触发click 因此这里添加判断 如果当前组件已经被选中则不做动作 避免此时触发click而将多选取消
  if (selected.value) {
    return;
  }
  props.compData.select(true);
}

/**
 * 鼠标抬起
 * @param evt
 */
const mouseUp = (evt: MouseEvent) => {
  // 因为dragStart需要preventDefault 所以dragEnd不能被自动触发 因此将停止拖拽的逻辑放在mouseUp上处理
  dragEnd();
}

/**
 * 双击事件
 * @param evt
 */
const dblclick = (evt: MouseEvent) => {
  props.compData.dblclick();
}

/**
 * 右键事件
 * @param evt
 */
const contextMenu = (evt: MouseEvent) => {
  // 触发选中事件
  props.compData.select(true, false);
  // 触发右键事件
  props.compData.contextMenu();
}

/**
 * 组件移除时移除监听
 */
onBeforeUnmount(() => {
  document.removeEventListener('mouseup', dragEnd);
});

// 连线
const linkLineSet = ref<LinkLine[]>([
  new LinkLine([{ x: -100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 200 }, { x: 100, y: 200 }]),
]);

</script>

<template>
  <!-- 外层容器 -->
  <div class="comp-div" :class="{ moving: !!dragWatch }" :style="compDivStyle" @dragstart.stop.prevent="dragStart"
    @click.stop="click" @dblclick="dblclick" @mouseup="mouseUp" @contextmenu.stop.prevent="contextMenu"
    draggable="true">
    <!-- 四角定位 -->
    <WrapperPlugin v-if="selected" :compData="props.compData" />
    <!-- 连线触发点 -->
    <LinkLineHandler v-if="selected" :compData="props.compData" />
    <!-- 组件 -->
    <component :is="compRegis[compData.compType].raw" :compData="compData" ref="compRef" class="component"
      :class="{ selected }"></component>
  </div>
  <!-- 连线 -->
  <LinkLinePlugin v-for="(item, index) in linkLineSet" :lineData="item" />
</template>

<style scoped>
/* 组件容器样式 */
.comp-div {
  display: inline-flex;
  position: relative;
}

.comp-div.moving {
  cursor: move;
}

/* 组件样式 */
.component {
  border: 1px solid var(--component-border-color);
}

/* 组件被选中时的四角边框 */
.selected {
  border: 1px solid var(--component-resize-wrapper-border-color) !important;
}
</style>
