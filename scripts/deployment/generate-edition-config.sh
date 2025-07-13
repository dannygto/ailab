#!/bin/bash
# AILAB平台版本配置脚本
# 用于生成不同版本的配置文件

# 版本类型：general（普教版）, vocational（职教版）, higher（高校版）
EDITION=${1:-general}
SCHOOL_ID=${2:-demo-school-001}
SCHOOL_NAME=${3:-示范学校}
TARGET_ENV=${4:-production}

echo "======================================="
echo "  AILAB平台版本配置"
echo "======================================="
echo "版本类型: $EDITION"
echo "学校ID: $SCHOOL_ID"
echo "学校名称: $SCHOOL_NAME"
echo "目标环境: $TARGET_ENV"
echo "======================================="

# 创建配置目录
mkdir -p config/deployment

# 生成版本配置文件
cat > config/deployment/edition.config.json << EOF
{
  "edition": "$EDITION",
  "schoolId": "$SCHOOL_ID",
  "schoolName": "$SCHOOL_NAME",
  "environment": "$TARGET_ENV",
  "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0.0-$EDITION",
  "features": $(case $EDITION in
    general)
      echo '["experiment-management", "student-management", "teacher-management", "ai-assistant", "device-management", "data-analytics", "campus-management", "course-template"]'
      ;;
    vocational)
      echo '["experiment-management", "student-management", "teacher-management", "ai-assistant", "device-management", "data-analytics", "campus-management", "course-template", "skills-training", "skill-assessment", "enterprise-cooperation", "certification-management"]'
      ;;
    higher)
      echo '["experiment-management", "student-management", "teacher-management", "ai-assistant", "device-management", "data-analytics", "campus-management", "course-template", "research-management", "academic-analytics", "paper-management", "lab-booking", "graduate-management", "collaboration-platform"]'
      ;;
    *)
      echo '["experiment-management", "student-management", "teacher-management"]'
      ;;
  esac),
  "limits": $(case $EDITION in
    general)
      echo '{"maxStudents": 5000, "maxTeachers": 500, "maxCampuses": 10}'
      ;;
    vocational)
      echo '{"maxStudents": 8000, "maxTeachers": 800, "maxCampuses": 15}'
      ;;
    higher)
      echo '{"maxStudents": 20000, "maxTeachers": 2000, "maxCampuses": 20}'
      ;;
    *)
      echo '{"maxStudents": 1000, "maxTeachers": 100, "maxCampuses": 3}'
      ;;
  esac)
}
EOF

# 生成环境变量文件
cat > config/deployment/.env.$EDITION << EOF
# AILAB平台环境配置 - $EDITION版本
NODE_ENV=$TARGET_ENV
PORT=3001
FRONTEND_PORT=3000

# 版本信息
AILAB_EDITION=$EDITION
AILAB_SCHOOL_ID=$SCHOOL_ID
AILAB_SCHOOL_NAME=$SCHOOL_NAME
AILAB_VERSION=1.0.0-$EDITION

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/ailab_${SCHOOL_ID}_${EDITION}

# AI服务配置
AI_SERVICE_ENABLED=true
AI_SERVICE_PORT=8080

# 文件存储
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=100MB

# 安全配置
JWT_SECRET=your-jwt-secret-${SCHOOL_ID}
ENCRYPTION_KEY=your-encryption-key-${SCHOOL_ID}

# 日志配置
LOG_LEVEL=info
LOG_DIR=./logs

# 邮件配置
SMTP_HOST=smtp.${SCHOOL_NAME}.edu.cn
SMTP_PORT=587
SMTP_USER=noreply@${SCHOOL_NAME}.edu.cn
SMTP_PASS=your-smtp-password

# 备份配置
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
EOF

