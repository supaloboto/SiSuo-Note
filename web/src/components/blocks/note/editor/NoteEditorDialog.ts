import {markRaw} from 'vue'
import {Dialog} from "@/frame/dialog/Dialog";
import type {Note} from "@/components/blocks/note/Note";
import NoteEditorDialogComp from "@/components/blocks/note/editor/NoteEditorDialog.vue";

export class NoteEditorDialog extends Dialog {
    type = 'noteEditor';
    component = markRaw(NoteEditorDialogComp);
    note: Note;

    constructor(id: string, title: string,
                pos: { clientX: number, clientY: number },
                rect: { width: number, height: number },
                data: Note) {
        super(id, title, 'noteEditor', pos, rect);
        this.note = data;
    }
}
