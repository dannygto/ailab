# AILAB 远程服务器配置信息

## 服务器基本信息
- **服务器IP**: 82.156.75.232
- **操作系统**: Ubuntu 20.04+
- **SSH连接**: `ssh root@82.156.75.232`
- **部署目录**: `/home/ubuntu/ailab/` 或 `/root/ailab/`

## 服务端口配置
- **前端服务**: 3000
- **后端API**: 3001  
- **AI服务**: 8001
- **MongoDB**: 27017
- **Redis**: 6379

## 访问地址
- **前端界面**: http://82.156.75.232:3000
- **后端API**: http://82.156.75.232:3001
- **健康检查**: http://82.156.75.232:3001/api/health
- **AI服务**: http://82.156.75.232:8001

## SSH连接示例
```bash
# 直接连接
ssh root@82.156.75.232

# 使用密钥连接（如有）
ssh -i /path/to/key.pem root@82.156.75.232
```

## 常用部署命令
```bash
# 连接到服务器
ssh root@82.156.75.232

# 进入项目目录
cd /home/ubuntu/ailab

# 拉取最新代码
git pull origin main

# 运行最小化部署脚本
./scripts/deployment/minimal-fix.sh

# 查看PM2状态
pm2 status

# 查看服务日志
pm2 logs
```

## 防火墙配置
```bash
# 开放必要端口
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 3000/tcp # 前端
sudo ufw allow 3001/tcp # 后端
sudo ufw enable
```
