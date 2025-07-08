#!/bin/bash

# AICAM 服务器端全自动部署脚本
# 适用于 Ubuntu 20.04+ 服务器
# 作者: AICAM 开发团队
# 版本: 1.0.0

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置变量
PROJECT_NAME="AICAM"
GIT_REPO="https://github.com/dannygto/ailab.git"
GIT_BRANCH="master"
DEPLOY_DIR="/opt/aicam"
BACKUP_DIR="/opt/aicam-backup"
LOG_FILE="/var/log/aicam-deploy.log"
DOCKER_COMPOSE_FILE="$DEPLOY_DIR/docker-compose.yml"
NGINX_CONF="/etc/nginx/sites-available/aicam"
NGINX_ENABLED="/etc/nginx/sites-enabled/aicam"

# 创建日志文件
mkdir -p $(dirname $LOG_FILE)
touch $LOG_FILE

# 记录日志
exec 1> >(tee -a $LOG_FILE)
exec 2> >(tee -a $LOG_FILE >&2)

log_info "开始 AICAM 全自动部署流程..."
log_info "部署时间: $(date)"
log_info "部署目录: $DEPLOY_DIR"

# 1. 系统环境检查
log_info "=== 步骤 1: 系统环境检查 ==="

check_system() {
    log_info "检查操作系统..."
    if [[ ! -f /etc/os-release ]]; then
        log_error "无法检测操作系统版本"
        exit 1
    fi
    
    source /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        log_warning "当前系统: $ID $VERSION_ID，推荐使用 Ubuntu 20.04+"
    else
        log_success "操作系统: $ID $VERSION_ID"
    fi
    
    # 检查内存
    local mem_total=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    if [[ $mem_total -lt 3 ]]; then
        log_warning "系统内存: ${mem_total}GB，推荐至少 4GB"
    else
        log_success "系统内存: ${mem_total}GB"
    fi
    
    # 检查磁盘空间
    local disk_free=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    if [[ $disk_free -lt 10 ]]; then
        log_warning "可用磁盘空间: ${disk_free}GB，推荐至少 10GB"
    else
        log_success "可用磁盘空间: ${disk_free}GB"
    fi
}

check_system

# 2. 安装必要软件
log_info "=== 步骤 2: 安装必要软件 ==="

install_dependencies() {
    log_info "更新软件包列表..."
    apt update -y
    
    log_info "安装基础软件包..."
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    # 安装 Node.js
    log_info "安装 Node.js..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
        log_success "Node.js 安装完成: $(node --version)"
    else
        log_success "Node.js 已安装: $(node --version)"
    fi
    
    # 安装 Docker
    log_info "安装 Docker..."
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        usermod -aG docker $USER
        systemctl enable docker
        systemctl start docker
        log_success "Docker 安装完成: $(docker --version)"
    else
        log_success "Docker 已安装: $(docker --version)"
    fi
    
    # 安装 Docker Compose
    log_info "安装 Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        log_success "Docker Compose 安装完成: $(docker-compose --version)"
    else
        log_success "Docker Compose 已安装: $(docker-compose --version)"
    fi
    
    # 安装 Nginx
    log_info "安装 Nginx..."
    if ! command -v nginx &> /dev/null; then
        apt install -y nginx
        systemctl enable nginx
        systemctl start nginx
        log_success "Nginx 安装完成: $(nginx -v 2>&1)"
    else
        log_success "Nginx 已安装: $(nginx -v 2>&1)"
    fi
}

install_dependencies

# 3. 备份现有部署
log_info "=== 步骤 3: 备份现有部署 ==="

backup_existing() {
    if [[ -d "$DEPLOY_DIR" ]]; then
        log_info "备份现有部署到 $BACKUP_DIR..."
        mkdir -p $BACKUP_DIR
        cp -r $DEPLOY_DIR $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
        log_success "备份完成"
    else
        log_info "没有发现现有部署，跳过备份"
    fi
}

backup_existing

# 4. 拉取最新代码
log_info "=== 步骤 4: 拉取最新代码 ==="

