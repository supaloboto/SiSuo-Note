<!--
 - 笔记组件
 -
 - @author 刘志栋
 - @since 2024/07/24
 -->
<script setup lang="ts">
// 定义组件属性
import {Note} from "@/components/blocks/note/Note";
import {computed, onMounted, ref, watch} from "vue";
import {useCanvasStore} from "@/stores/canvas";
import VditorPreview from "vditor/dist/method.min";

const props = defineProps({
  compData: Note,
});
const canvasStore = useCanvasStore();

// 组件内容dom
const contentRef = ref(null);
/**
 * 渲染组件内容为html
 */
const renderHtml = () => {
  const content = props.compData.data.content;
  VditorPreview.preview(contentRef.value, content ? content : '', {
    anchor: false,
    math: {
      engine: 'KaTeX',
      inlineDigit: true,
      macros: {},
    },
    speech: {
      enable: false,
    },
    theme: 'light',
    typewriterMode: true,
  });
};
onMounted(() => {
  // 组件挂载完毕首次执行 避免找不到dom
  renderHtml();
});
// 监听组件内容变化 重新渲染
watch(() => props.compData.data.content, renderHtml);

// 获取画布缩放比例
const scale = computed(() => canvasStore.scale / 100);
const scaleStyle = computed(() => {
  const padding = scale.value > 1 ? 10 : 10 * scale.value;
  return {
    padding: `${padding}px`,
    // 先设置宽高 再进行缩放 这样保证缩放后的内容宽高比例不变
    width: `${props.compData?.rect.width - 2 * padding}px`,
    height: `${props.compData?.rect.height - 2 * padding}px`,
    transform: `scale(${scale.value})`,
    transformOrigin: '0 0',
  };
});

</script>

<template>
  <div :id="`sisuo-comp-note-${compData.id}`" @wheel.stop class="note-div">
    <div class="note-content" ref="contentRef" :style="scaleStyle"></div>
  </div>
</template>

<style scoped>
.note-div {
  width: 100%;
  height: 100%;
  background-color: #fafafa;
  overflow: hidden;
}
</style>
