<script setup>
import Vditor from "vditor";
import 'vditor/dist/index.css'
import {onMounted, ref} from "vue";

const vditor = ref(null);
const props = defineProps({
  show: Boolean
});
onMounted(() => {
  vditor.value = new Vditor('vditor', {
    height: 560,
    toolbarConfig: {
      pin: true,
    },
    cache: {
      enable: false,
    },
    after: () => {
      vditor.value.setValue('hello, Vditor + Vue!')
    },
  })
});

</script>

<template>
  <div id="vditor" style="margin-top:50px"></div>
</template>

<style scoped>

</style>
