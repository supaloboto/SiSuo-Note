import { useKanbanStore } from "@/stores/kanban";
import { getLongID } from "@/assets/utils/idworker";
import { LinkLineRenderCmd } from "./LinkLineRenderCmd";
import type { Component } from "@/components/Component";
import { useCanvasStore } from "@/stores/canvas";

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
    // 路径点集合 包含起止点 但没有方向
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

    get sourceComp(): Component<any> {
        return useKanbanStore().components.find((item) => item.id === this.compId) as Component<any>;
    }

    get targetComp(): Component<any> {
        return useKanbanStore().components.find((item) => item.id === this.targetCompId) as Component<any>;
    }

    erase() {
        this.renderCommand.erase();
    }

    delete() {
        // 擦除图形
        this.erase();
        // 从选中中移除
        const selected = useCanvasStore().currentPointer.selected;
        const selectIndex = selected.findIndex((item) => item.id === this.id);
        if (selectIndex !== -1) {
            selected.splice(selectIndex, 1);
        }
        // 从组件中移除
        this.sourceComp?.deleteLink(this.id);
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
     * 获取连线的位置 与组件的位置逻辑保持一致 是将连线视为矩形并返回左上角坐标
     */
    get pos(): { x: number, y: number } {
        return {
            x: Math.min(...this.path.map((item) => item.x)),
            y: Math.min(...this.path.map((item) => item.y)),
        }
    }

    /**
     * 获取连线的宽高 与组件的大小逻辑保持一致 是将连线视为矩形并返回宽高
     */
    get rect(): { width: number, height: number } {
        const xArray = this.path.map((item) => item.x);
        const yArray = this.path.map((item) => item.y);
        return {
            width: Math.max(...xArray) - Math.min(...xArray),
            height: Math.max(...yArray) - Math.min(...yArray),
        }
    }

    /**
     * 更新连线的开始点
     * @param startPos 开始位置和方向
     */
    changeStartPos(startPos: { x: number, y: number, direct?: string }) {
        // 检查开始点是否在组件上
        const compList = useKanbanStore().components;
        const comp = compList.find((item) => {
            return item.pos.x < startPos.x && item.pos.x + item.rect.width > startPos.x
                && item.pos.y < startPos.y && item.pos.y + item.rect.height > startPos.y;
        });
        // 计算开始点位置
        if (comp) {
            startPos = this.getCompLinkPoint(startPos, comp as Component<any>, false);
            // TODO 如果脱离了原组件则需要把连线数据转移到新组件上
        }
        // 更新开始点
        this.startPos = startPos;
        // 更新连线
        this.refresh();
    }

    /**
     * 更新连线的结束点
     * @param endPos 结束位置和方向
     */
    changeEndPos(endPos: { x: number, y: number, direct?: string }) {
        // 检查结束点是否在组件上
        const compList = useKanbanStore().components;
        const comp = compList.find((item) => {
            // 排除连线发起者
            return item.id !== this.compId
                && item.pos.x < endPos.x && item.pos.x + item.rect.width > endPos.x
                && item.pos.y < endPos.y && item.pos.y + item.rect.height > endPos.y;
        });
        // 计算结束点位置
        if (comp) {
            endPos = this.getCompLinkPoint(endPos, comp as Component<any>, true);
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
     * 获取组件边线上最靠近指定位置的点的位置和连线方向
     * @param targetPos 指定位置
     * @param comp 组件信息
     * @param asLinkEnd 结果是否作为连线的终点 如果是则返回的方向应该是反方向
     */
    private getCompLinkPoint(targetPos: { x: number, y: number }, comp: Component<any>, asLinkEnd: boolean = false): { x: number, y: number, direct: string } {
        // 当目标位置在组件内部 且非常靠近组件边线时 则返回组件边线上的点 当结果作为连线的终点时将方向倒转 并为减少组件边框造成的影响对数值进行微调
        const offsetTop = targetPos.y - comp.pos.y;
        const offsetBottom = comp.pos.y + comp.rect.height - targetPos.y;
        const offsetLeft = targetPos.x - comp.pos.x;
        const offsetRight = comp.pos.x + comp.rect.width - targetPos.x;
        const threshold = 25;
        if (offsetTop >= 0 && offsetTop <= threshold && offsetTop <= offsetLeft && offsetTop <= offsetRight) {
            // 靠近上边线
            return { x: targetPos.x, y: comp.pos.y, direct: asLinkEnd ? 's' : 'n' };
        } else if (offsetBottom >= 0 && offsetBottom <= threshold && offsetBottom <= offsetLeft && offsetBottom <= offsetRight) {
            // 靠近下边线
            return { x: targetPos.x, y: comp.pos.y + comp.rect.height + 1, direct: asLinkEnd ? 'n' : 's' };
        } else if (offsetLeft >= 0 && offsetLeft <= threshold && offsetLeft <= offsetTop && offsetLeft <= offsetBottom) {
            // 靠近左边线
            return { x: comp.pos.x, y: targetPos.y, direct: asLinkEnd ? 'e' : 'w' };
        } else if (offsetRight >= 0 && offsetRight <= threshold && offsetRight <= offsetTop && offsetRight <= offsetBottom) {
            // 靠近右边线
            return { x: comp.pos.x + comp.rect.width - 1, y: targetPos.y, direct: asLinkEnd ? 'w' : 'e' };
        }
        // 当目标位置在组件内部 且不靠近任何组件边线时 选择附近的handler点 当结果作为连线的终点时将handler方向倒转 并为减少组件边框造成的影响对数值进行微调
        const compPos = comp.pos;
        const handlerPosList = [
            // 顶部中点
            { x: compPos.x + comp.rect.width / 2, y: compPos.y + 1, direct: asLinkEnd ? 's' : 'n' },
            // 底部中点
            { x: compPos.x + comp.rect.width / 2, y: compPos.y + comp.rect.height + 1, direct: asLinkEnd ? 'n' : 's' },
            // 左侧中点
            { x: compPos.x + 1, y: compPos.y + comp.rect.height / 2, direct: asLinkEnd ? 'e' : 'w' },
            // 右侧中点
            { x: compPos.x + comp.rect.width - 1, y: compPos.y + comp.rect.height / 2, direct: asLinkEnd ? 'w' : 'e' },
        ];
        // 计算两点之间距离的方法
        const getDistance = (pos1: { x: number, y: number }, pos2: { x: number, y: number }) => {
            if (pos1.x === pos2.x) {
                return Math.abs(pos1.y - pos2.y);
            } else if (pos1.y === pos2.y) {
                return Math.abs(pos1.x - pos2.x);
            } else {
                return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
            }
        }
        // 检查目标位置与各个handler位置的关系
        let nearestHandler = handlerPosList[0];
        for (let i = 1; i < handlerPosList.length; i++) {
            const handler = handlerPosList[i];
            if (getDistance(targetPos, handler) < getDistance(targetPos, nearestHandler)) {
                nearestHandler = handler;
            }
        }
        return nearestHandler;
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
        // 触发重绘
        if (this.renderCommand.update) {
            this.renderCommand.update();
        }
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
        const opposite: { [key: string]: string } = {
            'n': 's',
            's': 'n',
            'w': 'e',
            'e': 'w',
        }
        // 判断两个点的实际方向 实际方向是指两个点之间的连线的方向
        const realDirectionSet = ['', ''];
        if (cmdDirection[0] === 'n' || cmdDirection[0] === 's') {
            realDirectionSet[0] = startPos.y > endPos.y ? 'n' : 's';
            realDirectionSet[1] = startPos.x > endPos.x ? 'w' : 'e';
        } else {
            realDirectionSet[0] = startPos.x > endPos.x ? 'w' : 'e';
            realDirectionSet[1] = startPos.y > endPos.y ? 'n' : 's';
        }
        // 实际方向的两位中不能有一位与指令方向的对应位正好相反 比如指令方向是nw 实际方向不能是ne而应该是en
        if (realDirectionSet[0] === opposite[cmdDirection[0]] || realDirectionSet[1] === opposite[cmdDirection[1]]) {
            const temp = realDirectionSet[0];
            realDirectionSet[0] = realDirectionSet[1];
            realDirectionSet[1] = temp;
        }
        const realDirection = realDirectionSet.join('');
        // 若方向与实际方向相同 则以延长线连接 借用相反方向端点之间连线的方法
        if (cmdDirection === realDirection) {
            this.makeLineOfOppositeDirection(startPos, endPos, cmdDirection, minDist);
            return;
        }
        // 构建实际方向的反方向用于判断
        const realDirOppositeSet = [opposite[realDirection[1]], opposite[realDirection[0]]];
        const realDirectionOpposite = realDirOppositeSet.join('');
        // 若方向与实际方向不同 则根据方向与实际方向是垂直还是相反来决定连接方式
        if (cmdDirection === realDirectionOpposite) {
            // 方向与实际方向相反时 将两个端点互换 并借用相反方向端点连线的方法完成连线
            this.makeLineOfOppositeDirection(endPos, startPos, cmdDirection, minDist);
            return;
        } else {
            // 方向与实际方向垂直时 对两个端点中方向错误的做一个虚拟的辅助点
            const assistPos = { x: 0, y: 0 };
            if (cmdDirection[0] === realDirectionOpposite[0] || cmdDirection[0] === realDirectionOpposite[1]) {
                // 开始点方向错误 则沿结束点的方向 从开始点的位置出发 给开始点加一个辅助点
                const comp = this.sourceComp;
                const assistDirect = cmdDirection[1];
                switch (assistDirect) {
                    case 'n':
                        assistPos.x = startPos.x;;
                        assistPos.y = endPos.y < (comp.pos.y - minDist.y) ? (comp.pos.y - minDist.y) : endPos.y;
                        break;
                    case 's':
                        assistPos.x = startPos.x;
                        assistPos.y = endPos.y > (comp.pos.y + comp.rect.height + minDist.y) ? (comp.pos.y + comp.rect.height + minDist.y) : endPos.y;
                        break;
                    case 'w':
                        assistPos.x = endPos.x < (comp.pos.x - minDist.x) ? (comp.pos.x - minDist.x) : endPos.x;
                        assistPos.y = startPos.y;
                        break;
                    case 'e':
                        assistPos.x = endPos.x > (comp.pos.x + comp.rect.width + minDist.x) ? (comp.pos.x + comp.rect.width + minDist.x) : endPos.x;
                        assistPos.y = startPos.y;
                        break;
                }
                // 开始点连接到辅助点
                this.path.push(assistPos);
                // 连接辅助点和结束点 两个点是同方向 所以借用同方向端点连线的方法进行连接 在此过程中修正辅助点的位置
                this.makeLineOfSameDirection(assistPos, endPos, cmdDirection, minDist);
            } else {
                // 结束点方向错误 则沿开始点的方向 从组件位置出发 给结束点加一个辅助点
                const comp = this.targetComp;
                const assistDirect = cmdDirection[0];
                switch (assistDirect) {
                    case 'n':
                        assistPos.x = endPos.x;
                        assistPos.y = startPos.y > (comp.pos.y + comp.rect.height + minDist.y) ? (comp.pos.y + comp.rect.height + minDist.y) : startPos.y;
                        break;
                    case 's':
                        assistPos.x = endPos.x;
                        assistPos.y = startPos.y < (comp.pos.y - minDist.y) ? (comp.pos.y - minDist.y) : startPos.y;
                        break;
                    case 'w':
                        assistPos.x = startPos.x > (comp.pos.x + comp.rect.width + minDist.x) ? (comp.pos.x + comp.rect.width + minDist.x) : startPos.x;
                        assistPos.y = endPos.y;
                        break;
                    case 'e':
                        assistPos.x = startPos.x < (comp.pos.x - minDist.x) ? (comp.pos.x - minDist.x) : startPos.x;
                        assistPos.y = endPos.y;
                        break;
                }
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
