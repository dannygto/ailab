#!/bin/bash
# AICAM服务开机自启动设置脚本
# 此脚本用于在Linux服务器上设置AICAM服务开机自动启动

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}        AICAM服务开机自启动设置                  ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}请以root权限运行此脚本${NC}"
  echo "使用命令: sudo $0"
  exit 1
fi

# 设置工作目录
INSTALL_DIR="/home/aicam/aicam-platform"
SERVICE_NAME="aicam"
USERNAME="aicam"

# 检查安装目录是否存在
if [ ! -d "$INSTALL_DIR" ]; then
  echo -e "${RED}错误: 安装目录 $INSTALL_DIR 不存在${NC}"
  echo "请先部署AICAM平台"
  exit 1
fi

# 检查启动脚本是否存在
if [ ! -f "$INSTALL_DIR/scripts/linux-server-start.sh" ]; then
  echo -e "${RED}错误: 启动脚本不存在${NC}"
  echo "请确保已同步完整的AICAM平台文件"
  exit 1
fi

# 确保启动脚本有执行权限
chmod +x "$INSTALL_DIR/scripts/linux-server-start.sh"
chmod +x "$INSTALL_DIR/scripts/linux-server-stop.sh"

echo -e "${YELLOW}步骤1: 创建systemd服务文件...${NC}"

# 创建systemd服务文件
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=AICAM Platform Service
After=network.target

[Service]
Type=forking
User=$USERNAME
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/scripts/linux-server-start.sh
ExecStop=$INSTALL_DIR/scripts/linux-server-stop.sh
Restart=on-failure
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=aicam

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓ systemd服务文件已创建${NC}"

# 设置日志目录
echo -e "${YELLOW}步骤2: 创建日志目录...${NC}"
mkdir -p "$INSTALL_DIR/logs"
chown -R $USERNAME:$USERNAME "$INSTALL_DIR/logs"
echo -e "${GREEN}✓ 日志目录已创建${NC}"

# 配置防火墙
echo -e "${YELLOW}步骤3: 配置防火墙...${NC}"

# 检测防火墙类型
if command -v ufw &> /dev/null; then
    echo "检测到ufw防火墙"
    
    # 开放必要端口
    ufw allow 22/tcp
    ufw allow 3000/tcp
    ufw allow 3002/tcp
    ufw allow 5000/tcp
    
    echo -e "${GREEN}✓ 已配置ufw防火墙规则${NC}"
    
elif command -v firewall-cmd &> /dev/null; then
    echo "检测到firewalld防火墙"
    
    # 开放必要端口
    firewall-cmd --permanent --add-port=22/tcp
    firewall-cmd --permanent --add-port=3000/tcp
    firewall-cmd --permanent --add-port=3002/tcp
    firewall-cmd --permanent --add-port=5000/tcp
    firewall-cmd --reload
    
    echo -e "${GREEN}✓ 已配置firewalld防火墙规则${NC}"
    
else
    echo -e "${YELLOW}⚠️ 未检测到支持的防火墙系统${NC}"
    echo "请手动开放以下端口:"
    echo "  - 22 (SSH)"
    echo "  - 3000 (前端服务)"
    echo "  - 3002 (后端服务)"
    echo "  - 5000 (AI服务)"
fi

# 启用并启动服务
echo -e "${YELLOW}步骤4: 启用并启动服务...${NC}"
systemctl daemon-reload
systemctl enable $SERVICE_NAME.service
systemctl start $SERVICE_NAME.service

# 检查服务状态
sleep 5
if systemctl is-active --quiet $SERVICE_NAME.service; then
    echo -e "${GREEN}✓ AICAM服务已成功启动并设置为开机自启动${NC}"
else
    echo -e "${RED}❌ AICAM服务启动失败，请检查日志${NC}"
    echo "查看日志命令: journalctl -u $SERVICE_NAME.service"
fi

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}AICAM服务开机自启动设置完成!${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""
echo "服务信息:"
echo "  - 服务名称: $SERVICE_NAME"
echo "  - 安装目录: $INSTALL_DIR"
echo "  - 日志目录: $INSTALL_DIR/logs"
echo ""
echo "服务管理命令:"
echo "  - 启动服务: sudo systemctl start $SERVICE_NAME"
echo "  - 停止服务: sudo systemctl stop $SERVICE_NAME"
echo "  - 重启服务: sudo systemctl restart $SERVICE_NAME"
echo "  - 查看状态: sudo systemctl status $SERVICE_NAME"
echo "  - 查看日志: sudo journalctl -u $SERVICE_NAME"
echo ""
echo "开放的端口:"
echo "  - 22: SSH连接"
echo "  - 3000: 前端服务"
echo "  - 3002: 后端服务"
echo "  - 5000: AI服务"
echo ""
echo -e "${YELLOW}注意: 请确保以上端口在云服务器安全组/防火墙中已开放${NC}"
