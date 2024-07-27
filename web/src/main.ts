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
import ComponentRegister from '@/components/index'
import {createPinia} from 'pinia'
import 'virtual:svg-icons-register'

const app = createApp(App)
    .use(router)
    .use(VueI18n)
    .use(ComponentRegister)
    .use(createPinia())

app.config.globalProperties.$i18n = VueI18n;

app.mount('#app')
