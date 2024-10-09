import { getShortID } from "@/assets/utils/idworker";
import { useCanvasStore } from "@/stores/canvas";

/**
 * 画板图形信息相关类
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */

/**
 * 线条配置类
 */
export class LineStyle {
    // 线宽
    _lineWidth: number = 8;
    // 线样式 实线或虚线配置
    lineDash: string = 'solid';
    // 线头样式
    lineCap: string = 'butt';
    // 线连接样式
    lineJoin: string = 'miter';
    // 线颜色 默认设置为--line-stroke以应用SvgLine组件样式中指定的线段颜色
    stroke: string = 'var(--line-stroke)';
    // 内部填充 默认不填充
    fill: string = 'none';

    set lineWidth(value: number) {
        this._lineWidth = value;
    }

    get lineWidth(): number {
        // 获取缩放比例
        const canvasStore = useCanvasStore();
        const scale = canvasStore.scale;
        // 返回缩放后的线宽
        return this._lineWidth * scale / 100;
    }
}

/**
 * 画板图形接口
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */
export abstract class BoardShape {
    constructor() {
    }

    /**
    * 定义路径起始点
    * @param pos 位置
    */
    abstract from(pos: { x: number, y: number }, lineStyle?: LineStyle): BoardShape

    /**
     * 从上个点画直线到指定位置
     * @param pos 位置
     */
    abstract lineTo(pos: { x: number, y: number }): BoardShape

    /**
     * 使路径闭合
     */
    abstract closePath(): BoardShape

    /**
     * 在当前位置画圆
     * @param radius 半径
     */
    abstract circle(radius: number): BoardShape

}

export class BoardShapeSvgPath {
    // ID
    id: string = '';
    // 路径
    points: { command: string, pos: { x: number, y: number, r?: number } }[] = [];
    pathStr: string = '';
    // 属性
    attrs: { [key: string]: string | number } = {};
    // 拖动事件
    dragStart: Function | null = null;
    dragTo: Function | null = null;
    dragEnd: Function | null = null;

    constructor() {
        this.id = getShortID();
    }
}

/**
 * 画板图形-使用SVG绘制
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */
export class BoardShapeSvg extends BoardShape {
    // 宽高
    private _width: number = 0;
    private _height: number = 0;
    // svg路径集合
    private _paths: BoardShapeSvgPath[] = [];
    // 图像左上角坐标
    private topLeft: { x: number, y: number } = { x: null as any, y: null as any };
    // 图像右下角坐标
    private bottomRight: { x: number, y: number } = { x: null as any, y: null as any };
    // 最大线宽
    private maxLineWidth: number = 0;
    // 颜色
    private _stroke: string = 'var(--comp-link-stroke-color)';
    private _hoverStroke: string = 'var(--comp-link-hover-stroke-color)';

    constructor() {
        super();
    }

    get stroke(): string {
        return this._stroke;
    }

    get hoverStroke(): string {
        return this._hoverStroke;
    }

    get width(): number {
        // 如果宽过小则返回线段宽度作为最小宽度
        let result = this._width;
        if (!this._width || this._width < this.maxLineWidth) {
            result = this.maxLineWidth;
        }
        // 返回宽度加上线段宽度的两倍 使Svg元素左右两侧有充分空间 避免图形边界被截断
        return result + 2 * this.maxLineWidth;
    }

    get height(): number {
        // 如果高过小则返回线段宽度作为最小高度
        let result = this._height;
        if (!this._height || this._height < this.maxLineWidth) {
            result = this.maxLineWidth;
        }
        // 返回高度加上线段宽度的两倍 使Svg元素上下两侧有充分空间 避免图形边界被截断
        return result + 2 * this.maxLineWidth;
    }

