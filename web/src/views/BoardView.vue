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
import { useComponentStore } from "@/stores/component";
import { compRegis } from "@/components";

const componentStore = useComponentStore();

onMounted(() => {
  //todo 使用传递来的看板ID
  getKanban('kanban1').then((res) => {
    // 将返回的组件列表数据转化为组件对象集合
    const compList = res.componentList.map(obj => {
      const compCLass = compRegis.value[obj?.compType]?.class;
      return new compCLass(obj);
    });
    // 更新store
    componentStore.components = compList;
  });
});

</script>

<template>
  <BoardView></BoardView>
</template>

<style scoped></style>
