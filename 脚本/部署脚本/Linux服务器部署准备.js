const fs = require('fs');
const path = require('path');

console.log('🚀 Linux服务器部署准备脚本\n');

// 服务器部署配置
const serverConfig = {
  system: {
    os: 'Ubuntu 20.04+ / CentOS 8+',
    minMemory: '4GB',
    minStorage: '20GB',
    recommendedCores: 4
  },
  services: {
    docker: {
      version: '20.10+',
      compose: '2.0+'
    },
    nginx: {
      version: '1.18+'
    },
    database: {
      type: 'PostgreSQL',
      version: '13+'
    },
    redis: {
      version: '6.0+'
    }
  },
  ports: {
    http: 80,
    https: 443,
    frontend: 3000,
    backend: 8000,
    aiService: 8001,
    database: 5432,
    redis: 6379
  },
  domains: {
    main: 'yourdomain.com',
    api: 'api.yourdomain.com',
    ai: 'ai.yourdomain.com'
  }
};

// 1. 创建服务器环境检查脚本
console.log('🔍 创建服务器环境检查脚本...');
const envCheckScript = `#!/bin/bash

echo "🔍 开始服务器环境检查..."

# 系统信息检查
echo "\\n📊 系统信息:"
echo "操作系统: \$(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "内核版本: \$(uname -r)"
echo "CPU核心数: \$(nproc)"
echo "内存大小: \$(free -h | grep Mem | awk '{print \$2}')"
echo "磁盘空间: \$(df -h / | tail -1 | awk '{print \$4}')"

# 网络检查
echo "\\n🌐 网络信息:"
echo "公网IP: \$(curl -s ifconfig.me)"
echo "内网IP: \$(hostname -I | awk '{print \$1}')"
echo "DNS解析: \$(cat /etc/resolv.conf | grep nameserver | head -1 | awk '{print \$2}')"

# 端口检查
echo "\\n🔌 端口检查:"
ports=(80 443 3000 8000 8001 5432 6379)
for port in "\${ports[@]}"; do
  if netstat -tuln | grep ":\$port " > /dev/null; then
    echo "端口 \$port: ❌ 已被占用"
  else
    echo "端口 \$port: ✅ 可用"
  fi
done

# Docker检查
echo "\\n🐳 Docker环境检查:"
if command -v docker &> /dev/null; then
  echo "Docker版本: \$(docker --version)"
  echo "Docker服务状态: \$(systemctl is-active docker)"
else
  echo "❌ Docker未安装"
fi

if command -v docker-compose &> /dev/null; then
  echo "Docker Compose版本: \$(docker-compose --version)"
else
  echo "❌ Docker Compose未安装"
fi

# 防火墙检查
echo "\\n🔥 防火墙状态:"
if command -v ufw &> /dev/null; then
  echo "UFW状态: \$(ufw status)"
elif command -v firewall-cmd &> /dev/null; then
  echo "Firewalld状态: \$(firewall-cmd --state)"
else
  echo "⚠️  未检测到防火墙"
fi

# SSL证书检查
echo "\\n🔐 SSL证书检查:"
if [ -d "/etc/letsencrypt" ]; then
  echo "Let's Encrypt目录存在"
  ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "暂无证书"
else
  echo "Let's Encrypt目录不存在"
fi

echo "\\n✅ 环境检查完成"
`;

const envCheckPath = '脚本/部署脚本/check-server-env.sh';
fs.writeFileSync(envCheckPath, envCheckScript);
console.log('✅ 创建服务器环境检查脚本');

