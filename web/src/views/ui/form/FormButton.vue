<!--
 - 表单按钮组件
 -
 - @author 刘志栋
 - @since 2024/10/05
 -->
<script setup lang="ts">
    const props = defineProps({
        type: {
            type: String,
            default: 'default'
        },
        disabled: {
            type: Boolean,
            default: false
        }
    });

    // 点击事件检查
    const preClick = (evt) => {
        // 如果按钮被禁用则阻止默认事件 防止通过在调试工具删除disabled属性绕过禁用
        if (props.disabled) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
        }
    }

</script>

<template>
    <button :class="[props.type, props.disabled ? 'disabled' : '']" :disabled="disabled" @click="preClick">
        <slot></slot>
    </button>
</template>

<style scoped lang="scss">
    button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:focus {
        outline: 1px solid var(--btn-focus-outline-color);
    }

    button.default {
        background-color: var(--default-btn-color);
        color: var(--default-btn-text-color);
    }

    button.default:hover {
        background-color: var(--default-btn-hover-color);
    }

    button.default:active {
        background-color: var(--default-btn-active-color);
    }

    button.default.disabled {
        background-color: var(--default-btn-disabled-color);
        cursor: not-allowed;
    }

    button.primary {
        background-color: var(--primary-btn-color);
        color: var(--primary-btn-text-color);
    }

    button.primary:hover {
        background-color: var(--primary-btn-hover-color);
    }

    button.primary:active {
        background-color: var(--primary-btn-active-color);
    }

    button.primary.disabled {
        background-color: var(--primary-btn-disabled-color);
        cursor: not-allowed;
    }

    button.danger {
        background-color: var(--danger-btn-color);
        color: var(--danger-btn-text-color);
    }

    button.danger:hover {
        background-color: var(--danger-btn-hover-color);
    }

    button.danger:active {
        background-color: var(--danger-btn-active-color);
    }

    button.danger.disabled {
        background-color: var(--danger-btn-disabled-color);
        cursor: not-allowed;
    }
</style>