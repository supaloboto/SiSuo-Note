<!--
 - 系统Dock部分
 -
 - @author 刘志栋
 - @since 2024/07/28
 -->
<script setup lang="ts">
import {nextTick, onMounted, onUpdated, ref} from "vue";

// 对话框列表
const dialogs = ref([{
  name: '当前正在打开的文档2-20240728',
}, {
  name: '当前正在打开的文档2-20240728',
}, {
  name: '当前正在打开的文档3-20240728当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}, {
  name: '当前正在打开的文档3-20240728',
}]);

const mouseOnIndex = ref(-1);

const mouseOver = (index: number) => {
  mouseOnIndex.value = index;
};

const mouseLeave = (index: number) => {
  mouseOnIndex.value = -1;
};

const click = (index: number) => {
  console.log('open dialog', dialogs.value[index].name);
};

/**
 * 结合transition的钩子 在标题即将显示时 调整dom位置 避免超出边界
 */
const titleShow = (index: number) => {
  // 等待200ms 避免transition动画未完成时获取到的dom位置不准确
  setTimeout(() => {
    adjustTitlePos(index);
  }, 200);
}

const adjustTitlePos = (index: number) => {
  // 获取dialog-div dom
  const dialogElement = document.querySelectorAll('.dock-dialog')[index] as HTMLElement;
  // 获取标题dom 按样式设置标题dom会与dialog-div中线对齐
  const titleElement = document.querySelectorAll('.dock-dialog-hover-title')[index] as HTMLElement;
  if (dialogElement && titleElement) {
    // 获取dialog-div的中线位置
    const dialogCenter = dialogElement.offsetLeft + dialogElement.offsetWidth / 2;
    // 获取标题dom的宽度
    const titleWidth = titleElement.offsetWidth;
    const viewportWidth = window.innerWidth;
    // 和边界的最小间距
    const minMargin = 5;
    if (dialogCenter - titleWidth / 2 < minMargin) {
      // 如果标题超出左边界 则紧贴视图的左边界展示
      const dialogLeft = dialogElement.offsetLeft;
      titleElement.style.left = '0';
      titleElement.style.right = 'auto';
      titleElement.style.transform = `translateX(${minMargin - dialogLeft}px)`;
    } else if (dialogCenter + titleWidth / 2 > viewportWidth - minMargin) {
      // 如果标题超出右边界 则紧贴视图的右边界展示
      const dialogRight = viewportWidth - dialogElement.offsetLeft - dialogElement.offsetWidth;
      titleElement.style.left = 'auto';
      titleElement.style.right = '0';
      titleElement.style.transform = `translateX(${dialogRight - minMargin}px)`;
    } else {
      // 其他情况不做处理
      titleElement.style.left = '50%';
      titleElement.style.right = 'auto';
      titleElement.style.transform = 'translateX(-50%)';
    }
  }
};

</script>

<template>
  <div class="dock-div">
    <div v-for="(dialog,index) in dialogs" :key="index"
         :class="{'dock-dialog':true,'dock-dialog-hover':index===mouseOnIndex}" @mouseover="mouseOver(index)"
         @mouseleave="mouseLeave(index)" @click="click(index)">
      <!-- 悬浮标题 -->
      <transition name="hover-title" @enter="titleShow(index)">
        <div class="dock-dialog-hover-title" v-show="index===mouseOnIndex">
          {{ dialog.name }}
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dock-div {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: var(--dock-background-color);
  border-top: 1px solid var(--dock-border-color);
  z-index: var(--dock-zindex);
}

.dock-dialog {
  position: relative;
  bottom: 15px;
  margin-left: 5px;
  margin-right: 5px;
  width: 50px;
  height: 50px;
  border: 1px solid black;
  /* 动画效果 */
  transition: bottom 0.2s, width 0.2s, height 0.2s;
}

.dock-dialog-hover {
  cursor: pointer;
  bottom: 40px;
  width: 100px;
  height: 100px;
  border: 1px solid black;
  font-size: 12px;

  .dock-dialog-hover-title {
    position: absolute;
    text-align: center;
    width: max-content;
    min-width: 40px;
    max-width: 30vw;
    padding-inline: 10px;
    bottom: 105px;
    background-color: white;
    border: 1px solid black;
    /* 与dialog-div中线对齐 */
    left: 50%;
    transform: translateX(-50%);
    /* 禁止选中 */
    user-select: none;
  }
}

/* 悬浮标题动画 */
.hover-title-enter-active {
  animation: delay-ease 0.8s;
}

/* 动画共0.8s 在前0.2s中出现的标题悬浮框位置可能不准确 因此在前0.2s置为透明 */
@keyframes delay-ease {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

/* 标题隐藏时直接取消显示 避免闪动 */
.hover-title-leave-from {
  display: none;
}
</style>
