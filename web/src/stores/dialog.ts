/**
 * 对话框store
 *
 * @author 刘志栋
 * @since 2023/07/31
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {Dialog} from "@/frame/dialog/Dialog";
import {NoteEditorDialog} from "@/components/blocks/note/editor/NoteEditorDialog";

/**
 * 定义store
 */
export const useDialogStore = defineStore('dialog', () => {
    // 对话框列表
    const dialogs = ref<Dialog<any>[]>([
        new NoteEditorDialog('setting', '系统设置', {clientX: 100, clientY: 100}, {
            width: 800,
            height: 600
        }, null),
        new NoteEditorDialog('1', '文档1', {clientX: 200, clientY: 200}, {
            width: 800,
            height: 600
        }, null),
        new NoteEditorDialog('2', '文档2', {clientX: 300, clientY: 300}, {
            width: 800,
            height: 600
        }, null),
        new NoteEditorDialog('3', '文档3文档3文档3文档3文档文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档33', {
            clientX: 400,
            clientY: 400
        }, {
            width: 800,
            height: 600
        }, null)
    ]);

    // // 对话框列表整理为map
    // const dialogMap = computed(() => {
    //     const map = new Map<string, Dialog<any>>();
    //     dialogs.value.forEach(dialog => {
    //         map.set(dialog.id, dialog);
    //     });
    //     return map;
    // });

    return {dialogs};
});
