import { markRaw } from "vue";
import { Dialog } from "@/frame/dialog/Dialog";
import LinkLineEditor from "./LinkEditorDialog.vue";
import type { LinkLine } from "./LinkLine";
import { useCanvasStore } from "@/stores/canvas";

/**
 * 组件关联连线弹窗类
 * 
 * @author 刘志栋
 * @since 2024/09/03
 */
export class LinkEditorDialog extends Dialog {
    component = markRaw(LinkLineEditor);
    lineData: LinkLine = null as any;

    constructor(id: string, title: string,
        pos: { clientX: number, clientY: number },
        rect: { width: number, height: number },
        lineData: LinkLine) {
        super(id, title, 'linkEditor', pos, rect);
        this.lineData = lineData;
    }

    /**
     * 打开或仅聚焦编辑器弹窗
     */
    openAndFocus(): void {
        if (this.visible) {
            this.focus();
            return;
        }
        super.open({
            clientX: useCanvasStore().currentPointer.clientX,
            clientY: useCanvasStore().currentPointer.clientY,
            width: 100,
            height: 100
        }).then((dialog) => dialog.focus());
    }

    /**
     * 关闭编辑器弹窗
     */
    async close(): Promise<void> {
        await super.close();
    }
}