import { useCanvasStore } from "@/stores/canvas";
import { useKanbanStore } from "@/stores/kanban";
import { useDialogStore } from "@/stores/dialog";
import { deepCopy } from "@/assets/utils/copy";
import { Component } from "@/components/Component";
import { LinkLine } from "@/components/plugins/link/LinkLine";

/**
 * 快捷键
 *
 * @author 刘志栋
 * @since 2024/07/25
 */
export class Hotkeys {
    static init() {
        // 注册鼠标滚轮事件
        document.addEventListener("wheel", (e) => {
            const canvasStore = useCanvasStore();
            // 如果当前没有聚焦在画布上则不触发
            if (!canvasStore.currentPointer.focusOnCanvas) {
                return;
            }
            e.preventDefault();
            // 缩放
            const step = e.ctrlKey ? 1 : 10;
            if (e.deltaY < 0) {
                canvasStore.zoom(step, 1);
            } else {
                canvasStore.zoom(step, -1);
            }
        }, { passive: false });
        // 注册快捷键
        document.addEventListener("keydown", (e) => {
            // alt + d 隐藏/显示对话框
            if (e.altKey && e.key === "d") {
                e.preventDefault();
                useDialogStore().collapseAll();
            }
            // 快捷键如果当前没有聚焦在画布上则不触发
            if (!useCanvasStore().currentPointer.focusOnCanvas) {
                return;
            }
            // delete键删除组件
            if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                this.deleteComponent();
            }
            // ctrl + a 全选
            if (e.ctrlKey && e.key === "a") {
                e.preventDefault();
                this.selectAll();
            }
            // ctrl + c 复制
            if (e.ctrlKey && e.key === "c") {
                e.preventDefault();
                console.log("复制");
            }
            // ctrl + z 撤销
            if (e.ctrlKey && e.key === "z") {
                e.preventDefault();
                console.log("撤销");
            }
            // ctrl + y 重做
            if (e.ctrlKey && e.key === "y") {
                e.preventDefault();
                console.log("重做");
            }
        });
    }

    /**
     * 全选
     */
    static selectAll() {
        useKanbanStore().components.forEach(comp => {
            comp?.select(false);
        })
    }

    /**
     * 删除组件
     */
    static deleteComponent() {
        const canvasStore = useCanvasStore();
        // 删除选中组件
        const selected = canvasStore.currentPointer.selected;
        for (let i = selected.length - 1; i >= 0; i--) {
            const target = selected[i];
            if (target instanceof Component) {
                (target as Component<any>).delete();
            } else if (target instanceof LinkLine) {
                (target as LinkLine).delete();
            }
        }
    }

}
