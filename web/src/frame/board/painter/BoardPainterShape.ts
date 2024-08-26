import { useCanvasStore } from "@/stores/canvas";

/**
 * 画板手绘图形渲染指令接口
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */
export interface BoardPainterCommand {
    render(shape: BoardPainterShape): void;
}

/**
 * 画板图形类
 * 
 * @author 刘志栋
 * @since 2024/08/26
 */
export class BoardPainterShape {
    // canvas对象
    private ctx: CanvasRenderingContext2D;
    // 记录上个路径点 用于绘图指令拼接
    private lastPos: { x: number, y: number } = null as any;
    // 绘图指令集合
    private canvasCommands: Function[] = [];

    constructor(ctx: CanvasRenderingContext2D) {
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

    from(pos: { x: number, y: number }): BoardPainterShape {
        const clientPos = this.transPosToClientPos(pos);
        this.canvasCommands.push(() => {
            this.ctx?.beginPath();
            this.ctx?.moveTo(clientPos.x, clientPos.y);
        });
        this.lastPos = clientPos;
        return this;
    }

    lineTo(pos: { x: number, y: number }): BoardPainterShape {
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
