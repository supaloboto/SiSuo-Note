/**
 * 引入i18n
 *
 * @author 刘志栋
 * @since 2024/07/10
 */
import {createI18n} from "vue-i18n";

import zh from './zh.json';

const i18n = createI18n({
    legacy: false,
    // 从localStorage中获取语言设置 默认中文
    locale: localStorage.getItem('sisuo-note-lang') || 'zh',
    messages: {
        zh
    }
});

export default i18n;
