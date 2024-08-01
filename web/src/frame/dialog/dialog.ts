import type {Raw} from "vue";

/**
 * 对话框信息类
 *
 * @author 刘志栋
 * @since 2023/07/31
 */
export class Dialog<T> {
    // 对话框id
    id: string;
    // 对话框标题
    title: string;
    // 对话框类型
    type: string;
    // 位置
    position: {
        x: number,
        y: number,
        zIndex: number
    };
    // 大小
    size: {
        width: number,
        height: number
    };
    // 是否显示
    visible: boolean = false;
    // 使用的组件
    component: Raw<any>;
    // 绑定数据
    data: T;

    constructor(id: string,
                title: string,
                type: string,
                position: { x: number, y: number },
                size: { width: number, height: number },
                data: T) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.position = position;
        this.size = size;
        this.data = data;
    }

    /**
     * 展开对话框
     */
    expand(param: {
        startRect: { x: number, y: number, width: number, height: number },
        width: number,
        height: number
    }): void {
        console.log('expand dialog', this.id, this.title);
        this.visible = true;
    }

    /**
     * 最小化
     */
    minimize(): void {
        console.log('minimize');
    }

    /**
     * 全屏化
     */
    fullscreen(): void {
        console.log('fullscreen');
    }

    /**
     * 关闭
     */
    close(): void {
        console.log('close');
    }

}
