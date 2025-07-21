#!/bin/bash

# 完整的代码同步和部署流程 (使用SCP直接推送到测试服务器)
# 1. 本地构建 -> 2. 同步到Git -> 3. SCP推送到测试服务器 -> 4. 运行测试

set -e

echo "=========================================="
echo "🚀 开始完整的同步和部署流程 (SCP模式)"
echo "=========================================="

# 配置变量
LOCAL_DIR="d:/ailab/ailab"
REMOTE_HOST="ubuntu@82.156.75.232"
REMOTE_DIR="/home/ubuntu/ailab"
PEM_FILE="d:/ailab/ailab/ailab.pem"
BRANCH="master"

# 检查当前工作目录
if [ ! -d "$LOCAL_DIR" ]; then
    echo "❌ 本地目录不存在: $LOCAL_DIR"
    exit 1
fi

cd "$LOCAL_DIR"

echo "📍 当前工作目录: $(pwd)"
echo "📅 时间戳: $(date)"

# 步骤1: 检查本地代码状态
echo ""
echo "=========================================="
echo "📋 步骤1: 检查本地代码状态"
echo "=========================================="

echo "🔍 Git状态检查:"
git status --porcelain

echo ""
echo "🔍 当前分支:"
git branch --show-current

echo ""
echo "🔍 最近提交:"
git log --oneline -5

# 步骤2: 本地构建（前端）
echo ""
echo "=========================================="
echo "🔨 步骤2: 本地构建前端代码"
echo "=========================================="

if [ -d "src/frontend" ]; then
    echo "📦 开始前端构建..."
    cd src/frontend

    # 检查package.json
    if [ -f "package.json" ]; then
        echo "✅ 找到package.json"

        # 安装依赖（如果需要）
        if [ ! -d "node_modules" ]; then
            echo "📦 安装依赖..."
            npm install
        fi

        # 构建项目
        echo "🔨 构建前端项目..."
        npm run build

        echo "✅ 前端构建完成"
    else
        echo "⚠️ 未找到package.json，跳过前端构建"
    fi

    cd "$LOCAL_DIR"
else
    echo "⚠️ 未找到src/frontend目录，跳过前端构建"
fi

# 步骤3: 提交到Git
echo ""
echo "=========================================="
echo "📤 步骤3: 同步到Git仓库"
echo "=========================================="

# 检查是否有更改
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 发现代码更改，准备提交..."

    # 添加所有更改
    git add .

    # 生成提交信息
    COMMIT_MSG="🚀 自动同步部署 (SCP模式) - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "💬 提交信息: $COMMIT_MSG"

    # 提交更改
    git commit -m "$COMMIT_MSG"

    # 推送到远程仓库
    echo "📤 推送到远程仓库..."
    git push origin $BRANCH

    echo "✅ Git同步完成"
else
    echo "ℹ️ 没有代码更改，跳过Git提交"
fi

# 步骤4: 同步到测试服务器
echo ""
echo "=========================================="
echo "🌐 步骤4: 同步到测试服务器"
echo "=========================================="

echo "🔗 连接测试服务器..."

# 检查服务器连接
if ! ssh -i "$PEM_FILE" -o ConnectTimeout=10 "$REMOTE_HOST" "echo '✅ 服务器连接成功'"; then
    echo "❌ 无法连接到测试服务器"
    exit 1
fi

# 在服务器上拉取最新代码
echo "📥 在服务器上拉取最新代码..."
ssh -i "$PEM_FILE" "$REMOTE_HOST" << EOF
    cd $REMOTE_DIR
    echo "📍 服务器当前目录: \$(pwd)"

    # 拉取最新代码
    echo "📥 拉取Git最新代码..."
    git fetch origin
    git reset --hard origin/$BRANCH

    echo "✅ 代码同步完成"

    # 显示最新提交
    echo "📋 最新提交:"
    git log --oneline -3
EOF

# 步骤5: 服务器端构建和部署
echo ""
echo "=========================================="
echo "🔧 步骤5: 服务器端构建和部署"
echo "=========================================="

# 上传部署脚本
echo "📤 上传部署脚本..."
scp -i "$PEM_FILE" "$LOCAL_DIR/scripts/deployment/fix-frontend-api-config.sh" "$REMOTE_HOST:/home/ubuntu/"

