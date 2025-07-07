# AI实验平台启动指南

## 🚀 快速启动

### ⚡ 一键启动 (推荐)

#### VS Code 任务启动
1. 在VS Code中打开项目
2. `Ctrl+Shift+P` → "Tasks: Run Task" → "Start All Services"

#### 命令行启动
```bash
# 进入项目目录
cd D:\AICAMV2

# 方式1: npm启动（推荐）
npm start

# 方式2: PowerShell脚本
powershell -ExecutionPolicy Bypass -File smart-start.ps1
```

### 🔧 手动启动
```bash
# 1. 安装所有依赖
npm install
cd frontend && npm install && cd ../backend && npm install && cd ..

# 2. 分别启动前后端
# 终端1: 启动前端
cd frontend && npm start

# 终端2: 启动后端  
cd backend && npm run dev
```

## 🌐 访问地址

启动成功后，访问以下地址：

- **前端应用**: http://localhost:3001
- **后端API**: http://localhost:3002
- **API健康检查**: http://localhost:3002/health

## 📋 可用任务

### VS Code 任务
- **Start All Services** - 同时启动前后端服务
- **Start Frontend Only** - 仅启动前端服务
- **Start Backend Only** - 仅启动后端服务
- **Stop All Services** - 停止所有服务
- **Install All Dependencies** - 安装所有依赖

### PowerShell 脚本
- `smart-start.ps1` - 智能启动脚本
- `stop-platform.ps1` - 停止所有服务
- `system-check.ps1` - 系统环境检查

## ⚙️ 环境要求

### 必需环境
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **操作系统**: Windows (已配置)

### 可选环境
- **MongoDB**: 本地安装或云端服务
- **Git**: 版本控制
- **VS Code**: 推荐IDE

## 🔧 环境检查

运行环境检查脚本：
```bash
powershell -ExecutionPolicy Bypass -File system-check.ps1
```

## 📝 启动问题排查

### 常见问题

#### 1. 端口被占用
```bash
# 检查端口占用
netstat -ano | findstr :3001
netstat -ano | findstr :3002

# 停止占用进程
taskkill /PID <进程ID> /F
```

#### 2. 依赖安装失败
```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules重新安装
Remove-Item node_modules -Recurse -Force
npm install
```

#### 3. 权限问题
```bash
# 以管理员身份运行PowerShell
powershell -ExecutionPolicy Bypass -File smart-start.ps1
```

### 日志查看

启动时注意查看控制台输出：
- ✅ 绿色信息：成功启动
- ⚠️ 黄色警告：可能的问题
- ❌ 红色错误：需要处理的错误

## 🎯 验证启动成功

### 前端验证
1. 浏览器访问 http://localhost:3001
2. 应该看到登录界面
3. 界面加载正常，无控制台错误

### 后端验证
1. 浏览器访问 http://localhost:3002/health
2. 应该返回 `{"status": "ok"}`
3. 控制台显示服务启动信息

### 功能验证
1. 用户注册/登录功能
2. 实验管理功能
3. 设备监控功能
4. AI助手功能

## 📞 获得帮助

如果遇到问题：
1. 查看控制台错误信息
2. 运行系统检查脚本
3. 查阅项目文档
4. 检查网络连接和防火墙设置

---

**更新时间**: 2025年6月25日  
**适用版本**: v1.0.0-beta  
**维护者**: AI Assistant & 开发团队
