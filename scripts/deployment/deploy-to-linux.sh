#!/bin/bash
# AILAB平台 - Linux服务器部署脚本
# 此脚本用于在Linux服务器上部署AILAB平台（非Docker版）
# 适用于直接上传源代码到服务器的场景

set -e

echo "====================================="
echo "  AILAB平台 - Linux服务器部署脚本"
echo "====================================="

# 检查必要的Node.js工具
echo "检查Node.js环境..."
for cmd in node npm; do
  if ! command -v $cmd &> /dev/null; then
    echo "错误: $cmd 未安装"
    echo "请运行: sudo apt update && sudo apt install -y nodejs npm"
    echo "推荐使用Node.js版本管理器安装最新LTS版本:"
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash"
    echo "source ~/.bashrc && nvm install --lts"
    exit 1
  fi
done

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
  echo "警告: 检测到Node.js版本 $(node -v)，项目推荐使用v16.0.0或更高版本"
  read -p "是否继续部署？(y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "请升级Node.js后重试"
    echo "推荐使用: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash"
    echo "然后: source ~/.bashrc && nvm install --lts"
    exit 1
  fi
fi

# 检查MongoDB
echo "检查MongoDB..."
if ! command -v mongo &> /dev/null; then
  echo "错误: MongoDB 未安装"
  echo "请运行: sudo apt update && sudo apt install -y mongodb"
  echo "或参考MongoDB官方文档安装最新版本:"
  echo "https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/"
  exit 1
fi

# 检查Python环境
echo "检查Python环境..."
if ! command -v python3 &> /dev/null; then
  echo "警告: Python3 未安装，这可能导致AI服务部分功能不可用"
  echo "建议运行: sudo apt update && sudo apt install -y python3 python3-pip"
  read -p "是否继续部署？(y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 检查Redis
echo "检查Redis..."
if ! command -v redis-cli &> /dev/null; then
  echo "警告: Redis 未安装，这可能导致缓存功能不可用"
  echo "建议运行: sudo apt update && sudo apt install -y redis-server"
  read -p "是否继续部署？(y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  # 检查Redis服务状态
  if systemctl is-active --quiet redis-server; then
    echo "✅ Redis服务正在运行"
  else
    echo "启动Redis服务..."
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
  fi
fi

# 配置变量
DEPLOY_DIR=${1:-"/opt/ailab"}
FRONTEND_PORT=${2:-3000}
BACKEND_PORT=${3:-3001}
MONGODB_URI=${4:-"mongodb://localhost:27017/ailab"}
CURRENT_DIR=$(pwd)

