#!/bin/bash

echo "🔍 开始服务器环境检查..."

# 系统信息检查
echo "\n📊 系统信息:"
echo "操作系统: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "内核版本: $(uname -r)"
echo "CPU核心数: $(nproc)"
echo "内存大小: $(free -h | grep Mem | awk '{print $2}')"
echo "磁盘空间: $(df -h / | tail -1 | awk '{print $4}')"

# 网络检查
echo "\n🌐 网络信息:"
echo "公网IP: $(curl -s ifconfig.me)"
echo "内网IP: $(hostname -I | awk '{print $1}')"
echo "DNS解析: $(cat /etc/resolv.conf | grep nameserver | head -1 | awk '{print $2}')"

# 端口检查
echo "\n🔌 端口检查:"
ports=(80 443 3000 8000 8001 5432 6379)
for port in "${ports[@]}"; do
  if netstat -tuln | grep ":$port " > /dev/null; then
    echo "端口 $port: ❌ 已被占用"
  else
    echo "端口 $port: ✅ 可用"
  fi
done

# Docker检查
echo "\n🐳 Docker环境检查:"
if command -v docker &> /dev/null; then
  echo "Docker版本: $(docker --version)"
  echo "Docker服务状态: $(systemctl is-active docker)"
else
  echo "❌ Docker未安装"
fi

if command -v docker-compose &> /dev/null; then
  echo "Docker Compose版本: $(docker-compose --version)"
else
  echo "❌ Docker Compose未安装"
fi

# 防火墙检查
echo "\n🔥 防火墙状态:"
if command -v ufw &> /dev/null; then
  echo "UFW状态: $(ufw status)"
elif command -v firewall-cmd &> /dev/null; then
  echo "Firewalld状态: $(firewall-cmd --state)"
else
  echo "⚠️  未检测到防火墙"
fi

# SSL证书检查
echo "\n🔐 SSL证书检查:"
if [ -d "/etc/letsencrypt" ]; then
  echo "Let's Encrypt目录存在"
  ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "暂无证书"
else
  echo "Let's Encrypt目录不存在"
fi

echo "\n✅ 环境检查完成"
