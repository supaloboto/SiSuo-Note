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

    constructor() {
        this._id = getLongID();
    }

    get id(): string {
        return this._id;
    }

    /**
     * 计算需要渲染的图形
     */
    abstract getShape(): BoardShape;
}

/**
 * 画板图形类
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */
export class BoardShape {
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

    /**
     * 定义路径起始点
     * @param pos 位置
     */
    from(pos: { x: number, y: number }): BoardShape {
        const clientPos = this.transPosToClientPos(pos);
        // 创建一个新的path对象
        this._paths.push({
            path: `M ${clientPos.x} ${clientPos.y}`,
            attrs: {},
        });
        return this;
    }

    /**
     * 从上个点画直线到指定位置
     * @param pos 位置
     */
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
