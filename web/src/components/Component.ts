import { useKanbanStore } from "@/stores/kanban";
import { useCanvasStore } from "@/stores/canvas";
import type { LinkLine } from "./plugins/link/LinkLine";
import { deepCopy } from "@/assets/utils/copy";

/**
 * 组件的统一父类
 * @author 刘志栋
 * @since 2024/07/24
 */
export class Component<T> {
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
    // 组件连线
    links: LinkLine[] = [];

    constructor(props: { compType: string, id: string, pos: { x: number, y: number }, rect: { width: number, height: number }, data: any }) {
        this.compType = props.compType;
        this.id = props.id;
        this.pos = props.pos;
        this.rect = props.rect;
        this.data = props.data;
        this.updatePosMatrix();
    }

    /**
     * 更新坐标矩阵中的数据
     */
    private updatePosMatrix(): void {
        const kanbanStore = useKanbanStore();
        kanbanStore.updatePosMatrix();
    }

    /**
     * 移动组件
     * @param xOffset x轴偏移量
     * @param yOffset y轴偏移量
     */
    move(xOffset: number, yOffset: number): void {
        this.moveTo(this.pos.x + xOffset, this.pos.y + yOffset);
    }

    /**
     * 移动组件到指定位置
     * @param x x轴坐标
     * @param y y轴坐标
     */
    moveTo(x: number, y: number): void {
        if (this.pos.x === x && this.pos.y === y) {
            return;
        }
        // 记录原始位置
        const originPos = deepCopy(this.pos);
        // 更新位置
        this.pos.x = x;
        this.pos.y = y;
        // 更新从此组件出发的连线数据
        const xMovement = x - originPos.x;
        const yMovement = y - originPos.y;
        this.links.forEach((link) => {
            link.startPos.x += xMovement;
            link.startPos.y += yMovement;
            link.refresh();
        });
        // 更新连接到此组件的连线数据
        //TODO 优化逻辑
        const compList = useKanbanStore().components;
        for (const comp of compList) {
            for (const link of comp.links) {
                if (link.targetCompId === this.id) {
                    link.endPos.x += xMovement;
                    link.endPos.y += yMovement;
                    link.refresh();
                }
            }
        }
        // 更新坐标矩阵
        this.updatePosMatrix();
    }

    /**
     * 修改组件尺寸
     * @param widthExpand 宽度变化
     * @param heightExpand 高度变化
     */
    changeSize(widthExpand: number, heightExpand: number): void {
        if (widthExpand === 0 && heightExpand === 0) {
            return;
        }
        // 更新尺寸
        this.rect.width += widthExpand;
        this.rect.height += heightExpand;
        //TODO 更新连线数据
        // 更新坐标矩阵
        this.updatePosMatrix();
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
