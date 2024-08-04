import {BlockComponent} from "@/components/blocks/BlockComponent";

/**
 * 笔记组件
 * @author 刘志栋
 * @since 2024/07/24
 */
export class Note extends BlockComponent {
    /**
     * 构造函数
     */
    constructor(props: { id, pos, rect, data }) {
        props.type = "note";
        super(props);
        // 覆盖父类的事件
        this.dblclick = this.dblclick.bind(this);
        this.contextMenu = this.contextMenu.bind(this);
    }

    /**
     * 双击事件
     */
    dblclick(): boolean {
        console.log("双击笔记:", this.id);
        // 显示编辑器
        // this.showEditor.value = true;
        return true;
    }

    /**
     * 右键事件
     */
    contextMenu(): boolean {
        console.log("右键笔记:", this.id);
        return true;
    }
}
