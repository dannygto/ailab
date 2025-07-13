# AILAB项目 - 人工智能实验平台

这是一个专为K12教育设计的人工智能实验教学平台，提供完整的实验管理、AI助手、设备控制等功能。

## 🚀 快速开始

### 本地开发
```bash
# 安装依赖
npm install

# 启动前端开发服务器
cd src/frontend && npm start

# 启动后端开发服务器
cd src/backend && npm run dev
```

### 生产部署
```bash
# 使用快速部署脚本（推荐）
./quick-deploy.sh

# 或手动部署
./scripts/deployment/minimal-fix.sh
```

## 🌐 服务器信息

**生产服务器配置:**
- 服务器IP: `82.156.75.232`
- SSH用户: `root`
- 密钥文件: `ailab.pem` (项目根目录)
- 项目路径: `/root/ailab/`

**访问地址:**
- 前端: http://82.156.75.232:3000
- 后端API: http://82.156.75.232:3001
- API健康检查: http://82.156.75.232:3001/api/health

**SSH连接:**
```bash
ssh -i "ailab.pem" root@82.156.75.232
```

## 📁 项目结构

```
ailab/
├── src/
│   ├── frontend/          # React前端应用
│   ├── backend/           # Node.js后端API
│   └── ai-service/        # Python AI服务
├── scripts/
│   └── deployment/        # 部署脚本
├── docs/                  # 项目文档
├── config/               # 配置文件
├── ailab.pem            # SSH密钥文件
├── server-config.txt    # 服务器配置信息
└── quick-deploy.sh      # 快速部署脚本
```

## ⚙️ 配置说明

### 环境变量
前端配置文件: `src/frontend/.env.production`
```
REACT_APP_API_URL=/api
```

后端配置: `src/backend/.env`
```
PORT=3001
NODE_ENV=production
```

### PM2配置
服务通过PM2管理，配置文件: `ecosystem.config.js`

查看服务状态:
```bash
pm2 status
pm2 logs
```

## 🔧 常见问题

### 1. 实验列表乱码
- 问题：前端显示乱码字符
- 解决：文件编码问题，已修复为UTF-8

### 2. 主题设置无法保存
- 问题：设置页面无法保存配置
- 解决：已添加API端点支持设置保存

### 3. 帮助中心链接错误
- 问题：链接指向错误域名
- 解决：已更新为正确的内部链接

### 4. SSH连接问题
- 问题：密钥文件名或路径错误
- 解决：使用正确的密钥文件 `ailab.pem`

## 📋 开发指南

### 代码提交
```bash
git add .
git commit -m "描述修改内容"
git push origin main
```

### 部署更新
```bash
# 构建前端
cd src/frontend && npm run build

# 快速部署到服务器
./quick-deploy.sh
```

### 监控服务
```bash
# 连接服务器
ssh -i "ailab.pem" root@82.156.75.232

# 查看服务状态
pm2 status
pm2 logs
pm2 monit

# 查看系统资源
free -h
df -h
```

## 📞 技术支持

- 邮箱: support@sslab.edu.cn
- 电话: 400-888-9999
- 项目维护: AILAB开发团队

## ⚠️ 重要提醒

1. **密钥文件**: 确保使用正确的 `ailab.pem` 文件
2. **服务器信息**: IP `82.156.75.232`, 用户 `root`
3. **端口配置**: 前端3000, 后端3001
4. **编码问题**: 所有文件保持UTF-8编码
5. **部署脚本**: 优先使用 `quick-deploy.sh` 进行部署

---
*最后更新: 2025年7月13日*
