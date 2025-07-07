#!/bin/bash
# 远程服务器停止脚本
# 用于在Linux环境中停止AICAM平台的所有服务

echo "======================================================="
echo "         AICAM平台远程服务器停止脚本                  "
echo "======================================================="
echo ""

# 设置工作目录
WORK_DIR=$(pwd)
LOGS_DIR="$WORK_DIR/logs"

# 检查日志目录是否存在
if [ ! -d "$LOGS_DIR" ]; then
    echo "⚠️ 警告：日志目录不存在，可能没有服务在运行"
    exit 0
fi

# 停止前端服务
stop_frontend_service() {
    if [ -f "$LOGS_DIR/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$LOGS_DIR/frontend.pid")
        echo "停止前端服务 (PID: $FRONTEND_PID)..."
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            sleep 1
            if kill -0 $FRONTEND_PID 2>/dev/null; then
                echo "前端服务没有立即响应，尝试强制终止..."
                kill -9 $FRONTEND_PID 2>/dev/null
            fi
            echo "✅ 前端服务已停止"
        else
            echo "⚠️ 前端服务未在运行"
        fi
        rm -f "$LOGS_DIR/frontend.pid"
    else
        echo "⚠️ 找不到前端服务的PID文件"
    fi
}

# 停止后端服务
stop_backend_service() {
    if [ -f "$LOGS_DIR/backend.pid" ]; then
        BACKEND_PID=$(cat "$LOGS_DIR/backend.pid")
        echo "停止后端服务 (PID: $BACKEND_PID)..."
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            sleep 1
            if kill -0 $BACKEND_PID 2>/dev/null; then
                echo "后端服务没有立即响应，尝试强制终止..."
                kill -9 $BACKEND_PID 2>/dev/null
            fi
            echo "✅ 后端服务已停止"
        else
            echo "⚠️ 后端服务未在运行"
        fi
        rm -f "$LOGS_DIR/backend.pid"
    else
        echo "⚠️ 找不到后端服务的PID文件"
    fi
}

# 停止AI服务
stop_ai_service() {
    if [ -f "$LOGS_DIR/ai.pid" ]; then
        AI_PID=$(cat "$LOGS_DIR/ai.pid")
        echo "停止AI服务 (PID: $AI_PID)..."
        if kill -0 $AI_PID 2>/dev/null; then
            kill $AI_PID
            sleep 1
            if kill -0 $AI_PID 2>/dev/null; then
                echo "AI服务没有立即响应，尝试强制终止..."
                kill -9 $AI_PID 2>/dev/null
            fi
            echo "✅ AI服务已停止"
        else
            echo "⚠️ AI服务未在运行"
        fi
        rm -f "$LOGS_DIR/ai.pid"
    else
        echo "⚠️ 找不到AI服务的PID文件"
    fi
}

# 停止所有Node.js进程（备用方案）
stop_all_node_processes() {
    echo "尝试停止所有Node.js进程..."
    pkill -f "node" || true
    echo "尝试停止所有Python进程..."
    pkill -f "python3 main.py" || true
}

# 主函数
main() {
    echo "开始停止所有服务..."
    stop_frontend_service
    stop_backend_service
    stop_ai_service
    
    # 检查是否还有服务在运行
    echo "检查是否有遗留的服务进程..."
    FRONTEND_RUNNING=$(pgrep -f "npm run serve" | wc -l)
    BACKEND_RUNNING=$(pgrep -f "npm run start:prod" | wc -l)
    AI_RUNNING=$(pgrep -f "python3 main.py" | wc -l)
    
    if [ $FRONTEND_RUNNING -gt 0 ] || [ $BACKEND_RUNNING -gt 0 ] || [ $AI_RUNNING -gt 0 ]; then
        echo "⚠️ 检测到遗留的服务进程，尝试强制停止所有相关进程..."
        stop_all_node_processes
    fi
    
    echo ""
    echo "======================================================="
    echo "          所有服务已停止                             "
    echo "======================================================="
}

# 执行主函数
main