// 2. 创建Docker安装脚本
console.log('\n🐳 创建Docker安装脚本...');
const dockerInstallScript = `#!/bin/bash

echo "🐳 开始安装Docker环境..."

# 检测操作系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=\$NAME
    VER=\$VERSION_ID
else
    echo "无法检测操作系统"
    exit 1
fi

echo "检测到操作系统: \$OS \$VER"

# Ubuntu/Debian安装
if [[ "\$OS" == *"Ubuntu"* ]] || [[ "\$OS" == *"Debian"* ]]; then
    echo "使用Ubuntu/Debian安装方式..."
    
    # 更新包索引
    sudo apt-get update
    
    # 安装依赖
    sudo apt-get install -y \\
        apt-transport-https \\
        ca-certificates \\
        curl \\
        gnupg \\
        lsb-release
    
    # 添加Docker官方GPG密钥
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # 设置稳定版仓库
    echo \\
      "deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \\
      \$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # 安装Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # 启动Docker服务
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 添加当前用户到docker组
    sudo usermod -aG docker \$USER
    
    # 安装Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

# CentOS/RHEL安装
elif [[ "\$OS" == *"CentOS"* ]] || [[ "\$OS" == *"Red Hat"* ]]; then
    echo "使用CentOS/RHEL安装方式..."
    
    # 安装依赖
    sudo yum install -y yum-utils
    
    # 添加Docker仓库
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    
    # 安装Docker Engine
    sudo yum install -y docker-ce docker-ce-cli containerd.io
    
    # 启动Docker服务
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 添加当前用户到docker组
    sudo usermod -aG docker \$USER
    
    # 安装Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

else
    echo "不支持的操作系统: \$OS"
    exit 1
fi

# 验证安装
echo "\\n🔍 验证Docker安装..."
docker --version
docker-compose --version

echo "\\n✅ Docker安装完成"
echo "⚠️  请重新登录或运行 'newgrp docker' 以应用组权限"
`;

const dockerInstallPath = '脚本/部署脚本/install-docker.sh';
fs.writeFileSync(dockerInstallPath, dockerInstallScript);
console.log('✅ 创建Docker安装脚本');

