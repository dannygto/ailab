# AILAB 项目 - 重要配置信息总结

## 🔑 服务器信息 (必须牢记!)

**基本信息:**
- IP地址: `82.156.75.232`
- 用户名: `ubuntu` ❗ (不是root)
- SSH端口: `22`
- 密钥文件: `ailab.pem` ❗ (不是aws-key.pem)

**连接命令:**
```bash
ssh -i "ailab.pem" ubuntu@82.156.75.232
```

**文件传输:**
```bash
# 上传
scp -i "ailab.pem" [本地文件] ubuntu@82.156.75.232:/home/ubuntu/ailab/[目标路径]

# 下载
scp -i "ailab.pem" ubuntu@82.156.75.232:/home/ubuntu/ailab/[远程文件] [本地路径]
```

## 📁 目录结构

**服务器路径:**
- 项目根目录: `/home/ubuntu/ailab/`
- 前端目录: `/home/ubuntu/ailab/src/frontend/`
- 后端目录: `/home/ubuntu/ailab/src/backend/`
- 构建目录: `/home/ubuntu/ailab/src/frontend/build/`

**本地路径:**
- 项目根目录: `D:\ailab\ailab\`
- 密钥文件: `D:\ailab\ailab\ailab.pem`
- 前端源码: `D:\ailab\ailab\src\frontend\`
- 后端源码: `D:\ailab\ailab\src\backend\`

## 🌐 访问地址

- **前端**: http://82.156.75.232:3000
- **后端API**: http://82.156.75.232:3001
- **健康检查**: http://82.156.75.232:3001/api/health

## 🚀 快速部署

**方法1: 使用批处理脚本 (推荐)**
```cmd
quick-deploy.bat
```

**方法2: 使用bash脚本**
```bash
./quick-deploy.sh
```

**方法3: 手动部署**
```bash
# 1. 构建前端
cd src/frontend && npm run build

# 2. 上传文件
scp -i "ailab.pem" -r src/frontend/build/* ubuntu@82.156.75.232:/home/ubuntu/ailab/src/frontend/build/

# 3. 重启服务
ssh -i "ailab.pem" ubuntu@82.156.75.232 "cd /home/ubuntu/ailab && pm2 restart all"
```

## 🔧 问题修复记录

### 已修复的问题:

1. **实验列表乱码** ✅
   - 问题: 前端显示乱码字符
   - 修复: 更新了ExperimentListV2.tsx的编码

2. **主题设置无法保存** ✅
   - 问题: 设置页面保存功能不工作
   - 修复: 添加了API调用，支持POST请求保存

3. **网站基本信息无法修改** ✅
   - 问题: 通用设置页面保存失败
   - 修复: 更新了GeneralSettings.tsx的保存逻辑

4. **帮助中心链接错误** ✅
   - 问题: 链接指向错误的域名
   - 修复: 更新为正确的内部链接和邮箱

5. **SSH连接混乱** ✅
   - 问题: 总是使用错误的密钥和用户名
   - 修复: 创建了配置文件和快速连接脚本

## 📋 常用命令

**服务器管理:**
```bash
# 连接服务器
ssh -i "ailab.pem" ubuntu@82.156.75.232

# 查看PM2状态
pm2 status

# 查看日志
pm2 logs

# 重启所有服务
pm2 restart all

# 查看系统资源
free -h && df -h
```

**本地开发:**
```bash
# 前端开发
cd src/frontend && npm start

# 后端开发
cd src/backend && npm run dev

# 前端构建
cd src/frontend && npm run build
```

## ⚠️ 重要提醒

1. **密钥文件**: 永远使用 `ailab.pem` (不是aws-key.pem)
2. **用户名**: 永远使用 `ubuntu` (不是root)
3. **IP地址**: 永远使用 `82.156.75.232`
4. **项目路径**: 服务器上是 `/home/ubuntu/ailab/` (不是/root/ailab/)
5. **编码问题**: 所有文件保持UTF-8编码，避免乱码
6. **部署顺序**: 先构建前端，再上传文件，最后重启服务

## 📞 联系信息

- 邮箱: support@sslab.edu.cn
- 电话: 400-888-9999
- 技术支持: AILAB开发团队

---
**最后更新**: 2025年7月13日
**维护者**: 请严格按照此配置进行操作，避免重复错误！
