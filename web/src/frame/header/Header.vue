<!--
 - 系统Header部分
 -
 - @author 刘志栋
 - @since 2024/07/28
 -->
<script setup lang="ts">

</script>

<template>
  <div class="header-div">
    <!-- 左边部分 -->
    <div class="header-left">
      <!-- 返回按钮 -->
      <div class="header-btn back">
        <icon name="system-back"></icon>
      </div>
      <!-- 撤销按钮 -->
      <div class="header-btn undo">
        <icon name="system-undo"></icon>
      </div>
      <!-- 重做按钮 -->
      <div class="header-btn redo">
        <icon name="system-redo"></icon>
      </div>
    </div>
    <!-- 中间部分 -->
    <div class="header-middle">
      <div class="title">
        标题
      </div>
    </div>
    <!-- 右边部分 -->
    <div class="header-right">
      <!-- 关于按钮 -->
      <div class="header-btn about">
        <icon name="system-about"></icon>
      </div>
      <!-- 系统设置按钮 -->
      <div class="header-btn setting">
        <icon name="system-setting"></icon>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header-div {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: var(--header-background-color);
  border-bottom: 1px solid var(--header-border-color);
  box-shadow: 0 1px 1px -1px var(--header-shadow-color);
  z-index: var(--header-zindex);
}

.header-left {
  width: 120px;

  .header-btn {
    float: left;
  }
}

.header-middle {
  .title {
    color: var(--header-title-color);
    font-size: 20px;
    font-weight: bold;
  }
}

.header-right {
  width: 120px;

  .header-btn {
    float: right;
  }
}

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

</style>
