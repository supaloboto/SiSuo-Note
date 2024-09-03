import { BoardShapeCommand, BoardShape } from "@/frame/board/shape/BoardShape";
import { useCanvasStore } from "@/stores/canvas";
import { useKanbanStore } from "@/stores/kanban";
import { LinkEditorDialog } from "./LinkEditorDialog.js";
import { useDialogStore } from "@/stores/dialog";
import { getLongID } from "@/assets/utils/idworker";
import { Dialog } from "@/frame/dialog/Dialog.js";

/**
 * 组件关联连线渲染指令
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */
export class LinkLineRenderCmd extends BoardShapeCommand {
    // 关联连线信息 并利用此对象触发渲染更新
    private linkLine: LinkLine;

    constructor(linkLine: LinkLine) {
        super();
        this.linkLine = linkLine;
    }

    render(shape: BoardShape): void {
        // 如果路径点小于2个则不绘制
        if (this.linkLine.path.length < 2) {
            return null as any;
        }
        // 从第一个点开始绘制
        shape.from(this.linkLine.path[0]);
        // 所有路径点
        for (let i = 1; i < this.linkLine.path.length; i++) {
            shape.lineTo(this.linkLine.path[i]);
        }
        // todo 绘制箭头
    }

    click(): void {
        super.click();
        // todo 点击连线时的操作
    }

    dblclick(): void {
        super.dblclick();
        // 检查是否已经存在此连线的编辑弹窗
        let dialog: LinkEditorDialog = useDialogStore().dialogs.find((dialog) => {
            return dialog instanceof LinkEditorDialog && dialog.id === this.linkLine.id;
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
                this.linkLine.id,
                // todo 国际化
                "连线编辑",
                Dialog.fixPos(pos, rect),
                rect,
                this.linkLine
            );
        }
        // 打开并聚焦编辑弹窗
        dialog.openAndFocus();
    }

}

/**
 * 组件关联连线类
 * 
 * @todo 继承此类 添加曲线连线
 * @author 刘志栋
 * @since 2024/08/26
 */
export class LinkLine {
    // 连线ID
    id: string = '';
    // 所属组件
    compId: string = '';
    // 目标组件
    targetCompId: string = '';
    // 起始路径点
    startPos: { x: number, y: number, direct?: string };
    // 结束路径点
    endPos: { x: number, y: number, direct?: string };
    // 路径点集合
    path: { x: number, y: number }[] = [];
    // 活跃状态
    _active: boolean = false;
    // 画线指令
    renderCommand: LinkLineRenderCmd;

    constructor(props: {
        compId: string,
        targetCompId: string,
        startPos: { x: number, y: number, direct?: string },
        endPos: { x: number, y: number, direct?: string },
        path?: { x: number, y: number }[]
    }) {
        this.id = getLongID();
        this.compId = props.compId;
        this.targetCompId = props.targetCompId;
        this.startPos = props.startPos;
        this.endPos = props.endPos;
        this.renderCommand = new LinkLineRenderCmd(this);
        if (props.path) {
            // 使用传入的路径点
            this.path = props.path;
        } else {
            // 执行一次渲染 自动计算路径点
            this.refresh();
        }
    }

    draw() {
        this.renderCommand.draw();
    }

    erase() {
        this.renderCommand.erase();
    }

    active() {
        this._active = true;
        this.renderCommand.useCanvas();
    }

    deactive() {
        this._active = false;
        this.renderCommand.useSvg();
    }

