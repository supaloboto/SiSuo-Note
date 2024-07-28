<!--
 - 系统Dock部分
 -
 - @author 刘志栋
 - @since 2024/07/28
 -->
<script setup lang="ts">

</script>

<template>
  <div class="dock-div">
  </div>
</template>

<style scoped>
.dock-div {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: var(--dock-background-color);
  border-top: 1px solid var(--dock-border-color);
  z-index: var(--dock-zindex);
}
</style>
