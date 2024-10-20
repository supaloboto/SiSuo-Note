# 思索笔记 | SiSuo-Note
主要基于以下开源项目构建：
- [Gin](https://github.com/gin-gonic/gin)
- [sonic](https://github.com/bytedance/sonic)
- [Vue](https://github.com/vuejs/core)
- [Vite](https://github.com/vitejs/vite)
- [pinia](https://github.com/vuejs/pinia)
- [Vditor](https://github.com/Vanessa219/vditor)
- [CodeMirror6](https://github.com/codemirror/dev)
- [axios](https://github.com/axios/axios)

## 特性 | Features
- 使用Markdown编辑器编写笔记
- 以无限尺寸看板的形式管理笔记
- (TODO)  内置脚本工具以支持功能的高度自定义
- (TODO)  多人即时协同

## 部署 | Deploy
### 以Docker方式部署 | Deploy With Docker
- 拉取最新镜像
```
docker pull supaloboto/sisuo-note:latest
```
- 启动容器 需要对外绑定80端口
```
docker run -itd --name {容器名} -p {前端对外端口}:80 --privileged=true supaloboto/sisuo-note:latest
```

### 以打包代码方式部署 | Deploy By Building the Code
- 拉取代码  
```
git clone https://github.com/supaloboto/SiSuo-Note.git
```
- 前端构建
```
cd SiSuo-Note/web

## 安装依赖
yarn install

## 打包
yarn run build
```
- 后端构建
```
cd SiSuo-Note/server

## 安装依赖
go mod download

## 为Linux环境打包则先执行 set GOOS=linux
## 打包
go build
```
- Nginx代理配置
```
server {
    listen       80;
    listen       [::]:80;
    server_name  _;
        
    # 前端路由采用history模式 需要配置try_files
    location / {
        root {前端文件路径};
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 代理数据请求 后端服务使用8618端口
    location /api/ {
        proxy_pass http://{后端IP}:8618/;
    }
}
```

## LICENSE

[MIT](LICENSE)