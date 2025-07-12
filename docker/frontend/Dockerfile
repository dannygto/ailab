FROM node:18-alpine as build

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制所有源代码
COPY . .

# 构建应用
RUN npm run build

# 创建初始化页面目录
RUN mkdir -p /app/build/initialize

# 复制初始化页面
COPY ./initialize-page /app/build/initialize

# 生产环境
FROM nginx:alpine

# 复制构建产物到Nginx目录
COPY --from=build /app/build /usr/share/nginx/html

# 复制Nginx配置
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
