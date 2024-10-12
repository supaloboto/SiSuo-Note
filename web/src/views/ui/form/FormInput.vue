<!--
 - 表单输入项组件
 -
 - @author 刘志栋
 - @since 2024/10/05
 -->
<script setup lang="ts">
    import { computed, ref, watch } from 'vue';

    const props = defineProps({
        modelValue: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: 'text'
        },
        errorMsg: {
            type: String,
            default: ''
        }
    });

    const inputDomRef = ref(null);

    // 聚焦状态
    const focus = ref(false);
    const focusInput = () => {
        inputDomRef.value.focus();
    }

    // 输入项值
    const inputValue = ref(props.modelValue);
    // 当输入值变化时更新modelValue
    const emit = defineEmits();
    watch(inputValue, (value) => {
        emit('update:modelValue', value);
    });

    // 是否显示label
    const showLabel = computed(() => {
        return focus.value || inputValue.value !== '';
    });

    // placeholder和lable的值
    const labelText = computed(() => {
        return props.errorMsg ? props.errorMsg : props.placeholder;
    });

</script>

<template>
    <div :class="{ 'input-border': true, 'show-label': showLabel, 'error': !!errorMsg }" @click="focusInput">
        <label v-if="showLabel" @click="focusInput">{{ labelText }}</label>
        <input ref="inputDomRef" :type="type" v-model="inputValue" :placeholder="showLabel ? '' : labelText"
            @focus="focus = true" @blur="focus = false" />
    </div>
</template>

<style scoped lang="scss">

    // 外框
    .input-border {
        // 设置padding时让输入项稍微靠上 这样placeholder不会被遮挡
        padding: 8px 10px 12px 10px;
        background-color: var(--input-background-color);
        border: 1px solid var(--input-border-color);
        border-radius: 5px;
        cursor: text;
    }

    .input-border.show-label {
        padding-top: 0;
        padding-bottom: 4px;
        border-color: var(--input-focus-border-color);
    }

    .input-border.error {
        border-color: var(--input-error-color);

        label {
            color: var(--input-error-color);
        }

        input::placeholder {
            color: var(--input-error-color);
        }
    }

    // 标签
    label {
        display: block;
        font-size: 12px;
        color: var(--input-lable-color);
        user-select: none;
        cursor: text;
    }

    // 输入项dom
    input {
        border: none;
        font-size: 16px;
        color: var(--input-text-color);
    }

    input::placeholder {
        font-size: 14px;
        user-select: none;
    }

    input:focus {
        outline: none;
    }

</style>