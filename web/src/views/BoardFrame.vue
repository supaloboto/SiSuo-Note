<!--
 - 看板视图框架
 -
 - @author 刘志栋
 - @since 2024/07/25
 -->
<script setup lang="ts">
import Header from "@/header/header.vue";
import Board from "@/board/board.vue";
import Dock from "@/dock/dock.vue";

</script>

<template>
  <div id="board-frame">
    <!-- header -->
    <Header></Header>
    <!-- 画布 -->
    <Board id="board"></Board>
    <!-- dock -->
    <Dock></Dock>
  </div>
</template>

<style scoped>
#board-frame {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

#board {
  height: calc(100% - 50px);
  width: calc(100% - 50px);
  border: 1px solid #676767;
}
</style>
