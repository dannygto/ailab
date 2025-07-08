# AICAM 快速部署命令

## 一键部署（推荐）

```bash
# 1. 连接到服务器
ssh root@82.156.75.232

# 2. 下载并执行部署脚本
wget -O deploy.sh https://raw.githubusercontent.com/dannygto/ailab/master/scripts/部署脚本/服务器端全自动部署脚本.sh
chmod +x deploy.sh
./deploy.sh
```

## 部署完成后验证

```bash
# 检查服务状态
cd /opt/aicam && ./status.sh

# 访问应用
curl http://82.156.75.232/health
```

## 常用管理命令

```bash
cd /opt/aicam

# 启动服务
./start.sh

# 停止服务  
./stop.sh

# 重启服务
./restart.sh

# 查看日志
./logs.sh

# 查看状态
./status.sh
```

## 访问地址

- **前端界面**: http://82.156.75.232
- **API 接口**: http://82.156.75.232:5000  
- **健康检查**: http://82.156.75.232/health

## 故障排除

```bash
# 查看部署日志
tail -f /var/log/aicam-deploy.log

# 查看容器状态
docker-compose ps

# 重新部署
cd /opt/aicam
./stop.sh
./start.sh
```

---

**注意**: 部署过程约需 10-15 分钟，请耐心等待。 