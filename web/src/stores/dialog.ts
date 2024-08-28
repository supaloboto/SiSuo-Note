/**
 * 对话框store
 *
 * @author 刘志栋
 * @since 2023/07/31
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { Dialog } from "@/frame/dialog/Dialog";
import { deepCopy } from "@/assets/utils/copy";

/**
 * 定义store
 */
export const useDialogStore = defineStore('dialog', () => {
    // 对话框列表
    const dialogs = ref<Dialog[]>([]);

    // 对话框堆叠顺序
    const dialogStack = ref<string[]>([]);

    // 整理对话框ID与对话框的映射
    const dialogMap = computed(() => {
        const map = new Map<string, Dialog>();
        dialogs.value.forEach(dialog => {
            map.set(dialog.id, dialog as any);
        });
        return map;
    });

    // 存储对话框堆叠顺序 用于切换对话框显示隐藏使用
    let dialogStackCopy: string[] = [];
    // 收起所有对话框 或展开之前打开的对话框
    const collapseAll = () => {
        if (dialogStack.value.length > 0) {
            // 如果当前有对话框堆叠 则记录并最小化所有对话框
            dialogStackCopy = deepCopy(dialogStack.value);
            // 将所有对话框最小化
            dialogStackCopy.forEach(id => {
                dialogMap.value.get(id)?.minimize(null as any);
            });
        } else if (dialogStackCopy.length > 0) {
            // 如果当前没有对话框堆叠 且之前有记录 则展开之前记录的对话框
            dialogStackCopy.reverse().forEach(id => {
                dialogMap.value.get(id)?.open(null as any);
            });
            dialogStackCopy = [];
        }
    };

    return {
        // 对话框控制
        dialogs, dialogStack, collapseAll,
        // 重置方法
        reset: () => {
            dialogs.value = [];
            dialogStack.value = [];
            dialogStackCopy = [];
        }
    };
});
