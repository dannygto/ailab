# AILAB平台 Linux服务器部署指南（非Docker方式）

## 概述

本文档提供了AILAB平台在Linux服务器上使用非Docker方式的部署方法、常见问题及其解决方案。AILAB平台采用前后端分离架构，前端使用React开发，后端使用Node.js，数据库使用MongoDB。

> 注意：如果您希望使用Docker方式部署，请参考`docs/03-部署指南/Docker部署指南.md`。

## 部署方式

AILAB平台提供以下非Docker的Linux服务器部署方式：

**源代码直接部署**：将源代码直接上传到Linux服务器并部署

## 前置条件

无论采用哪种部署方式，服务器都需要满足以下条件：

- Linux操作系统（推荐Ubuntu 18.04/20.04或CentOS 7/8）
- 开放端口：3000（前端）和3001（后端），可根据需要自定义
- 配置服务器防火墙和云服务器安全组（详见下方说明）

部署脚本会自动安装以下软件，无需手动预装：
  - Node.js 16+ 和 npm
  - MongoDB 4.0+
  - Python 3.6+（用于AI服务）
  - Redis（用于缓存）

### 服务器端口配置

部署完成后，需要配置服务器防火墙和云服务器安全组以允许外部访问：

#### 本地防火墙配置

**Ubuntu/Debian 系统 (ufw)：**
```bash
# 开放前端端口
sudo ufw allow 3000
# 开放后端端口
sudo ufw allow 3001
# 开放HTTPS端口（推荐）
sudo ufw allow 443
# 如果部署了AI服务，还需开放AI服务端口
sudo ufw allow 8001
```

**CentOS/RHEL 系统 (firewalld)：**
```bash
# 开放前端端口
sudo firewall-cmd --permanent --add-port=3000/tcp
# 开放后端端口
sudo firewall-cmd --permanent --add-port=3001/tcp
# 开放HTTPS端口（推荐）
sudo firewall-cmd --permanent --add-port=443/tcp
# 如果部署了AI服务，还需开放AI服务端口
sudo firewall-cmd --permanent --add-port=8001/tcp
# 重新加载防火墙配置
sudo firewall-cmd --reload
```

#### 云服务器安全组配置

如果使用云服务器（如阿里云、腾讯云、AWS等），还需要在云控制台配置安全组：

- **入站规则**：开放端口 3000、3001、443（如有AI服务则加上8001）
- **协议类型**：TCP
- **授权对象**：0.0.0.0/0（公网访问）

#### 安全建议

⚠️ **重要提示**：
- 生产环境建议只开放443端口(HTTPS)，通过Nginx反向代理转发到内部端口
- 使用SSL证书启用HTTPS加密传输
- 限制管理端口的访问来源，避免暴露到公网
- 定期更新系统和软件包，及时修复安全漏洞

## 源代码直接部署

此方法适用于将项目源代码直接上传到Linux服务器并在服务器上进行部署的场景。

### 步骤

1. 将项目源代码打包并上传到Linux服务器
   ```bash
   # 在Windows本地打包
   cd D:\ailab\ailab
   tar -czvf ailab.tar.gz .
   
   # 使用SCP上传
   scp ailab.tar.gz 用户名@服务器IP:/tmp/
   ```

2. 在Linux服务器上解压源代码
   ```bash
   # 登录服务器后
   mkdir -p /opt/ailab
   cd /opt/ailab
   tar -xzvf /tmp/ailab.tar.gz
   ```

3. 运行部署脚本
   ```bash
   # 切换到项目目录
   cd /path/to/your/ailab/project
   
   # 给脚本执行权限
   chmod +x scripts/deployment/deploy-to-linux.sh
   
   # 运行部署脚本（使用当前目录）
   ./scripts/deployment/deploy-to-linux.sh
   
   # 或指定参数
   ./scripts/deployment/deploy-to-linux.sh [部署目录] [前端端口] [后端端口] [MongoDB URI]
   ```

   **重要说明**: 脚本会自动检测当前目录是否为部署目录，如果不是，会将文件复制到指定的部署目录。

   例如：
   ```bash
   # 使用默认参数（当前目录作为部署目录）
   ./scripts/deployment/deploy-to-linux.sh
   
   # 指定部署到/opt/ailab目录
   ./scripts/deployment/deploy-to-linux.sh /opt/ailab 3000 3001 mongodb://localhost:27017/ailab
   ```

