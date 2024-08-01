<!--
 - 画布侧边工具栏
 -
 - @author 刘志栋
 - @since 2024/07/27
 -->
<script setup lang="ts">
// 引入国际化
import i18n from "@/assets/lang";
import {compRegis} from "@/components";
import {computed} from "vue";

const $t = i18n.global.t;

// 获取组件注册信息
const compRegisList = computed(() => {
  const list = [];
  for (const key in compRegis.value) {
    list.push(compRegis.value[key]);
  }
  return list;
});

const addComp = (compName: string) => {
  console.log('addComp,' + compName);
}

</script>

<template>
  <div id="toolbar">
    <!-- 组件列表 -->
    <div v-for="(comp,index) in compRegisList" class="toolbar-item" :key="comp.name"
         @click="addComp(comp.name)">
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
