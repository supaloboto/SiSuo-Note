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
    locale: 'zh',
    messages: {
        zh
    }
});

export default i18n;
