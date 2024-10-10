<!--
 - 看板页面
 -
 - @author 刘志栋
 - @since 2024/07/25
 -->
<script setup lang="ts">
  import { computed, onBeforeMount } from "vue";
  import router from '@/router';
  import { useKanbanStore } from "@/stores/kanban";
  import { useCanvasStore } from "@/stores/canvas";
  import { useDialogStore } from "@/stores/dialog";
  import Header from "@/frame/header/Header.vue";
  import HeaderButton from "@/frame/header/HeaderButton.vue";
  import Board from "@/frame/board/Board.vue";
  import Dock from "@/frame/dock/Dock.vue";
  import { compRegis } from "@/components";
  import { getKanban } from "@/assets/api/kanban";

  onBeforeMount(() => {
    // 使用传递来的看板ID
    const kanbanId = router.currentRoute.value.query.kanbanId;
    if (!kanbanId) {
      // todo 错误处理
      return;
    }
    if (kanbanId === useKanbanStore().kanbanId) {
      return;
    }
    // 清空所有需要清空的store
    useCanvasStore().reset();
    useDialogStore().reset();
    useKanbanStore().reset();
    // 获取看板数据
    getKanban(kanbanId as string).then((res) => {
      // 将返回的组件列表数据转化为组件对象集合
      const compList = res.componentList.map(obj => {
        const compCLass = compRegis.value[obj?.compType]?.class;
        return new compCLass(obj);
      });
      // 更新store
      const kanbanStore = useKanbanStore();
      kanbanStore.kanbanId = res.kanbanId;
      kanbanStore.kanbanTitle = res.title;
      kanbanStore.components = compList;
    });
  });

  // 对话框列表
  const dialogs = computed(() => useDialogStore().dialogs);
  // 控制鼠标信息
  const pointer = computed(() => useCanvasStore().currentPointer);

  // 看板视图标题
  const kanbanStore = useKanbanStore();
  const title = computed(() => kanbanStore.kanbanTitle);

  /**
    * 返回列表页
    */
  const goBack = () => {
    router.back();
  }

  const clickInBoard = (evt: MouseEvent) => {
    pointer.value.focusOnCanvas = true;
  }

  const clickOutBoard = (evt: MouseEvent) => {
    pointer.value.focusOnCanvas = false;
  }

</script>

<template>
  <div id="page-frame" @mousedown="clickOutBoard">
    <!-- header -->
    <Header :title="title">
      <template #left>
        <!-- 返回按钮 -->
        <HeaderButton class="back" @click="goBack">
          <icon name="system-back"></icon>
        </HeaderButton>
        <!-- 撤销按钮 -->
        <HeaderButton class="undo">
          <icon name="system-undo"></icon>
        </HeaderButton>
        <!-- 重做按钮 -->
        <HeaderButton class="redo">
          <icon name="system-redo"></icon>
        </HeaderButton>
      </template>
    </Header>
    <!-- 画布 -->
    <Board @mousedown.stop="clickInBoard" id="board"></Board>
    <!-- dock -->
    <Dock id="dock"></Dock>
    <!-- 对话框 -->
    <component v-for="(dialog, index) in dialogs" :is="dialog.component" :key="dialog.id" :dialog="dialog"></component>
  </div>
</template>

<style lang="scss" scoped>
  $page-height: calc(100% - 2px);
  $page-width: calc(100% - 2px);
  $header-height: 36px;
  $dock-height: 50px;

  #page-frame {
    position: absolute;
    height: $page-height;
    width: $page-width;
    overflow: hidden;
  }

  #board {
    position: absolute;
    margin: $header-height auto;
    height: calc(100% - $header-height - $dock-height);
    width: $page-width;
  }

  #dock {
    position: absolute;
    bottom: 0;
    height: $dock-height;
    width: $page-width;
  }
</style>