// 3. 创建生产环境配置生成脚本
console.log('\n⚙️ 创建生产环境配置生成脚本...');
const configGenScript = `#!/bin/bash

echo "⚙️ 生成生产环境配置..."

# 获取服务器信息
SERVER_IP=\$(curl -s ifconfig.me)
DOMAIN=\${1:-"yourdomain.com"}
DB_PASSWORD=\$(openssl rand -base64 32)
REDIS_PASSWORD=\$(openssl rand -base64 32)
JWT_SECRET=\$(openssl rand -base64 64)

echo "服务器IP: \$SERVER_IP"
echo "域名: \$DOMAIN"

# 创建生产环境变量文件
cat > 配置/环境配置/.env.production << EOF
# 服务器配置
SERVER_IP=\$SERVER_IP
DOMAIN=\$DOMAIN
NODE_ENV=production

# 数据库配置
DB_HOST=db
DB_PORT=5432
DB_NAME=aicam_production
DB_USER=aicam_user
DB_PASSWORD=\$DB_PASSWORD

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=\$REDIS_PASSWORD

# JWT配置
JWT_SECRET=\$JWT_SECRET
JWT_EXPIRES_IN=7d

# AI服务配置
AI_SERVICE_URL=http://ai-service:8001
AI_API_KEY=your_ai_api_key_here

# 文件上传配置
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=50MB

# 日志配置
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log

# 监控配置
ENABLE_MONITORING=true
METRICS_PORT=9090

# SSL配置
SSL_ENABLED=true
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
EOF

# 创建Nginx配置
cat > 配置/nginx/nginx.conf << EOF
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # 上游服务器
    upstream frontend {
        server frontend:3000;
    }
    
    upstream backend {
        server backend:8000;
    }
    
    upstream ai_service {
        server ai-service:8001;
    }
    
    # HTTP重定向到HTTPS
    server {
        listen 80;
        server_name \$DOMAIN www.\$DOMAIN;
        return 301 https://\$server_name\$request_uri;
    }
    
    # HTTPS主站点
    server {
        listen 443 ssl http2;
        server_name \$DOMAIN www.\$DOMAIN;
        
        # SSL配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # 安全头
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # 前端应用
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # 后端API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # AI服务
        location /ai/ {
            proxy_pass http://ai_service;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # 静态文件
        location /static/ {
            alias /app/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

# 创建Docker Compose生产配置
cat > 配置/部署配置/docker-compose.prod.yml << EOF
version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: ./源代码/前端
      dockerfile: Dockerfile.prod
    container_name: aicam-frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=https://\$DOMAIN/api
      - REACT_APP_AI_URL=https://\$DOMAIN/ai
    volumes:
      - ./logs:/app/logs
    networks:
      - aicam-network

  # 后端服务
  backend:
    build:
      context: ./源代码/后端
      dockerfile: Dockerfile.prod
    container_name: aicam-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=aicam_production
      - DB_USER=aicam_user
      - DB_PASSWORD=\$DB_PASSWORD
      - REDIS_HOST=redis
      - REDIS_PASSWORD=\$REDIS_PASSWORD
      - JWT_SECRET=\$JWT_SECRET
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    depends_on:
      - db
      - redis
    networks:
      - aicam-network

  # AI服务
  ai-service:
    build:
      context: ./源代码/AI服务
      dockerfile: Dockerfile.prod
    container_name: aicam-ai-service
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - AI_API_KEY=your_ai_api_key_here
    volumes:
      - ./logs:/app/logs
    networks:
      - aicam-network

  # 数据库
  db:
    image: postgres:13-alpine
    container_name: aicam-db
    restart: unless-stopped
    environment:
      - POSTGRES_DB=aicam_production
      - POSTGRES_USER=aicam_user
      - POSTGRES_PASSWORD=\$DB_PASSWORD
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./备份:/backup
    networks:
      - aicam-network

  # Redis缓存
  redis:
    image: redis:6-alpine
    container_name: aicam-redis
    restart: unless-stopped
    command: redis-server --requirepass \$REDIS_PASSWORD
    volumes:
      - redis_data:/data
    networks:
      - aicam-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: aicam-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./配置/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./配置/SSL配置:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
      - ai-service
    networks:
      - aicam-network

  # 监控服务
  prometheus:
    image: prom/prometheus:latest
    container_name: aicam-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./配置/监控配置/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - aicam-network

  # 日志收集
  filebeat:
    image: docker.elastic.co/beats/filebeat:7.17.0
    container_name: aicam-filebeat
    restart: unless-stopped
    volumes:
      - ./logs:/var/log/aicam
      - ./配置/日志配置/filebeat.yml:/usr/share/filebeat/filebeat.yml
    networks:
      - aicam-network

volumes:
  postgres_data:
  redis_data:
  prometheus_data:

networks:
  aicam-network:
    driver: bridge
EOF

echo "✅ 生产环境配置生成完成"
echo "📝 请检查并修改以下配置:"
echo "   - 域名: \$DOMAIN"
echo "   - AI API密钥"
echo "   - SSL证书路径"
`;

const configGenPath = '脚本/部署脚本/generate-prod-config.sh';
fs.writeFileSync(configGenPath, configGenScript);
console.log('✅ 创建生产环境配置生成脚本');

// 4. 创建部署脚本
console.log('\n🚀 创建部署脚本...');
const deployScript = `#!/bin/bash

echo "🚀 开始部署AICAM系统..."

# 检查Docker环境
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先运行 install-docker.sh"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先运行 install-docker.sh"
    exit 1
fi

# 检查配置文件
if [ ! -f "配置/环境配置/.env.production" ]; then
    echo "❌ 生产环境配置文件不存在，请先运行 generate-prod-config.sh"
    exit 1
fi

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p logs
mkdir -p uploads
mkdir -p 备份
mkdir -p 配置/SSL配置

# 设置文件权限
echo "🔐 设置文件权限..."
chmod 600 配置/环境配置/.env.production
chmod +x 脚本/部署脚本/*.sh

# 构建Docker镜像
echo "🔨 构建Docker镜像..."
docker-compose -f 配置/部署配置/docker-compose.prod.yml build

# 启动服务
echo "🚀 启动服务..."
docker-compose -f 配置/部署配置/docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 健康检查
echo "🔍 执行健康检查..."
./脚本/测试脚本/health-check.js

# 显示服务状态
echo "📊 服务状态:"
docker-compose -f 配置/部署配置/docker-compose.prod.yml ps

echo "\\n✅ 部署完成！"
echo "🌐 访问地址: https://\$(grep DOMAIN 配置/环境配置/.env.production | cut -d'=' -f2)"
echo "📊 监控地址: http://\$(curl -s ifconfig.me):9090"
`;

