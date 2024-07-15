/**
* 画布
*
* @author 刘志栋
* @version 1.0
* @since 2024/07/10
*/
<script setup>
import {ref} from "vue";

const compList = ref([{
  type: 'note',
  id: 'test',
  pos: {x: 100, y: 120},
}]);

</script>

<template>
  <sisuo-comp v-for="(comp,index) in compList" :key="comp.id" :compInfo="comp" :pos="comp.pos"></sisuo-comp>
</template>

<style scoped>

</style>