# 生成PM2配置
cat > config/deployment/ecosystem.$EDITION.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ailab-backend-$EDITION',
      cwd: './src/backend',
      script: 'src/server.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm --experimental-specifier-resolution=node --max-old-space-size=2048',
      env: {
        NODE_ENV: '$TARGET_ENV',
        PORT: 3001,
        TS_NODE_PROJECT: 'tsconfig.json',
        TS_NODE_ESM: 'true',
        AILAB_EDITION: '$EDITION',
        AILAB_SCHOOL_ID: '$SCHOOL_ID',
        AILAB_SCHOOL_NAME: '$SCHOOL_NAME'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '2G',
      error_file: './logs/backend-$EDITION-error.log',
      out_file: './logs/backend-$EDITION-out.log',
      log_file: './logs/backend-$EDITION.log',
      time: true
    },
    {
      name: 'ailab-frontend-$EDITION',
      cwd: './src/frontend',
      script: '/usr/bin/npx',
      args: ['http-server', 'build', '-p', '3000', '-a', '0.0.0.0', '--proxy', 'http://localhost:3001?', '--cors'],
      env: {
        NODE_ENV: '$TARGET_ENV',
        AILAB_EDITION: '$EDITION',
        AILAB_SCHOOL_ID: '$SCHOOL_ID'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: './logs/frontend-$EDITION-error.log',
      out_file: './logs/frontend-$EDITION-out.log',
      log_file: './logs/frontend-$EDITION.log',
      time: true
    }$(if [ "$EDITION" != "general" ] || [ "$TARGET_ENV" = "production" ]; then
      echo ','
      echo '    {'
      echo '      name: "ailab-ai-service-'$EDITION'",'
      echo '      cwd: "./src/ai-service",'
      echo '      script: "app.py",'
      echo '      interpreter: "python3",'
      echo '      env: {'
      echo '        PORT: 8080,'
      echo '        EDITION: "'$EDITION'",'
      echo '        SCHOOL_ID: "'$SCHOOL_ID'"'
      echo '      },'
      echo '      watch: false,'
      echo '      instances: 1,'
      echo '      exec_mode: "fork",'
      echo '      max_memory_restart: "1G",'
      echo '      error_file: "./logs/ai-service-'$EDITION'-error.log",'
      echo '      out_file: "./logs/ai-service-'$EDITION'-out.log",'
      echo '      log_file: "./logs/ai-service-'$EDITION'.log",'
      echo '      time: true'
      echo '    }'
    fi)
  ]
};
EOF

# 生成版本特定的前端配置
mkdir -p src/frontend/public/config
cat > src/frontend/public/config/app-config.$EDITION.json << EOF
{
  "edition": "$EDITION",
  "editionName": "$(case $EDITION in
    general) echo '普教版' ;;
    vocational) echo '职教版' ;;
    higher) echo '高校版' ;;
  esac)",
  "schoolId": "$SCHOOL_ID",
  "schoolName": "$SCHOOL_NAME",
  "version": "1.0.0-$EDITION",
  "apiBaseUrl": "/api",
  "features": {
    "experimentManagement": true,
    "studentManagement": true,
    "teacherManagement": true,
    "aiAssistant": true,
    "deviceManagement": true,
    "dataAnalytics": true,
    "campusManagement": true,
    "courseTemplate": true,
    "skillsTraining": $([ "$EDITION" = "vocational" ] || [ "$EDITION" = "higher" ] && echo 'true' || echo 'false'),
    "skillAssessment": $([ "$EDITION" = "vocational" ] || [ "$EDITION" = "higher" ] && echo 'true' || echo 'false'),
    "enterpriseCooperation": $([ "$EDITION" = "vocational" ] && echo 'true' || echo 'false'),
    "researchManagement": $([ "$EDITION" = "higher" ] && echo 'true' || echo 'false'),
    "academicAnalytics": $([ "$EDITION" = "higher" ] && echo 'true' || echo 'false'),
    "paperManagement": $([ "$EDITION" = "higher" ] && echo 'true' || echo 'false'),
    "labBooking": $([ "$EDITION" = "higher" ] && echo 'true' || echo 'false'),
    "graduateManagement": $([ "$EDITION" = "higher" ] && echo 'true' || echo 'false')
  },
  "ui": {
    "theme": {
      "primaryColor": "$(case $EDITION in
        general) echo '#1976d2' ;;
        vocational) echo '#ff9800' ;;
        higher) echo '#9c27b0' ;;
      esac)",
      "logo": "/assets/logo-$EDITION.png"
    },
    "navigation": {
      "showAdvancedFeatures": $([ "$EDITION" != "general" ] && echo 'true' || echo 'false')
    }
  },
  "limits": {
    "maxStudents": $(case $EDITION in
      general) echo '5000' ;;
      vocational) echo '8000' ;;
      higher) echo '20000' ;;
    esac),
    "maxTeachers": $(case $EDITION in
      general) echo '500' ;;
      vocational) echo '800' ;;
      higher) echo '2000' ;;
    esac),
    "maxCampuses": $(case $EDITION in
      general) echo '10' ;;
      vocational) echo '15' ;;
      higher) echo '20' ;;
    esac)
  }
}
EOF

