const fs = require('fs');
const path = require('path');

// 部署配置模板
const dockerComposeTemplate = `version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: ./源代码/前端
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - backend
    networks:
      - aicam-network

  # 后端服务
  backend:
    build:
      context: ./源代码/后端
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/aicam
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - db
    networks:
      - aicam-network

  # AI服务
  ai-service:
    build:
      context: ./源代码/AI服务
      dockerfile: Dockerfile
    ports:
      - "8001:8001"
    environment:
      - NODE_ENV=production
      - AI_MODEL_PATH=/app/models
    volumes:
      - ai-models:/app/models
    networks:
      - aicam-network

  # 数据库
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=aicam
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - aicam-network

  # Redis缓存
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    networks:
      - aicam-network

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./配置/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./配置/nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - aicam-network

volumes:
  postgres-data:
  ai-models:

networks:
  aicam-network:
    driver: bridge
`;

const nginxConfigTemplate = `events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8000;
    }

    upstream ai-service {
        server ai-service:8001;
    }

    server {
        listen 80;
        server_name localhost;

        # 前端静态文件
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # API接口
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # AI服务接口
        location /ai/ {
            proxy_pass http://ai-service;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }

        # 静态资源
        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
`;

const envTemplate = `# 环境变量配置
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/aicam
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=aicam
DATABASE_USER=user
DATABASE_PASSWORD=password

# Redis配置
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=8000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000

# AI服务配置
AI_SERVICE_URL=http://localhost:8001
AI_MODEL_PATH=/app/models

# 日志配置
LOG_LEVEL=info
LOG_FILE=logs/app.log

# 监控配置
ENABLE_MONITORING=true
METRICS_PORT=9090

# 安全配置
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
`;

const deploymentScriptTemplate = `#!/bin/bash

# AICAM 项目部署脚本
# 版本: v1.0.0
# 更新时间: $(date)

set -e

echo "🚀 开始部署 AICAM 项目..."

# 颜色定义
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "\${GREEN}[INFO]\${NC} \$1"
}

log_warn() {
    echo -e "\${YELLOW}[WARN]\${NC} \$1"
}

log_error() {
    echo -e "\${RED}[ERROR]\${NC} \$1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_info "依赖检查完成"
}

# 环境准备
prepare_environment() {
    log_info "准备部署环境..."
    
    # 创建必要的目录
    mkdir -p logs
    mkdir -p 配置/nginx/ssl
    mkdir -p 备份
    
    # 复制环境变量文件
    if [ ! -f .env ]; then
        cp 配置/环境配置/env.example .env
        log_warn "请编辑 .env 文件配置环境变量"
    fi
    
    log_info "环境准备完成"
}

# 构建镜像
build_images() {
    log_info "构建 Docker 镜像..."
    
    docker-compose build --no-cache
    
    log_info "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    docker-compose up -d
    
    log_info "服务启动完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 30
    
    # 检查前端服务
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "前端服务运行正常"
    else
        log_error "前端服务检查失败"
        return 1
    fi
    
    # 检查后端服务
    if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
        log_info "后端服务运行正常"
    else
        log_error "后端服务检查失败"
        return 1
    fi
    
    log_info "健康检查完成"
}

# 备份数据
backup_data() {
    log_info "备份现有数据..."
    
    if [ -d "备份" ]; then
        tar -czf "备份/backup-\$(date +%Y%m%d-%H%M%S).tar.gz" \\
            --exclude=node_modules \\
            --exclude=.git \\
            --exclude=logs \\
            .
    fi
    
    log_info "数据备份完成"
}

# 主函数
main() {
    echo "========================================"
    echo "    AICAM 项目部署脚本"
    echo "========================================"
    
    # 检查依赖
    check_dependencies
    
    # 备份数据
    backup_data
    
    # 准备环境
    prepare_environment
    
    # 构建镜像
    build_images
    
    # 启动服务
    start_services
    
    # 健康检查
    health_check
    
    echo "========================================"
    echo "🎉 部署完成！"
    echo "前端地址: http://localhost:3000"
    echo "后端API: http://localhost:8000"
    echo "AI服务: http://localhost:8001"
    echo "========================================"
}

# 执行主函数
main "\$@"
`;

