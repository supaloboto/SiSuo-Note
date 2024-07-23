<script setup>

// 双击事件
const dblclick = (evt) => {
  // 双击时打开编辑器
  console.log('dblclick');
}

const contextMenu = (evt) => {
  console.log('contextMenu');
}

defineExpose({
  dblclick, contextMenu
});

</script>

<template>
  <div style="width:100%;height:100%;"></div>
</template>

<style scoped>

</style>
