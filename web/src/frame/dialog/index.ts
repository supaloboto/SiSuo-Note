/**
 * 注册弹框组件
 *
 * @author 刘志栋
 * @since 2024/07/31
 */
import {markRaw} from 'vue'
import NoteEditorDialog from "@/components/blocks/note/editor/NoteEditorDialog.vue";

// 注册弹框
export const dialogRegis = {
    // 笔记编辑器
    noteEditor: {
        raw: markRaw(NoteEditorDialog),
    },
    // 系统设置弹窗
    setting: {
        raw: markRaw(NoteEditorDialog),
    },
}
