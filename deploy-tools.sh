#!/bin/bash
# AILAB部署配置 - 服务器信息

# 远程服务器配置
SERVER_IP="82.156.75.232"
SERVER_USER="ubuntu"
SSH_KEY_PATH="C:/Users/admin/.ssh/aws-key.pem"
SERVER_PROJECT_PATH="/home/ubuntu/ailab"

# 本地项目配置
LOCAL_PROJECT_PATH="D:/ailab/ailab"
FRONTEND_BUILD_PATH="$LOCAL_PROJECT_PATH/src/frontend/build"
BACKEND_PATH="$LOCAL_PROJECT_PATH/src/backend"

# 服务端口配置
FRONTEND_PORT="3000"
BACKEND_PORT="3001"

# SSH连接函数
connect_server() {
    ssh -i "$SSH_KEY_PATH" $SERVER_USER@$SERVER_IP "$@"
}

# SCP上传函数
upload_file() {
    local local_path="$1"
    local remote_path="$2"
    scp -i "$SSH_KEY_PATH" -r "$local_path" $SERVER_USER@$SERVER_IP:"$remote_path"
}

# SCP下载函数
download_file() {
    local remote_path="$1"
    local local_path="$2"
    scp -i "$SSH_KEY_PATH" -r $SERVER_USER@$SERVER_IP:"$remote_path" "$local_path"
}

# 快速部署函数
quick_deploy() {
    echo "正在连接服务器并运行部署脚本..."
    connect_server "cd $SERVER_PROJECT_PATH && bash scripts/deployment/minimal-fix.sh"
}

# 查看服务状态
check_status() {
    echo "检查远程服务器PM2状态..."
    connect_server "pm2 status"
}

# 查看服务日志
check_logs() {
    echo "查看远程服务器日志..."
    connect_server "pm2 logs"
}

# 重启服务
restart_services() {
    echo "重启远程服务器服务..."
    connect_server "pm2 restart all"
}

# 使用说明
if [ $# -eq 0 ]; then
    echo "AILAB部署工具使用说明:"
    echo "  $0 connect          - 连接到远程服务器"
    echo "  $0 deploy           - 运行快速部署"
    echo "  $0 status           - 查看服务状态"
    echo "  $0 logs             - 查看服务日志"
    echo "  $0 restart          - 重启所有服务"
    echo "  $0 upload <local> <remote> - 上传文件到服务器"
    echo "  $0 download <remote> <local> - 从服务器下载文件"
fi

# 命令处理
case "$1" in
    connect)
        connect_server
        ;;
    deploy)
        quick_deploy
        ;;
    status)
        check_status
        ;;
    logs)
        check_logs
        ;;
    restart)
        restart_services
        ;;
    upload)
        upload_file "$2" "$3"
        ;;
    download)
        download_file "$2" "$3"
        ;;
    *)
        echo "未知命令: $1"
        echo "运行 $0 查看使用说明"
        ;;
esac
