import { BoardShapeCommand } from "@/frame/board/shape/BoardShapeCommand";
import { BoardShape, BoardShapeCanvas, BoardShapeSvg, LineStyle } from "@/frame/board/shape/BoardShape";
import { Pointer, useCanvasStore } from "@/stores/canvas";
import { LinkEditorDialog } from "./LinkEditorDialog.js";
import { useDialogStore } from "@/stores/dialog";
import { Dialog } from "@/frame/dialog/Dialog.js";
import { deepCopy } from "@/assets/utils/copy.js";
import { watch, computed } from "vue";
import { LinkLine } from "./LinkLine.js";

/**
 * 组件关联连线渲染指令
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */
export class LinkLineRenderCmd extends BoardShapeCommand {
    // 关联连线信息
    private _linkLine: LinkLine;

    constructor(linkLine: LinkLine) {
        super();
        this._linkLine = linkLine;
    }

    get linkLine(): LinkLine {
        return this._linkLine;
    }

    get selected(): boolean {
        return useCanvasStore().currentPointer.selected.includes(this._linkLine);
    }

    render(): BoardShape {
        this.shape = this.type === 'svg' ? new BoardShapeSvg() : new BoardShapeCanvas();
        // 如果路径点小于2个则不绘制
        if (this._linkLine.path.length < 2) {
            return null as any;
        }
        // 箭头宽高
        const arrowWidth = 2;
        const arrowHeight = 1;
        // 箭头与线段终点的间距
        const arrowGap = -6;
        // 从第一个点开始绘制
        this.shape.from(this._linkLine.path[0]);
        // 所有路径点
        for (let i = 1; i < this._linkLine.path.length; i++) {
            // 最后一个点回退一点给箭头留位置
            if (i < this._linkLine.path.length - 1) {
                this.shape.lineTo(this._linkLine.path[i]);
            } else {
                const lastPos = deepCopy(this._linkLine.path[i]);
                const lastDirect = this._linkLine.endPos.direct;
                switch (lastDirect) {
                    case 'n':
                        lastPos.y += arrowHeight - arrowGap + 2;
                        break;
                    case 's':
                        lastPos.y -= arrowHeight - arrowGap + 2;
                        break;
                    case 'w':
                        lastPos.x += arrowHeight - arrowGap + 2;
                        break;
                    case 'e':
                        lastPos.x -= arrowHeight - arrowGap + 2;
                        break;
                }
                this.shape.lineTo(lastPos);
            }
        }
        // 绘制箭头
        const endPos = this._linkLine.endPos;
        const endDirect = endPos.direct;
        let arrowPoints: { x: number, y: number }[] = [];
        switch (endDirect) {
            case 'n':
                arrowPoints = [
                    { x: endPos.x - arrowWidth / 2, y: endPos.y - arrowGap },
                    { x: endPos.x, y: endPos.y - arrowHeight - arrowGap },
                    { x: endPos.x + arrowWidth / 2, y: endPos.y - arrowGap },
                ];
                break;
            case 's':
                arrowPoints = [
                    { x: endPos.x - arrowWidth / 2, y: endPos.y + arrowGap },
                    { x: endPos.x, y: endPos.y + arrowHeight + arrowGap },
                    { x: endPos.x + arrowWidth / 2, y: endPos.y + arrowGap },
                ];
                break;
            case 'w':
                arrowPoints = [
                    { x: endPos.x - arrowGap, y: endPos.y - arrowWidth / 2 },
                    { x: endPos.x - arrowHeight - arrowGap, y: endPos.y },
                    { x: endPos.x - arrowGap, y: endPos.y + arrowWidth / 2 },
                ];
                break;
            case 'e':
                arrowPoints = [
                    { x: endPos.x + arrowGap, y: endPos.y - arrowWidth / 2 },
                    { x: endPos.x + arrowHeight + arrowGap, y: endPos.y },
                    { x: endPos.x + arrowGap, y: endPos.y + arrowWidth / 2 },
                ];
                break;
        }
        this.shape.from(arrowPoints[0]).lineTo(arrowPoints[1]).lineTo(arrowPoints[2]).closePath();
        // 当被选中时 在线段两端绘制小圆点 用于拖动连线
        if (this.selected) {
            const endPointLineStyle = new LineStyle();
            endPointLineStyle.stroke = 'var(--line-fill-endpoint)';
            endPointLineStyle.fill = 'var(--line-fill-endpoint)';
            const shape = this.shape;
            // 设置起始点拖动事件
            const startPointDot = shape.from(this._linkLine.startPos, endPointLineStyle).circle(4);
            if (this.type === 'svg') {
                (startPointDot as BoardShapeSvg)
                    .setDragStartEvt(() => this.useCanvas())
                    .setDragEvt((mouse: Pointer) => {
                        const { x, y } = mouse;
                        this._linkLine.changeStartPos({ x, y, direct: this._linkLine.startPos.direct });
                    })
                    .setDragEndEvt(() => {
                        this.useSvg();
                        this._linkLine.sourceComp?.updateLink();
                    });
            }
            // 设置结束点拖动事件
            const endPointDot = shape.from(this._linkLine.endPos, endPointLineStyle).circle(4);
            if (this.type === 'svg') {
                (endPointDot as BoardShapeSvg)
                    .setDragStartEvt(() => this.useCanvas())
                    .setDragEvt((mouse: Pointer) => {
                        const { x, y } = mouse;
                        this._linkLine.changeEndPos({ x, y });
                    })
                    .setDragEndEvt(() => {
                        this.useSvg();
                        this._linkLine.sourceComp?.updateLink();
                    });
            }
        }
        return this.shape;
    }

    select(removeOtherSelection: boolean = true, reverse: boolean = false): void {
        const canvasStore = useCanvasStore();
        // 记录选中
        canvasStore.selectComponent(this._linkLine, removeOtherSelection, reverse);
        // 触发重绘
        this.update?.();
        // 如果此时被选中则建立监听 当取消选中时再次触发重绘
        if (this.selected) {
            const selectWatch = watch(computed(() => this.selected), (val) => {
                if (!val) {
                    this.update?.();
                    selectWatch();
                }
            });
        }
    }

    click(): void {
        super.click();
        this.select();
    }

    dblclick(): void {
        super.dblclick();
        // 检查是否已经存在此连线的编辑弹窗
        let dialog: LinkEditorDialog = useDialogStore().dialogs.find((dialog) => {
            return dialog instanceof LinkEditorDialog && dialog.id === this._linkLine.id;
        }) as any;
        if (!dialog) {
            // 新建编辑弹窗
            const pos = {
                clientX: useCanvasStore().currentPointer.clientX - 430, clientY: useCanvasStore().currentPointer.clientY - 480
            };
            const rect = {
                width: 860, height: 960
            };
            dialog = new LinkEditorDialog(
                this._linkLine.id,
                // todo 国际化
                "连线编辑",
                Dialog.fixPos(pos, rect),
                rect,
                this._linkLine
            );
        }
        // 打开并聚焦编辑弹窗
        dialog.openAndFocus();
    }

}
