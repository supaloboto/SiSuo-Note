import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import {createSvgIconsPlugin} from "vite-plugin-svg-icons";
import path from "path";

export default defineConfig({
    plugins: [
        vue(),
        vueJsx(),
        // vueDevTools(),
        // svg支持
        createSvgIconsPlugin({
            iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
            symbolId: 'icon-[dir]-[name]',
            inject: 'body-last',
            customDomId: '__svg__icons__dom__',
        }),
    ],
    // 服务配置
    server: {
        // 代理本机所有IP
        host: true,
        // 端口
        port: 8098,
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
        // 配置文件后缀省略
        extensions: ['.js', '.ts']
    }
})
