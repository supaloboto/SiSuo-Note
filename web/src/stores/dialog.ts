/**
 * 对话框store
 *
 * @author 刘志栋
 * @since 2023/07/31
 */
import {defineStore} from "pinia";
import {ref} from "vue";
import {Dialog} from "@/frame/dialog/Dialog";

/**
 * 定义store
 */
export const useDialogStore = defineStore('dialog', () => {
    // 对话框列表
    const dialogs = ref<Dialog<any>[]>([]);

    // 对话框堆叠顺序
    const dialogStack = ref<string[]>([]);

    return {dialogs, dialogStack};
});
