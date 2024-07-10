/**
 * 应用入口
 *
 * @author 刘志栋
 * @version 1.0
 * @since 2024/07/10
 */
import {createApp} from 'vue'
import router from '@/router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueI18n from '@/assets/lang/index'
import App from './App'
import ComponentRegister from '@/components/index'
import {createPinia} from 'pinia'

const app = createApp(App)
    .use(router)
    .use(ElementPlus)
    .use(VueI18n)
    .use(ComponentRegister)
    .use(createPinia())

app.config.globalProperties.$i18n = VueI18n;

app.mount('#app')
