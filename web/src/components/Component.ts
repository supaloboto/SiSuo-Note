import { useKanbanStore } from "@/stores/kanban";
import { useCanvasStore } from "@/stores/canvas";

/**
 * 组件的统一父类
 * @author 刘志栋
 * @since 2024/07/24
 */
export class Component<T extends { [key: string]: any }> {
    // 组件类型
    compType: string;
    // 组件id
    id: string;
    // 组件位置
    pos: { x: number, y: number };
    // 组件形状
    rect: { width: number, height: number };
    // 组件数据
    data: { [key: string]: any };

    constructor(props: { compType: string, id: string, pos: { x: number, y: number }, rect: { width: number, height: number }, data: any }) {
        this.compType = props.compType;
        this.id = props.id;
        this.pos = props.pos;
        this.rect = props.rect;
        this.data = props.data;
    }

    /**
     * 点击事件
     */
    click(): boolean {
        return true;
    }

    /**
     * 双击事件
     */
    dblclick(): boolean {
        return true;
    }

    /**
     * 右键菜单
     */
    contextMenu(): boolean {
        return true;
    }

    /**
     * 被选中
     */
    select(removeOthers: boolean = true, reverse: boolean = false): boolean {
        const canvasStore = useCanvasStore();
        canvasStore.selectComponent(this.id, removeOthers, reverse);
        return true;
    }

    /**
     * 取消选中
     */
    unselect(): boolean {
        const canvasStore = useCanvasStore();
        canvasStore.unSelectComponent(this.id);
        return true;
    }

    /**
     * 删除组件
     */
    delete(): boolean {
        // 移除选中
        this.unselect();
        // 从组件列表中删除
        useKanbanStore().deleteComponent(this.id);
        return true;
    }

    /**
     * 更新组件信息
     */
    update(): Promise<any> {
        return useKanbanStore().updateComponent(this);
    }

}