### 参数说明

- `部署目录`：服务器上的部署目录（默认：/opt/ailab）
- `前端端口`：前端服务端口（默认：3000）
- `后端端口`：后端API服务端口（默认：3001）
- `MongoDB URI`：MongoDB连接字符串（默认：mongodb://localhost:27017/ailab）

### 部署流程

部署脚本会执行以下操作：

1. **自动安装必要的软件**：
   - Node.js 16+（如果未安装或版本低于16，会自动安装最新LTS版本）
   - MongoDB 4.0+（如果未安装，会自动安装并启动服务）
   - Python 3.6+和pip3（如果未安装，会自动安装）
   - Redis（如果未安装，会自动安装并启动服务）
   - PM2和serve（用于服务管理和前端部署）

2. 配置服务器环境和目录结构
3. 自动检测项目目录结构
4. 自动安装依赖并构建前端代码
5. 自动配置后端环境变量
6. 创建PM2配置、启动脚本和健康检查脚本
7. 提供启动指令和说明

## 服务管理

部署完成后，将生成以下管理脚本：

- `start-ailab.sh`：启动AILAB平台服务

### 启动服务

```bash
# 切换到实际的部署目录
cd /path/to/your/deployment/directory

# 运行启动脚本
./start-ailab.sh
```

**注意**: 请将 `/path/to/your/deployment/directory` 替换为实际的部署目录路径。部署脚本完成后会显示正确的路径。

启动脚本会：
1. 检查MongoDB服务是否运行
2. 检查Redis服务是否运行（如已安装）
3. 启动前端和后端服务
4. 执行健康检查
5. 显示访问地址

### 使用PM2管理服务

部署脚本使用PM2管理Node.js应用程序的运行。您可以使用以下PM2命令进行服务管理：

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs

# 查看特定服务日志
pm2 logs ailab-backend
pm2 logs ailab-frontend

# 重启服务
pm2 restart ailab-backend
pm2 restart ailab-frontend
pm2 restart all

# 停止服务
pm2 stop ailab-backend
pm2 stop ailab-frontend
pm2 stop all

# 设置开机自启动
pm2 startup
pm2 save
```

## 健康检查

部署脚本会创建一个健康检查脚本，用于验证服务是否正常运行：

```bash
# 切换到部署目录
cd /path/to/your/deployment/directory

# 运行健康检查
node scripts/health-check.js
```

**注意**: 请将 `/path/to/your/deployment/directory` 替换为实际的部署目录路径。

健康检查会验证：
1. 前端服务是否可访问
2. 后端API服务是否可访问

## 常见问题与解决方案

### 1. 端口被占用

**症状**：启动服务时报错，提示端口已被占用

**解决方案**：
1. 查找占用端口的进程：
   ```bash
   sudo lsof -i:3000  # 前端端口
   sudo lsof -i:3001  # 后端端口
   ```

2. 终止占用进程：
   ```bash
   sudo kill -9 进程ID
   ```

3. 或者修改配置使用其他端口：
   ```bash
   # 编辑ecosystem.config.js文件
   vi ecosystem.config.js
   # 修改PORT和PM2_SERVE_PORT值
   ```

### 2. MongoDB连接失败

**症状**：后端服务启动失败，日志中报MongoDB连接错误

**解决方案**：
1. 检查MongoDB服务状态：
   ```bash
   sudo systemctl status mongodb
   ```

2. 如果服务未运行，启动服务：
   ```bash
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

3. 检查MongoDB日志：
   ```bash
   sudo cat /var/log/mongodb/mongodb.log
   ```

### 3. Node.js版本问题

**症状**：部署过程中提示Node.js版本过低

**解决方案**：
1. 检查当前Node.js版本：
   ```bash
   node -v
   ```