function createDeploymentConfigs() {
  console.log('🔧 创建部署配置文件...');
  
  // 创建nginx配置目录
  const nginxDir = '配置/nginx';
  if (!fs.existsSync(nginxDir)) {
    fs.mkdirSync(nginxDir, { recursive: true });
  }
  
  // 创建nginx配置文件
  const nginxConfigPath = path.join(nginxDir, 'nginx.conf');
  if (!fs.existsSync(nginxConfigPath)) {
    fs.writeFileSync(nginxConfigPath, nginxConfigTemplate);
    console.log('✅ 创建nginx配置文件');
  }
  
  // 创建环境变量文件
  const envPath = '配置/环境配置/.env.production';
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ 创建生产环境变量文件');
  }
  
  // 创建部署脚本
  const deployScriptPath = 'scripts/部署脚本/deploy.sh';
  if (!fs.existsSync(deployScriptPath)) {
    fs.writeFileSync(deployScriptPath, deploymentScriptTemplate);
    // 设置执行权限
    try {
      fs.chmodSync(deployScriptPath, '755');
    } catch (error) {
      console.log('⚠️  无法设置脚本执行权限');
    }
    console.log('✅ 创建部署脚本');
  }
  
  // 更新docker-compose文件
  const dockerComposePath = '配置/部署配置/docker-compose.yml';
  if (fs.existsSync(dockerComposePath)) {
    fs.writeFileSync(dockerComposePath, dockerComposeTemplate);
    console.log('✅ 更新docker-compose配置');
  }
}

function createMonitoringConfig() {
  console.log('📊 创建监控配置...');
  
  const monitoringConfig = {
    version: 'v1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      frontend: {
        port: 3000,
        healthCheck: '/health',
        metrics: '/metrics'
      },
      backend: {
        port: 8000,
        healthCheck: '/api/health',
        metrics: '/api/metrics'
      },
      aiService: {
        port: 8001,
        healthCheck: '/health',
        metrics: '/metrics'
      },
      database: {
        port: 5432,
        healthCheck: 'SELECT 1'
      },
      redis: {
        port: 6379,
        healthCheck: 'PING'
      }
    },
    alerts: {
      cpuThreshold: 80,
      memoryThreshold: 85,
      diskThreshold: 90,
      responseTimeThreshold: 5000
    },
    logging: {
      level: 'info',
      format: 'json',
      retention: '30d'
    }
  };
  
  const monitoringPath = '配置/监控配置/monitoring.json';
  if (!fs.existsSync('配置/监控配置')) {
    fs.mkdirSync('配置/监控配置', { recursive: true });
  }
  
  fs.writeFileSync(monitoringPath, JSON.stringify(monitoringConfig, null, 2));
  console.log('✅ 创建监控配置文件');
}

