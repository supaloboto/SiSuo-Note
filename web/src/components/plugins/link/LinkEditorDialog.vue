<!--
 - 组件连接线编辑器弹窗
 -
 - @author 刘志栋
 - @since 2024/09/03
 -->
<script setup lang="ts">
    import { LinkEditorDialog } from '@/components/plugins/link/LinkEditorDialog';
    import ScriptEditor from '@/script/ScriptEditor.vue';

    const props = defineProps<{
        dialog: LinkEditorDialog;
    }>();

</script>

<template>
    <Dialog :dialog="dialog">
        <ScriptEditor />
    </Dialog>
</template>

<style lang="scss" scoped></style>
