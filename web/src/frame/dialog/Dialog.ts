import type {Raw} from "vue";
import {deepCopy} from "@/assets/utils/copy";
import {useDialogStore} from "@/stores/dialog";

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
    pos: { clientX: number, clientY: number };
    // 大小
    rect: { width: number, height: number };
    // 是否显示
    visible: boolean = false;
    // 使用的组件
    component: Raw<any>;
    // 绑定数据
    data: T;
    // 是否最大化
    maximized: boolean = false;
    // 记录原本的位置和大小 用于最大化之后还原
    private originPos: { x: number, y: number };
    private originRect: { width: number, height: number };

    constructor(id: string,
                title: string,
                type: string,
                pos: { clientX: number, clientY: number },
                rect: { width: number, height: number },
                data: T) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.pos = pos;
        this.rect = rect;
        this.data = data;
    }

    /**
     * 展开对话框
     */
    open(param: {
        startRect: { clientX: number, clientY: number, width: number, height: number },
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
        this.visible = false;
    }

    /**
     * 全屏化
     */
    fullscreen(): void {
        // 如果是最大化状态 则还原
        if (this.maximized) {
            this.pos = deepCopy(this.originPos);
            this.rect = deepCopy(this.originRect);
            this.maximized = false;
            return;
        }
        // 如果不是最大化状态 则最大化
        // 获取看板视图整体和dock的dom
        const frameDiv = document.getElementById('page-frame');
        if (!frameDiv) {
            return;
        }
        const dockDiv = document.getElementById('dock');
        if (!dockDiv) {
            return;
        }
        // 记录原本的位置和大小
        this.originPos = deepCopy(this.pos);
        this.originRect = deepCopy(this.rect);
        // 设置最大化
        this.rect.width = frameDiv.clientWidth;
        this.rect.height = frameDiv.clientHeight - dockDiv.clientHeight;
        this.pos.clientX = 0;
        this.pos.clientY = 0;
        this.maximized = true;
    }

    /**
     * 关闭
     */
    close(): void {
        // 从store中移除
        const dialogStore = useDialogStore();
        const index = dialogStore.dialogs.findIndex(dialog => dialog.id === this.id);
        if (index > -1) {
            dialogStore.dialogs.splice(index, 1);
        }
    }

}
