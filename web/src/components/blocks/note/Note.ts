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
        // 获取编辑器dom的位置 使窗口从组件上弹出
        const editorDom = document.getElementById(`sisuo-comp-note-${this.id}`);
        if (!editorDom) {
            console.error("笔记组件未渲染");
            return false;
        }
        const editorDomRect = editorDom.getBoundingClientRect();
        const editorPos = {
            clientX: editorDomRect.x - (editorRect.width - editorDomRect.width) / 2,
            clientY: editorDomRect.y + 40 - (editorRect.height - editorDomRect.height) / 2
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
        // 如果编辑器不可见 则打开
        if (!this.editor.visible) {
            // 打开编辑器
            this.editor.open({
                clientX: editorDomRect.x,
                clientY: editorDomRect.y,
                width: editorDomRect.width,
                height: editorDomRect.height
            }).then(() => {
                this.editor.focus();
            });
        } else {
            this.editor.focus();
        }
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
