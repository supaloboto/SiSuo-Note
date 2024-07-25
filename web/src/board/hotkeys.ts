import {useCanvasStore} from "@/stores/canvas";
import {useComponentStore} from "@/stores/component";

/**
 * 快捷键
 *
 * @author 刘志栋
 * @since 2024/07/24
 */
export class Hotkeys {
    static init() {
        // 注册快捷键
        document.addEventListener("keydown", (e) => {
            // delete键删除组件
            if (e.key === "Delete") {
                this.deleteComponent();
            }
            // ctrl + a 全选
            if (e.ctrlKey && e.key === "a") {
                this.selectAll();
            }
            // ctrl + c 复制
            if (e.ctrlKey && e.key === "c") {
                console.log("复制");
            }
            // ctrl + z 撤销
            if (e.ctrlKey && e.key === "z") {
                console.log("撤销");
            }
        });
    }

    /**
     * 全选
     */
    static selectAll() {
        const componentStore = useComponentStore();
        componentStore.components.forEach(comp => {
            componentStore.componentActionMap.get(comp.id)?.select(false);
        })
    }

    /**
     * 删除组件
     */
    static deleteComponent() {
        console.log("删除组件");
    }
}
