<!--
 - 系统Header部分
 -
 - @author 刘志栋
 - @since 2024/07/28
 -->
<script setup lang="ts">
  import { ref } from 'vue';
  import HeaderButton from './HeaderButton.vue';
  import About from './menu/About.vue';
  import Setting from './menu/Setting.vue';
  import User from './menu/User.vue';

  const props = defineProps({
    title: {
      type: String,
      required: false
    }
  });

  const showUserMenu = ref(false);

</script>

<template>
  <div class="frame-header-div">
    <!-- 左边部分 -->
    <div class="header-left">
      <!-- 左侧插槽 -->
      <slot name="left">
      </slot>
    </div>
    <!-- 中间部分 -->
    <div class="header-middle">
      <div class="title">
        {{ title }}
      </div>
    </div>
    <!-- 右边部分 按钮顺序是倒排的 -->
    <div class="header-right">
      <!-- 关于 -->
      <HeaderButton class="about">
        <icon name="system-about"></icon>
      </HeaderButton>
      <About v-show="true" />
      <!-- 系统设置 -->
      <HeaderButton class="setting">
        <icon name="system-setting"></icon>
      </HeaderButton>
      <Setting v-show="true" />
      <!-- 用户 -->
      <HeaderButton class="user" @click="showUserMenu = !showUserMenu">
        <icon name="system-user"></icon>
      </HeaderButton>
      <User v-model="showUserMenu" />
      <!-- 右侧插槽 -->
      <slot name="right">
      </slot>
    </div>
  </div>
</template>

<style lang="scss">
  .frame-header-div {
    position: absolute;
    height: 36px;
    width: calc(100vw - 2px);
    margin: auto;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: var(--header-background-color);
    border-bottom: 1px solid var(--header-border-color);
    box-shadow: 0 1px 1px -1px var(--header-shadow-color);
    z-index: var(--header-zindex);

    // 左边部分
    .header-left {
      width: 120px;

      .header-btn {
        float: left;
      }

      .header-menu {
        position: absolute;
        top: 100%;
        left: 0;
      }
    }

    // 中间部分
    .header-middle {
      .title {
        color: var(--header-title-color);
        font-size: 20px;
        font-weight: bold;
        user-select: none;
      }
    }

    // 右边部分
    .header-right {
      width: 120px;

      .header-btn {
        float: right;
      }

      .header-menu {
        position: absolute;
        top: 100%;
        right: 0;
      }
    }

    // 按钮样式
    .header-btn {
      height: 30px;
      width: 30px;
      margin-left: 5px;
      margin-right: 5px;

      svg {
        margin: 4px;
        width: 22px;
        height: 22px;
        --path-fill: var(--header-btn-icon-color);
      }
    }

    .header-btn:hover {
      cursor: pointer;
      background-color: var(--header-btn-hover-background-color);
      border-radius: 5px;

      svg {
        --path-fill: var(--header-btn-hover-icon-color);
      }
    }

  }
</style>
