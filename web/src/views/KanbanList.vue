<!--
 - 看板列表页面
 -
 - @author 刘志栋
 - @since 2024/08/16
 -->
<script setup lang="ts">
  import i18n from "@/assets/lang";
  import { onMounted, ref } from 'vue';
  import * as kanbanApi from '@/assets/api/kanban';
  import { useGlobalStore } from '@/stores/global';
  import router from '@/router';
  import FormButton from '@/views/ui/form/FormButton.vue';
  import FormInput from '@/views/ui/form/FormInput.vue';

  const $t = i18n.global.t;
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

  // 待删除看板ID
  const idToDel = ref('');
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
  <div class="kanban-page-background">
    <div class="list-container">
      <!-- 创建看板 -->
      <div class="create-kanban">
        <FormInput v-model="newKanbanTitle" :placeholder="$t('filemanage.newBoard')" />
        <FormButton class="create-kanban-btn" type="primary" @click="createKanban">{{ $t('common.add') }}</FormButton>
      </div>
      <!-- 看板列表 -->
      <div class="kanban-list">
        <div v-for="(kanban, index) in kanbanList" class="kanban-item">
          <!-- 正常展示状态 -->
          <div class="item-content" v-if="idToDel !== kanban.kanbanId">
            <!-- 标题 -->
            <span>{{ kanban.title }}</span>
            <!-- 打开按钮 -->
            <FormButton class="operate-btn" @click="gotoKanban(kanban.kanbanId)">{{ $t('common.open') }}</FormButton>
            <!-- 删除按钮点击后进入删除状态 -->
            <FormButton class="operate-btn" @click="idToDel = kanban.kanbanId">
              {{ $t('common.delete') }}
            </FormButton>
          </div>
          <!-- 待删除状态 -->
          <div class="delete-confirm" v-else>
            <!-- 删除提示 -->
            <span>{{ $t("filemanage.deleteConfirm") }}</span>
            <!-- 确认和取消按钮 -->
            <FormButton class="operate-btn" type="danger" @click="deleteKanban(kanban.kanbanId)">
              {{ $t('common.confirm') }}
            </FormButton>
            <FormButton class="operate-btn" @click="idToDel = ''">{{ $t('common.cancel') }}</FormButton>
          </div>
          <!-- 分割线 -->
          <div class="kanban-item-split" v-if="index !== kanbanList.length - 1"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

  // 页面背景
  .kanban-page-background {
    height: 100%;
    width: 100%;
    background-color: var(--login-page-background-color);
  }

  // 列表容器
  .list-container {
    margin: auto;
    margin-top: 10vh;
    height: 80vh;
    min-height: 400px;
    width: 40vw;
    min-width: 600px;
    background-color: var(--login-form-container-background-color);
    border: 1px solid var(--login-form-container-border-color);
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  // 创建看板
  .create-kanban {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;

    .create-kanban-btn {
      margin-left: 10px;
      height: 44px;
    }
  }

  // 看板列表
  .kanban-list {
    margin: auto;
    padding: 2px;
    width: 80%;
    // 高度 = 容器高度 - 创建看板高度 - 底部间距
    height: calc(100% - 100px - 20px);
    overflow-y: auto;
    border: 1px solid var(--login-form-container-border-color);
    border-radius: 3px;

    .kanban-item {
      border-radius: 5px;

      span {
        display: inline-block;
        width: calc(100% - 144px);
        color: var(--input-text-color);
        font-weight: 800;
        text-align: center;
      }

      .operate-btn {
        margin-right: 5px;
      }

      // 正常展示状态
      .item-content {
        padding: 5px;
      }

      .item-content:hover {
        background-color: var(--kanban-item-hover-color);
      }

      // 删除待确认状态
      .delete-confirm {
        padding: 5px;
        background-color: var(--kanban-item-delete-color);
      }
    }

    // 列表行分割线
    .kanban-item-split {
      height: 1px;
      background-color: var(--kanban-list-split-color);
      margin: 2px 0 2px 0;
    }
  }
</style>