    /**
     * 更新连线的结束点
     * @param endPos 结束位置和方向
     */
    changeEndPos(endPos: { x: number, y: number, direct?: string }) {
        // 检查结束点是否在组件上
        const compList = useKanbanStore().components;
        const comp = compList.find((item) => {
            return item.id !== this.compId
                && item.pos.x < endPos.x && item.pos.x + item.rect.width > endPos.x
                && item.pos.y < endPos.y && item.pos.y + item.rect.height > endPos.y;
        });
        // 计算结束点位置
        if (comp) {
            // 选择组件上靠近鼠标的handler点位 为减少组件边框造成的影响进行微调
            const compPos = comp.pos;
            const compstartPos = [
                { x: compPos.x + comp.rect.width / 2, y: compPos.y + comp.rect.height + 1, direct: 'n' },
                { x: compPos.x + comp.rect.width / 2, y: compPos.y + 1, direct: 's' },
                { x: compPos.x + 1, y: compPos.y + comp.rect.height / 2, direct: 'e' },
                { x: compPos.x + comp.rect.width - 1, y: compPos.y + comp.rect.height / 2, direct: 'w' },
            ];
            // 检查鼠标位置与各个handler位置的关系
            let nearestHandler = compstartPos[0];
            const getDistance = (pos1: { x: number, y: number }, pos2: { x: number, y: number }) => {
                if (pos1.x === pos2.x) {
                    return Math.abs(pos1.y - pos2.y);
                } else if (pos1.y === pos2.y) {
                    return Math.abs(pos1.x - pos2.x);
                } else {
                    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
                }
            }
            for (let i = 1; i < compstartPos.length; i++) {
                const handler = compstartPos[i];
                if (getDistance(endPos, handler) < getDistance(endPos, nearestHandler)) {
                    nearestHandler = handler;
                }
            }
            endPos = nearestHandler;
            // 记录连接的组件
            this.targetCompId = comp.id;
        } else {
            // 连接到鼠标位置
            const startPos = this.startPos;
            // 当鼠标位置距离handler的水平或垂直距离小于5时 将线段捋直
            endPos.x = Math.abs(endPos.x - startPos.x) > 5 ? endPos.x : startPos.x;
            endPos.y = Math.abs(endPos.y - startPos.y) > 5 ? endPos.y : startPos.y;
            // 计算方向
            const gapX = endPos.x - startPos.x;
            const gapY = endPos.y - startPos.y;
            if (endPos.x > startPos.x) {
                endPos.direct = Math.abs(gapX) > Math.abs(gapY) ? 'e' : (gapY > 0 ? 's' : 'n');
            } else {
                endPos.direct = Math.abs(gapX) > Math.abs(gapY) ? 'w' : (gapY > 0 ? 's' : 'n');
            }
            // 清空组件连接
            this.targetCompId = '';
        }
        // 更新结束点
        this.endPos = endPos;
        // 更新连线
        this.refresh();
    }

    /**
     * 根据端点自动更新线段
     * @param startPos 开始位置和方向
     * @param endPos 结束位置和方向
     * @returns 点位集合
     */
    refresh() {
        this.path = [];
        const startPos = this.startPos;
        const endPos = this.endPos;
        if (!startPos || !endPos) {
            return;
        }
        // 记录开始点
        this.path.push(startPos);
        // 如果开始结束点刚好呈垂直或水平 则直接连接
        if ((startPos.x === endPos.x) || (startPos.y === endPos.y)) {
            this.path.push(endPos);
            return;
        }
        // 判断开始方向和结束方向之间的关系
        const directConcat = (startPos.direct ?? '') + endPos.direct;
        // 计算可使用的最小距离 最小是10 最大是40 若开始结束方向相反 则固定使用最大值
        const minDist = { x: 40, y: 40 };
        if (directConcat !== 'sn' && directConcat !== 'ns' && directConcat !== 'we' && directConcat !== 'ew') {
            minDist.x = Math.min(Math.max(Math.abs(startPos.x - endPos.x) / 2, 10), 40);
            minDist.y = Math.min(Math.max(Math.abs(startPos.y - endPos.y) / 2, 10), 40);
        }
        // 第一个点从开始点的位置 延方向出发到最小距离处
        const firstPos = {
            x: startPos.x + (startPos.direct === 'w' ? -minDist.x : startPos.direct === 'e' ? minDist.x : 0),
            y: startPos.y + (startPos.direct === 'n' ? -minDist.y : startPos.direct === 's' ? minDist.y : 0),
        };
        this.path.push(firstPos);
        // 倒数第一个点从结束点的位置 延方向反向出发到最小距离处
        const lastPos = {
            x: endPos.x + (endPos.direct === 'w' ? minDist.x : endPos.direct === 'e' ? -minDist.x : 0),
            y: endPos.y + (endPos.direct === 'n' ? minDist.y : endPos.direct === 's' ? -minDist.y : 0),
        };
        // 连接第一个点到最后一个点
        switch (directConcat) {
            case 'nn': case 'ss': case 'ww': case 'ee':
                // 如果开始点和结束点方向相同
                this.makeLineOfSameDirection(firstPos, lastPos, directConcat, minDist);
                break;
            case 'nw': case 'wn': case 'ne': case 'en':
            case 'sw': case 'ws': case 'se': case 'es':
                // 如果开始方向和结束方向呈90度夹角
                this.makeLineOfVerticalDirection(firstPos, lastPos, directConcat, minDist);
                break;
            case 'sn': case 'ns': case 'we': case 'ew':
                // 如果开始方向和结束方向相反
                this.makeLineOfOppositeDirection(firstPos, lastPos, directConcat, minDist);
                break;
            default:
                // 开始方向和结束方向有至少一个不存在 则直接使用中间点连接
                this.path.push({
                    x: (firstPos.x + lastPos.x) / 2,
                    y: (firstPos.y + lastPos.y) / 2,
                });
                break;
        }
        this.path.push(lastPos);
        // 记录结束点
        this.path.push(endPos);
    }

