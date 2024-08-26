import { BoardShapeCommand, BoardShape } from "@/frame/board/shape/BoardShape";

export class LinkLine {
    // 路径点
    path: { x: number, y: number }[];

    constructor(path: { x: number, y: number }[]) {
        this.path = path;
    }

}

export class LinkLineRenderCmd extends BoardShapeCommand {
    private linkLine: LinkLine;

    constructor(linkLine: LinkLine) {
        super();
        this.linkLine = linkLine;
    }

    getShape(): BoardShape {
        // 如果路径点小于2个则不绘制
        if (this.linkLine.path.length < 2) {
            return null as any;
        }
        const shape = new BoardShape();
        // 从第一个点开始绘制
        shape.from(this.linkLine.path[0]);
        // 所有路径点
        for (let i = 1; i < this.linkLine.path.length; i++) {
            shape.lineTo(this.linkLine.path[i]);
        }
        // todo 绘制箭头
        // 返回
        return shape;
    }
}