function createSecurityConfig() {
  console.log('🔒 创建安全配置...');
  
  const securityConfig = {
    version: 'v1.0.0',
    timestamp: new Date().toISOString(),
    authentication: {
      jwtSecret: 'change-this-in-production',
      jwtExpiresIn: '7d',
      refreshTokenExpiresIn: '30d',
      passwordMinLength: 8,
      passwordRequireSpecialChars: true
    },
    authorization: {
      roles: ['admin', 'teacher', 'student', 'guest'],
      permissions: {
        admin: ['*'],
        teacher: ['read', 'write', 'delete'],
        student: ['read', 'write'],
        guest: ['read']
      }
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15分钟
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    cors: {
      origin: ['http://localhost:3000', 'https://yourdomain.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    },
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  };
  
  const securityPath = '配置/安全配置/security.json';
  if (!fs.existsSync('配置/安全配置')) {
    fs.mkdirSync('配置/安全配置', { recursive: true });
  }
  
  fs.writeFileSync(securityPath, JSON.stringify(securityConfig, null, 2));
  console.log('✅ 创建安全配置文件');
}

function createBackupScript() {
  console.log('💾 创建备份脚本...');
  
  const backupScript = `#!/bin/bash

# AICAM 项目备份脚本
# 版本: v1.0.0

set -e

BACKUP_DIR="备份/\$(date +%Y%m%d)"
BACKUP_FILE="aicam-backup-\$(date +%Y%m%d-%H%M%S).tar.gz"

echo "开始备份 AICAM 项目..."

# 创建备份目录
mkdir -p "\$BACKUP_DIR"

# 备份数据库
echo "备份数据库..."
docker-compose exec -T db pg_dump -U user aicam > "\$BACKUP_DIR/database.sql"

# 备份文件
echo "备份项目文件..."
tar -czf "\$BACKUP_DIR/\$BACKUP_FILE" \\
    --exclude=node_modules \\
    --exclude=.git \\
    --exclude=logs \\
    --exclude=备份 \\
    .

echo "备份完成: \$BACKUP_DIR/\$BACKUP_FILE"

# 清理旧备份（保留最近7天）
find 备份 -name "*.tar.gz" -mtime +7 -delete
find 备份 -name "*.sql" -mtime +7 -delete

echo "清理完成"
`;
  
  const backupScriptPath = 'scripts/维护脚本/backup.sh';
  if (!fs.existsSync(backupScriptPath)) {
    fs.writeFileSync(backupScriptPath, backupScript);
    try {
      fs.chmodSync(backupScriptPath, '755');
    } catch (error) {
      console.log('⚠️  无法设置备份脚本执行权限');
    }
    console.log('✅ 创建备份脚本');
  }
}

function generateDeploymentReport() {
  console.log('📋 生成部署配置报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: 'v1.0.0',
    deploymentConfigs: {
      dockerCompose: '配置/部署配置/docker-compose.yml',
      nginx: '配置/nginx/nginx.conf',
      environment: '配置/环境配置/.env.production',
      monitoring: '配置/监控配置/monitoring.json',
      security: '配置/安全配置/security.json'
    },
    scripts: {
      deploy: 'scripts/部署脚本/deploy.sh',
      backup: 'scripts/维护脚本/backup.sh'
    },
    services: [
      {
        name: 'frontend',
        port: 3000,
        description: 'React前端应用'
      },
      {
        name: 'backend',
        port: 8000,
        description: 'Node.js后端API'
      },
      {
        name: 'ai-service',
        port: 8001,
        description: 'AI服务'
      },
      {
        name: 'database',
        port: 5432,
        description: 'PostgreSQL数据库'
      },
      {
        name: 'redis',
        port: 6379,
        description: 'Redis缓存'
      },
      {
        name: 'nginx',
        port: 80,
        description: 'Nginx反向代理'
      }
    ],
    nextSteps: [
      '编辑 .env 文件配置环境变量',
      '配置SSL证书（生产环境）',
      '设置数据库密码',
      '配置监控告警',
      '测试部署脚本'
    ]
  };
  
  const reportPath = '项目管理/进度报告/部署配置报告.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('✅ 生成部署配置报告');
  
  return report;
}

function main() {
  console.log('🚀 开始完善部署配置...\n');
  
  try {
    // 1. 创建部署配置文件
    createDeploymentConfigs();
    
    // 2. 创建监控配置
    createMonitoringConfig();
    
    // 3. 创建安全配置
    createSecurityConfig();
    
    // 4. 创建备份脚本
    createBackupScript();
    
    // 5. 生成部署报告
    const report = generateDeploymentReport();
    
    console.log('\n🎉 部署配置完善完成！');
    console.log('📋 配置文件位置:');
    console.log('   - Docker配置: 配置/部署配置/docker-compose.yml');
    console.log('   - Nginx配置: 配置/nginx/nginx.conf');
    console.log('   - 环境变量: 配置/环境配置/.env.production');
    console.log('   - 监控配置: 配置/监控配置/monitoring.json');
    console.log('   - 安全配置: 配置/安全配置/security.json');
    console.log('   - 部署脚本: scripts/部署脚本/deploy.sh');
    console.log('   - 备份脚本: scripts/维护脚本/backup.sh');
    console.log('   - 详细报告: 项目管理/进度报告/部署配置报告.json');
    
  } catch (error) {
    console.error('❌ 部署配置完善过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  createDeploymentConfigs,
  createMonitoringConfig,
  createSecurityConfig,
  createBackupScript,
  generateDeploymentReport
}; 