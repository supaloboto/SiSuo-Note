import type { BoardCanvasCommand, BoardCanvasShape } from "@/frame/board/boardcanvas/BoardCanvasShape";

export class LinkLine {
    // 路径点
    path: { x: number, y: number }[];

    constructor(path: { x: number, y: number }[]) {
        this.path = path;
    }

}

export class LinkLinePrintCmd implements BoardCanvasCommand {
    private linkLine: LinkLine;

    constructor(linkLine: LinkLine) {
        this.linkLine = linkLine;
    }

    render(shape: BoardCanvasShape): void {
        if (this.linkLine.path.length < 2) {
            return;
        }
        shape.from(this.linkLine.path[0]);
        for (let i = 1; i < this.linkLine.path.length; i++) {
            shape.lineTo(this.linkLine.path[i]);
        }
        shape.print();
    }
}