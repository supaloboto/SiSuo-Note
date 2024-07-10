/**
 * 引入i18n
 *
 * @author 刘志栋
 * @version 1.0
 * @since 2024/07/10
 */
import {createI18n} from "vue-i18n";

const i18n = createI18n({
    legacy: false,
    locale: 'zh',
    messages: {
        'zh': require('./zh')
    }
});

export default i18n;