/**
* 基础组件
*
* @author 刘志栋
* @version 1.0
* @since 2024/07/10
*/
<script setup>
import {computed, ref, watchEffect} from "vue";

const props = defineProps({
  compInfo: {type: Object},
  pos: {type: Object},
  readonly: {type: Boolean, default: false},
});

const posStyle = computed(() => {
  console.log(props.pos);
  return {
    marginTop: `${props.pos.y}px`,
    marginLeft: `${props.pos.x}px`,
  }
});

/*------ 拖拽逻辑 ------*/
// 鼠标拖拽偏移量
const dragMouseOffset = ref(null);

const dragStart = (evt) => {
  console.log('dragStart', evt);
  dragMouseOffset.value = {
    x: evt.clientX - props.pos.x,
    y: evt.clientY - props.pos.y,
  };
}

const dragEnter = (evt) => {
  console.log('dragenter', evt);
}

const dragOver = (evt) => {
  console.log('dragOver', evt);
  if (dragMouseOffset.value) {
    props.pos.x = evt.clientX - dragMouseOffset.value.x;
    props.pos.y = evt.clientY - dragMouseOffset.value.y;
  }
}

const drop = (evt) => {
  console.log('drop', evt);
}

const dragEnd = (evt) => {
  console.log('dragEnd', evt);
  dragMouseOffset.value = null;
}

</script>

<template>
  <component :is="$comp(compInfo.type)"
             :compId="compInfo.id"
             :data="compInfo.data"
             :style="posStyle"
             :readonly="readonly"
             @dragstart="dragStart($event)"
             @dragenter="dragEnter($event)"
             @dragover="dragOver($event)"
             @drop="drop($event)"
             @dragend="dragEnd($event)"
             draggable="true"
  ></component>
</template>

<style scoped>

</style>
