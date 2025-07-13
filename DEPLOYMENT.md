# AILAB 服务器连接配置

## 重要配置信息 - 请牢记！

### 服务器信息
- **IP地址**: 82.156.75.232
- **用户名**: root (不是ubuntu!)
- **SSH端口**: 22
- **密钥文件**: ailab.pem (项目根目录，不是aws-key.pem!)

### 连接命令模板
```bash
# SSH连接
ssh -i "ailab.pem" root@82.156.75.232

# SCP上传文件
scp -i "ailab.pem" [本地文件] root@82.156.75.232:/root/ailab/[目标路径]

# SCP下载文件  
scp -i "ailab.pem" root@82.156.75.232:/root/ailab/[文件路径] [本地路径]
```

### 服务器路径
- **项目根目录**: /root/ailab/
- **前端路径**: /root/ailab/src/frontend/
- **后端路径**: /root/ailab/src/backend/
- **构建文件**: /root/ailab/src/frontend/build/

### 端口信息
- **前端**: 3000
- **后端**: 3001  
- **AI服务**: 8000

### 访问URL
- **前端**: http://82.156.75.232:3000
- **后端API**: http://82.156.75.232:3001
- **健康检查**: http://82.156.75.232:3001/api/health

## 常见错误避免

❌ **错误的配置**:
- 密钥文件: aws-key.pem
- 用户名: ubuntu
- 项目路径: /home/ubuntu/ailab/
- IP地址: 其他错误IP

✅ **正确的配置**:
- 密钥文件: ailab.pem  
- 用户名: root
- 项目路径: /root/ailab/
- IP地址: 82.156.75.232

## 部署流程

1. **本地构建**:
   ```bash
   cd src/frontend
   npm run build
   ```

2. **快速部署**:
   ```bash
   ./quick-deploy.sh
   ```

3. **手动部署**:
   ```bash
   # 上传前端构建文件
   scp -i "ailab.pem" -r src/frontend/build/* root@82.156.75.232:/root/ailab/src/frontend/build/
   
   # 上传后端代码
   scp -i "ailab.pem" -r src/backend/src/* root@82.156.75.232:/root/ailab/src/backend/src/
   
   # 重启服务
   ssh -i "ailab.pem" root@82.156.75.232 "cd /root/ailab && pm2 restart all"
   ```

---
**最后更新**: 2025年7月13日
**维护者**: 请保持此文件信息准确性！
