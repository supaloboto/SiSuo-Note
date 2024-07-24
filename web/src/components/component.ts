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
    }

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

    expose() {
        return {
            click: this.click,
            dblclick: this.dblclick,
            contextMenu: this.contextMenu
        };
    }

}
