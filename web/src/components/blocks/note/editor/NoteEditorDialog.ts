import {markRaw} from 'vue'
import {Dialog} from "@/frame/dialog/Dialog";
import type {Note} from "@/components/blocks/note/Note";
import NoteEditorDialogComp from "@/components/blocks/note/editor/NoteEditorDialog.vue";

export class NoteEditorDialog extends Dialog<Note> {
    type = 'noteEditor';
    component = markRaw(NoteEditorDialogComp);

    constructor(id: string, title: string, position: { x: number, y: number }, size: {
        width: number,
        height: number
    }, data: Note) {
        super(id, title, 'noteEditor', position, size, data);
    }
}
