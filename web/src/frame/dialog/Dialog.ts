import { type Raw, type Ref, ref, toRef, toRefs } from "vue";
import { deepCopy } from "@/assets/utils/copy";
import { useDialogStore } from "@/stores/dialog";
import { DialogAnimation } from "@/frame/dialog/DialogAnimation";
import { useCanvasStore } from "@/stores/canvas";

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
    private originPos: { clientX: number, clientY: number } = null as any;
    private originRect: { width: number, height: number } = null as any;
    // 动画控制
    animation: DialogAnimation;
    // 尺寸变化时的钩子
    onRectChange: () => void = null as any;

    constructor(id: string,
        title: string,
        type: string,
        pos: { clientX: number, clientY: number },
        rect: { width: number, height: number }) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.animation = new DialogAnimation(this);
        this.pos = ref(pos);
        this.rect = ref(rect);
        // 加入到对话框store
        useDialogStore().dialogs.push(this as any);
    }

    /**
     * 对对话框的位置做检查 如果超出边界 则调整位置
     * @param pos 位置
     * @param rect 对话框大小
     * @return {{clientX: number, clientY: number}} 合理的打开位置
     */
    static fixPos(pos: { clientX: number, clientY: number }, rect: { width: number, height: number }): {
        clientX: number,
        clientY: number
    } {
        const result = { clientX: pos.clientX, clientY: pos.clientY };
        const padding = 30;
        // 获取当前可使用视图的大小
        const viewWidth = window.innerWidth;
        const dockClientHeight = document.getElementById('dock')?.clientHeight;
        const viewHeight = window.innerHeight - (dockClientHeight ? dockClientHeight : 0);
        if (result.clientX + rect.width > viewWidth) {
            result.clientX = viewWidth - rect.width - padding;
        }
        if (result.clientY + rect.height > viewHeight) {
            result.clientY = viewHeight - rect.height - padding;
        }
        if (result.clientX < 0) {
            result.clientX = padding;
        }
        if (result.clientY < 0) {
            result.clientY = padding;
        }
        return result;
    }

    /**
     * 展开对话框
     */
    open(startRect: { clientX: number, clientY: number, width: number, height: number }): Promise<Dialog> {
        return new Promise((resolve, reject) => {
            // 插入到对话框堆叠顺序的最前面
            const dialogStore = useDialogStore();
            dialogStore.dialogStack.unshift(this.id);
            // 播放展开动画
            this.animation.openAnimation(startRect).then(() => {
                if (this.onRectChange) {
                    this.onRectChange();
                }
                resolve(this);
            });
        });
    }

    /**
     * 聚焦
     */
    focus(): void {
        // 插入到对话框堆叠顺序的最前面
        const dialogStore = useDialogStore();
        const dialogStackIndex = dialogStore.dialogStack.indexOf(this.id);
        if (dialogStackIndex !== -1
        ) {
            dialogStore.dialogStack.splice(dialogStackIndex, 1);
        }
        dialogStore.dialogStack.unshift(this.id);
        // 更改鼠标聚焦状态
        useCanvasStore().currentPointer.focusOnCanvas = false;
    }

    /**
     * 最小化
     */
    minimize(endRect: { clientX: number, clientY: number, width: number, height: number }): Promise<void> {
        return new Promise((resolve, reject) => {
            this.animation.minimizeAnimation(endRect).then(() => {
                // 从对话框堆叠顺序中移除
                const dialogStore = useDialogStore();
                const dialogStackIndex = dialogStore.dialogStack.indexOf(this.id);
                if (dialogStackIndex !== -1) {
                    dialogStore.dialogStack.splice(dialogStackIndex, 1);
                }
                resolve();
            });
        });
    }

    /**
     * 全屏化
     */
    fullscreen(): void {
        // 直接使用this.pos访问会导致无法触发响应式
        const pos = toRef(this, 'pos');
        const rect = toRef(this, 'rect');
        // 如果是最大化状态 则还原
        if (this.maximized) {
            pos.value = deepCopy(this.originPos);
            rect.value = deepCopy(this.originRect);
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
        this.originPos = deepCopy(pos.value);
        this.originRect = deepCopy(rect.value);
        // 设置最大化
        rect.value.width = frameDiv.clientWidth;
        rect.value.height = frameDiv.clientHeight - dockDiv.clientHeight;
        if (this.onRectChange) {
            this.onRectChange();
        }
        pos.value.clientX = 0;
        pos.value.clientY = 0;
        this.maximized = true;
    }

    /**
     * 关闭
     */
    close(): Promise<void> {
        return new Promise((resolve, reject) => {
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
                const dialogIndex = dialogStore.dialogs.indexOf(this as any);
                if (dialogIndex !== -1) {
                    dialogStore.dialogs.splice(dialogIndex, 1);
                }
                resolve();
            });
        });
    }

}
