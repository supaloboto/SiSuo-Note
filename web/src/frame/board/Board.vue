<!--
 - 画布
 -
 - @author 刘志栋
 - @since 2024/07/10
 -->
<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch, type StyleValue } from "vue";
  import { useGlobalStore } from "@/stores/global";
  import { PointerState, useCanvasStore } from "@/stores/canvas";
  import { useKanbanStore } from "@/stores/kanban";
  import { Hotkeys } from "@/frame/board/hotkeys";
  import Toolbar from "@/frame/board/toolbar/Toolbar.vue";
  import SisuoComp from "@/components/Component.vue";
  import Scale from "@/frame/board/scale/Scale.vue";
  import CanvasRenderer from "@/frame/board/shape/CanvasRenderer.vue";
  import SvgRenderer from "@/frame/board/shape/SvgRenderer.vue";
  import { BoardShapeCommand } from "@/frame/board/shape/BoardShapeCommand";
  import { BoardShape, BoardShapeCanvas, LineStyle } from "@/frame/board/shape/BoardShape";
  import { deepCopy } from "@/assets/utils/copy";

  const canvasStore = useCanvasStore();
  const kanbanStore = useKanbanStore();
  const globalStore = useGlobalStore();

  // 获取组件列表
  const tempComponent = computed(() => canvasStore.tempComponent);
  const components = computed(() => kanbanStore.components);

  // 监听键盘事件
  Hotkeys.init();

  // 鼠标拖拽移动开关
  const viewDragging = ref<boolean>(false);
  // 获取当前视图参数
  const scale = computed(() => canvasStore.scale / 100);
  const viewRect = computed(() => canvasStore.currentViewRect);
  /**
   * 记录视图宽高数据
   */
  const updateRectSize = () => {
    const rect = document.getElementById("sisuo-canvas").getBoundingClientRect();
    canvasStore.currentViewRect.clientWidth = rect.width;
    canvasStore.currentViewRect.clientHeight = rect.height;
    canvasStore.currentViewRect.width = rect.width / scale.value;
    canvasStore.currentViewRect.height = rect.height / scale.value;
  }
  onMounted(() => {
    updateRectSize();
    window.addEventListener('resize', updateRectSize);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateRectSize);
  });

  /**
   * 监听鼠标位置 同步到store
   * @param evt
   */
  const mouseMove = (evt: MouseEvent) => {
    // 当正在拖拽视图时 不更新鼠标位置 避免触发各种事件
    if (viewDragging.value) {
      canvasStore.currentViewRect.x -= evt.movementX / scale.value;
      canvasStore.currentViewRect.y -= evt.movementY / scale.value;
      return;
    }
    // 获取画布的上边距和左边距
    const canvas = document.getElementById("sisuo-canvas");
    const canvasRect = canvas.getBoundingClientRect();
    // 记录鼠标在视图中的位置
    canvasStore.currentPointer.clientX = evt.clientX - canvasRect.left;
    canvasStore.currentPointer.clientY = evt.clientY - canvasRect.top;
    // 计算鼠标在画布上的坐标
    // 求画布dom中心的客户端坐标
    const clientCenter = {
      clientX: canvasRect.left + canvasRect.width / 2,
      clientY: canvasRect.top + canvasRect.height / 2,
    }
    // 求鼠标位置与此中心坐标的差 并除以缩放比例
    const mousePosOffset = {
      x: (evt.clientX - clientCenter.clientX) / scale.value,
      y: (evt.clientY - clientCenter.clientY) / scale.value,
    }
    // 将差值修约至小数点后三位 以抹去js浮点数计算精度问题导致的误差
    mousePosOffset.x = Math.round(mousePosOffset.x * 1000) / 1000;
    mousePosOffset.y = Math.round(mousePosOffset.y * 1000) / 1000;
    // 差值与当前画布中心点坐标叠加 求得鼠标在画布上的位置
    canvasStore.currentPointer.x = viewRect.value.x + mousePosOffset.x;
    canvasStore.currentPointer.y = viewRect.value.y + mousePosOffset.y;
  }
  /**
   * 当鼠标按下时 检查是否是鼠标右键 是右键则进入拖拽移动视图模式
   * @param evt
   */
  const onMouseDown = (evt: MouseEvent) => {
    if (evt.button !== 2) {
      return;
    }
    evt.preventDefault();
    viewDragging.value = true;
    // 在document上监听鼠标抬起事件
    document.addEventListener('mouseup', onMouseUp);
  }
  /**
   * 鼠标抬起事件
   */
  const onMouseUp = () => {
    // 若当前正处于拖拽移动视图模式 则退出
    if (viewDragging.value) {
      viewDragging.value = false;
      document.removeEventListener('mouseup', onMouseUp);
    }
    // 若当前正处于框选模式 则退出
    if (dragSelectWatch.value) {
      dragEnd();
    }
  }

  /**
   * 左键点击空白处 取消选中
   */
  const clickBlank = () => {
    canvasStore.currentPointer.selected = [];
  }
  /**
   * 右键点击空白处 弹出右键菜单
   */
  const rightClickBlank = (evt: MouseEvent) => {
    evt.preventDefault();
    if (viewDragging.value) {
      return;
    }
    // todo 弹出右键菜单
  }

  // 鼠标是否处于组件创建状态
  const cursorCreatingMode = computed(() => canvasStore.currentPointer.state === PointerState.CREATING);
  // 根据鼠标状态选择鼠标样式类
  const cursorStyleClass = computed(() => {
    if (viewDragging.value) {
      return 'grabbing';
    }
    if (cursorCreatingMode.value) {
      return 'creating';
    }
  });

  // 背景类型
  const boardBgType = computed(() => globalStore.sysConfig.boardBgType);
  // 背景样式
  const boardBgStyle = computed<StyleValue>(() => {
    if (boardBgType.value === 'none') {
      return {};
    }
    // 背景类型
    switch (boardBgType.value) {
      // 简单辅助线网格背景
      case 'lattice1':
        const latticeSize = 60 * scale.value;
        return {
          backgroundImage: 'linear-gradient(#e1e1e1 2px, transparent 0), linear-gradient(90deg, #e1e1e1 1px, transparent 0)',
          backgroundSize: `${latticeSize}px ${latticeSize}px`,
        }
      // 细致辅助线网格背景
      case 'lattice2':
        const latticeOuterSize = 150 * scale.value;
        const latticeInnerSize = 30 * scale.value;
        return {
          backgroundImage: 'linear-gradient(#e1e1e1 2px, transparent 0), linear-gradient(90deg, #e1e1e1 1px, transparent 0), linear-gradient(#ededed 1px, transparent 0), linear-gradient(90deg, #ededed 1px, transparent 0)',
          backgroundSize: `${latticeOuterSize}px ${latticeOuterSize}px, ${latticeOuterSize}px ${latticeOuterSize}px, ${latticeInnerSize}px ${latticeInnerSize}px, ${latticeInnerSize}px ${latticeInnerSize}px`,
        }
      // 点阵背景
      case 'dot1':
        const dotSize = 30 * scale.value;
        return {
          backgroundImage: 'radial-gradient(circle, #c1c1c1 1px, transparent 0)',
          backgroundSize: `${dotSize}px ${dotSize}px`,
        }
    }
  });
  // 背景位置
  const boardBgPos = computed(() => {
    // 因为背景位置定义的是背景的左上角 所以需要结合视图中心和大小计算背景位置
    const x = viewRect.value.x * scale.value - viewRect.value.clientWidth / 2;
    const y = viewRect.value.y * scale.value - viewRect.value.clientHeight / 2;
    return {
      backgroundPosition: `${-x}px ${-y}px`,
    }
  });

  /*------ 框选逻辑 ------*/
  const mousePos = computed(() => {
    return {
      x: canvasStore.currentPointer.x,
      y: canvasStore.currentPointer.y,
    }
  });
  // 拖拽监听
  const dragSelectWatch = ref(null);
  // 选框绘制命令
  class SelectionSquareCmd extends BoardShapeCommand {
    startPos: { x: number, y: number };
    endPos: { x: number, y: number };

    constructor() {
      super();
      super.useCanvas();
    }

    render(): BoardShape {
      // 线条样式
      const lineStyle = new LineStyle();
      lineStyle.lineWidth = 2;
      lineStyle.stroke = '#adc7d8da';
      lineStyle.fill = '#84e2ff3d';
      // 绘制选框
      const shape = new BoardShapeCanvas();
      shape.from(this.startPos, lineStyle)
        .lineTo({ x: this.endPos.x, y: this.startPos.y })
        .lineTo(this.endPos)
        .lineTo({ x: this.startPos.x, y: this.endPos.y })
        .closePath();
      return shape;
    }
  }
  const selectionSquareCmd = ref(null);
  /**
  * 开始拖拽方法
  */
  const dragStart = () => {
    // 新建选框绘制命令
    selectionSquareCmd.value = new SelectionSquareCmd();
    const startPos = { x: mousePos.value.x, y: mousePos.value.y };
    selectionSquareCmd.value.startPos = startPos;
    selectionSquareCmd.value.endPos = startPos;
    // 建立监听
    dragSelectWatch.value = watch(mousePos, (val) => {
      // 鼠标移动时绘制框选框
      if (val.x < startPos.x || val.y < startPos.y) {
        selectionSquareCmd.value.startPos = { x: val.x, y: val.y };
        selectionSquareCmd.value.endPos = startPos;
      } else {
        selectionSquareCmd.value.startPos = startPos;
        selectionSquareCmd.value.endPos = { x: val.x, y: val.y };
      }
      selectionSquareCmd.value.update();
      // 利用坐标矩阵查找与选框坐标范围匹配的组件和连线 更新选中对象
      canvasStore.currentPointer.selected = [];
      const posMatrix = kanbanStore.posMatrix;
      let minXIndex = 0;
      for (let yIndex = 0; yIndex < posMatrix.length; yIndex++) {
        const row = posMatrix[yIndex];
        for (let xIndex = minXIndex; xIndex < row.length; xIndex++) {
          const location = row[xIndex];
          // 跳过空位置
          if (!location) {
            continue;
          }
          // 比较开始位置
          // 如果位置的y坐标小于选框的y坐标 则说明整行都不在选框内 跳出
          if (location.startPos.y < selectionSquareCmd.value.startPos.y) {
            break;
          }
          // 如果位置的x坐标小于选框的x坐标 则跳过此位置 并更新最小x坐标
          if (location.startPos.x < selectionSquareCmd.value.startPos.x) {
            minXIndex = xIndex + 1;
            continue;
          }
          // 如果通过了开始位置比对 则继续比对结束位置 结束位置小于选框的结束位置 则说明此位置在选框内
          if (location.endPos.x <= selectionSquareCmd.value.endPos.x && location.endPos.y <= selectionSquareCmd.value.endPos.y) {
            // 进行选中
            canvasStore.currentPointer.selected.push(location.target.id);
          }
        }
      }
    }, { deep: true });
    document.addEventListener('mouseup', dragEnd);
  }
  /**
  * 结束拖拽方法
  */
  const dragEnd = () => {
    // 移除监听
    dragSelectWatch.value && dragSelectWatch.value();
    dragSelectWatch.value = null;
    // 移除选框绘制命令
    selectionSquareCmd.value.erase();
    selectionSquareCmd.value = null;
    // 移除document上的监听
    document.removeEventListener('mouseup', dragEnd);
  }