    /**
     * 在同方向的端点之间创建连线
     */
    private makeLineOfSameDirection(startPos: { x: number, y: number }, endPos: { x: number, y: number }, cmdDirection: string, minDist: { x: number, y: number }): void {
        // 如果二者之间有足够的夹缝(距离大于0) 则直接连接
        // 如果二者之间没有足够的夹缝 则将中间点作为连接点 并额外创建两个过渡点
        const midPos = {
            x: (startPos.x + endPos.x) / 2,
            y: (startPos.y + endPos.y) / 2,
        };
        if (cmdDirection[0] === 'n' || cmdDirection[0] === 's') {
            const gap = cmdDirection[0] === 'n' ? (startPos.y - endPos.y) : (endPos.y - startPos.y);
            // 如果两个点之间的距离大于0 则直接连接
            if (gap > 0) {
                // 这两个点一定会被加入到path中 直接修改开始和结束点的y坐标即可
                startPos.y = midPos.y;
                endPos.y = midPos.y;
            } else {
                this.path.push({ x: midPos.x, y: startPos.y });
                this.path.push(midPos);
                this.path.push({ x: midPos.x, y: endPos.y });
            }
        } else if (cmdDirection[0] === 'w' || cmdDirection[0] === 'e') {
            const gap = cmdDirection[0] === 'w' ? (startPos.x - endPos.x) : (endPos.x - startPos.x);
            if (gap > 0) {
                startPos.x = midPos.x;
                endPos.x = midPos.x;
            } else {
                this.path.push({ x: startPos.x, y: midPos.y });
                this.path.push(midPos);
                this.path.push({ x: endPos.x, y: midPos.y });
            }
        }
    }

