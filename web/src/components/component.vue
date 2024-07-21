/**
* 基础组件
*
* @author 刘志栋
* @version 1.0
* @since 2024/07/10
*/
<script setup>
import {computed, ref, toRef, watch} from "vue";
import {useCanvasStore} from "@/store/canvas";

const props = defineProps({
  component: {type: Object},
  readonly: {type: Boolean, default: false},
});

// 组件位置样式
const compDivStyle = computed(() => {
  return {
    width: `${props.component.rect.width}px`,
    height: `${props.component.rect.height}px`,
    marginTop: `${props.component.pos.y}px`,
    marginLeft: `${props.component.pos.x}px`,
  }
});

/*------ 拖拽逻辑 ------*/
const canvasStore = useCanvasStore();
// 从store中获取鼠标位置
const mousePos = computed(() => canvasStore.currentPointer);
// 拖拽监听
const dragWatch = ref(null);
/**
 * 开始拖拽方法
 */
const dragStart = () => {
  // 拖拽开始 计算鼠标偏移量
  const dragMouseOffset = {
    x: mousePos.value.x - props.component.pos.x,
    y: mousePos.value.y - props.component.pos.y,
  };
  // 建立监听 在拖拽中移动组件
  dragWatch.value = watch(mousePos, (pos) => {
    props.component.pos.x = pos.x - dragMouseOffset.x;
    props.component.pos.y = pos.y - dragMouseOffset.y;
  }, {deep: true});
}
/**
 * 结束拖拽方法
 * 因为dragStart需要preventDefault 所以dragEnd不能被自动触发 因此将停止拖拽的逻辑放在mouseUp上处理
 */
const dragEnd = () => {
  dragWatch.value && dragWatch.value();
  dragWatch.value = null;
}

/*------ 鼠标动作交互 ------*/
// 点击事件
const click = (evt) => {
  // 选中组件
  canvasStore.selectComponent(props.component.id, !evt.ctrlKey);
}

// 鼠标抬起
const mouseUp = (evt) => {
  // 因为dragStart需要preventDefault 所以dragEnd不能被自动触发 因此将停止拖拽的逻辑放在mouseUp上处理
  dragEnd();
}

// 双击
const dblclick = (evt) => {
  // todo 处理双击
}

// todo 右键

/*------ 四角边框 ------*/
const selected = computed(() => canvasStore.currentPointer.selected.includes(props.component.id));
const wrappers = ref(['nw', 'ne', 'sw', 'se']);
const resizeWatch = ref(null);
/**
 * 开始调整大小
 */
const resizeStart = (evt, wrapper) => {
  // 获取鼠标位置与对角点位之间矩阵量的方法
  const getMouseRect = () => {
    return {
      width: wrapper.includes('w') ? (props.component.pos.x + props.component.rect.width - mousePos.value.x) : (mousePos.value.x - props.component.pos.x),
      height: wrapper.includes('n') ? (props.component.pos.y + props.component.rect.height - mousePos.value.y) : (mousePos.value.y - props.component.pos.y),
    }
  }
  // 记录当拖拽开始时的矩阵量
  let lastRect = getMouseRect();
  // 建立监听 在拖拽中调整组件大小
  resizeWatch.value = watch(mousePos, () => {
    const currentRect = getMouseRect();
    // 以10px为最小宽度
    if (currentRect.width > 10) {
      const widthOffset = currentRect.width - lastRect.width;
      props.component.rect.width += widthOffset;
      // 如果是调整了左边的两个点 则需要调整位置
      if (wrapper.includes('w')) {
        props.component.pos.x -= widthOffset;
      }
    }
    // 以10px为最小高度
    if (currentRect.height > 10) {
      const heightOffset = currentRect.height - lastRect.height;
      props.component.rect.height += heightOffset;
      // 如果是调整了上边的两个点 则需要调整位置
      if (wrapper.includes('n')) {
        props.component.pos.y -= heightOffset;
      }
    }
    // 记录矩阵量
    lastRect = getMouseRect();
  }, {deep: true});
}

/**
 * 结束调整大小
 */
const resizeEnd = () => {
  resizeWatch.value && resizeWatch.value();
}

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
       draggable="true">
    <!-- 四角定位 -->
    <div v-if="selected" v-for="wrapper in wrappers" :key="wrapper"
         :class="`resize-wrapper ${wrapper}`"
         @dragstart.stop.prevent="resizeStart($event,wrapper)"
         @mouseup.stop="resizeEnd"
         @click.stop
         draggable="true"
    ></div>
    <!-- 组件 -->
    <component :is="$comp(component.type)"
               :compId="component.id"
               :data="component.data"
               :readonly="readonly"
               class="component"
               :class="{selected}"
    ></component>
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
  border: 1px solid #000;
}

/* 组件被选中时的四角边框 */
.selected {
  border: 1px solid #62bee6 !important;
}

.resize-wrapper {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #62bee6;
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