2. 使用NVM安装最新LTS版本：
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
   source ~/.bashrc
   nvm install --lts
   nvm use --lts
   ```

### 4. 前端构建失败

**症状**：前端代码构建时报错

**解决方案**：
1. 检查构建日志：
   ```bash
   cd /opt/ailab/[前端目录]
   npm run build -- --verbose
   ```

2. 检查Node.js内存限制：
   ```bash
   # 增加构建内存限制
   export NODE_OPTIONS=--max_old_space_size=4096
   npm run build
   ```

3. 删除node_modules并重新安装：
   ```bash
   cd /opt/ailab/[前端目录]
   rm -rf node_modules
   npm install
   ```

### 5. Python依赖安装失败

**症状**：AI服务的Python依赖安装失败

**解决方案**：
1. 确保pip3已安装：
   ```bash
   sudo apt install python3-pip
   ```

2. 更新pip：
   ```bash
   pip3 install --upgrade pip
   ```

3. 手动安装依赖：
   ```bash
   cd /opt/ailab/[AI服务目录]
   pip3 install -r requirements.txt
   ```

### 6. Redis连接失败

**症状**：服务启动后某些缓存功能不可用

**解决方案**：
1. 检查Redis服务状态：
   ```bash
   sudo systemctl status redis-server
   ```

2. 如果服务未运行，启动服务：
   ```bash
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   ```

3. 检查Redis日志：
   ```bash
   sudo cat /var/log/redis/redis-server.log
   ```

## 安全建议

1. **更改默认端口**：修改默认的3000和3001端口，减少被扫描的风险
   ```bash
   # 编辑ecosystem.config.js
   vi /opt/ailab/ecosystem.config.js
   # 修改PORT和PM2_SERVE_PORT值为非标准端口
   ```

2. **使用Nginx代理**：配置Nginx作为反向代理，添加SSL支持
   ```bash
   # 安装Nginx
   sudo apt install nginx
   
   # 配置HTTPS
   sudo certbot --nginx -d yourdomain.com
   
   # 编辑Nginx配置
   sudo vi /etc/nginx/sites-available/ailab
   
   # 添加以下内容
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$host$request_uri;
   }
   
   server {
       listen 443 ssl;
       server_name yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       # 前端代理
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # 后端API代理
       location /api {
           proxy_pass http://localhost:3001/api;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **MongoDB安全设置**：启用认证
   ```bash
   # 编辑MongoDB配置
   sudo vi /etc/mongod.conf
   
   # 添加以下配置
   security:
     authorization: enabled
   ```

4. **定期备份**：设置自动备份脚本
   ```bash
   # 创建备份脚本
   cat > /opt/ailab/scripts/backup.sh << EOF
   #!/bin/bash
   BACKUP_DIR="/opt/ailab/backup/\$(date +%Y%m%d)"
   mkdir -p \$BACKUP_DIR
   mongodump --db ailab --out \$BACKUP_DIR
   find /opt/ailab/backup -type d -mtime +7 -exec rm -rf {} \;
   EOF
   
   # 添加执行权限
   chmod +x /opt/ailab/scripts/backup.sh
   
   # 添加定时任务
   (crontab -l 2>/dev/null; echo "0 2 * * * /opt/ailab/scripts/backup.sh") | crontab -
   ```

## 性能优化

1. **Node.js内存限制**：增加Node.js可用内存
   ```bash
   # 修改ecosystem.config.js
   vi /opt/ailab/ecosystem.config.js
   
   # 添加node_args字段
   node_args: '--max-old-space-size=2048'
   ```

2. **MongoDB索引优化**：创建必要的索引
   ```bash
   mongo
   use ailab
   db.schools.createIndex({ code: 1 }, { unique: true })
   ```

3. **启用PM2集群模式**：利用多核CPU
   ```bash
   # 修改ecosystem.config.js
   vi /opt/ailab/ecosystem.config.js
   
   # 后端服务配置修改
   instances: 'max',  // 使用所有可用CPU核心
   exec_mode: 'cluster'  // 使用集群模式
   ```

## Docker和非Docker部署对比

| 特性 | Docker方式 | 非Docker方式(PM2) |
|------|------------|------------------|
| 环境隔离 | 强 | 弱 |
| 资源占用 | 较高 | 较低 |
| 部署速度 | 较慢 | 较快 |
| 迁移便捷性 | 高 | 中 |
| 版本控制 | 容器镜像 | 代码仓库 |
| 维护难度 | 简单 | 中等 |
| 系统依赖 | 少 | 多 |
| 监控方式 | Docker Stats/容器日志 | PM2/系统日志 |
| 扩展性 | 容器编排(Swarm/K8s) | PM2集群 |
| 适用场景 | 复杂环境/多服务 | 简单环境/开发测试 |

## 结论

本文档提供了AILAB平台在Linux服务器上使用非Docker方式的部署方法、服务管理、常见问题解决方案、安全建议和性能优化建议。按照本文档的指导，可以顺利完成AILAB平台的Linux服务器部署和维护工作。
