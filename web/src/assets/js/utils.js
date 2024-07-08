import {ElMessage} from "element-plus";

/**
 * 复制到粘贴板
 */
export function copyText(text, message="复制成功") {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.setAttribute('value', text);
    input.select();
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        ElMessage.success(message);
    }
    document.body.removeChild(input);
}
