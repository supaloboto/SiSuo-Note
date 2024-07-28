/**
 * 应用入口
 *
 * @author 刘志栋
 * @since 2024/07/10
 */
import './assets/css/main.css'
import {createApp} from 'vue'
import router from '@/router'
import VueI18n from '@/assets/lang/index'
import App from './App.vue'
import {createPinia} from 'pinia'
// svg图标支持
import 'virtual:svg-icons-register'
import Icon from '@/frame/SvgIcon.vue'
// 主题样式
import '@/assets/css/theme-default.css'
import '@/assets/css/theme-dark.css'

const app = createApp(App)
    .use(router)
    .use(VueI18n)
    .use(createPinia())

// 挂载i18n
app.config.globalProperties.$i18n = VueI18n;
// 挂载icon组件
app.component('Icon', Icon);

app.mount('#app')
