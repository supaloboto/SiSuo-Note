import {createApp} from 'vue'
import router from '@/router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VueI18n from '@/assets/lang/index'
import App from './App'

const app = createApp(App)
    .use(router)
    .use(ElementPlus)
    .use(VueI18n)

app.mount('#app')
