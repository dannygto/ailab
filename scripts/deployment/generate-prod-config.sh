#!/bin/bash

echo "⚙️ 生成生产环境配置..."

# 获取服务器信息
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN=${1:-"yourdomain.com"}
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

echo "服务器IP: $SERVER_IP"
echo "域名: $DOMAIN"

# 创建生产环境变量文件
cat > 配置/环境配置/.env.production << EOF
# 服务器配置
SERVER_IP=$SERVER_IP
DOMAIN=$DOMAIN
NODE_ENV=production

# 数据库配置
DB_HOST=db
DB_PORT=5432
DB_NAME=aicam_production
DB_USER=aicam_user
DB_PASSWORD=$DB_PASSWORD

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT配置
JWT_SECRET=$JWT_SECRET
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
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
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
        server_name $DOMAIN www.$DOMAIN;
        return 301 https://$server_name$request_uri;
    }
    
    # HTTPS主站点
    server {
        listen 443 ssl http2;
        server_name $DOMAIN www.$DOMAIN;
        
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
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # 后端API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # AI服务
        location /ai/ {
            proxy_pass http://ai_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
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
      - REACT_APP_API_URL=https://$DOMAIN/api
      - REACT_APP_AI_URL=https://$DOMAIN/ai
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
      - DB_PASSWORD=$DB_PASSWORD
      - REDIS_HOST=redis
      - REDIS_PASSWORD=$REDIS_PASSWORD
      - JWT_SECRET=$JWT_SECRET
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
      - POSTGRES_PASSWORD=$DB_PASSWORD
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
    command: redis-server --requirepass $REDIS_PASSWORD
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
echo "   - 域名: $DOMAIN"
echo "   - AI API密钥"
echo "   - SSL证书路径"
