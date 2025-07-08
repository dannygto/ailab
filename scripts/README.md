# AICAM 脚本目录

## 目录结构

```
scripts/
├── deployment/          # 部署相关脚本
│   ├── linux/          # Linux 部署脚本
│   │   ├── auto-deploy.sh      # 服务器端全自动部署脚本
│   │   ├── deployment-guide.md # 详细部署指南
│   │   └── quick-commands.md   # 快速部署命令
│   └── windows/        # Windows 部署脚本
├── maintenance/         # 维护脚本
│   ├── cleanup.js      # 项目清理工具
│   └── health-check.js # 项目健康检查工具
├── development/         # 开发脚本
└── utils/              # 工具脚本
```

## 快速开始

### Linux 部署
```bash
# 一键部署
wget -O deploy.sh https://raw.githubusercontent.com/dannygto/ailab/master/scripts/deployment/linux/auto-deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### 项目维护
```bash
# 清理项目
node scripts/maintenance/cleanup.js

# 健康检查
node scripts/maintenance/health-check.js
```

## 脚本说明

### 部署脚本 (deployment/)

#### Linux 部署
- **auto-deploy.sh**: Linux 服务器全自动部署脚本
  - 自动检查系统环境
  - 安装必要软件 (Docker, Node.js, Nginx)
  - 拉取最新代码
  - 构建和部署应用
  - 配置反向代理和防火墙
  - 健康检查和状态监控

- **deployment-guide.md**: 详细部署指南
  - 系统要求
  - 部署步骤
  - 故障排除
  - 安全建议

- **quick-commands.md**: 快速部署命令
  - 一键部署命令
  - 常用管理命令
  - 访问地址

### 维护脚本 (maintenance/)

#### cleanup.js
项目清理工具，清理以下内容：
- `node_modules` 目录
- 构建产物 (`build`, `dist`)
- 临时文件 (`logs`, `temp`, `.cache`)
- 测试覆盖率文件 (`coverage`, `.nyc_output`)

#### health-check.js
项目健康检查工具，检查：
- 必要文件是否存在
- 目录结构是否完整
- 配置文件是否齐全
- 依赖文件状态
- Git 仓库状态

## 使用示例

### 1. 部署到 Linux 服务器

```bash
# 连接到服务器
ssh root@82.156.75.232

# 下载并执行部署脚本
wget -O deploy.sh https://raw.githubusercontent.com/dannygto/ailab/master/scripts/deployment/linux/auto-deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### 2. 项目维护

```bash
# 清理项目
node scripts/maintenance/cleanup.js

# 检查项目健康状态
node scripts/maintenance/health-check.js
```

### 3. 服务管理 (部署后)

```bash
cd /opt/aicam

# 查看服务状态
./status.sh

# 启动服务
./start.sh

# 停止服务
./stop.sh

# 重启服务
./restart.sh

# 查看日志
./logs.sh
```

## 访问地址

部署完成后，可通过以下地址访问：

- **前端界面**: http://82.156.75.232
- **API 接口**: http://82.156.75.232:5000
- **健康检查**: http://82.156.75.232/health

## 故障排除

### 常见问题

1. **Git 拉取失败**
   ```bash
   # 网络问题，尝试使用代理或更换网络
   git config --global http.proxy http://proxy:port
   ```

2. **Docker 构建失败**
   ```bash
   # 清理 Docker 缓存
   docker system prune -a
   docker-compose build --no-cache
   ```

3. **端口被占用**
   ```bash
   # 查看端口占用
   netstat -tlnp | grep :80
   
   # 停止占用进程
   sudo kill -9 <PID>
   ```

### 日志文件

- **部署日志**: `/var/log/aicam-deploy.log`
- **Nginx 日志**: `/var/log/nginx/`
- **Docker 日志**: `docker-compose logs`

## 注意事项

1. **系统要求**
   - Ubuntu 20.04 或更高版本
   - 至少 4GB RAM
   - 至少 10GB 可用磁盘空间

2. **网络要求**
   - 开放端口: 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - 稳定的互联网连接

3. **安全建议**
   - 部署后立即更改默认密码
   - 配置 SSL 证书
   - 定期更新系统和依赖

## 更新日志

- **v1.0.0**: 初始版本
  - 支持 Linux 全自动部署
  - 项目清理和健康检查工具
  - 标准化目录结构

---

**注意**: 本脚本仅适用于 Ubuntu 20.04+ 系统，其他系统可能需要手动调整。 