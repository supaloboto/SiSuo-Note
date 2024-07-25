import {useComponentStore} from "@/stores/component";
import {useCanvasStore} from "@/stores/canvas";

/**
 * 组件的统一父类
 * @author 刘志栋
 * @since 2024/07/24
 */
export interface Component {
    // 组件类型
    type: string;
    // 组件id
    id: string;
    // 组件位置
    pos: { x: number, y: number };
    // 组件形状
    rect: { width: number, height: number };
    // 组件数据
    data: any;
}

/**
 * 组件的统一行为
 * @author 刘志栋
 * @since 2024/07/24
 */
export abstract class ComponentAction {
    props: Component;

    constructor(props: Component) {
        this.props = props;
        // 记录在store中
        const componentStore = useComponentStore();
        componentStore.componentActionMap.set(props.id, this);
    }

    /**
     * 获取组件属性 用于子类调用
     */
    getProps(): Component {
        return this.props;
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
        canvasStore.selectComponent(this.props.id, removeOthers, reverse);
        return true;
    }

    /**
     * 取消选中
     */
    unselect(): boolean {
        const canvasStore = useCanvasStore();
        canvasStore.unSelectComponent(this.props.id);
        return true;
    }

    /**
     * 删除组件
     */
    delete(): boolean {
        // 移除选中
        this.unselect();
        // 从组件列表中删除
        const componentStore = useComponentStore();
        componentStore.components = componentStore.components.filter(item => item.id !== this.props.id);
        componentStore.componentActionMap.delete(this.props.id);
        return true;
    }

}
