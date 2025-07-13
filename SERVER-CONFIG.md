# AILAB服务器配置信息

## 远程服务器信息
- **服务器IP**: 82.156.75.232
- **用户名**: ubuntu
- **SSH端口**: 22
- **密钥文件**: C:\Users\admin\.ssh\aws-key.pem
- **项目路径**: /home/ubuntu/ailab/

## SSH连接命令
```bash
ssh -i "C:\Users\admin\.ssh\aws-key.pem" ubuntu@82.156.75.232
```

## SCP文件传输命令
```bash
# 上传文件到服务器
scp -i "C:\Users\admin\.ssh\aws-key.pem" local_file ubuntu@82.156.75.232:/home/ubuntu/ailab/

# 上传目录到服务器
scp -i "C:\Users\admin\.ssh\aws-key.pem" -r local_dir ubuntu@82.156.75.232:/home/ubuntu/ailab/

# 从服务器下载文件
scp -i "C:\Users\admin\.ssh\aws-key.pem" ubuntu@82.156.75.232:/home/ubuntu/ailab/remote_file ./
```

## 服务访问地址
- **前端**: http://82.156.75.232:3000
- **后端API**: http://82.156.75.232:3001
- **健康检查**: http://82.156.75.232:3001/api/health

## 常用部署命令
```bash
# 连接服务器
ssh -i "C:\Users\admin\.ssh\aws-key.pem" ubuntu@82.156.75.232

# 在服务器上运行部署脚本
cd /home/ubuntu/ailab && bash scripts/deployment/minimal-fix.sh

# 查看PM2状态
pm2 status

# 查看服务日志
pm2 logs

# 重启服务
pm2 restart all
```

## 注意事项
1. 密钥文件权限必须是600 (仅所有者可读写)
2. 如果连接超时，检查防火墙设置
3. 服务器时区为UTC+8
4. 使用Ubuntu 20.04 LTS