const deployPath = '脚本/部署脚本/deploy.sh';
fs.writeFileSync(deployPath, deployScript);
console.log('✅ 创建部署脚本');

// 5. 创建健康检查脚本
console.log('\n🔍 创建健康检查脚本...');
const healthCheckScript = `const http = require('http');
const https = require('https');

const healthConfig = {
  services: [
    { name: '前端服务', url: 'http://localhost:3000', path: '/' },
    { name: '后端服务', url: 'http://localhost:8000', path: '/api/health' },
    { name: 'AI服务', url: 'http://localhost:8001', path: '/ai/health' },
    { name: 'Nginx', url: 'http://localhost', path: '/' }
  ],
  timeout: 5000
};

class HealthChecker {
  constructor() {
    this.results = [];
  }

  async checkService(service) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = http.get(service.url + service.path, (res) => {
        const responseTime = Date.now() - startTime;
        
        this.results.push({
          service: service.name,
          status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
          responseTime: responseTime,
          statusCode: res.statusCode
        });
        
        resolve();
      });
      
      req.on('error', () => {
        this.results.push({
          service: service.name,
          status: 'unreachable',
          responseTime: 0,
          statusCode: 0
        });
        resolve();
      });
      
      req.setTimeout(healthConfig.timeout, () => {
        req.destroy();
        this.results.push({
          service: service.name,
          status: 'timeout',
          responseTime: healthConfig.timeout,
          statusCode: 0
        });
        resolve();
      });
    });
  }

  async runHealthCheck() {
    console.log('🔍 开始健康检查...');
    
    const promises = healthConfig.services.map(service => this.checkService(service));
    await Promise.all(promises);
    
    console.log('\\n📊 健康检查结果:');
    this.results.forEach(result => {
      const statusIcon = result.status === 'healthy' ? '✅' : '❌';
      console.log(\`\${statusIcon} \${result.service}: \${result.status} (\${result.responseTime}ms)\`);
    });
    
    const healthyCount = this.results.filter(r => r.status === 'healthy').length;
    const totalCount = this.results.length;
    
    console.log(\`\\n📈 健康状态: \${healthyCount}/\${totalCount} 服务正常\`);
    
    if (healthyCount === totalCount) {
      console.log('🎉 所有服务运行正常！');
      process.exit(0);
    } else {
      console.log('⚠️  部分服务存在问题，请检查日志');
      process.exit(1);
    }
  }
}

const checker = new HealthChecker();
checker.runHealthCheck().catch(console.error);
`;

const healthCheckPath = '脚本/测试脚本/health-check.js';
fs.writeFileSync(healthCheckPath, healthCheckScript);
console.log('✅ 创建健康检查脚本');

