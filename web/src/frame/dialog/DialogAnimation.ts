import type {Dialog} from "@/frame/dialog/Dialog";

/**
 * 对话框动画控制
 *
 * @author 刘志栋
 * @since 2023/08/04
 */
export class DialogAnimation {
    // 对话框对象
    dialog: Dialog;
    // 动画播放过程标志 播放动画时不渲染插槽内容 避免宽度剧烈变化导致渲染问题 也避免动画播放过程中触发各种鼠标事件造成无法预料的问题
    animating: boolean = false;
    // 记录原始位置和大小
    private originRect: { clientX: number, clientY: number, width: number, height: number };
    // 透明度
    opacity: number = 1;
    // 动画播放计时器
    private animationTimer: number = null;

    constructor(dialog: Dialog) {
        this.dialog = dialog;
    }

    /**
     * 动画结束
     */
    endAnim = () => {
        this.animating = false;
        this.originRect = null;
        this.animationTimer = null;
    };

    /**
     * 更改对话框大小位置
     */
    applyRect = (rect: { clientX: number, clientY: number, width: number, height: number }) => {
        this.dialog.pos.value.clientX = rect.clientX;
        this.dialog.pos.value.clientY = rect.clientY;
        this.dialog.rect.value.width = rect.width;
        this.dialog.rect.value.height = rect.height;
    };

    /**
     * 展开动画
     * @param startRect
     */
    openAnimation = (startRect: { clientX: number, clientY: number, width: number, height: number }) => {
        const self = this;
        // 如果有正在进行中的动画则中断并立即展开
        if (self.animationTimer) {
            clearTimeout(self.animationTimer);
        } else {
            // 如未传入起始位置 则尝试获取dock上的对话框dom位置 作为展开的起始位置
            // 如果dom未获取到 则以画面中心为准
            if (!startRect) {
                const dialogElement = document.querySelector(`.dock-dialog[id="${self.dialog.id}"]`) as HTMLElement;
                startRect = dialogElement ? {
                    clientX: dialogElement.getBoundingClientRect().left,
                    clientY: dialogElement.getBoundingClientRect().top,
                    width: dialogElement.getBoundingClientRect().width,
                    height: dialogElement.getBoundingClientRect().height
                } : {
                    clientX: window.innerWidth / 2 - self.dialog.rect.value.width / 2,
                    clientY: window.innerHeight / 2 - self.dialog.rect.value.height / 2,
                    width: 0,
                    height: 0,
                };
            }
            // 记录原本的位置
            if (!self.originRect) {
                self.originRect = {
                    clientX: self.dialog.pos.value.clientX,
                    clientY: self.dialog.pos.value.clientY,
                    width: self.dialog.rect.value.width,
                    height: self.dialog.rect.value.height,
                };
            }
            // 设置开始位置和大小
            self.applyRect(startRect);
        }
        // 显示对话框并进入动画播放状态(动画效果由css样式具体控制)
        self.animating = true;
        self.dialog.visible = true;
        return new Promise<void>(resolve => {
            // 设置结束位置和大小 使用延时避免动画效果未生效
            self.animationTimer = window.setTimeout(() => {
                self.applyRect(self.originRect);
                // 动画结束后解除动画播放状态
                self.animationTimer = window.setTimeout(() => {
                    self.endAnim();
                    resolve();
                }, 200);
            }, 10);
        });
    };

    /**
     * 最小化动画
     * @param endRect
     */
    minimizeAnimation = (endRect: { clientX: number, clientY: number, width: number, height: number }) => {
        // 如果有正在进行中的动画则中断
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
        }
        // 如未传入结束位置 则尝试获取dock上的对话框dom位置 作为收缩的结束位置
        // 如果dom未获取到 则以画面中心为准
        if (!endRect) {
            const dialogElement = document.querySelector(`.dock-dialog[id="${this.dialog.id}"]`) as HTMLElement;
            endRect = dialogElement ? {
                clientX: dialogElement.getBoundingClientRect().left,
                clientY: dialogElement.getBoundingClientRect().top,
                width: dialogElement.getBoundingClientRect().width,
                height: dialogElement.getBoundingClientRect().height
            } : {
                clientX: window.innerWidth / 2 - this.dialog.rect.value.width / 2,
                clientY: window.innerHeight / 2 - this.dialog.rect.value.height / 2,
                width: 0,
                height: 0,
            };
        }
        // 记录原本的位置
        if (!this.originRect) {
            this.originRect = {
                clientX: this.dialog.pos.value.clientX,
                clientY: this.dialog.pos.value.clientY,
                width: this.dialog.rect.value.width,
                height: this.dialog.rect.value.height,
            };
        }
        this.applyRect(endRect);
        // 进入动画播放状态(动画效果由css样式具体控制)
        this.animating = true;
        return new Promise<void>(resolve => {
            // 动画结束后解除动画播放状态
            this.animationTimer = window.setTimeout(() => {
                this.applyRect(this.originRect);
                this.endAnim();
                this.dialog.visible = false;
                resolve();
            }, 200);
        });
    };

    /**
     * 关闭动画
     */
    closeAnimation = () => {
        // 借用最小化动画 将对话框进行收缩 然后隐藏
        // 整理收缩的结束位置
        const endRect = {
            clientX: this.dialog.pos.value.clientX + this.dialog.rect.value.width * 0.1,
            clientY: this.dialog.pos.value.clientY + this.dialog.rect.value.height * 0.1,
            width: this.dialog.rect.value.width * 0.8,
            height: this.dialog.rect.value.height * 0.8,
        };
        return new Promise<void>(resolve => {
            this.opacity = 0;
            this.minimizeAnimation(endRect).then(() => {
                resolve();
            });
        });
    };

}