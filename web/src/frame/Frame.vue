<!--
 - 视图框架
 -
 - @author 刘志栋
 - @since 2024/07/25
 -->
<script setup lang="ts">
import {computed} from "vue";
import {useCanvasStore} from "@/stores/canvas";
import {useDialogStore} from "@/stores/dialog";
import Header from "@/frame/header/Header.vue";
import Board from "@/frame/board/Board.vue";
import Dock from "@/frame/dock/Dock.vue";

// 对话框列表
const dialogs = computed(() => useDialogStore().dialogs);
// 控制鼠标信息
const pointer = computed(() => useCanvasStore().currentPointer);

const clickInBoard = (evt: MouseEvent) => {
  pointer.value.focusOnCanvas = true;
}

const clickOutBoard = (evt: MouseEvent) => {
  pointer.value.focusOnCanvas = false;
}

</script>

<template>
  <div id="page-frame" @mousedown="clickOutBoard">
    <!-- header -->
    <Header id="header"></Header>
    <!-- 画布 -->
    <Board @mousedown.stop="clickInBoard" id="board"></Board>
    <!-- dock -->
    <Dock id="dock"></Dock>
    <!-- 对话框 -->
    <component v-for="(dialog,index) in dialogs" :is="dialog.component" :key="dialog.id" :dialog="dialog"></component>
  </div>
</template>

<style lang="scss" scoped>
$page-height: calc(100% - 2px);
$page-width: calc(100% - 2px);
$header-height: 36px;
$dock-height: 50px;

#page-frame {
  position: absolute;
  height: $page-height;
  width: $page-width;
  overflow: hidden;
}

#header {
  position: absolute;
  height: $header-height;
  width: $page-width;
  margin: auto;
}

#board {
  position: absolute;
  margin: $header-height auto;
  height: calc(100% - $header-height - $dock-height);
  width: $page-width;
}

#dock {
  position: absolute;
  bottom: 0;
  height: $dock-height;
  width: $page-width;
}
</style>
