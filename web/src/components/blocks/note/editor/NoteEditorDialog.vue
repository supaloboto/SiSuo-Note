<script setup>
import Vditor from "vditor";
import 'vditor/dist/index.css'
import {onMounted, ref} from "vue";

const vditor = ref(null);
const props = defineProps({
  id: String
});
onMounted(() => {
  // vditor.value = new Vditor('vditor', {
  //   height: 560,
  //   toolbarConfig: {
  //     pin: true,
  //   },
  //   cache: {
  //     enable: false,
  //   },
  //   after: () => {
  //     vditor.value.setValue('hello, Vditor + Vue!')
  //   },
  // })
});

</script>

<template>
  <Dialog :id="id">
    <div :id="'vditor-'+id" class="vditor"></div>
  </Dialog>
</template>

<style scoped>
.vditor {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border: none;
}
</style>
