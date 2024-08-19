<!--
 - 看板列表页面
 -
 - @author 刘志栋
 - @since 2024/08/16
 -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as kanbanApi from '@/assets/api/kanban';
import { useGlobalStore } from '@/stores/global';
import router from '@/router';

const globalStore = useGlobalStore();

// 看板列表
const kanbanList = ref<{
  kanbanId: string,
  title: string,
  userId: string
}[]>([]);

/**
 * 获取看板列表
 */
const getKanbanList = () => {
  kanbanApi.getKanbanList({
    userId: globalStore.user.id
  }).then(res => {
    kanbanList.value = res;
  });
}
onMounted(() => {
  if (!globalStore.user.id) {
    // todo 处理未登录情况
    return;
  }
  getKanbanList();
});

/*------ 看板创建功能 ------*/
// 新建看板标题
const newKanbanTitle = ref('');
/**
 * 创建看板
 */
const createKanban = () => {
  kanbanApi.createKanban({
    userId: globalStore.user.id,
    title: newKanbanTitle.value,
    componentList: []
  }).then(res => {
    newKanbanTitle.value = '';
    getKanbanList();
  });
}
// todo 编辑看板标题
const editKanbanTitle = () => {
}
/**
 * 删除看板
 * @param kanbanId 看板id
 */
const deleteKanban = (kanbanId: string) => {
  kanbanApi.deleteKanban(kanbanId).then(res => {
    getKanbanList();
  });
}

/**
 * 跳转到看板详情页
 * @param kanbanId 看板id
 */
const gotoKanban = (kanbanId: string) => {
  router.push({ path: '/kanban', query: { kanbanId } });
}

</script>

<template>
  <div class="kanban-div">
    <!-- 看板列表 -->
    <div class="kanban-list">
      <div v-for="(kanban, index) in kanbanList" class="kanban-item">
        {{ kanban.title }}
        <button @click="gotoKanban(kanban.kanbanId)">进入</button>
        <button @click="deleteKanban(kanban.kanbanId)">删除</button>
      </div>
    </div>
    <!-- 创建看板 -->
    <div class="create-kanban">
      <input v-model="newKanbanTitle">
      <button @click="createKanban">创建看板</button>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
