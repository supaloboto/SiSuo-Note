import { markRaw } from 'vue'
import { Dialog } from "@/frame/dialog/Dialog";
import type { Note } from "@/components/blocks/note/Note";
import NoteEditorDialogComp from "@/components/blocks/note/editor/NoteEditorDialog.vue";
import Vditor from "vditor";

/**
 * 笔记编辑器对话框
 * @author 刘志栋
 * @since 2024/08/05
 */
export class NoteEditorDialog extends Dialog {
    type = 'noteEditor';
    component = markRaw(NoteEditorDialogComp);
    // 笔记数据
    note: Note;
    // 编辑器实例
    editorInstance: Vditor = null as any;

    constructor(id: string, title: string,
        pos: { clientX: number, clientY: number },
        rect: { width: number, height: number },
        note: Note) {
        super(id, title, 'noteEditor', pos, rect);
        this.note = note;
    }

    /**
     * 更新组件内容
     */
    updateNoteContent() {
        const markdown = this.editorInstance.getValue();
        this.note.data.title = markdown.split('\n')[0].replace(/[#\s]/g, '');
        this.note.data.content = markdown;
        this.note.save().then(() => {
            console.log('笔记保存成功');
        });
    }

    /**
     * 关闭编辑器弹窗
     */
    async close(): Promise<void> {
        await super.close();
        // 关闭时解除绑定
        if (this.note != null) {
            this.note.editor = null as any;
        }
    }
}
