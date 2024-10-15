<!--
 - 组件四角定位点
 -
 - @author 刘志栋
 - @since 2024/07/10
 -->
<script setup lang="ts">
    import { computed, ref, watch, onBeforeUnmount } from "vue";
    /*------ 四角边框 ------*/
    const wrappers = ref<string[]>(['n', 'e', 'w', 's', 'nw', 'ne', 'sw', 'se']);
    const resizeWatch = ref(null);
    import { Component } from "@/components/Component";
    import { useCanvasStore } from "@/stores/canvas";

    const props = defineProps({
        compData: { type: Component, required: true },
    });

    // 获取鼠标位置
    const canvasStore = useCanvasStore();
    const mousePos = computed(() => canvasStore.currentPointer);

    /**
     * 开始调整大小
     */
    const resizeStart = (evt: MouseEvent, wrapper: string) => {
        // 组件大小调整方法
        const resizeComp = () => {
            const pos = props.compData.pos;
            const rect = props.compData.rect;
            // 获取当前由[选中定位点的对角点]与[鼠标位置]构成的矩阵宽高
            const currentRect = {
                width: wrapper.includes('w') ? (pos.x + rect.width - mousePos.value.x) : (mousePos.value.x - pos.x),
                height: wrapper.includes('n') ? (pos.y + rect.height - mousePos.value.y) : (mousePos.value.y - pos.y),
            };
            let widthChange = 0;
            let heightChange = 0;
            let xChange = 0;
            let yChange = 0;
            if (wrapper.includes('w') || wrapper.includes('e')) {
                // 以10px为最小宽度 调整组件宽度
                const widthOffset = currentRect.width - rect.width;
                if (rect.width + widthOffset > 10) {
                    widthChange = widthOffset;
                    // 如果是调整了左边的两个点 则需要调整位置
                    if (wrapper.includes('w')) {
                        xChange = -widthOffset;
                    }
                }
            }
            // 以10px为最小高度 调整组件高度
            if (wrapper.includes('n') || wrapper.includes('s')) {
                const heightOffset = currentRect.height - rect.height;
                if (rect.height + heightOffset > 10) {
                    heightChange = heightOffset;
                    // 如果是调整了上边的两个点 则需要调整位置
                    if (wrapper.includes('n')) {
                        yChange = -heightOffset;
                    }
                }
            }
            // 更新组件数据
            props.compData.changeSize(widthChange, heightChange);
            props.compData.moveTo(props.compData.pos.x + xChange, props.compData.pos.y + yChange);
        }
        // 因为@dragstart会在鼠标已经做了一定位移之后才触发 所以这里先手动调用一次 避免出现鼠标移动较快时定位点不跟手的情况
        resizeComp();
        // 建立监听 在拖拽中调整组件大小
        resizeWatch.value = watch(mousePos, () => {
            resizeComp();
        }, { deep: true });
        // 因为有时候鼠标移动太快会导致监听不到mouseup事件 所以在document上建立监听
        document.addEventListener('mouseup', resizeEnd);
    }

    /**
     * 结束调整大小
     */
    const resizeEnd = () => {
        resizeWatch.value && resizeWatch.value();
        resizeWatch.value = null;
        // 更新组件数据
        props.compData.update();
        // 移除document上的监听
        document.removeEventListener('mouseup', resizeEnd);
    }

    /**
     * 组件移除时移除监听
     */
    onBeforeUnmount(() => {
        document.removeEventListener('mouseup', resizeEnd);
    });

</script>

<template>
    <div style="display: contents;">
        <div v-for="wrapper in wrappers" :key="wrapper" :class="`resize-wrapper ${wrapper}`"
            @dragstart.stop.prevent="resizeStart($event, wrapper)" @click.stop draggable="true"></div>
    </div>
</template>

<style scoped>

    /* 四角定位点样式 */
    .resize-wrapper {
        position: absolute;
        width: 8px;
        height: 8px;
    }

    .n,
    .s {
        width: calc(100% - 12px);
        transform: translateX(-50%);
    }

    .n {
        top: -4px;
        left: 50%;
        cursor: n-resize;
    }

    .s {
        bottom: -4px;
        left: 50%;
        cursor: s-resize;
    }

    .e,
    .w {
        height: calc(100% - 12px);
        transform: translateY(-50%);
    }

    .e {
        top: 50%;
        right: -4px;
        cursor: e-resize;
    }

    .w {
        top: 50%;
        left: -4px;
        cursor: w-resize;
    }

    .nw,
    .ne,
    .sw,
    .se {
        background-color: var(--component-resize-wrapper-fill-color);
    }

    .nw {
        top: -4px;
        left: -4px;
        cursor: nw-resize;
    }

    .ne {
        top: -4px;
        right: -4px;
        cursor: ne-resize;
    }

    .sw {
        bottom: -4px;
        left: -4px;
        cursor: sw-resize;
    }

    .se {
        bottom: -4px;
        right: -4px;
        cursor: se-resize;
    }
</style>
