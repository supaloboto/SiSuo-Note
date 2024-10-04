<!--
 - CodeMirror编辑器组件
 -
 - @author 刘志栋
 - @since 2024/10/02
 -->
<template>
    <div ref="editorDivRef" :style="divStyle"></div>
</template>

<script lang="ts" setup>
    import { onMounted, ref, watch } from 'vue'
    import { EditorState } from "@codemirror/state"
    import { EditorView, basicSetup } from "codemirror"
    import { keymap } from "@codemirror/view"
    import { indentWithTab } from "@codemirror/commands"
    import { logicLinter } from "@/script/codemirror/lint";
    import { LanguageSupport } from "@codemirror/language";
    import { completeFromList } from "@codemirror/autocomplete";
    import { ScriptLang } from "@/script/codemirror/lang.js";

    const emit = defineEmits();
    const editorDivRef = ref(null);
    const editorView = ref(null);
    // 传入参数
    const props = defineProps<{
        modelValue: string,
        height: number,
        width: number
    }>()

    // 组件样式
    const divStyle = {
        height: `${props.height}px`,
        width: `${props.width}px`,
        overflow: "auto"
    }

    // 值绑定
    // 当绑定值变化时更新编辑器内容
    const updateDoc = (newDoc: string) => {
        if (editorView.value) {
            const transaction = editorView.value.state.update({
                changes: { from: 0, to: editorView.value.state.doc.length, insert: newDoc }
            });
            editorView.value.dispatch(transaction);
        }
    };
    watch(() => props.modelValue, (newValue) => {
        if (editorView.value && editorView.value.state.doc.toString() !== newValue) {
            updateDoc(newValue);
        }
    });

    // 组件挂载后初始化编辑器
    onMounted(() => {
        // 设置主题
        const customTheme = EditorView.theme({
            ".cm-content, .cm-gutter": { minHeight: `${props.height}px` }
        });
        // 设置内容修改监听
        const onChange = EditorView.updateListener.of((viewUpdate) => {
            // 当编辑器内容变化时修改modelValue
            if (editorView.value?.state.doc) {
                emit('update:modelValue', editorView.value.state.doc.toString());
            }
        });
        // 设置自动补全
        const completion = ScriptLang.data.of({
            autocomplete: completeFromList([
                { label: "ref", type: "keyword" },
                { label: "var", type: "keyword" },
                { label: "function", type: "keyword" },
                { label: "for", type: "keyword" },
                // { label: "for", type: "function" },
            ])
        });
        const langSupport = new LanguageSupport(ScriptLang, [completion]);
        // 构建编辑器配置
        const state = EditorState.create({
            doc: props.modelValue,
            extensions: [
                basicSetup,
                keymap.of([indentWithTab]),
                logicLinter,
                customTheme,
                langSupport,
                onChange,
            ]
        });
        // 创建编辑器
        editorView.value = new EditorView({
            state: state,
            parent: editorDivRef.value
        });
    })

</script>