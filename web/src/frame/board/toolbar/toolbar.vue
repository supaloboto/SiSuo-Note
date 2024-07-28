<!--
 - 画布侧边工具栏
 -
 - @author 刘志栋
 - @since 2024/07/27
 -->
<script setup lang="ts">
// 引入国际化
import i18n from "@/assets/lang";

const $t = i18n.global.t;

// 获取组件注册信息
import {compRegis} from "@/components";
import {computed} from "vue";

const compRegisList = computed(() => {
  const list = [];
  for (const key in compRegis) {
    list.push(compRegis[key]);
  }
  console.log(list);
  return list;
});

const addComp = (compName: string) => {
  console.log(compName);
}

</script>

<template>
  <div id="toolbar">
    <!-- 组件列表 -->
    <div v-for="(comp,index) in compRegisList" class="toolbar-item" :key="comp.name"
         @click="addComp(comp.name)">
      <!-- 组件图标 -->
      <div class="toolbar-item-icon">
        <Icon :name="`component-${comp.name}`"></Icon>
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
  margin: auto;
  width: 50px;
  height: 650px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid var(--toolbar-border-color);
  border-radius: 5px;
  background-color: var(--toolbar-background-color);
}

.toolbar-item {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.toolbar-item-icon {

  svg {
    width: 50px;
    height: 50px
  }
}
</style>
