/**
 * 组件类
 * @author 刘志栋
 * @since 2024/07/24
 */
export default class Component {
    type: string;
    id: string;
    pos: { x: number, y: number };
    rect: { width: number, height: number };
    data: any;

    constructor(type: string, id: string, pos: { x: number, y: number }, rect: {
        width: number,
        height: number
    }, data: any) {
        this.type = type;
        this.id = id;
        this.pos = pos;
        this.rect = rect;
        this.data = data;
    }
}
