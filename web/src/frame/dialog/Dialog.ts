import {type Raw, type Ref, ref} from "vue";
import {deepCopy} from "@/assets/utils/copy";
import {useDialogStore} from "@/stores/dialog";
import {DialogAnimation} from "@/frame/dialog/DialogAnimation";

/**
 * 对话框信息类
 *
 * @author 刘志栋
 * @since 2023/07/31
 */
export class Dialog {
    // 对话框id
    id: string;
    // 对话框标题
    title: string;
    // 对话框类型
    type: string;
    // 位置
    pos: Ref<{ clientX: number, clientY: number }>;
    // 大小
    rect: Ref<{ width: number, height: number }>;
    // 是否显示
    visible: boolean = false;
    // 使用的组件
    component: Raw<any>;
    // 是否最大化
    maximized: boolean = false;
    // 记录原本的位置和大小 用于最大化之后还原
    private originPos: { x: number, y: number };
    private originRect: { width: number, height: number };
    // 动画控制
    animation: DialogAnimation;
    // 尺寸变化时的钩子
    onRectChange: () => void;

    constructor(id: string,
                title: string,
                type: string,
                pos: { clientX: number, clientY: number },
                rect: { width: number, height: number }) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.pos = ref(pos);
        this.rect = ref(rect);
        this.animation = new DialogAnimation(this);
        // 加入到对话框store
        useDialogStore().dialogs.push(this);
    }

    /**
     * 展开对话框
     */
    open(startRect: { clientX: number, clientY: number, width: number, height: number }): void {
        // 播放展开动画
        this.animation.openAnimation(startRect).then(() => {
            if (this.onRectChange) {
                this.onRectChange();
            }
            // 插入到对话框堆叠顺序的最前面
            const dialogStore = useDialogStore();
            dialogStore.dialogStack.unshift(this.id);
        });
    }

    /**
     * 聚焦
     */
    focus(): void {
        // 插入到对话框堆叠顺序的最前面
        const dialogStore = useDialogStore();
        const dialogStackIndex = dialogStore.dialogStack.indexOf(this.id);
        if (dialogStackIndex !== -1) {
            dialogStore.dialogStack.splice(dialogStackIndex, 1);
        }
        dialogStore.dialogStack.unshift(this.id);
    }

    /**
     * 最小化
     */
    minimize(endRect: { clientX: number, clientY: number, width: number, height: number }): void {
        this.animation.minimizeAnimation(endRect).then(() => {
            // 从对话框堆叠顺序中移除
            const dialogStore = useDialogStore();
            const dialogStackIndex = dialogStore.dialogStack.indexOf(this.id);
            if (dialogStackIndex !== -1) {
                dialogStore.dialogStack.splice(dialogStackIndex, 1);
            }
        });
    }

    /**
     * 全屏化
     */
    fullscreen(): void {
        // 如果是最大化状态 则还原
        if (this.maximized) {
            this.pos = deepCopy(this.originPos);
            this.rect = deepCopy(this.originRect);
            if (this.onRectChange) {
                this.onRectChange();
            }
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
        if (this.onRectChange) {
            this.onRectChange();
        }
        this.pos.clientX = 0;
        this.pos.clientY = 0;
        this.maximized = true;
    }

    /**
     * 关闭
     */
    close(): void {
        // 播放关闭动画
        this.animation.closeAnimation().then(() => {
            this.visible = false;
            // 从store中移除
            const dialogStore = useDialogStore();
            // 从堆叠顺序中移除
            const dialogStackIndex = dialogStore.dialogStack.indexOf(this.id);
            if (dialogStackIndex !== -1) {
                dialogStore.dialogStack.splice(dialogStackIndex, 1);
            }
            // 从对话框列表中移除
            const dialogIndex = dialogStore.dialogs.indexOf(this);
            if (dialogIndex !== -1) {
                dialogStore.dialogs.splice(dialogIndex, 1);
            }
        });
    }

}
