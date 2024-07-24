<!--
 - 笔记组件
 -
 - @author 刘志栋
 - @since 2024/07/24
 -->
<script setup lang="ts">
import {Note, NoteAction} from "@/components/blocks/note/note";
// 定义组件属性
const props = defineProps<Note>();
// 组件行为初始化
defineExpose(new NoteAction(props).expose());

</script>

<template>
  <div style="width:100%;height:100%;"></div>
</template>

<style scoped>

</style>
