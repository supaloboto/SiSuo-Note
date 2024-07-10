/**
* 基础组件
*
* @author 刘志栋
* @version 1.0
* @since 2024/07/10
*/
<script setup>
const props = defineProps({
  compInfo: {type: Object},
  readonly: {type: Boolean, default: false},
});

</script>

<template>
  <component :is="$comp(compInfo.type)"
             :compId="compInfo.id"
             :data="compInfo.data"
             :style="compInfo.style"
             :readonly="readonly"></component>
</template>

<style scoped>

</style>