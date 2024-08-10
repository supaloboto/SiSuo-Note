<!--
 - 基础组件
 -
 - @author 刘志栋
 - @since 2024/07/10
 -->
<script setup lang="ts">
import {StyleValue, computed, ref, watch, type ComputedRef, onBeforeUnmount} from "vue";
import {useCanvasStore} from "@/stores/canvas";
import i18n from "@/assets/lang";
import {Component} from "@/components/Component";
import {compRegis} from "@/components/index";

const props = defineProps({
  compData: {type: Component, required: true},
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
  }, {deep: true});
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

/*------ 四角边框 ------*/
const wrappers = ref<string[]>(['n', 'e', 'w', 's', 'nw', 'ne', 'sw', 'se']);
const resizeWatch = ref(null);
/**
 * 开始调整大小
 */
const resizeStart = (evt: MouseEvent, wrapper: string) => {
  // 组件大小调整方法
  const resizeComp = () => {
    const pos = props.compData.pos;
    const rect = props.compData.rect;
    // 获取当前由[选中定位点的对角点]与[鼠标位置]构成的矩阵宽高
    const currentRect = {
      width: wrapper.includes('w') ? (pos.x + rect.width - mousePos.value.x) : (mousePos.value.x - pos.x),
      height: wrapper.includes('n') ? (pos.y + rect.height - mousePos.value.y) : (mousePos.value.y - pos.y),
    };
    if (wrapper.includes('w') || wrapper.includes('e')) {
      // 以10px为最小宽度 调整组件宽度
      const widthOffset = currentRect.width - rect.width;
      if (rect.width + widthOffset > 10) {
        rect.width += widthOffset;
        // 如果是调整了左边的两个点 则需要调整位置
        if (wrapper.includes('w')) {
          pos.x -= widthOffset;
        }
      }
    }
    // 以10px为最小高度 调整组件高度
    if (wrapper.includes('n') || wrapper.includes('s')) {
      const heightOffset = currentRect.height - rect.height;
      if (rect.height + heightOffset > 10) {
        rect.height += heightOffset;
        // 如果是调整了上边的两个点 则需要调整位置
        if (wrapper.includes('n')) {
          pos.y -= heightOffset;
        }
      }
    }
  }
  // 因为@dragstart会在鼠标已经做了一定位移之后才触发 所以这里先手动调用一次 避免出现鼠标移动较快时定位点不跟手的情况
  resizeComp();
  // 建立监听 在拖拽中调整组件大小
  resizeWatch.value = watch(mousePos, () => {
    resizeComp();
  }, {deep: true});
  // 因为有时候鼠标移动太快会导致监听不到mouseup事件 所以在document上建立监听
  document.addEventListener('mouseup', resizeEnd);
}

/**
 * 结束调整大小
 */
const resizeEnd = () => {
  resizeWatch.value && resizeWatch.value();
  resizeWatch.value = null;
  // 移除document上的监听
  document.removeEventListener('mouseup', resizeEnd);
}

/**
 * 组件移除时移除监听
 */
onBeforeUnmount(() => {
  dragEnd();
  resizeEnd();
});

</script>

<template>
  <!-- 外层容器 -->
  <div class="comp-div"
       :class="{moving:!!dragWatch}"
       :style="compDivStyle"
       @dragstart.stop.prevent="dragStart"
       @click.stop="click"
       @dblclick="dblclick"
       @mouseup="mouseUp"
       @contextmenu.stop.prevent="contextMenu"
       draggable="true"
  >
    <!-- 四角定位 -->
    <div v-if="selected" v-for="wrapper in wrappers" :key="wrapper"
         :class="`resize-wrapper ${wrapper}`"
         @dragstart.stop.prevent="resizeStart($event,wrapper)"
         @mouseup="resizeEnd"
         @click.stop
         draggable="true"
    ></div>
    <!-- 组件 -->
    <component :is="compRegis[compData.type].raw" :compData="compData" ref="compRef"
               class="component" :class="{selected}"></component>
  </div>
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

/* 四角定位点样式 */
.resize-wrapper {
  position: absolute;
  width: 8px;
  height: 8px;
}

.n, .s {
  width: calc(100% - 12px);
  transform: translateX(-50%);
}

.n {
  top: -4px;
  left: 50%;
  cursor: n-resize;
}

.s {
  bottom: -4px;
  left: 50%;
  cursor: s-resize;
}

.e, .w {
  height: calc(100% - 12px);
  transform: translateY(-50%);
}

.e {
  top: 50%;
  right: -4px;
  cursor: e-resize;
}

.w {
  top: 50%;
  left: -4px;
  cursor: w-resize;
}

.nw, .ne, .sw, .se {
  background-color: var(--component-resize-wrapper-fill-color);
}

.nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

</style>
