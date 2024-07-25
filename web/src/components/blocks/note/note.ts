import {BlockComponent, BlockComponentAction} from "@/components/blocks/BlockComponent";
import {type Ref} from "vue";

/**
 * 笔记组件
 * @author 刘志栋
 * @since 2024/07/24
 */
export interface Note extends BlockComponent {
}

/**
 * 笔记组件行为
 * @author 刘志栋
 * @since 2024/07/24
 */
export class NoteAction extends BlockComponentAction {
    // 是否显示编辑器
    showEditor: Ref<boolean>;

    /**
     * 构造函数
     */
    constructor({props, showEditor}: {
        props: Note,
        showEditor: Ref<boolean>
    }) {
        super(props);
        this.showEditor = showEditor;
        // 绑定this
        this.dblclick = this.dblclick.bind(this);
        this.contextMenu = this.contextMenu.bind(this);
    }

    /**
     * 双击事件
     */
    dblclick(): boolean {
        console.log("双击组件:", this.getProps().id);
        // 显示编辑器
        this.showEditor.value = true;
        return true;
    }

    /**
     * 右键事件
     */
    contextMenu(): boolean {
        console.log("右键:", this.getProps().id);
        return true;
    }
}
