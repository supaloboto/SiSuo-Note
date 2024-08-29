import { BoardShapeCommand, BoardShape } from "@/frame/board/shape/BoardShape";
import { useKanbanStore } from "@/stores/kanban";

/**
 * 组件关联连线类
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */
export class LinkLine {
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

    constructor(compId: string, targetCompId: string, startPos: { x: number, y: number, direct?: string }, endPos: { x: number, y: number, direct?: string }) {
        this.compId = compId;
        this.targetCompId = targetCompId;
        this.startPos = startPos;
        this.endPos = endPos;
        this.renderCommand = new LinkLineRenderCmd(this);
        // 执行一次渲染
        this.refresh();
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
            endPos.direct = endPos.x > startPos.x ? 'e' : endPos.x < startPos.x ? 'w' : endPos.y > startPos.y ? 's' : 'n';
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
        // 计算可使用的最小距离
        const minDist = { x: 40, y: 40 };
        // 如果开始点和结束点方向相同 则检查二者之间是否有足够的夹缝
        if (startPos.direct === endPos.direct) {
            if (startPos.direct === 'n' || startPos.direct === 's') {
                const minY = Math.abs(startPos.y - endPos.y) / 2;
                minDist.y = Math.min(minDist.y, minY);
            } else if (startPos.direct === 'w' || startPos.direct === 'e') {
                const minX = Math.abs(startPos.x - endPos.x) / 2;
                minDist.x = Math.min(minDist.x, minX);
            }
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
        const midPos = {
            x: (firstPos.x + lastPos.x) / 2,
            y: (firstPos.y + lastPos.y) / 2,
        };
        this.path.push(midPos);
        this.path.push(lastPos);
        // 记录结束点
        this.path.push(endPos);
    }

}

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

}