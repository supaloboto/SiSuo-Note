<!--
 - 笔记编辑器弹窗
 -
 - @author 刘志栋
 - @since 2024/08/01
 -->
<script setup lang="ts">
import Vditor from "vditor";
import 'vditor/dist/index.css'
import {onMounted, ref} from "vue";
import type {Dialog} from "@/frame/dialog/Dialog.js";

const props = defineProps<{
  dialog: Dialog;
}>();

const vditor = ref(null);

onMounted(() => {
  vditor.value = new Vditor(`vditor-${props.dialog.id}`, {
    mode: 'wysiwyg',
    height: '100%',
    cache: {
      enable: false,
    },
    after: () => {
      // vditor.value.setValue('hello, Vditor + Vue!')
    },
  })
});

</script>

<template>
  <Dialog :dialog="dialog">
    <div :id="'vditor-'+dialog.id" class="vditor"></div>
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
