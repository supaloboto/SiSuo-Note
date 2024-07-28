<!--
 - 根组件
 -
 - @author 刘志栋
 - @since 2024/07/10
 -->
<script setup lang="ts">
import {useGlobalStore} from "@/stores/global";
import {watch} from "vue";

// 加载主题样式
watch(() => useGlobalStore().sysConfig.theme, (theme) => {
  document.documentElement.setAttribute('theme', theme);
}, {immediate: true});

</script>

<template>
  <router-view></router-view>
</template>

<style lang="scss">
/* 全局样式 */
html {
  height: 100%;
  display: flex;
}

body {
  display: flex;
  flex: 1;
}

#app {
  display: flex;
  flex: 1;
}
</style>