# 创建或确认部署目录
echo "确认部署目录: $DEPLOY_DIR"
if [ "$CURRENT_DIR" != "$DEPLOY_DIR" ]; then
  echo "当前目录 ($CURRENT_DIR) 与部署目录 ($DEPLOY_DIR) 不同"
  read -p "是否将当前目录文件复制到部署目录? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo mkdir -p $DEPLOY_DIR
    sudo chown $(whoami):$(whoami) $DEPLOY_DIR
    echo "复制文件到部署目录..."
    cp -r ./* $DEPLOY_DIR/
    cd $DEPLOY_DIR
  else
    echo "使用当前目录作为部署目录"
    DEPLOY_DIR=$CURRENT_DIR
  fi
fi

# 确保目录结构正确
echo "确保目录结构正确..."
mkdir -p logs

# 检查MongoDB服务
echo "检查MongoDB服务..."
if systemctl is-active --quiet mongodb; then
  echo "✅ MongoDB服务正在运行"
else
  echo "启动MongoDB服务..."
  sudo systemctl start mongodb
  sudo systemctl enable mongodb
fi

# 检查前后端目录结构
if [ -d "src/frontend" ] && [ -d "src/backend" ]; then
  echo "检测到标准目录结构"
  FRONTEND_DIR="src/frontend"
  BACKEND_DIR="src/backend"
else
  echo "警告: 未检测到标准目录结构"
  read -p "请输入前端代码相对路径: " FRONTEND_DIR
  read -p "请输入后端代码相对路径: " BACKEND_DIR

  if [ ! -d "$FRONTEND_DIR" ] || [ ! -d "$BACKEND_DIR" ]; then
    echo "错误: 指定的目录不存在"
    exit 1
  fi
fi

echo "使用前端目录: $FRONTEND_DIR"
echo "使用后端目录: $BACKEND_DIR"

# 配置后端环境
echo "配置后端环境..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "创建后端.env文件..."
  cat > $BACKEND_DIR/.env << EOF
PORT=$BACKEND_PORT
DATABASE_URL=$MONGODB_URI
JWT_SECRET=ailab-secret-key
NODE_ENV=production
API_BASE_URL=http://localhost:$BACKEND_PORT/api
CORS_ORIGIN=http://localhost:$FRONTEND_PORT
EOF
else
  echo "检测到现有.env文件，跳过创建"
fi

# 检查AI服务目录
if [ -d "src/ai-service" ]; then
  AI_DIR="src/ai-service"
else
  AI_DIR=""
fi

# 安装依赖
echo "安装后端依赖..."
cd $BACKEND_DIR
npm install

echo "安装前端依赖..."
cd $DEPLOY_DIR
cd $FRONTEND_DIR
npm install

# 安装AI服务依赖（如果存在）
if [ ! -z "$AI_DIR" ]; then
  echo "安装AI服务依赖..."
  cd $DEPLOY_DIR
  cd $AI_DIR
  if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
  else
    echo "未找到requirements.txt，跳过Python依赖安装"
  fi
fi

# 构建前端
echo "构建前端生产版本..."
cd $DEPLOY_DIR
cd $FRONTEND_DIR
npm run build

# 创建PM2配置文件
cd $DEPLOY_DIR
echo "创建PM2配置文件..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ailab-backend',
      cwd: '${DEPLOY_DIR}/${BACKEND_DIR}',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'ailab-frontend',
      cwd: '${DEPLOY_DIR}/${FRONTEND_DIR}',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: 'build',
        PM2_SERVE_PORT: $FRONTEND_PORT,
        PM2_SERVE_SPA: 'true'
      },
      watch: false
    }
  ]
};
EOF

# 安装全局依赖
echo "安装全局依赖..."
sudo npm install -g pm2 serve

# 创建健康检查脚本
echo "创建健康检查脚本..."
mkdir -p $DEPLOY_DIR/scripts
cat > $DEPLOY_DIR/scripts/health-check.js << EOF
const http = require('http');

const BACKEND_URL = 'http://localhost:$BACKEND_PORT/api/health';
const FRONTEND_URL = 'http://localhost:$FRONTEND_PORT';

function checkService(url, name) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(\`✅ \${name} 服务正常运行 (\${url})\`);
        resolve(true);
      } else {
        console.error(\`❌ \${name} 服务返回非200状态码: \${res.statusCode}\`);
        resolve(false);
      }
    }).on('error', (err) => {
      console.error(\`❌ \${name} 服务检查失败: \${err.message}\`);
      resolve(false);
    });
  });
}

async function runHealthCheck() {
  const backendStatus = await checkService(BACKEND_URL, '后端');
  const frontendStatus = await checkService(FRONTEND_URL, '前端');

  if (backendStatus && frontendStatus) {
    console.log('✅ 所有服务运行正常');
    return 0;
  } else {
    console.error('❌ 部分服务未正常运行');
    return 1;
  }
}

runHealthCheck().then(process.exit);
EOF

# 创建启动脚本
echo "创建启动脚本..."
cat > $DEPLOY_DIR/start-ailab.sh << EOF
#!/bin/bash
# AILAB平台启动脚本

echo "====================================="
echo "  AILAB平台 - 启动服务"
echo "====================================="

# 检查PM2是否已安装
if ! command -v pm2 &> /dev/null; then
  echo "安装PM2..."
  sudo npm install -g pm2
fi

# 检查MongoDB服务
if systemctl is-active --quiet mongodb; then
  echo "✅ MongoDB服务正在运行"
else
  echo "启动MongoDB服务..."
  sudo systemctl start mongodb
  sudo systemctl enable mongodb
fi

# 检查Redis服务（如果已安装）
if command -v redis-cli &> /dev/null; then
  if ! systemctl is-active --quiet redis-server; then
    echo "启动Redis服务..."
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
  else
    echo "✅ Redis服务正在运行"
  fi
fi

# 启动服务
echo "启动AILAB平台服务..."
pm2 start ecosystem.config.js

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 运行健康检查
echo "运行健康检查..."
node scripts/health-check.js

if [ \$? -eq 0 ]; then
  echo "====================================="
  echo "  AILAB平台服务已成功启动"
  echo "====================================="
  echo "前端: http://localhost:$FRONTEND_PORT"
  echo "后端API: http://localhost:$BACKEND_PORT/api"
else
  echo "⚠️ 部分服务可能未正确启动，请检查日志"
  echo "查看日志: pm2 logs"
fi

# 保存PM2进程列表
pm2 save

# 显示PM2进程状态
pm2 status
EOF

# 设置执行权限
chmod +x $DEPLOY_DIR/start-ailab.sh

echo "====================================="
echo "      AILAB平台部署完成！"
echo "====================================="
echo "运行以下命令启动AILAB平台:"
echo "cd $DEPLOY_DIR && ./start-ailab.sh"
echo ""
echo "要设置系统启动自动运行，请执行:"
echo "pm2 startup && pm2 save"
echo ""
echo "部署中使用的配置:"
echo "前端端口: $FRONTEND_PORT"
echo "后端端口: $BACKEND_PORT"
echo "MongoDB URI: $MONGODB_URI"
echo "部署目录: $DEPLOY_DIR"