    get paths(): BoardShapeSvgPath[] {
        // 整理路径
        this._paths.forEach(path => {
            path.pathStr = path.points.map(point => {
                if (point.command === 'Z') {
                    // 闭合指令
                    return point.command;
                } else if (point.command === 'M' || point.command === 'L') {
                    // 直线 绝对坐标指令
                    return `${point.command} ${point.pos.x - this.topLeft.x} ${point.pos.y - this.topLeft.y}`;
                } else if (point.command === 'a') {
                    // 圆弧相对坐标指令
                    const r = point.pos.r!;
                    return `a ${r},${r} 0 1,0 ${r * 2},0 ` + `a ${r},${r} 0 1,0 ${-r * 2},0 `;
                }
                // 相对坐标指令
                return `${point.command} ${point.pos.x} ${point.pos.y}`;
            }).join(' ');
        });
        return this._paths;
    }

    /**
     * 获取视图框
     */
    get viewBox(): string {
        // 视图框与图像宽高完全一致 使图形以1:1渲染
        return `${-this.maxLineWidth} ${-this.maxLineWidth} ${this.width} ${this.height}`;
    }

    /**
     * 获取图像渲染位置
     */
    get clientPos(): { x: number, y: number } {
        const canvasStore = useCanvasStore();
        const viewRect = canvasStore.currentViewRect;
        const scale = canvasStore.scale;
        // 因为svg的宽高加上了线段宽度 所以是稍微大于实际图形宽高的 因此需要按线宽做一定的偏移
        return {
            x: this.topLeft.x - viewRect.x * scale / 100 + viewRect.clientWidth / 2 - this.maxLineWidth,
            y: this.topLeft.y - viewRect.y * scale / 100 + viewRect.clientHeight / 2 - this.maxLineWidth,
        };
    }

    /**
     * 将画布位置转换为视图位置
     * @param pos 画布位置
     * @returns 视图位置
     */
    private transPosToClientPos(pos: { x: number, y: number }): { x: number, y: number } {
        // 获取画布信息
        const canvasStore = useCanvasStore();
        const scale = canvasStore.scale;
        // 计算点在视图上的位置
        const clientPos = {
            x: pos.x * scale / 100,
            y: pos.y * scale / 100,
        };
        // 更新图形的宽高
        if (this.topLeft.x === null || clientPos.x < this.topLeft.x) {
            this.topLeft.x = clientPos.x;
        }
        if (this.topLeft.y === null || clientPos.y < this.topLeft.y) {
            this.topLeft.y = clientPos.y;
        }
        if (this.bottomRight.x === null || clientPos.x > this.bottomRight.x) {
            this.bottomRight.x = clientPos.x;
        }
        if (this.bottomRight.y === null || clientPos.y > this.bottomRight.y) {
            this.bottomRight.y = clientPos.y;
        }
        this._width = this.bottomRight.x - this.topLeft.x;
        this._height = this.bottomRight.y - this.topLeft.y;
        return clientPos;
    }

    from(pos: { x: number, y: number }, lineStyle: LineStyle = new LineStyle()): BoardShape {
        // 创建一个新的path对象
        const newPath = new BoardShapeSvgPath();
        newPath.points.push({
            command: 'M',
            pos: this.transPosToClientPos(pos),
        });
        // 设置线段属性
        newPath.attrs = {
            'stroke': lineStyle.stroke,
            'stroke-width': lineStyle.lineWidth,
            'fill': lineStyle.fill,
        };
        this._paths.push(newPath);
        // 更新最大线宽
        if (lineStyle.lineWidth > this.maxLineWidth) {
            this.maxLineWidth = lineStyle.lineWidth;
        }
        return this;
    }

    lineTo(pos: { x: number, y: number }): BoardShape {
        const currentPath = this._paths[this._paths.length - 1];
        if (!currentPath || !currentPath.points || currentPath.points.length === 0) {
            return this;
        }
        // 记录点
        currentPath.points.push({
            command: 'L',
            pos: this.transPosToClientPos(pos),
        });
        return this;
    }

    closePath(): BoardShape {
        // 闭合路径
        const currentPath = this._paths[this._paths.length - 1];
        if (!currentPath || !currentPath.points || currentPath.points.length === 0) {
            return this;
        }
        // 记录点
        currentPath.points.push({
            command: 'Z',
            pos: currentPath.points[0].pos,
        });
        return this;
    }

