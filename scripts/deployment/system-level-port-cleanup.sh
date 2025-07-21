#!/bin/bash

# 系统级端口清理脚本（需要root权限）

set -e

echo "=========================================="
echo "🔧 系统级端口强制清理"
echo "=========================================="

# 1. 显示当前端口占用情况
echo "📊 当前端口占用情况:"
echo "--- 端口 3000 ---"
lsof -i:3000 2>/dev/null || echo "端口 3000 未被占用"
echo "--- 端口 3001 ---"
lsof -i:3001 2>/dev/null || echo "端口 3001 未被占用"
echo "--- 端口 3002 ---"
lsof -i:3002 2>/dev/null || echo "端口 3002 未被占用"

echo ""
echo "--- netstat 检查 ---"
netstat -tulpn | grep -E ":(3000|3001|3002)" || echo "未发现相关端口监听"

# 2. 强制杀死所有相关进程
echo ""
echo "🔪 强制杀死所有相关进程..."

# 杀死所有node进程
echo "杀死所有node进程..."
sudo pkill -9 -f "node" 2>/dev/null || true

# 杀死所有npm进程
echo "杀死所有npm进程..."
sudo pkill -9 -f "npm" 2>/dev/null || true

# 杀死所有next进程
echo "杀死所有next进程..."
sudo pkill -9 -f "next" 2>/dev/null || true

# 杀死所有ts-node进程
echo "杀死所有ts-node进程..."
sudo pkill -9 -f "ts-node" 2>/dev/null || true

# 3. 按端口强制杀死进程
echo ""
echo "🎯 按端口强制杀死进程..."

for port in 3000 3001 3002; do
    echo "清理端口 $port..."

    # 使用lsof杀死
    sudo lsof -ti:$port | xargs -r sudo kill -9 2>/dev/null || true

    # 使用fuser杀死（如果可用）
    sudo fuser -k $port/tcp 2>/dev/null || true

    # 使用netstat + awk杀死
    netstat -tulpn | grep :$port | awk '{print $7}' | cut -d'/' -f1 | xargs -r sudo kill -9 2>/dev/null || true
done

# 4. 清理PM2
echo ""
echo "🧹 清理PM2..."
pm2 kill || true
pm2 flush || true

# 5. 等待系统清理
echo ""
echo "⏳ 等待系统清理..."
sleep 10

# 6. 再次检查端口状态
echo ""
echo "🔍 再次检查端口状态..."
for port in 3000 3001 3002; do
    if lsof -i:$port >/dev/null 2>&1; then
        echo "❌ 端口 $port 仍被占用:"
        lsof -i:$port
    else
        echo "✅ 端口 $port 已完全释放"
    fi
done

echo ""
echo "--- 最终netstat检查 ---"
netstat -tulpn | grep -E ":(3000|3001|3002)" || echo "✅ 所有目标端口已释放"

echo ""
echo "=========================================="
echo "✅ 系统级端口清理完成"
echo "=========================================="
echo ""
echo "💡 现在可以安全启动服务了！"
