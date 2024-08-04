<!--
 - 笔记组件
 -
 - @author 刘志栋
 - @since 2024/07/24
 -->
<script setup lang="ts">
// 定义组件属性
import {Note} from "@/components/blocks/note/Note";
import {ref} from "vue";
import NoteEditorDialog from "@/components/blocks/note/editor/NoteEditorDialog.vue";

const props = defineProps({
  compData: Note,
});

// 控制编辑器显隐
const showEditor = ref(false);

</script>

<template>
  <div class="note-div">
    <div v-if="showEditor">
      <NoteEditorDialog :show="showEditor"/>
    </div>
  </div>
</template>

<style scoped>
.note-div {
  width: 100%;
  height: 100%;
  background-color: #fafafa;
}
</style>
