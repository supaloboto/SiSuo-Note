import { getLongID } from "@/assets/utils/idworker";
import { useCanvasStore } from "@/stores/canvas";
import type { BoardShape } from "./BoardShape";

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
    // 图形对象
    private _shape: BoardShape | undefined = undefined;

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

    get shape(): BoardShape | undefined {
        return this._shape;
    }

    set shape(shape: BoardShape | undefined) {
        this._shape = shape;
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
     * 图形渲染逻辑 由子类实现 返回图形对象交给画布做必要的处理和绑定
     */
    abstract render(): BoardShape;

    /**
     * 图形更新逻辑 由画布实现 当图形需要进行重绘时调用 由画布负责擦除和重绘
     * svg和canvas的更新逻辑不同 SVG画布可以分别处理每个图形的更新 但canvas画布需要整体重绘
     */
    update: Function | null = null;

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

    /**
     * 点击事件
     */
    click(): void {
        console.log("click", this.id)
    }

    /**
     * 双击事件
     */
    dblclick(): void {
        console.log("dblclick", this.id)
    }

}