# 生成部署说明文档
cat > config/deployment/README-$EDITION.md << EOF
# AILAB平台 - $EDITION版本部署说明

## 版本信息
- **版本类型**: $(case $EDITION in
  general) echo '普教版 (面向普通中小学)' ;;
  vocational) echo '职教版 (面向职业学校)' ;;
  higher) echo '高校版 (面向大学院校)' ;;
esac)
- **学校ID**: $SCHOOL_ID
- **学校名称**: $SCHOOL_NAME
- **目标环境**: $TARGET_ENV
- **生成时间**: $(date)

## 快速部署

### 1. 环境准备
\`\`\`bash
# 加载环境变量
source config/deployment/.env.$EDITION

# 设置数据库
export MONGODB_URI=mongodb://localhost:27017/ailab_${SCHOOL_ID}_${EDITION}
\`\`\`

### 2. 启动服务
\`\`\`bash
# 使用PM2启动
pm2 start config/deployment/ecosystem.$EDITION.config.js

# 查看状态
pm2 status
pm2 logs
\`\`\`

### 3. 验证部署
- 前端地址: http://localhost:3000
- 后端API: http://localhost:3001
- 版本信息: http://localhost:3001/api/version

## 版本特性

### 基础功能
- ✅ 实验管理
- ✅ 学生管理
- ✅ 教师管理
- ✅ AI助手
- ✅ 设备管理
- ✅ 数据分析
- ✅ 校区管理
- ✅ 课程模板

$(case $EDITION in
  vocational)
    echo '### 职教版特有功能'
    echo '- ✅ 实训管理'
    echo '- ✅ 技能评估'
    echo '- ✅ 企业合作'
    echo '- ✅ 认证管理'
    ;;
  higher)
    echo '### 高校版特有功能'
    echo '- ✅ 研究管理'
    echo '- ✅ 学术分析'
    echo '- ✅ 论文管理'
    echo '- ✅ 实验室预约'
    echo '- ✅ 研究生管理'
    echo '- ✅ 协作平台'
    ;;
esac)

## 系统限制
- 最大学生数: $(case $EDITION in general) echo '5,000' ;; vocational) echo '8,000' ;; higher) echo '20,000' ;; esac)
- 最大教师数: $(case $EDITION in general) echo '500' ;; vocational) echo '800' ;; higher) echo '2,000' ;; esac)
- 最大校区数: $(case $EDITION in general) echo '10' ;; vocational) echo '15' ;; higher) echo '20' ;; esac)

## 技术支持
- 邮箱: support@ailab-platform.com
- 文档: https://docs.ailab-platform.com/$EDITION
- 更新: https://updates.ailab-platform.com/$EDITION
EOF

echo ""
echo "✅ 版本配置生成完成"
echo ""
echo "📁 生成的文件:"
echo "  - config/deployment/edition.config.json"
echo "  - config/deployment/.env.$EDITION"
echo "  - config/deployment/ecosystem.$EDITION.config.js"
echo "  - src/frontend/public/config/app-config.$EDITION.json"
echo "  - config/deployment/README-$EDITION.md"
echo ""
echo "🚀 使用方法:"
echo "  1. 部署: pm2 start config/deployment/ecosystem.$EDITION.config.js"
echo "  2. 查看: pm2 status"
echo "  3. 日志: pm2 logs"
echo ""
echo "📖 详细说明请查看: config/deployment/README-$EDITION.md"
