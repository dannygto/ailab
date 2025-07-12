# Docker部署指南

本文档提供使用Docker部署AI实验平台的详细步骤和最佳实践。

## 目录

1. [环境要求](#环境要求)
2. [部署准备](#部署准备)
3. [部署步骤](#部署步骤)
4. [配置说明](#配置说明)
5. [监控和维护](#监控和维护)
6. [故障排除](#故障排除)
7. [更新和回滚](#更新和回滚)

## 环境要求

- Docker Engine 20.10.0+
- Docker Compose 2.0.0+
- 至少8GB RAM
- 至少50GB磁盘空间
- 良好的网络连接

## 部署准备

### 1. 安装Docker和Docker Compose

如果您的服务器上尚未安装Docker和Docker Compose，请参考以下命令：

```bash
# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 克隆或上传项目代码

确保项目代码已上传至服务器，或通过以下命令克隆项目：

```bash
git clone <项目仓库URL> ailab
cd ailab
```

### 3. 配置环境变量

复制环境变量示例文件并根据需要修改：

```bash
cd docker
cp .env.example .env
# 使用文本编辑器修改.env文件
nano .env
```

## 部署步骤

### 1. 构建和启动容器

在项目的`docker`目录下执行以下命令：

```bash
docker-compose up -d
```

这将构建并启动所有服务，包括前端、后端、MongoDB和Redis等。

### 2. 验证部署

执行以下命令检查所有容器是否正常运行：

```bash
docker-compose ps
```

所有服务状态应显示为`Up`。

### 3. 访问应用

部署完成后，可通过以下方式访问应用：

- 前端: http://服务器IP:3000
- 后端API: http://服务器IP:3001
- Grafana监控: http://服务器IP:3002

### 4. 初始化系统

系统部署后，会自动检测是否需要初始化。如果需要初始化，系统会自动重定向到初始化页面。

1. 首次访问时，系统会自动重定向到初始化页面: http://服务器IP:3000/initialize
2. 按照页面提示完成以下初始化步骤:
   - 系统环境检查
   - 数据库连接与初始化
   - 创建示例学校数据
   - 创建管理员账户
   - 配置系统参数

完成初始化后，系统将自动跳转到登录页面。

### 5. 重置初始化状态

如果需要重新初始化系统（例如开发或测试环境），可以使用提供的重置脚本:

```bash
# Linux环境
cd ailab/docker && ./reset-initialization.sh

# Windows环境
cd ailab\docker
.\reset-initialization.ps1
```

注意: 在生产环境中不建议重置初始化状态，除非有特殊需求。

## 配置说明

### 前端配置

前端服务配置位于`docker/frontend/nginx.conf`文件中，包含了Nginx的代理设置、缓存策略等。

### 后端配置

后端服务的主要配置通过环境变量进行，可在`docker/.env`文件中修改。

### 数据库配置

MongoDB数据库的初始化脚本位于`docker/mongo/mongo-init.sh`，可根据需要修改以创建额外的数据库用户或集合。

## 监控和维护

### 容器管理

```bash
# 查看容器日志
docker-compose logs -f [服务名]

# 重启服务
docker-compose restart [服务名]

# 停止所有服务
docker-compose down

# 停止并删除所有卷（会删除数据）
docker-compose down -v
```

### 数据备份

定期备份MongoDB数据：

```bash
# 备份
docker exec -it ailab_mongodb_1 mongodump --uri="mongodb://用户名:密码@localhost:27017/数据库名" --out=/backup/$(date +%Y%m%d)

# 将备份文件从容器复制到宿主机
docker cp ailab_mongodb_1:/backup ./mongodb-backups
```

## 故障排除

### 容器无法启动

1. 检查日志：`docker-compose logs -f [服务名]`
2. 验证环境变量配置是否正确
3. 确认宿主机端口是否被占用

### 数据库连接问题

1. 确认MongoDB容器正常运行
2. 验证连接字符串和凭据是否正确
3. 检查网络设置是否允许容器间通信

### 前端无法访问后端API

1. 确认后端服务正常运行
2. 检查Nginx代理配置是否正确
3. 验证防火墙设置是否允许所需端口

## 更新和回滚

### 更新应用

当需要部署新版本时：

```bash
# 拉取最新代码
git pull

# 重新构建并启动容器
docker-compose up -d --build
```

### 回滚到之前版本

如果新版本出现问题，可以回滚到之前的版本：

```bash
# 回滚代码
git checkout <上一个稳定版本的Commit ID>

# 重新构建并启动容器
docker-compose up -d --build
```

---

如有任何部署或维护问题，请联系技术支持团队。