    circle(radius: number): BoardShape {
        const currentPath = this._paths[this._paths.length - 1];
        if (!currentPath || !currentPath.points || currentPath.points.length === 0) {
            return this;
        }
        // 移动到圆开始位置
        currentPath.points.push({
            command: 'm',
            pos: {
                x: -radius,
                y: 0,
            },
        });
        currentPath.points.push({
            command: 'a',
            pos: {
                x: 0,
                y: 0,
                r: radius,
            },
        });
        return this;
    }

    /**
     * 设置拖动事件
     */
    setDragStartEvt(dragStart: Function): BoardShapeSvg {
        const currentPath = this._paths[this._paths.length - 1];
        if (!currentPath || !currentPath.points || currentPath.points.length === 0) {
            return this;
        }
        currentPath.dragStart = dragStart;
        return this;
    }

    setDragEvt(dragTo: Function): BoardShapeSvg {
        const currentPath = this._paths[this._paths.length - 1];
        if (!currentPath || !currentPath.points || currentPath.points.length === 0) {
            return this;
        }
        currentPath.dragTo = dragTo;
        return this;
    }

    setDragEndEvt(dragEnd: Function): BoardShapeSvg {
        const currentPath = this._paths[this._paths.length - 1];
        if (!currentPath || !currentPath.points || currentPath.points.length === 0) {
            return this;
        }
        currentPath.dragEnd = dragEnd;
        return this;
    }

}

/**
 * 画板图形-使用Canvas绘制
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */
export class BoardShapeCanvas extends BoardShape {
    // canvas对象
    private ctx: CanvasRenderingContext2D | null = null;
    // 记录上个路径点 用于绘图指令拼接
    private lastPos: { x: number, y: number } = null as any;
    // 绘图指令集合
    private canvasCommandSet: Function[][] = [];

    constructor() {
        super();
    }

    attachToCtx(ctx: CanvasRenderingContext2D): void {
        this.ctx = ctx;
    }

    /**
     * 将画布位置转换为视图位置
     * @param pos 画布位置
     * @returns 视图位置
     */
    private transPosToClientPos(pos: { x: number, y: number }): { x: number, y: number } {
        // 获取画布信息
        const canvasStore = useCanvasStore();
        const viewRect = canvasStore.currentViewRect;
        const scale = canvasStore.scale;
        // 计算点在视图上的位置
        return {
            x: (pos.x - viewRect.x) * scale / 100 + viewRect.clientWidth / 2,
            y: (pos.y - viewRect.y) * scale / 100 + viewRect.clientHeight / 2,
        };
    }

    from(pos: { x: number, y: number }, lineStyle: LineStyle = new LineStyle(),): BoardShapeCanvas {
        const clientPos = this.transPosToClientPos(pos);
        const newCommands = [];
        newCommands.push(() => {
            if (!this.ctx) {
                return;
            }
            this.ctx.beginPath();
            this.ctx.moveTo(clientPos.x, clientPos.y);
            // 设置线段宽度
            this.ctx.lineWidth = lineStyle.lineWidth;
            // todo 设置线段颜色
        });
        this.canvasCommandSet.push(newCommands);
        this.lastPos = clientPos;
        return this;
    }

    lineTo(pos: { x: number, y: number }): BoardShapeCanvas {
        if (!this.lastPos) {
            return this.from(pos);
        }
        const clientPos = this.transPosToClientPos(pos);
        // 记录画线指令
        const currentCommand = this.canvasCommandSet[this.canvasCommandSet.length - 1];
        currentCommand.push(() => {
            if (!this.ctx) {
                return;
            }
            this.ctx.lineWidth = 8;
            this.ctx.lineTo(clientPos.x, clientPos.y);
        });
        this.lastPos = clientPos;
        return this;
    }

    closePath(): BoardShape {
        // 闭合路径
        const currentCommand = this.canvasCommandSet[this.canvasCommandSet.length - 1];
        currentCommand.push(() => {
            if (!this.ctx) {
                return;
            }
            this.ctx.closePath();
        });
        return this;
    }

    circle(radius: number): BoardShape {
        //TODO 画圆
        return this;
    }

    print(): void {
        // 运行画线指令
        this.canvasCommandSet.forEach(commandSet => {
            commandSet.forEach(command => command());
            this.ctx?.stroke();
        });
    }

}
