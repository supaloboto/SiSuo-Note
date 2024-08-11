<!--
 - 笔记编辑器弹窗
 -
 - @author 刘志栋
 - @since 2024/08/01
 -->
<script setup lang="ts">
import Vditor from "vditor";
import 'vditor/dist/index.css'
import {onMounted} from "vue";
import {NoteEditorDialog} from "@/components/blocks/note/editor/NoteEditorDialog";

const props = defineProps<{
  dialog: NoteEditorDialog;
}>();

onMounted(() => {
  const vditor = new Vditor(`vditor-${props.dialog.id}`, {
    mode: 'wysiwyg',
    height: '100%',
    cache: {
      enable: false,
    },
    typewriterMode: true,
    input: (value) => {
      props.dialog.updateNoteContent();
    },
    after: () => {
      const content = props.dialog.note?.data?.content;
      if (content) {
        vditor.setValue(content);
      }
    },
  });
  props.dialog.editorInstance = vditor;
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