clone_or_pull_code() {
    if [[ -d "$DEPLOY_DIR" ]]; then
        log_info "更新现有代码库..."
        cd $DEPLOY_DIR
        git fetch origin
        git reset --hard origin/$GIT_BRANCH
        git clean -fd
    else
        log_info "克隆代码库..."
        git clone -b $GIT_BRANCH $GIT_REPO $DEPLOY_DIR
    fi
    
    cd $DEPLOY_DIR
    log_success "代码拉取完成，当前提交: $(git rev-parse --short HEAD)"
}

clone_or_pull_code

# 5. 生成部署配置
log_info "=== 步骤 5: 生成部署配置 ==="

generate_configs() {
    cd $DEPLOY_DIR
    
    # 检查是否存在配置生成脚本
    if [[ -f "脚本/部署脚本/生成部署配置.sh" ]]; then
        log_info "运行配置生成脚本..."
        chmod +x "脚本/部署脚本/生成部署配置.sh"
        ./脚本/部署脚本/生成部署配置.sh
    else
        log_warning "未找到配置生成脚本，使用默认配置"
        
        # 创建基础 Docker Compose 配置
        cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  frontend:
    build:
      context: ./源代码/前端
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build:
      context: ./源代码/后端
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - DATABASE_URL=mongodb://mongo:27017/aicam
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=aicam
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./配置/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./配置/SSL配置:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  mongo_data:
EOF
    fi
    
    log_success "部署配置生成完成"
}

generate_configs

# 6. 构建和部署
log_info "=== 步骤 6: 构建和部署 ==="

build_and_deploy() {
    cd $DEPLOY_DIR
    
    # 停止现有容器
    log_info "停止现有容器..."
    docker-compose down --remove-orphans || true
    
    # 清理旧镜像
    log_info "清理旧镜像..."
    docker system prune -f
    
    # 构建新镜像
    log_info "构建 Docker 镜像..."
    docker-compose build --no-cache
    
    # 启动服务
    log_info "启动服务..."
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    log_success "部署完成"
}

build_and_deploy

# 7. 配置 Nginx
log_info "=== 步骤 7: 配置 Nginx ==="

configure_nginx() {
    # 创建 Nginx 配置
    cat > $NGINX_CONF << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    
    # 启用站点
    ln -sf $NGINX_CONF $NGINX_ENABLED
    
    # 测试配置
    nginx -t
    
    # 重载 Nginx
    systemctl reload nginx
    
    log_success "Nginx 配置完成"
}

configure_nginx

# 8. 健康检查
log_info "=== 步骤 8: 健康检查 ==="

health_check() {
    log_info "执行健康检查..."
    
    # 检查容器状态
    local containers_running=$(docker-compose ps --filter "status=running" --format "table {{.Name}}" | wc -l)
    if [[ $containers_running -lt 4 ]]; then
        log_error "部分容器未正常运行"
        docker-compose ps
        return 1
    fi
    
    # 检查端口
    local ports=(80 3000 5000)
    for port in "${ports[@]}"; do
        if ! netstat -tlnp | grep ":$port " > /dev/null; then
            log_error "端口 $port 未监听"
            return 1
        fi
    done
    
    # 检查 HTTP 响应
    sleep 10
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "健康检查通过"
    else
        log_error "健康检查失败"
        return 1
    fi
}

health_check

# 9. 设置防火墙
log_info "=== 步骤 9: 配置防火墙 ==="

configure_firewall() {
    log_info "配置防火墙规则..."
    
    # 允许 SSH
    ufw allow ssh
    
    # 允许 HTTP/HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # 启用防火墙
    ufw --force enable
    
    log_success "防火墙配置完成"
}

configure_firewall

# 10. 创建服务管理脚本
log_info "=== 步骤 10: 创建服务管理脚本 ==="

