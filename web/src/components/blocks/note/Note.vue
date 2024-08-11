<!--
 - 笔记组件
 -
 - @author 刘志栋
 - @since 2024/07/24
 -->
<script setup lang="ts">
// 定义组件属性
import {Note} from "@/components/blocks/note/Note";
import {computed} from "vue";
import {marked} from "marked";
import {useCanvasStore} from "@/stores/canvas";

const props = defineProps({
  compData: Note,
});
const canvasStore = useCanvasStore();

// 将 markdown 转换为 html
const contentHtml = computed(() => {
  if (!props.compData?.data?.content) {
    return '';
  }
  return marked(props.compData.data.content, {});
});

// 获取画布缩放比例
const scale = computed(() => canvasStore.scale / 100);
const scaleStyle = computed(() => {
  return {
    padding: `${10 * scale.value}px`,
    transform: `scale(${scale.value})`,
  };
});

</script>

<template>
  <div :id="`sisuo-comp-note-${compData.id}`"
       class="note-div vditor-wysiwyg vditor-reset"
       :style="scaleStyle"
       v-html="contentHtml">
  </div>
</template>

<style scoped>
.note-div {
  width: 100%;
  height: 100%;
  background-color: #fafafa;
}
</style>
