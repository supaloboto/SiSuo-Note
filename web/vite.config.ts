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
        // 设置反向代理 用于开发环境
        proxy: {
            '/api': {
                //代理地址
                target: 'http://localhost:8088',
                // 开启websocket支持
                ws: true,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
        // 配置文件后缀省略
        extensions: ['.js', '.ts']
    }
})
