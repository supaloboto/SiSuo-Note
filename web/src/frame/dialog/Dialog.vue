<!--
 - 对话框组件
 -
 - @author 刘志栋
 - @since 2024/07/31
 -->
<script setup lang="ts">
import {computed, onMounted, ref, StyleValue, toRef} from "vue";
import {useDialogStore} from "@/stores/dialog";
import type {Dialog} from "@/dialog/dialog";

const props = defineProps<{
  id: string;
}>();

const dialogStore = useDialogStore();

const dialog = computed<Dialog<any>>(() => dialogStore.dialogs.find(d => d.id === props.id));
onMounted(() => {
  console.log('dialog', props.id, dialog.value);
});

const posStyle = computed<StyleValue>(() => {
  return {
    position: 'absolute',
    top: `${dialog.value.position.x}px`,
    left: `${dialog.value.position.y}px`,
    'z-index': dialog.value.position.zIndex,
    width: `${dialog.value.size.width}px`,
    height: `${dialog.value.size.height}px`,
  }
});

const visible = toRef(dialog.value, 'visible');

</script>

<template>
  <div class="dialog-div" :style="posStyle" v-show="visible">
    <slot></slot>
  </div>
</template>

<style scoped>
.dialog-div {
  border: 1px solid black;
}
</style>
