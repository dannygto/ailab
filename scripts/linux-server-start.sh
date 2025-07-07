#!/bin/bash
# 远程服务器一键启动脚本
# 用于在Linux环境中快速启动AICAM平台的所有服务

echo "======================================================="
echo "         AICAM平台远程服务器一键启动脚本                "
echo "======================================================="
echo ""

# 设置工作目录
WORK_DIR=$(pwd)
FRONTEND_DIR="$WORK_DIR/frontend"
BACKEND_DIR="$WORK_DIR/backend"
AI_DIR="$WORK_DIR/ai"

# 检查目录是否存在
check_directory() {
    if [ ! -d "$1" ]; then
        echo "❌ 错误：目录 $1 不存在!"
        exit 1
    fi
}

# 检查主要目录
check_directory "$FRONTEND_DIR"
check_directory "$BACKEND_DIR"
check_directory "$AI_DIR"

# 检查环境变量文件
if [ ! -f "$WORK_DIR/.env" ]; then
    echo "⚠️ 警告：.env 文件不存在，将使用 env.example 创建"
    if [ -f "$WORK_DIR/env.example" ]; then
        cp "$WORK_DIR/env.example" "$WORK_DIR/.env"
        echo "✅ 已创建 .env 文件"
    else
        echo "❌ 错误：env.example 文件也不存在，无法创建环境配置"
        exit 1
    fi
fi

# 检查所需的Linux工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ 错误：命令 $1 未安装!"
        echo "请运行：sudo apt-get update && sudo apt-get install -y $1"
        exit 1
    fi
}

# 检查基本工具
echo "检查系统依赖..."
check_command node
check_command npm
check_command python3
check_command pip3

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ "$NODE_MAJOR" -lt "16" ]; then
    echo "❌ 错误：Node.js版本 ($NODE_VERSION) 过低，至少需要 v16"
    echo "请升级Node.js：curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi
echo "✅ Node.js版本检查通过：v$NODE_VERSION"

# 检查Python版本
PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d '.' -f 1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d '.' -f 2)
if [ "$PYTHON_MAJOR" -lt "3" ] || ([ "$PYTHON_MAJOR" -eq "3" ] && [ "$PYTHON_MINOR" -lt "8" ]); then
    echo "❌ 错误：Python版本 ($PYTHON_VERSION) 过低，至少需要 Python 3.8"
    echo "请升级Python：sudo apt-get install -y python3.8"
    exit 1
fi
echo "✅ Python版本检查通过：$PYTHON_VERSION"

# 函数：安装NPM依赖
install_npm_dependencies() {
    echo "安装 $1 依赖..."
    cd "$2"
    npm install --quiet
    if [ $? -ne 0 ]; then
        echo "❌ $1 依赖安装失败"
        exit 1
    fi
    echo "✅ $1 依赖安装完成"
}

# 函数：安装Python依赖
install_python_dependencies() {
    echo "安装 AI服务 依赖..."
    cd "$AI_DIR"
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ AI服务依赖安装失败"
        exit 1
    fi
    echo "✅ AI服务依赖安装完成"
}

# 安装依赖
echo "开始安装依赖..."
install_npm_dependencies "前端" "$FRONTEND_DIR"
install_npm_dependencies "后端" "$BACKEND_DIR"
install_python_dependencies

# 启动AI服务
start_ai_service() {
    echo "启动 AI 服务..."
    cd "$AI_DIR"
    python3 main.py > "$WORK_DIR/logs/ai.log" 2>&1 &
    AI_PID=$!
    echo $AI_PID > "$WORK_DIR/logs/ai.pid"
    echo "✅ AI 服务已启动 (PID: $AI_PID)"
    # 等待AI服务启动
    echo "等待 AI 服务完全启动..."
    sleep 5
    
    # 检查AI服务是否成功启动
    if kill -0 $AI_PID 2>/dev/null; then
        echo "✅ AI 服务运行正常"
    else
        echo "❌ AI 服务启动失败"
        exit 1
    fi
}

# 启动后端服务
start_backend_service() {
    echo "启动后端服务..."
    cd "$BACKEND_DIR"
    npm run start:prod > "$WORK_DIR/logs/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$WORK_DIR/logs/backend.pid"
    echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
    # 等待后端服务启动
    echo "等待后端服务完全启动..."
    sleep 5
    
    # 检查后端服务是否成功启动
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "✅ 后端服务运行正常"
    else
        echo "❌ 后端服务启动失败"
        exit 1
    fi
}

# 启动前端服务
start_frontend_service() {
    echo "启动前端服务..."
    cd "$FRONTEND_DIR"
    npm run serve > "$WORK_DIR/logs/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$WORK_DIR/logs/frontend.pid"
    echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
    # 等待前端服务启动
    echo "等待前端服务完全启动..."
    sleep 5
    
    # 检查前端服务是否成功启动
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "✅ 前端服务运行正常"
    else
        echo "❌ 前端服务启动失败"
        exit 1
    fi
}

# 创建日志目录
mkdir -p "$WORK_DIR/logs"

# 启动所有服务
echo "开始启动所有服务..."
start_ai_service
start_backend_service
start_frontend_service

# 显示服务状态
echo ""
echo "======================================================="
echo "          所有服务已成功启动                         "
echo "======================================================="
echo ""
echo "前端服务: http://localhost:3000"
echo "后端服务: http://localhost:3002"
echo "AI服务: http://localhost:5000"
echo ""
echo "日志文件位置:"
echo "  前端: $WORK_DIR/logs/frontend.log"
echo "  后端: $WORK_DIR/logs/backend.log"
echo "  AI服务: $WORK_DIR/logs/ai.log"
echo ""
echo "进程ID:"
echo "  前端: $(cat $WORK_DIR/logs/frontend.pid)"
echo "  后端: $(cat $WORK_DIR/logs/backend.pid)"
echo "  AI服务: $(cat $WORK_DIR/logs/ai.pid)"
echo ""
echo "使用以下命令停止所有服务:"
echo "  ./stop-services.sh"
echo ""