create_management_scripts() {
    cd $DEPLOY_DIR
    
    # 创建启动脚本
    cat > start.sh << 'EOF'
#!/bin/bash
cd /opt/aicam
docker-compose up -d
echo "AICAM 服务已启动"
EOF
    
    # 创建停止脚本
    cat > stop.sh << 'EOF'
#!/bin/bash
cd /opt/aicam
docker-compose down
echo "AICAM 服务已停止"
EOF
    
    # 创建重启脚本
    cat > restart.sh << 'EOF'
#!/bin/bash
cd /opt/aicam
docker-compose down
docker-compose up -d
echo "AICAM 服务已重启"
EOF
    
    # 创建日志查看脚本
    cat > logs.sh << 'EOF'
#!/bin/bash
cd /opt/aicam
docker-compose logs -f
EOF
    
    # 创建状态检查脚本
    cat > status.sh << 'EOF'
#!/bin/bash
cd /opt/aicam
echo "=== 容器状态 ==="
docker-compose ps
echo ""
echo "=== 系统资源 ==="
docker stats --no-stream
echo ""
echo "=== 端口监听 ==="
netstat -tlnp | grep -E ":(80|3000|5000) "
EOF
    
    # 设置执行权限
    chmod +x *.sh
    
    log_success "管理脚本创建完成"
}

create_management_scripts

# 11. 创建定时任务
log_info "=== 步骤 11: 创建定时任务 ==="

setup_cron() {
    # 创建日志轮转
    cat > /etc/logrotate.d/aicam << 'EOF'
/var/log/aicam-deploy.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF
    
    # 创建自动备份任务
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/aicam/backup.sh") | crontab -
    
    log_success "定时任务设置完成"
}

setup_cron

# 12. 生成部署报告
log_info "=== 步骤 12: 生成部署报告 ==="

generate_report() {
    local report_file="$DEPLOY_DIR/deployment-report-$(date +%Y%m%d_%H%M%S).json"
    
    cat > $report_file << EOF
{
    "deployment_info": {
        "timestamp": "$(date -Iseconds)",
        "project": "$PROJECT_NAME",
        "version": "$(cd $DEPLOY_DIR && git rev-parse --short HEAD)",
        "branch": "$GIT_BRANCH"
    },
    "system_info": {
        "os": "$(lsb_release -d | cut -f2)",
        "kernel": "$(uname -r)",
        "memory": "$(free -h | awk 'NR==2{print $2}')",
        "disk": "$(df -h / | awk 'NR==2{print $4}') 可用"
    },
    "services": {
        "docker": "$(docker --version)",
        "docker_compose": "$(docker-compose --version)",
        "nginx": "$(nginx -v 2>&1)",
        "node": "$(node --version)"
    },
    "deployment_status": "success",
    "health_check": "passed",
    "access_urls": {
        "frontend": "http://$(hostname -I | awk '{print $1}')",
        "api": "http://$(hostname -I | awk '{print $1}'):5000",
        "health": "http://$(hostname -I | awk '{print $1}')/health"
    },
    "management_commands": {
        "start": "cd $DEPLOY_DIR && ./start.sh",
        "stop": "cd $DEPLOY_DIR && ./stop.sh",
        "restart": "cd $DEPLOY_DIR && ./restart.sh",
        "logs": "cd $DEPLOY_DIR && ./logs.sh",
        "status": "cd $DEPLOY_DIR && ./status.sh"
    }
}
EOF
    
    log_success "部署报告已生成: $report_file"
}

generate_report

# 完成
log_success "=== AICAM 全自动部署完成 ==="
log_info "部署时间: $(date)"
log_info "部署目录: $DEPLOY_DIR"
log_info "访问地址: http://$(hostname -I | awk '{print $1}')"
log_info "健康检查: http://$(hostname -I | awk '{print $1}')/health"
log_info "管理命令: cd $DEPLOY_DIR && ./status.sh"

echo ""
echo "=== 快速管理命令 ==="
echo "查看状态: cd $DEPLOY_DIR && ./status.sh"
echo "查看日志: cd $DEPLOY_DIR && ./logs.sh"
echo "重启服务: cd $DEPLOY_DIR && ./restart.sh"
echo "停止服务: cd $DEPLOY_DIR && ./stop.sh"
echo ""

log_success "部署脚本执行完成！" 