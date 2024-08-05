<!--
 - 笔记组件
 -
 - @author 刘志栋
 - @since 2024/07/24
 -->
<script setup lang="ts">
// 定义组件属性
import {Note} from "@/components/blocks/note/Note";

const props = defineProps({
  compData: Note,
});

</script>

<template>
  <div class="note-div">
  </div>
</template>

<style scoped>
.note-div {
  width: 100%;
  height: 100%;
  background-color: #fafafa;
}
</style>