    /**
     * 在垂直方向的端点之间创建连线
     */
    private makeLineOfVerticalDirection(startPos: { x: number, y: number }, endPos: { x: number, y: number }, cmdDirection: string, minDist: { x: number, y: number }): void {
        // 规范化方向字符串 保证第一个字符是垂直方向 第二个字符是水平方向
        if (cmdDirection[0] === 'w' || cmdDirection[0] === 'e') {
            cmdDirection = cmdDirection.split('').reverse().join('');
        }
        // 判断两个点的实际方向
        const realDirection = [
            startPos.y > endPos.y ? 'n' : 's',
            startPos.x > endPos.x ? 'w' : 'e',
        ].join('');
        // 若方向与实际方向相同 则以延长线连接 借用相反方向端点之间连线的方法
        if (cmdDirection === realDirection) {
            this.makeLineOfOppositeDirection(startPos, endPos, cmdDirection, minDist);
            return;
        }
        // 若方向与实际方向不同 则根据方向与实际方向是垂直还是相反来决定连接方式
        const realDirectionOpposite = [
            startPos.y > endPos.y ? 's' : 'n',
            startPos.x > endPos.x ? 'e' : 'w',
        ].join('');
        if (cmdDirection === realDirectionOpposite) {
            // 方向与实际方向相反时 将两个端点互换 并借用相反方向端点连线的方法完成连线
            this.makeLineOfOppositeDirection(endPos, startPos, cmdDirection, minDist);
            return;
        } else {
            // 方向与实际方向垂直时 对两个端点中方向错误的做一个虚拟的辅助点
            const assistPos = { x: 0, y: 0 };
            if (cmdDirection[0] !== realDirection[0]) {
                // 开始点方向错误 则沿结束点的方向 从开始点的位置出发 给开始点加一个辅助点
                const comp = useKanbanStore().components.find((item) => item.id === this.compId) as any;
                const assistDirect = cmdDirection[1];
                assistPos.x = assistDirect === 'w' ? (comp.pos.x - minDist.x) : assistDirect === 'e' ? (comp.pos.x + comp.rect.width + minDist.x) : startPos.x;
                assistPos.y = assistDirect === 'n' ? (comp.pos.y - minDist.y) : assistDirect === 's' ? (comp.pos.y + comp.rect.height + minDist.y) : startPos.y;
                // 开始点连接到辅助点
                this.path.push(assistPos);
                // 连接辅助点和结束点 两个点是同方向 所以借用同方向端点连线的方法进行连接 在此过程中修正辅助点的位置
                this.makeLineOfSameDirection(assistPos, endPos, cmdDirection, minDist);
            } else {
                // 结束点方向错误 则沿开始点的方向 从组件位置出发 给结束点加一个辅助点
                const comp = useKanbanStore().components.find((item) => item.id === this.targetCompId) as any;
                const assistDirect = cmdDirection[0];
                assistPos.x = assistDirect === 'e' ? (comp.pos.x - minDist.x) : assistDirect === 'w' ? (comp.pos.x + comp.rect.width + minDist.x) : endPos.x;
                assistPos.y = assistDirect === 's' ? (comp.pos.y - minDist.y) : assistDirect === 'n' ? (comp.pos.y + comp.rect.height + minDist.y) : endPos.y;
                // 连接开始点和辅助点 两个点是同方向 所以借用同方向端点连线的方法进行连接 在此过程中修正辅助点的位置
                this.makeLineOfSameDirection(startPos, assistPos, cmdDirection, minDist);
                this.path.push(assistPos);
            }

        }
    }

    /**
    * 在相反方向的端点之间创建连线
    */
    private makeLineOfOppositeDirection(startPos: { x: number, y: number }, endPos: { x: number, y: number }, cmdDirection: string, minDist: { x: number, y: number }): void {
        // 当两个点方向相反时 两条线的延长方向是一致的 所以需要将短的一条线延长到能与长的一条线相交的位置
        const midPos = { x: 0, y: 0 };
        switch (cmdDirection[0]) {
            case 'n':
                if (startPos.y > endPos.y) {
                    midPos.x = startPos.x;
                    midPos.y = endPos.y;
                } else {
                    midPos.x = endPos.x;
                    midPos.y = startPos.y;
                }
                break;
            case 's':
                if (startPos.y < endPos.y) {
                    midPos.x = startPos.x;
                    midPos.y = endPos.y;
                } else {
                    midPos.x = endPos.x;
                    midPos.y = startPos.y;
                }
                break;
            case 'w':
                if (startPos.x > endPos.x) {
                    midPos.x = endPos.x;
                    midPos.y = startPos.y;
                } else {
                    midPos.x = startPos.x;
                    midPos.y = endPos.y;
                }
                break;
            case 'e':
                if (startPos.x < endPos.x) {
                    midPos.x = endPos.x;
                    midPos.y = startPos.y;
                } else {
                    midPos.x = startPos.x;
                    midPos.y = endPos.y;
                }
                break;
        }
        this.path.push(midPos);
    }

}