// 6. 生成部署指南
console.log('\n📋 生成部署指南...');
const deploymentGuide = `# AICAM Linux服务器部署指南

## 前置要求

### 服务器配置
- **操作系统**: Ubuntu 20.04+ 或 CentOS 8+
- **内存**: 最少4GB，推荐8GB+
- **存储**: 最少20GB，推荐50GB+
- **CPU**: 最少2核，推荐4核+
- **网络**: 公网IP，开放80/443端口

### 域名要求
- 已注册的域名
- 域名解析指向服务器IP
- 支持SSL证书申请

## 部署步骤

### 1. 服务器环境检查
\`\`\`bash
# 上传项目文件到服务器
scp -r AICAMV2/ user@your-server:/home/user/

# 进入项目目录
cd AICAMV2

# 运行环境检查
chmod +x 脚本/部署脚本/check-server-env.sh
./脚本/部署脚本/check-server-env.sh
\`\`\`

### 2. 安装Docker环境
\`\`\`bash
# 安装Docker和Docker Compose
chmod +x 脚本/部署脚本/install-docker.sh
./脚本/部署脚本/install-docker.sh

# 重新登录或应用组权限
newgrp docker
\`\`\`

### 3. 生成生产环境配置
\`\`\`bash
# 生成配置文件（替换为您的域名）
chmod +x 脚本/部署脚本/generate-prod-config.sh
./脚本/部署脚本/generate-prod-config.sh yourdomain.com

# 检查并修改配置
vim 配置/环境配置/.env.production
vim 配置/nginx/nginx.conf
\`\`\`

### 4. 配置SSL证书
\`\`\`bash
# 安装Certbot
sudo apt-get install certbot python3-certbot-nginx

# 申请SSL证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem 配置/SSL配置/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem 配置/SSL配置/key.pem
sudo chown \$USER:\$USER 配置/SSL配置/*
\`\`\`

### 5. 部署应用
\`\`\`bash
# 运行部署脚本
chmod +x 脚本/部署脚本/deploy.sh
./脚本/部署脚本/deploy.sh
\`\`\`

### 6. 验证部署
\`\`\`bash
# 健康检查
node 脚本/测试脚本/health-check.js

# 查看服务状态
docker-compose -f 配置/部署配置/docker-compose.prod.yml ps

# 查看日志
docker-compose -f 配置/部署配置/docker-compose.prod.yml logs -f
\`\`\`

## 访问地址

- **主站**: https://yourdomain.com
- **API文档**: https://yourdomain.com/api/docs
- **监控面板**: http://your-server-ip:9090
- **健康检查**: https://yourdomain.com/api/health

## 运维命令

### 服务管理
\`\`\`bash
# 启动服务
docker-compose -f 配置/部署配置/docker-compose.prod.yml up -d

# 停止服务
docker-compose -f 配置/部署配置/docker-compose.prod.yml down

# 重启服务
docker-compose -f 配置/部署配置/docker-compose.prod.yml restart

# 查看日志
docker-compose -f 配置/部署配置/docker-compose.prod.yml logs -f [service-name]
\`\`\`

### 备份恢复
\`\`\`bash
# 数据库备份
docker exec aicam-db pg_dump -U aicam_user aicam_production > 备份/db_backup_\$(date +%Y%m%d_%H%M%S).sql

# 文件备份
tar -czf 备份/files_backup_\$(date +%Y%m%d_%H%M%S).tar.gz 源代码 配置 资源 文档

# 数据库恢复
docker exec -i aicam-db psql -U aicam_user aicam_production < 备份/db_backup_20250101_120000.sql
\`\`\`

### 监控告警
\`\`\`bash
# 查看系统资源
docker stats

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看网络连接
netstat -tuln
\`\`\`

## 故障排除

### 常见问题

1. **端口被占用**
   \`\`\`bash
   # 查看端口占用
   netstat -tuln | grep :80
   
   # 停止占用端口的服务
   sudo systemctl stop apache2
   sudo systemctl stop nginx
   \`\`\`

2. **SSL证书问题**
   \`\`\`bash
   # 检查证书有效期
   openssl x509 -in 配置/SSL配置/cert.pem -text -noout | grep "Not After"
   
   # 续期证书
   sudo certbot renew
   \`\`\`

3. **数据库连接失败**
   \`\`\`bash
   # 检查数据库状态
   docker logs aicam-db
   
   # 进入数据库容器
   docker exec -it aicam-db psql -U aicam_user aicam_production
   \`\`\`

4. **服务启动失败**
   \`\`\`bash
   # 查看详细日志
   docker-compose -f 配置/部署配置/docker-compose.prod.yml logs [service-name]
   
   # 重新构建镜像
   docker-compose -f 配置/部署配置/docker-compose.prod.yml build --no-cache
   \`\`\`

## 安全建议

1. **防火墙配置**
   \`\`\`bash
   # 只开放必要端口
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   \`\`\`

2. **定期更新**
   \`\`\`bash
   # 更新系统
   sudo apt-get update && sudo apt-get upgrade
   
   # 更新Docker镜像
   docker-compose -f 配置/部署配置/docker-compose.prod.yml pull
   \`\`\`

3. **备份策略**
   - 每日自动备份数据库
   - 每周备份配置文件
   - 每月完整备份

## 性能优化

1. **Nginx优化**
   - 启用Gzip压缩
   - 配置缓存策略
   - 调整worker进程数

2. **数据库优化**
   - 调整连接池大小
   - 优化查询索引
   - 定期清理日志

3. **应用优化**
   - 启用Redis缓存
   - 配置CDN加速
   - 优化静态资源

## 联系支持

如遇到问题，请提供以下信息：
- 服务器操作系统版本
- Docker版本
- 错误日志
- 复现步骤
`;

