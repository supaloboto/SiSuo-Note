import { deepCopy } from "@/assets/utils/copy";
import { getLongID } from "@/assets/utils/idworker";
import { useCanvasStore } from "@/stores/canvas";

/**
 * 画板图形渲染指令接口
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */
export abstract class BoardShapeCommand {
    // ID
    private _id: string = '';
    // svg/canvas
    private _type: string = '';

    constructor() {
        this._id = getLongID();
        // 添加进store
        useCanvasStore().boardShapeCmds.push(this);
    }

    get id(): string {
        return this._id;
    }

    get type(): string {
        // 默认使用svg
        if (!this._type) {
            this.useSvg();
        }
        return this._type;
    }

    useSvg(): BoardShapeCommand {
        this._type = 'svg';
        return this;
    }

    useCanvas(): BoardShapeCommand {
        this._type = 'canvas';
        return this;
    }

    /**
     * 图形渲染逻辑 由子类实现
     * @param shape 图形对象
     */
    abstract render(shape: BoardShape): void;

    /**
     * 渲染图形
     */
    draw(): void {
        // 添加进store 使之生效
        const canvasStore = useCanvasStore();
        if (canvasStore.boardShapeCmds.includes(this)) {
            return;
        }
        canvasStore.boardShapeCmds.push(this);
    }

    /**
     * 擦除图形
     */
    erase(): void {
        // 从store中删除
        const canvasStore = useCanvasStore();
        const index = canvasStore.boardShapeCmds.findIndex(cmd => cmd.id === this.id);
        if (index >= 0) {
            canvasStore.boardShapeCmds.splice(index, 1);
        }
    }

}

/**
 * 线条配置类
 */
export class LineStyle {
    // 线宽
    _lineWidth: number = 8;
    // 线颜色
    lineColor: string = 'var(--line-stroke)';
    // 线样式 实线或虚线配置
    lineDash: string = 'solid';
    // 线头样式
    lineCap: string = 'butt';
    // 线连接样式
    lineJoin: string = 'miter';
    // 内部填充
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
    private _paths: {
        // 路径
        points: { command: string, pos: { x: number, y: number } }[],
        type?: string,
        attrs: { [key: string]: string | number },
    }[] = [];
    // 图像左上角坐标
    private topLeft: { x: number, y: number } = { x: null as any, y: null as any };
    // 图像右下角坐标
    private bottomRight: { x: number, y: number } = { x: null as any, y: null as any };
    // 最大线宽
    private maxLineWidth: number = 0;

    constructor() {
        super();
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

    get paths(): {
        path: string,
        attrs: { [key: string]: string | number },
    }[] {
        // 整理路径
        return this._paths.map(path => {
            const pathStr = path.points.map(point => `${point.command} ${point.pos.x - this.topLeft.x} ${point.pos.y - this.topLeft.y}`).join(' ');
            return { path: pathStr, attrs: path.attrs };
        });
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
        this._paths.push({
            points: [{
                command: 'M',
                pos: this.transPosToClientPos(pos),
            }],
            // 设置线段属性
            attrs: {
                'stroke': lineStyle.lineColor,
                'stroke-width': lineStyle.lineWidth,
                'fill': lineStyle.fill,
            },
        });
        // 更新最大线宽
        if (lineStyle.lineWidth > this.maxLineWidth) {
            this.maxLineWidth = lineStyle.lineWidth;
        }
        return this;
    }

    lineTo(pos: { x: number, y: number }): BoardShape {
        const currentPath = this._paths[this._paths.length - 1];
        if (!currentPath || !currentPath.points || currentPath.points.length === 0) {
            return this.from(pos);
        }
        // 将属性设置为线段
        // todo 如果此时检查到类型有冲突则新建path
        currentPath.type = 'line';
        // 记录点
        currentPath.points.push({
            command: 'L',
            pos: this.transPosToClientPos(pos),
        });
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
    private canvasCommands: Function[] = [];

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
        this.canvasCommands.push(() => {
            if (!this.ctx) {
                return;
            }
            this.ctx.beginPath();
            this.ctx.moveTo(clientPos.x, clientPos.y);
            // 设置线段宽度
            this.ctx.lineWidth = lineStyle.lineWidth;
            // todo 设置线段颜色
        });
        this.lastPos = clientPos;
        return this;
    }

    lineTo(pos: { x: number, y: number }): BoardShapeCanvas {
        if (!this.lastPos) {
            return this.from(pos);
        }
        const clientPos = this.transPosToClientPos(pos);
        // 记录画线指令
        this.canvasCommands.push(() => {
            if (!this.ctx) {
                return;
            }
            this.ctx.lineWidth = 8;
            this.ctx.lineTo(clientPos.x, clientPos.y);
        });
        this.lastPos = clientPos;
        return this;
    }

    print(): void {
        // 运行画线指令
        this.canvasCommands.forEach(command => command());
        this.ctx?.stroke();
    }
}
