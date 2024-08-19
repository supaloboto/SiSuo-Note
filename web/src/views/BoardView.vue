<!--
 - 看板页面
 -
 - @author 刘志栋
 - @since 2024/07/25
 -->
<script setup lang="ts">
import { onMounted } from "vue";
import BoardView from "@/frame/Frame.vue";
import { getKanban } from "@/assets/api/kanban";
import { useKanbanStore } from "@/stores/kanban";
import { compRegis } from "@/components";
import router from "@/router";

const kanbanStore = useKanbanStore();

onMounted(() => {
  // 使用传递来的看板ID
  const kanbanId = router.currentRoute.value.query.kanbanId;
  getKanban(kanbanId as string).then((res) => {
    // 将返回的组件列表数据转化为组件对象集合
    const compList = res.componentList.map(obj => {
      const compCLass = compRegis.value[obj?.compType]?.class;
      return new compCLass(obj);
    });
    // 更新store
    kanbanStore.kanbanId = res.kanbanId;
    kanbanStore.components = compList;
  });
});

</script>

<template>
  <BoardView></BoardView>
</template>

<style scoped></style>
