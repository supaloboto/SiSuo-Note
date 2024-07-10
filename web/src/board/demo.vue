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
  id: 'test'
}]);
</script>

<template>
  <sisuo-comp v-for="(comp,index) in compList" :key="comp.id" :compInfo="comp"></sisuo-comp>
</template>

<style scoped>

</style>