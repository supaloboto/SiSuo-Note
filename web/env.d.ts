/// <reference types="vite/client" />

// 配置TS对.vue文件的解析
declare module '*.vue' {
    import { defineComponent } from 'vue'
    const component: ReturnType<typeof defineComponent>
    export default component
}
