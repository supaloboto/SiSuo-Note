<!--
 - 系统Dock部分
 -
 - @author 刘志栋
 - @since 2024/07/28
 -->
<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {useCanvasStore} from "@/stores/canvas";
import {useDialogStore} from "@/stores/dialog";
import type {Dialog} from "@/frame/dialog/Dialog";
import {NoteEditorDialog} from "@/components/blocks/note/editor/NoteEditorDialog";

const canvasStore = useCanvasStore();
const dialogStore = useDialogStore();
// 对话框列表
const dialogs = computed<Dialog[]>(() => dialogStore.dialogs);
// 鼠标悬浮的对话框索引
const mouseOnIndex = ref(-1);
// 当前焦点对话框 当聚焦在画布上时为空
const currentFocusDialog = computed(() => {
  if (canvasStore.currentPointer.focusOnCanvas || dialogStore.dialogStack.length === 0) {
    return '';
  }
  return dialogStore.dialogStack[0];
});

/**
 * 鼠标悬浮时修改对话框索引
 */
const mouseOver = (index: number) => {
  mouseOnIndex.value = index;
};
/**
 * 鼠标离开时重置对话框索引
 */
const mouseLeave = (index: number) => {
  mouseOnIndex.value = -1;
};
/**
 * 点击展开对话框
 */
const click = (index: number) => {
  // 获取对话框对象 以调用开关方法
  const dialog = dialogs.value[index];
  // 当对话框没有打开时打开
  if (!dialog.visible) {
    dialog.open(null);
    return;
  }
  // 如果当前没有聚焦在此对话框则聚焦
  if (currentFocusDialog.value !== dialog.id) {
    dialog.focus();
  } else {
    // 如果已经聚焦在此对话框则最小化
    dialog.minimize(null);
  }
};
/**
 * 鼠标按下时处理
 * @param evt
 * @param index
 */
const mouseDown = (evt: MouseEvent, index: number) => {
  // 鼠标中间点击为关闭
  if (evt.button === 1) {
    dialogs.value[index].close();
  }
};

/**
 * 结合transition的钩子 在标题即将显示时 调整dom位置 避免超出边界
 */
const titleShow = (dialogIndex: number) => {
  // 等待200ms 避免transition动画未完成时获取到的dom位置不准确
  setTimeout(() => {
    adjustTitlePos(dialogIndex);
  }, 200);
}

/**
 * 调整标题位置
 */
const adjustTitlePos = (dialogIndex: number) => {
  // 获取dialog-div dom
  const dialogElement = document.querySelectorAll('.dock-dialog')[dialogIndex] as HTMLElement;
  // 获取标题dom 按样式设置标题dom会与dialog-div中线对齐
  const titleElement = document.querySelectorAll('.dock-dialog-hover-title')[dialogIndex] as HTMLElement;
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

// 测试数据
onMounted(() => {
  new NoteEditorDialog('setting', '系统设置', {clientX: 100, clientY: 100}, {
    width: 800,
    height: 600
  }, null);
  new NoteEditorDialog('1', '文档1', {clientX: 200, clientY: 200}, {
    width: 800,
    height: 600
  }, null);
  new NoteEditorDialog('2', '文档2', {clientX: 300, clientY: 300}, {
    width: 800,
    height: 600
  }, null);
  new NoteEditorDialog('3', '文档3文档3文档3文档3文档文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档3文档33', {
    clientX: 400,
    clientY: 400
  }, {
    width: 800,
    height: 600
  }, null);
});

</script>

<template>
  <div class="dock-div">
    <TransitionGroup name="dock-fade">
      <div v-for="(dialog,index) in dialogs" :key="dialog.id" :id="dialog.id"
           :class="{'dock-dialog':true, 'dock-dialog-focus':currentFocusDialog===dialog.id, 'dock-dialog-hover':index===mouseOnIndex}"
           @mouseover="mouseOver(index)"
           @mouseleave="mouseLeave(index)"
           @click="click(index)"
           @mousedown="evt=>mouseDown(evt,index)"
      >
        <!-- 缩略图 对特殊弹框显示对应的icon 对普通弹框显示标题或缩略图  -->
        <div v-if="dialog.id==='setting'">
          <icon name="system-setting"></icon>
        </div>
        <!-- todo 使用缩略图 -->
        <span v-else>
        {{ dialog.title }}
      </span>
        <!-- 关闭按钮 -->
        <button class="dialog-btn close" v-show="index===mouseOnIndex" @click.stop="dialog.close()">
          <icon name="system-close"/>
        </button>
        <!-- 悬浮标题 -->
        <transition name="hover-title" @enter="titleShow(index)">
          <div class="dock-dialog-hover-title" v-show="index===mouseOnIndex">
            {{ dialog.title }}
          </div>
        </transition>
      </div>
    </TransitionGroup>
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
  border: 1px solid var(--dock-item-border-color);
  border-radius: 2px;
  background-color: var(--dock-item-background-color);
  /* 动画效果 */
  transition: bottom 0.2s, width 0.2s, height 0.2s, font-size 0.2s;
  /* 内容居中 */
  text-align: center;
  align-content: center;
  /* 空间有限 需要使文字更紧凑地显示 */
  word-break: break-all;
  user-select: none;
  font-size: 12px;
  color: var(--dock-item-font-color);
  /* 避免文字溢出 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  svg {
    /* 鼠标悬浮时尺寸变大 添加动画效果 */
    transition: width 0.2s, height 0.2s;
    width: 45px;
    height: 45px;
    --path-fill: var(--dock-item-font-color);
  }
}

.dock-dialog-focus {
  border: 2px solid var(--dock-item-focus-border-color);
}

.dock-dialog-hover {
  cursor: pointer;
  bottom: 40px;
  width: 100px;
  height: 100px;
  box-shadow: 0 5px 10px 0 var(--dock-item-border-color);
  /* 使文字变大 */
  font-size: 16px;
  /* 取消overflow-hidden以显示出悬浮标题 */
  overflow: visible;
  white-space: normal;

  svg {
    width: 80px;
    height: 80px;
  }

  .dock-dialog-hover-title {
    position: absolute;
    text-align: center;
    align-content: center;
    width: max-content;
    min-height: 20px;
    min-width: 40px;
    max-width: 30vw;
    padding: 2px 8px;
    bottom: 105px;
    background-color: var(--dock-item-background-color);
    border: 1px solid var(--dock-item-title-border-color);
    box-shadow: 0 2px 8px 0 var(--dock-item-title-border-color);
    color: var(--dock-item-title-font-color);
    border-radius: 5px;
    font-size: 12px;
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

/* 关闭按钮 */
.dialog-btn {
  position: absolute;
  border-radius: 15px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  padding: 0;
  border: none;
  user-select: none;

  svg {
    margin-top: 2px;
    width: 14px;
    height: 14px;
  }
}

.close {
  left: calc(100% - 15px);
  top: -5px;
  background-color: var(--dock-item-close-btn-color);

  svg {
    --path-fill: var(--dock-item-close-content-color);
  }
}

.close:hover {
  background-color: var(--dock-item-close-btn-hover-color);
}

/* 对话框进出时的动画 */
.dock-fade-move,
.dock-fade-enter-active,
.dock-fade-leave-active {
  transition: all 0.2s ease;
}

.dock-fade-enter-from,
.dock-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.dock-fade-leave-active {
  position: absolute;
}

</style>
