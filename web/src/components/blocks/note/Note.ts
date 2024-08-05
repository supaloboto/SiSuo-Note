import {BlockComponent} from "@/components/blocks/BlockComponent";
import {NoteEditorDialog} from "@/components/blocks/note/editor/NoteEditorDialog";
import {useDialogStore} from "@/stores/dialog";

/**
 * 笔记组件
 * @author 刘志栋
 * @since 2024/07/24
 */
export class Note extends BlockComponent {
    editor: NoteEditorDialog = null;
    title: string;

    /**
     * 构造函数
     */
    constructor(props: { id, pos, rect, data }) {
        props.type = "note";
        super(props);
    }

    /**
     * 双击事件
     */
    dblclick(): boolean {
        super.dblclick();
        const editorRect = {width: 800, height: 600};
        // todo 获取编辑器的clientX和clientY
        const editorPos = {
            clientX: this.pos.x - (editorRect.width - this.rect.width) / 2,
            clientY: this.pos.y + 40 - (editorRect.height - this.rect.height) / 2
        };
        // 如果编辑器不存在或者已经关闭 则重新创建
        const dialogStore = useDialogStore();
        if (!this.editor || dialogStore.dialogs.findIndex(dialog => dialog.id === this.id) === -1) {
            // 显示编辑器
            this.editor = new NoteEditorDialog(
                this.id,
                this.title ? this.title : "无标题",
                editorPos,
                editorRect,
                this.data
            );
        }
        // 打开编辑器
        this.editor.open({
            clientX: this.pos.x,
            clientY: this.pos.y,
            width: this.rect.width,
            height: this.rect.height
        });
        return true;
    }

    /**
     * 右键事件
     */
    contextMenu(): boolean {
        super.contextMenu();
        console.log("右键笔记:", this.id);
        return true;
    }
}
