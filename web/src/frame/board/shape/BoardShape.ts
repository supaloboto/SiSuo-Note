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
     * @returns 图形对象 供画布渲染组件使用
     */
    doRender(): BoardShape {
        const shape = this.type === 'svg' ? new BoardShapeSvg() : new BoardShapeCanvas();
        this.render(shape);
        return shape;
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
    abstract from(pos: { x: number, y: number }): BoardShape

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
        path: string,
        type?: string,
        attrs: { [key: string]: string | number },
    }[] = [];
    // 图像左上角坐标
    private topLeft: { x: number, y: number } = { x: null as any, y: null as any };
    // 图像右下角坐标
    private bottomRight: { x: number, y: number } = { x: null as any, y: null as any };

    constructor() {
        super();
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    get paths(): {
        path: string,
        attrs: { [key: string]: string | number },
    }[] {
        return this._paths;
    }

    /**
     * 获取视图框
     */
    get viewBox(): string {
        return `${this.topLeft.x} ${this.topLeft.y} ${this._width} ${this._height}`;
    }

    /**
     * 获取图像渲染位置
     */
    get clientPos(): { x: number, y: number } {
        const canvasStore = useCanvasStore();
        const viewRect = canvasStore.currentViewRect;
        const scale = canvasStore.scale;
        return {
            x: this.topLeft.x - viewRect.x * scale / 100 + viewRect.clientWidth / 2,
            y: this.topLeft.y - viewRect.y * scale / 100 + viewRect.clientHeight / 2,
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
        const viewRect = canvasStore.currentViewRect;
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

    from(pos: { x: number, y: number }): BoardShape {
        const clientPos = this.transPosToClientPos(pos);
        // 创建一个新的path对象
        this._paths.push({
            path: `M ${clientPos.x} ${clientPos.y}`,
            attrs: {},
        });
        return this;
    }

    lineTo(pos: { x: number, y: number }): BoardShape {
        const currentPath = this._paths[this._paths.length - 1];
        if (!currentPath) {
            return this.from(pos);
        }
        const clientPos = this.transPosToClientPos(pos);
        // 记录画线指令
        currentPath.path += ` L ${clientPos.x} ${clientPos.y}`;
        // 将属性设置为线段
        // todo 如果此时检查到类型有冲突则新建path
        currentPath.type = 'line';
        // todo 线段宽度和颜色
        currentPath.attrs = {
            ...currentPath.attrs,
            'stroke': 'var(--line-stroke)',
            'stroke-width': 8,
            'fill': 'none',
        };
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

    from(pos: { x: number, y: number }): BoardShapeCanvas {
        const clientPos = this.transPosToClientPos(pos);
        this.canvasCommands.push(() => {
            this.ctx?.beginPath();
            this.ctx?.moveTo(clientPos.x, clientPos.y);
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
            this.ctx?.lineTo(clientPos.x, clientPos.y);
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
