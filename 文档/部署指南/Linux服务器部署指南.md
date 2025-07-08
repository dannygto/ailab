# AICAM Linux服务器部署指南

## 前置要求

### 服务器配置
- **操作系统**: Ubuntu 20.04+ 或 CentOS 8+
- **内存**: 最少4GB，推荐8GB+
- **存储**: 最少20GB，推荐50GB+
- **CPU**: 最少2核，推荐4核+
- **网络**: 公网IP，开放80/443端口

### 域名要求
- 已注册的域名
- 域名解析指向服务器IP
- 支持SSL证书申请

## 部署步骤

### 1. 服务器环境检查
```bash
# 上传项目文件到服务器
scp -r AICAMV2/ user@your-server:/home/user/

# 进入项目目录
cd AICAMV2

# 运行环境检查
chmod +x 脚本/部署脚本/check-server-env.sh
./脚本/部署脚本/check-server-env.sh
```

### 2. 安装Docker环境
```bash
# 安装Docker和Docker Compose
chmod +x 脚本/部署脚本/install-docker.sh
./脚本/部署脚本/install-docker.sh

# 重新登录或应用组权限
newgrp docker
```

### 3. 生成生产环境配置
```bash
# 生成配置文件（替换为您的域名）
chmod +x 脚本/部署脚本/generate-prod-config.sh
./脚本/部署脚本/generate-prod-config.sh yourdomain.com

# 检查并修改配置
vim 配置/环境配置/.env.production
vim 配置/nginx/nginx.conf
```

### 4. 配置SSL证书
```bash
# 安装Certbot
sudo apt-get install certbot python3-certbot-nginx

# 申请SSL证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem 配置/SSL配置/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem 配置/SSL配置/key.pem
sudo chown $USER:$USER 配置/SSL配置/*
```

### 5. 部署应用
```bash
# 运行部署脚本
chmod +x 脚本/部署脚本/deploy.sh
./脚本/部署脚本/deploy.sh
```

### 6. 验证部署
```bash
# 健康检查
node 脚本/测试脚本/health-check.js

# 查看服务状态
docker-compose -f 配置/部署配置/docker-compose.prod.yml ps

# 查看日志
docker-compose -f 配置/部署配置/docker-compose.prod.yml logs -f
```

## 访问地址

- **主站**: https://yourdomain.com
- **API文档**: https://yourdomain.com/api/docs
- **监控面板**: http://your-server-ip:9090
- **健康检查**: https://yourdomain.com/api/health

## 运维命令

### 服务管理
```bash
# 启动服务
docker-compose -f 配置/部署配置/docker-compose.prod.yml up -d

# 停止服务
docker-compose -f 配置/部署配置/docker-compose.prod.yml down

# 重启服务
docker-compose -f 配置/部署配置/docker-compose.prod.yml restart

# 查看日志
docker-compose -f 配置/部署配置/docker-compose.prod.yml logs -f [service-name]
```

### 备份恢复
```bash
# 数据库备份
docker exec aicam-db pg_dump -U aicam_user aicam_production > 备份/db_backup_$(date +%Y%m%d_%H%M%S).sql

# 文件备份
tar -czf 备份/files_backup_$(date +%Y%m%d_%H%M%S).tar.gz 源代码 配置 资源 文档

# 数据库恢复
docker exec -i aicam-db psql -U aicam_user aicam_production < 备份/db_backup_20250101_120000.sql
```

### 监控告警
```bash
# 查看系统资源
docker stats

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看网络连接
netstat -tuln
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   netstat -tuln | grep :80
   
   # 停止占用端口的服务
   sudo systemctl stop apache2
   sudo systemctl stop nginx
   ```

2. **SSL证书问题**
   ```bash
   # 检查证书有效期
   openssl x509 -in 配置/SSL配置/cert.pem -text -noout | grep "Not After"
   
   # 续期证书
   sudo certbot renew
   ```

3. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker logs aicam-db
   
   # 进入数据库容器
   docker exec -it aicam-db psql -U aicam_user aicam_production
   ```

4. **服务启动失败**
   ```bash
   # 查看详细日志
   docker-compose -f 配置/部署配置/docker-compose.prod.yml logs [service-name]
   
   # 重新构建镜像
   docker-compose -f 配置/部署配置/docker-compose.prod.yml build --no-cache
   ```

## 安全建议

1. **防火墙配置**
   ```bash
   # 只开放必要端口
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```

2. **定期更新**
   ```bash
   # 更新系统
   sudo apt-get update && sudo apt-get upgrade
   
   # 更新Docker镜像
   docker-compose -f 配置/部署配置/docker-compose.prod.yml pull
   ```

3. **备份策略**
   - 每日自动备份数据库
   - 每周备份配置文件
   - 每月完整备份

## 性能优化

1. **Nginx优化**
   - 启用Gzip压缩
   - 配置缓存策略
   - 调整worker进程数

2. **数据库优化**
   - 调整连接池大小
   - 优化查询索引
   - 定期清理日志

3. **应用优化**
   - 启用Redis缓存
   - 配置CDN加速
   - 优化静态资源

## 联系支持

如遇到问题，请提供以下信息：
- 服务器操作系统版本
- Docker版本
- 错误日志
- 复现步骤