const guidePath = '文档/部署指南/Linux服务器部署指南.md';
if (!fs.existsSync('文档/部署指南')) {
  fs.mkdirSync('文档/部署指南', { recursive: true });
}
fs.writeFileSync(guidePath, deploymentGuide);
console.log('✅ 生成部署指南');

// 7. 生成部署准备报告
console.log('\n📋 生成部署准备报告...');
const deployReport = {
  timestamp: new Date().toISOString(),
  version: 'v1.0.0',
  status: 'READY_FOR_DEPLOYMENT',
  serverRequirements: serverConfig,
  deploymentScripts: [
    'check-server-env.sh - 服务器环境检查',
    'install-docker.sh - Docker环境安装',
    'generate-prod-config.sh - 生产配置生成',
    'deploy.sh - 应用部署',
    'health-check.js - 健康检查'
  ],
  configurationFiles: [
    '配置/环境配置/.env.production',
    '配置/nginx/nginx.conf',
    '配置/部署配置/docker-compose.prod.yml',
    '配置/SSL配置/',
    '配置/监控配置/',
    '配置/日志配置/'
  ],
  deploymentSteps: [
    '1. 上传项目文件到Linux服务器',
    '2. 运行环境检查脚本',
    '3. 安装Docker环境',
    '4. 配置域名和SSL证书',
    '5. 生成生产环境配置',
    '6. 运行部署脚本',
    '7. 验证部署结果'
  ],
  nextActions: [
    '提供服务器IP和域名信息',
    '确认服务器配置满足要求',
    '准备SSL证书',
    '配置防火墙规则',
    '开始部署流程'
  ]
};

const reportPath = '项目管理/进度报告/Linux服务器部署准备报告.json';
fs.writeFileSync(reportPath, JSON.stringify(deployReport, null, 2));
console.log('✅ 生成部署准备报告');

console.log('\n🎉 Linux服务器部署准备完成！');
console.log('📋 已创建的脚本:');
deployReport.deploymentScripts.forEach(script => console.log(`   ✅ ${script}`));

console.log('\n📁 配置文件位置:');
deployReport.configurationFiles.forEach(file => console.log(`   📄 ${file}`));

console.log('\n🚀 部署步骤:');
deployReport.deploymentSteps.forEach(step => console.log(`   ${step}`));

console.log('\n💡 下一步操作:');
deployReport.nextActions.forEach(action => console.log(`   🔸 ${action}`));

console.log('\n📖 详细部署指南: 文档/部署指南/Linux服务器部署指南.md');
console.log('\n🎯 准备就绪，可以开始Linux服务器部署！'); 