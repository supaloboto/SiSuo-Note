<!--
 - 画布侧边工具栏
 -
 - @author 刘志栋
 - @since 2024/07/27
 -->
<script setup lang="ts">
import i18n from "@/assets/lang";
import { compRegis } from "@/components";
import { computed, watch } from "vue";
import { getLongID } from "@/assets/utils/idworker";
import { useKanbanStore } from "@/stores/kanban";
import { useCanvasStore } from "@/stores/canvas";

const $t = i18n.global.t;
const canvasStore = useCanvasStore();
const kanbanStore = useKanbanStore();

// 获取组件注册信息
const compRegisList = computed(() => {
  const list = [];
  for (const key in compRegis.value) {
    list.push(compRegis.value[key]);
  }
  return list;
});

/**
 * 添加组件
 * @param compName
 */
const addComp = (compName: string) => {
  const compRegisInfo = compRegis.value[compName];
  // 创建组件占位符信息
  const compId = getLongID();
  const compPlaceholder = new compRegisInfo.class({
    id: compId,
    pos: {
      x: canvasStore.currentPointer.x - compRegisInfo.defaultRect.width / 2,
      y: canvasStore.currentPointer.y - compRegisInfo.defaultRect.height / 2,
    },
    rect: {
      width: compRegisInfo.defaultRect.width,
      height: compRegisInfo.defaultRect.height,
    },
  });
  canvasStore.tempComponent = compPlaceholder;
  // 更新store中的鼠标状态
  // canvasStore.currentPointer.selected = [compId];
  canvasStore.currentPointer.state = `creating-${compId}`;
  // 设置鼠标拖动组件的监听
  const stopCompWatch = watch(canvasStore.currentPointer, () => {
    if (!canvasStore.tempComponent) {
      stopCompWatch();
      return;
    }
    canvasStore.tempComponent.pos = {
      x: canvasStore.currentPointer.x - canvasStore.tempComponent.rect.width / 2,
      y: canvasStore.currentPointer.y - canvasStore.tempComponent.rect.height / 2,
    };
  }, { deep: true });
  // 状态还原方法
  const resetState = () => {
    stopCompWatch();
    document.removeEventListener("mouseup", dropComp);
    document.removeEventListener("keydown", escEvt);
    canvasStore.currentPointer.state = "pointer";
    canvasStore.tempComponent = null;
  }
  // 构建添加组件的方法
  const dropComp = () => {
    // 添加组件
    kanbanStore.addComponent(compPlaceholder);
    // 重置状态
    resetState();
  }
  // 监听鼠标抬起事件
  document.addEventListener("mouseup", dropComp);
  // 监听键盘Esc按键事件
  const escEvt = (evt: KeyboardEvent) => {
    if (evt.key === "Escape") {
      resetState();
    }
  };
  document.addEventListener("keydown", escEvt);
}

</script>

<template>
  <div id="toolbar">
    <!-- 组件列表 -->
    <div v-for="(comp, index) in compRegisList" class="toolbar-item" :key="comp.name" @click="addComp(comp.name)">
      <!-- 组件图标 -->
      <div class="toolbar-item-icon">
        <Icon :name="comp.icon"></Icon>
      </div>
      <!-- 组件名称 -->
      <div class="toolbar-item-name">
        {{ $t("component." + comp.name) }}
      </div>
    </div>
    <!-- todo 其他功能 -->
  </div>
</template>

<style lang="scss" scoped>
#toolbar {
  position: fixed;
  z-index: var(--toolbar-zindex);
  top: calc(50% - 345px);
  left: 12px;
  width: 75px;
  height: 615px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid var(--toolbar-border-color);
  border-radius: 5px;
  background-color: var(--toolbar-background-color);
  box-shadow: 0 0 2px 0 var(--toolbar-shadow-color);
  user-select: none;
}

.toolbar-item {
  margin: 5px;
  width: 65px;
  height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  .toolbar-item-icon {
    svg {
      width: 42px;
      height: 42px
    }
  }

  .toolbar-item-name {
    margin-top: -5px;
    font-size: 14px;
    color: var(--toolbar-item-color);
  }
}

.toolbar-item:hover {
  background-color: var(--toolbar-item-hover-backgroud-color);
  border-radius: 5px;

  .toolbar-item-icon {
    svg {
      --path-fill: var(--toolbar-item-hover-color);
    }
  }

  .toolbar-item-name {
    font-size: 14px;
    color: var(--toolbar-item-hover-color);
  }
}
</style>
