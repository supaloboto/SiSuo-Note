<!--
 - Header中按钮打开的菜单
 -
 - @author 刘志栋
 - @since 2024/10/10
 -->
<script setup lang="ts">
  import { onBeforeUnmount, toRef, watch } from 'vue';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: false,
      default: false
    }
  });

  const emit = defineEmits();

  // 点击菜单外部关闭菜单
  const closeMenu = (evt) => {
    if (evt.target.closest('.header-menu') === null) {
      // 延迟关闭菜单 这样HeaderButton上的点击事件触发时标志位没有被修改 就能实现点击按钮打开再点击关闭的效果
      setTimeout(() => {
        emit('update:modelValue', false);
      }, 100);
    }
  }

  // 监听点击事件
  const show = toRef(props, 'modelValue');
  watch(show, (newValue) => {
    if (newValue) {
      document.addEventListener('mousedown', closeMenu);
    } else {
      document.removeEventListener('mousedown', closeMenu);
    }
  });
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', closeMenu);
  });

</script>

<template>
  <div v-show="show" class="header-menu">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
  .header-menu {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  }
</style>
