<!--
 - 笔记组件
 -
 - @author 刘志栋
 - @since 2024/07/24
 -->
<script setup lang="ts">
// 定义组件属性
import {Note, NoteAction} from "@/components/blocks/note/note";
import {computed, ref} from "vue";
import Editor from "@/components/blocks/note/editor/editor.vue";
import {useComponentStore} from "@/stores/component";

const props = defineProps({
  id: String
});

const componentStore = useComponentStore();

// 获取组件属性
const note = computed(() => componentStore.componentMap.get(props.id));

// 控制编辑器显隐
const showEditor = ref(false);

// 组件行为初始化
const action = new NoteAction({
  props: note.value,
  showEditor
});

</script>

<template>
  <div style="width:100%;height:100%;">
    <div v-if="showEditor">
      <Editor :show="showEditor"/>
    </div>
  </div>
</template>

<style scoped>

</style>