</script>

<template>
  <div class="board-div">
    <!-- 侧边栏 -->
    <Toolbar v-show="!cursorCreatingMode"></Toolbar>
    <!-- 组件 -->
    <div id="sisuo-canvas" :class="[cursorStyleClass]" :style="[boardBgStyle, boardBgPos]" @mousemove="mouseMove"
      @click="clickBlank" @mousedown="onMouseDown" @mouseup="onMouseUp" @contextmenu="rightClickBlank" draggable="true"
      @dragstart.stop.prevent="dragStart">
      <!-- 定位居中 为了计算缩放方便 视图采用中心点为坐标原点的定位方式 因此需要让所有组件的渲染以窗口中心为原点 -->
      <div class="canvas-center">
        <!-- 渲染组件 -->
        <sisuo-comp v-for="(comp, index) in components" :key="comp.id" :compData="(comp as any)"></sisuo-comp>
        <!-- 渲染组件占位符 使用temp-comp类控制z-index -->
        <sisuo-comp v-if="tempComponent" class="temp-comp" :key="tempComponent.id"
          :compData="(tempComponent as any)"></sisuo-comp>
      </div>
    </div>
    <!-- 缩放工具 -->
    <Scale></Scale>
    <!-- 形状绘制器-Canvas -->
    <CanvasRenderer></CanvasRenderer>
    <!-- 形状绘制器-SVG -->
    <SvgRenderer></SvgRenderer>
  </div>
</template>

<style lang="scss" scoped>
  #sisuo-canvas {
    position: absolute;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background-color: var(--board-background-color);
  }

  .grabbing {
    cursor: grabbing;
  }

  .creating {
    cursor: none !important;
  }

  .canvas-center {
    position: absolute;
    top: 50%;
    left: 50%;
  }
</style>
