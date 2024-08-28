<!--
 - 看板页面
 -
 - @author 刘志栋
 - @since 2024/07/25
 -->
<script setup lang="ts">
import { onBeforeMount } from "vue";
import BoardView from "@/frame/Frame.vue";
import router from "@/router";
import { compRegis } from "@/components";
import { getKanban } from "@/assets/api/kanban";
import { useKanbanStore } from "@/stores/kanban";
import { useCanvasStore } from "@/stores/canvas";
import { useDialogStore } from "@/stores/dialog";

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
    kanbanStore.components = compList;
  });
});

</script>

<template>
  <BoardView></BoardView>
</template>

<style scoped></style>
