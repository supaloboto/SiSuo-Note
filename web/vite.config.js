import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginRequireTransform from 'vite-plugin-require-transform'
import commonjs from "@rollup/plugin-commonjs";

const path = require('path')

export default defineConfig(({command, mode}) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        base: env.VITE_BASE_PATH,
        plugins: [
            // 启用vue插件
            vue(),
            // 启用commonjs支持
            commonjs({
                exclude: []
            }),
            // 启用require插件
            vitePluginRequireTransform({
                fileRegex: /.js$|.vue$/
            }),
        ],
        // 服务配置
        server: {
            // 代理本机所有IP
            host: true,
            // 端口
            port: 8098,
            // 设置反向代理
            proxy: {
                '/hussarApi': {
                    target: env.VITE_APP_BASE_API,//代理地址
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/hussarApi/, '')
                }
            }
        },
        resolve: {
            // 配置文件路径别名
            alias: {
                '@': path.resolve(__dirname, 'src')
            },
            // 配置文件后缀省略
            extensions: ['.vue', '.js']
        },
        build: {
            outDir: 'eln-sandbox',
            commonjsOptions: {
                // 取消vite自带的rollup/commonjs插件对文件的处理 使另外引入的版本更高的commonjs插件发挥作用
                extensions: []
            }
        }
    }
})
