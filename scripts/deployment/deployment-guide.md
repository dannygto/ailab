# AICAM 服务器端一键部署指南

## 概述

本指南将帮助您在 Ubuntu 20.04+ 服务器上快速部署 AICAM AI 辅助实验平台。

## 前置要求

### 服务器配置要求
- **操作系统**: Ubuntu 20.04 或更高版本
- **CPU**: 至少 2 核心
- **内存**: 至少 4GB RAM
- **存储**: 至少 10GB 可用空间
- **网络**: 稳定的互联网连接

### 网络要求
- 开放端口: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- 服务器 IP: 82.156.75.232

## 部署步骤

### 1. 连接到服务器

```bash
ssh root@82.156.75.232
```

### 2. 下载部署脚本

```bash
# 创建临时目录
mkdir -p /tmp/aicam-deploy
cd /tmp/aicam-deploy

# 下载部署脚本
wget https://raw.githubusercontent.com/dannygto/ailab/master/scripts/部署脚本/服务器端全自动部署脚本.sh

# 设置执行权限
chmod +x 服务器端全自动部署脚本.sh
```

### 3. 执行一键部署

```bash
# 执行部署脚本
./服务器端全自动部署脚本.sh
```

**注意**: 部署过程大约需要 10-15 分钟，请耐心等待。

## 部署过程说明

### 自动执行的步骤

1. **系统环境检查**
   - 检查操作系统版本
   - 检查内存和磁盘空间
   - 验证系统兼容性

2. **安装必要软件**
   - Node.js 18.x
   - Docker 和 Docker Compose
   - Nginx 反向代理
   - 基础工具包

3. **备份现有部署**
   - 自动备份到 `/opt/aicam-backup`

4. **拉取最新代码**
   - 从 Git 仓库拉取最新代码
   - 自动切换到 master 分支

5. **生成部署配置**
   - 创建 Docker Compose 配置
   - 生成环境变量文件
   - 配置服务依赖关系

6. **构建和部署**
   - 构建 Docker 镜像
   - 启动所有服务容器
   - 配置服务间通信

7. **配置 Nginx**
   - 设置反向代理
   - 配置负载均衡
   - 启用健康检查端点

8. **健康检查**
   - 验证容器状态
   - 检查端口监听
   - 测试 HTTP 响应

9. **配置防火墙**
   - 开放必要端口
   - 设置安全规则

10. **创建管理脚本**
    - 启动/停止/重启脚本
    - 日志查看脚本
    - 状态监控脚本

11. **设置定时任务**
    - 日志轮转
    - 自动备份

12. **生成部署报告**
    - 记录部署信息
    - 生成访问地址
    - 提供管理命令

## 部署完成后的验证

### 1. 检查服务状态

```bash
cd /opt/aicam
./status.sh
```

### 2. 访问应用

- **前端界面**: http://82.156.75.232
- **API 接口**: http://82.156.75.232:5000
- **健康检查**: http://82.156.75.232/health

### 3. 查看日志

```bash
cd /opt/aicam
./logs.sh
```

## 常用管理命令

### 服务管理

```bash
cd /opt/aicam

# 启动服务
./start.sh

# 停止服务
./stop.sh

# 重启服务
./restart.sh

# 查看状态
./status.sh

# 查看日志
./logs.sh
```

### 系统监控

```bash
# 查看容器状态
docker-compose ps

# 查看系统资源
docker stats

# 查看端口监听
netstat -tlnp | grep -E ":(80|3000|5000)"

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   netstat -tlnp | grep :80
   
   # 停止占用进程
   sudo kill -9 <PID>
   ```

2. **容器启动失败**
   ```bash
   # 查看容器日志
   docker-compose logs <service-name>
   
   # 重新构建容器
   docker-compose build --no-cache
   ```

3. **磁盘空间不足**
   ```bash
   # 清理 Docker 资源
   docker system prune -a
   
   # 清理日志文件
   sudo journalctl --vacuum-time=7d
   ```

4. **网络连接问题**
   ```bash
   # 检查防火墙状态
   ufw status
   
   # 开放端口
   ufw allow 80/tcp
   ufw allow 443/tcp
   ```

### 日志文件位置

- **部署日志**: `/var/log/aicam-deploy.log`
- **Nginx 日志**: `/var/log/nginx/`
- **Docker 日志**: `docker-compose logs`

## 备份和恢复

### 自动备份

系统会自动在每天凌晨 2 点进行备份：

```bash
# 查看备份文件
ls -la /opt/aicam-backup/

# 手动备份
cd /opt/aicam
./backup.sh
```

### 手动恢复

```bash
# 停止服务
cd /opt/aicam
./stop.sh

# 恢复备份
cp -r /opt/aicam-backup/YYYYMMDD_HHMMSS/* /opt/aicam/

# 重新启动
./start.sh
```

## 安全建议

1. **更改默认密码**
   - 修改数据库密码
   - 更新 API 密钥
   - 设置强密码策略

2. **配置 SSL 证书**
   ```bash
   # 安装 Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # 获取 SSL 证书
   sudo certbot --nginx -d your-domain.com
   ```

3. **定期更新**
   ```bash
   # 更新系统
   sudo apt update && sudo apt upgrade
   
   # 更新 Docker 镜像
   docker-compose pull
   docker-compose up -d
   ```

## 性能优化

### 系统优化

```bash
# 优化 Docker 配置
sudo nano /etc/docker/daemon.json
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# 重启 Docker
sudo systemctl restart docker
```

### 数据库优化

```bash
# 进入 MongoDB 容器
docker exec -it aicam_mongo_1 mongosh

# 创建索引
use aicam
db.experiments.createIndex({ "createdAt": -1 })
db.devices.createIndex({ "status": 1 })
```

## 联系支持

如果在部署过程中遇到问题，请：

1. 查看部署日志: `/var/log/aicam-deploy.log`
2. 检查服务状态: `cd /opt/aicam && ./status.sh`
3. 收集错误信息并提供给技术支持

## 更新日志

- **v1.0.0**: 初始版本，支持基础部署功能
- 支持自动环境检查
- 支持一键部署
- 支持健康检查
- 支持服务管理

---

**注意**: 本脚本仅适用于 Ubuntu 20.04+ 系统，其他系统可能需要手动调整。 