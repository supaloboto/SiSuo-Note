import {markRaw} from 'vue'
import {Dialog} from "@/frame/dialog/Dialog";
import type {Note} from "@/components/blocks/note/Note";
import NoteEditorDialogComp from "@/components/blocks/note/editor/NoteEditorDialog.vue";

/**
 * 笔记编辑器对话框
 * @author 刘志栋
 * @since 2024/08/05
 */
export class NoteEditorDialog extends Dialog {
    type = 'noteEditor';
    component = markRaw(NoteEditorDialogComp);
    note: Note;

    constructor(id: string, title: string,
                pos: { clientX: number, clientY: number },
                rect: { width: number, height: number },
                note: Note) {
        super(id, title, 'noteEditor', pos, rect);
        this.note = note;
    }

    close() {
        super.close().then(() => {
            // 关闭时解除绑定
            if (this.note != null) {
                this.note.editor = null;
            }
        });
    }
}