# 在服务器上执行部署
echo "🚀 执行服务器部署..."
ssh -i "$PEM_FILE" "$REMOTE_HOST" << 'EOF'
    # 设置权限
    chmod +x /home/ubuntu/fix-frontend-api-config.sh

    # 检查服务状态
    echo "📊 当前服务状态:"
    pm2 list | grep ailab || echo "未找到ailab服务"

    # 构建前端
    echo "🔨 服务器端前端构建..."
    cd /home/ubuntu/ailab/src/frontend
    npm run build

    # 重启服务
    echo "🔄 重启服务..."
    pm2 restart ailab-frontend || echo "前端服务重启失败"
    pm2 restart ailab-backend || echo "后端服务重启失败"

    # 等待服务启动
    sleep 5

    echo "✅ 服务器部署完成"
EOF

# 步骤6: 运行测试
echo ""
echo "=========================================="
echo "🧪 步骤6: 运行部署测试"
echo "=========================================="

# 上传测试脚本
echo "📤 上传测试脚本..."
cat > "$LOCAL_DIR/scripts/deployment/test-deployment.sh" << 'EOF'
#!/bin/bash

echo "🧪 开始部署测试..."

# 测试服务状态
echo "📊 检查PM2服务状态:"
pm2 list | grep ailab

# 测试API端点
echo ""
echo "📡 测试API端点:"

echo "1. 健康检查:"
curl -s -w "Status: %{http_code}\n" http://localhost:3001/health | head -5

echo ""
echo "2. 学校API:"
curl -s -w "Status: %{http_code}\n" http://localhost:3001/api/schools | head -5

echo ""
echo "3. 实验API:"
curl -s -w "Status: %{http_code}\n" http://localhost:3001/api/experiments | head -5

echo ""
echo "4. 前端页面:"
curl -s -w "Status: %{http_code}\n" http://localhost:3000 | grep -o '<title>.*</title>' || echo "前端访问失败"

# 外部访问测试
echo ""
echo "🌐 外部访问测试:"

echo "1. 外部前端:"
curl -s -w "Status: %{http_code}\n" -m 10 http://82.156.75.232:3000 | grep -o '<title>.*</title>' || echo "外部前端访问失败"

echo ""
echo "2. 外部API:"
curl -s -w "Status: %{http_code}\n" -m 10 http://82.156.75.232:3001/api/schools | head -3

echo ""
echo "📋 测试完成!"

# 生成测试报告
echo ""
echo "=========================================="
echo "📊 部署测试报告"
echo "=========================================="
echo "测试时间: $(date)"
echo "服务状态:"
pm2 list | grep ailab | awk '{print "- " $2 ": " $10}'

# 检查端口占用
echo ""
echo "端口状态:"
netstat -tlnp | grep -E ":(3000|3001)" | while read line; do
    echo "- $line"
done

echo ""
echo "🎉 所有测试完成!"
EOF

scp -i "$PEM_FILE" "$LOCAL_DIR/scripts/deployment/test-deployment.sh" "$REMOTE_HOST:/home/ubuntu/"

# 执行测试
echo "🧪 执行部署测试..."
ssh -i "$PEM_FILE" "$REMOTE_HOST" "chmod +x /home/ubuntu/test-deployment.sh && /home/ubuntu/test-deployment.sh"

# 完成总结
echo ""
echo "=========================================="
echo "🎉 完整同步部署流程完成!"
echo "=========================================="
echo ""
echo "📋 执行摘要:"
echo "1. ✅ 本地代码状态检查"
echo "2. ✅ 前端代码构建"
echo "3. ✅ Git仓库同步"
echo "4. ✅ 测试服务器同步"
echo "5. ✅ 服务器部署"
echo "6. ✅ 部署测试"
echo ""
echo "🌐 访问地址:"
echo "- 前端: http://82.156.75.232:3000"
echo "- 后端API: http://82.156.75.232:3001"
echo "- 健康检查: http://82.156.75.232:3001/health"
echo ""
echo "📊 下次同步命令:"
echo "bash $LOCAL_DIR/scripts/deployment/sync-and-deploy.sh"
echo ""
