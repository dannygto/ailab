# AILAB平台 - 低配置服务器优化建议

## 服务器配置: 2核4G无显卡

### 当前问题分析

1. **前端serve ESM错误**: 
   - 原因: PM2在fork模式下无法正确require ES模块
   - 解决: 使用npx serve或全局serve启动

2. **AI服务motor依赖缺失**:
   - 原因: Python依赖未正确安装
   - 解决: 强制重新安装motor依赖

3. **服务器资源限制**:
   - 2核4G配置对于完整AILAB平台较为吃紧
   - 无显卡影响AI服务性能

### 当前问题的立即解决方案

根据你的服务器日志，有以下问题：

1. **路径错误**: 脚本在错误的目录运行
2. **前端serve ESM错误**: 仍然存在
3. **AI服务重复崩溃**: motor依赖问题

**推荐立即执行**:
```bash
cd /home/ubuntu/ailab
# 使用最小化脚本（仅启动前后端，适合2核4G）
chmod +x scripts/deployment/minimal-fix.sh
./scripts/deployment/minimal-fix.sh
```

这个脚本会：
- ✅ 自动检测正确的目录结构
- ✅ 创建最小化配置（仅前后端）
- ✅ 修复serve的ESM问题
- ✅ 启用swap分区
- ✅ 设置内存限制防止OOM
- ✅ 跳过资源密集的AI服务

### 优化建议

#### 立即修复 (推荐用最小化脚本)
```bash
cd /home/ubuntu/ailab
chmod +x scripts/deployment/minimal-fix.sh
./scripts/deployment/minimal-fix.sh
```

**或者** 使用完整修复脚本:
```bash
cd /home/ubuntu/ailab
chmod +x scripts/deployment/quick-fix-current.sh
./scripts/deployment/quick-fix-current.sh
```

#### 资源优化配置

1. **禁用AI服务** (节省资源):
```bash
pm2 stop ailab-ai-service
pm2 delete ailab-ai-service
```

2. **限制Node.js内存使用**:
```bash
# 在PM2配置中添加内存限制
node_args: ['--max-old-space-size=1024']
```

3. **启用swap分区** (增加虚拟内存):
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### 最小化部署方案

对于2核4G服务器，建议只运行核心服务：

```javascript
// 最小化ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'ailab-backend',
      cwd: './src/backend/backend',
      script: 'src/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm --max-old-space-size=1024',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'ailab-frontend',
      cwd: './src/frontend',
      script: '/usr/bin/npx',
      args: ['serve', '-s', 'build', '-l', '3000'],
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
```

#### 监控和维护

1. **监控内存使用**:
```bash
pm2 monit
htop
free -h
```

2. **定期清理日志**:
```bash
pm2 flush
pm2 reloadLogs
```

3. **设置定时重启** (防止内存泄漏):
```bash
# 每天凌晨2点重启
echo "0 2 * * * pm2 restart all" | crontab -
```

### 升级服务器建议

如需完整功能，建议升级到：
- **CPU**: 4核心或以上
- **内存**: 8GB或以上  
- **磁盘**: SSD 40GB或以上
- **GPU**: 可选，用于AI服务加速

### 故障排除

1. **服务无法启动**: 检查内存是否充足
2. **响应缓慢**: 可能是swap在工作，属正常现象
3. **频繁重启**: 检查是否内存不足导致OOM

### 紧急处理命令

```bash
# 完全重置PM2
pm2 kill
pm2 start ecosystem.config.js

# 检查系统资源
df -h
free -h
ps aux --sort=-%mem | head

# 清理系统缓存
sudo sync && sudo sysctl -w vm.drop_caches=3
```
