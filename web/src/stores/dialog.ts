/**
 * 对话框store
 *
 * @author 刘志栋
 * @since 2023/07/31
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {Dialog} from "@/dialog/dialog";
import {NoteEditorDialog} from "@/components/blocks/note/editor/NoteEditorDialog";

/**
 * 定义store
 */
export const useDialogStore = defineStore('dialog', () => {
    // 对话框列表
    const dialogs = ref<Dialog<any>[]>([
        new NoteEditorDialog('setting', '系统设置', {x: 100, y: 100}, {
            width: 400,
            height: 300
        }, null),
        new NoteEditorDialog('1', '文档1', {x: 100, y: 100}, {
            width: 400,
            height: 300
        }, null),
        new NoteEditorDialog('2', '文档2', {x: 100, y: 100}, {
            width: 400,
            height: 300
        }, null),
        new NoteEditorDialog('3', '文档3', {x: 100, y: 100}, {
            width: 400,
            height: 300
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
