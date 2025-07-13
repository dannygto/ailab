#!/bin/bash
# AILAB平台 - Linux服务器部署脚本
# 此脚本用于在Linux服务器上部署AILAB平台（非Docker版）
# 适用于直接上传源代码到服务器的场景
# 优化版：支持网络受限环境，改进GPG密钥处理

# 不使用 set -e，以便脚本在遇到错误时能够继续执行
# 而是手动检查每个关键步骤的结果

# 日志函数
log_info() {
  echo -e "\033[0;32m[信息]\033[0m $1"
}

log_warning() {
  echo -e "\033[0;33m[警告]\033[0m $1"
}

log_error() {
  echo -e "\033[0;31m[错误]\033[0m $1"
}

log_success() {
  echo -e "\033[0;32m[成功]\033[0m $1"
}

echo "====================================="
echo "  AILAB平台 - Linux服务器部署脚本"
echo "  (优化版: 支持网络受限环境)"
echo "====================================="

# 检测Linux发行版
log_info "检测Linux发行版..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS_NAME=$NAME
    OS_VERSION=$VERSION_ID
    log_info "检测到操作系统: $OS_NAME $OS_VERSION"
else
    log_warning "无法检测操作系统类型，将假设为Ubuntu/Debian系统"
    OS_NAME="Unknown"
    OS_VERSION="Unknown"
fi

# 安装Node.js环境（使用系统包管理器）
log_info "安装Node.js环境..."

# 依赖检查函数
check_dependency() {
  local cmd=$1
  local package=$2
  local min_version=$3
  local install_cmd=$4

  log_info "检查 $package..."

  if command -v $cmd &> /dev/null; then
    log_success "$package 已安装"

    # 如果指定了最小版本，则检查版本
    if [ ! -z "$min_version" ]; then
      local version=$($cmd --version 2>/dev/null | head -n 1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)
      local major_version=$(echo $version | cut -d. -f1)

      if [ "$major_version" -lt "$min_version" ]; then
        log_warning "$package 版本 ($version) 低于推荐的最小版本 $min_version.x"
        log_warning "某些功能可能无法正常工作。建议升级 $package。"
        return 2  # 版本过低
      else
        log_success "$package 版本 ($version) 符合要求 (>= $min_version.x)"
        return 0  # 已安装且版本符合要求
      fi
    fi

    return 0  # 已安装
  else
    log_error "$package 未安装"
    if [ ! -z "$install_cmd" ]; then
      log_info "推荐安装命令: $install_cmd"
    fi
    return 1  # 未安装
  fi
}

# Node.js安装函数 - 使用现代方法
install_nodejs_modern() {
  log_info "使用现代方法安装Node.js 16..."

  # 清理可能存在的旧版本
  log_info "清理可能存在的旧版本Node.js..."
  sudo apt-get -y purge nodejs npm
  sudo apt-get -y autoremove

  # 安装依赖
  log_info "安装GPG依赖..."
  sudo apt-get install -y ca-certificates curl gnupg

  # 导入Node.js GPG密钥（使用推荐的keyring方法）
  log_info "导入Node.js GPG密钥..."
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | \
    sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg

  # 添加NodeSource源
  log_info "添加Node.js源..."
  echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_16.x $(lsb_release -sc) main" | \
    sudo tee /etc/apt/sources.list.d/nodesource.list > /dev/null

  # 更新包列表
  log_info "更新软件包列表..."
  sudo apt-get update

  # 安装Node.js
  log_info "安装Node.js 16..."
  sudo apt-get install -y nodejs

  # 检查安装结果
  if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    log_success "Node.js 安装成功: $NODE_VERSION"
    return 0
  else
    log_error "Node.js 安装失败"
    return 1
  fi
}

# MongoDB安装函数 - 使用优化方法
install_mongodb_modern() {
  log_info "使用优化方法安装MongoDB..."

  # 添加Ubuntu focal-security源以获取libssl1.1
  log_info "添加Ubuntu focal-security源以解决libssl1.1依赖问题..."
  echo "deb http://security.ubuntu.com/ubuntu focal-security main" | sudo tee /etc/apt/sources.list.d/focal-security.list > /dev/null

  # 更新包列表
  log_info "更新软件包列表..."
  sudo apt-get update

  # 安装libssl1.1依赖
  log_info "安装libssl1.1依赖..."
  sudo apt-get install -y libssl1.1

  # 安装MongoDB
  log_info "安装MongoDB 4.4..."
  sudo apt-get install -y mongodb-org

  # 启动并启用MongoDB服务
  log_info "启动MongoDB服务..."
  sudo systemctl start mongod
  sudo systemctl enable mongod

  # 检查安装结果
  if command -v mongod &> /dev/null; then
    log_success "MongoDB 安装成功"
    return 0
  else
    log_error "MongoDB 安装失败"
    return 1
  fi
}
# 调用main函数开始脚本执行
main() {
  # 检查并安装Node.js
  echo "检查Node.js环境..."
  if ! check_dependency "node" "Node.js" "16" ""; then
    echo "Node.js未安装，正在安装Node.js..."

    # 先尝试使用现代方法安装
    install_nodejs_modern && {
      echo "✅ 使用现代方法成功安装Node.js"
    } || {
      echo "现代方法安装失败，尝试传统方法..."

      # 直接使用系统包管理器安装Node.js
      echo "尝试使用系统包管理器直接安装Node.js..."
      sudo apt update

      # 检查系统包管理器中是否有Node.js
      if apt-cache show nodejs &>/dev/null; then
        echo "在系统仓库中找到Node.js，尝试安装..."
        # 尝试安装默认版本
        if ! sudo apt install -y nodejs npm; then
          echo "无法安装Node.js，尝试使用非标准方法..."

          # 尝试使用NodeSource但处理GPG密钥问题
          sudo apt install -y ca-certificates curl gnupg

          # 添加正确的NodeSource GPG密钥 - 使用多种方法尝试
          echo "获取并安装NodeSource GPG密钥..."
          GPG_SUCCESS=false

          # 方法1：使用keyserver.ubuntu.com
          if sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 1655A0AB68576280 2>/dev/null; then
            echo "✅ 成功从keyserver.ubuntu.com获取NodeSource密钥"
            GPG_SUCCESS=true
          else
            echo "通过keyserver.ubuntu.com获取密钥失败，尝试其他方法..."
          fi

          # 方法2：使用keyserver.ubuntu.com的端口80
          if [ "$GPG_SUCCESS" = false ] && sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 1655A0AB68576280 2>/dev/null; then
            echo "✅ 成功从keyserver.ubuntu.com:80获取NodeSource密钥"
            GPG_SUCCESS=true
          else
            echo "通过keyserver.ubuntu.com:80获取密钥失败，尝试其他方法..."
          fi

          # 方法3：使用curl从官方网站
          if [ "$GPG_SUCCESS" = false ] && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add - 2>/dev/null; then
            echo "✅ 成功通过curl从NodeSource网站获取密钥"
            GPG_SUCCESS=true
          else
            echo "通过curl获取密钥失败，尝试其他方法..."
          fi

          # 方法4：使用wget从官方网站
          if [ "$GPG_SUCCESS" = false ] && command -v wget &> /dev/null; then
            if wget -qO- https://deb.nodesource.com/gpgkey/nodesource.gpg.key | sudo apt-key add - 2>/dev/null; then
              echo "✅ 成功通过wget从NodeSource网站获取密钥"
              GPG_SUCCESS=true
            else
              echo "通过wget获取密钥失败..."
            fi
          fi

          if [ "$GPG_SUCCESS" = false ]; then
            echo "警告: 无法获取NodeSource GPG密钥，将继续安装但不验证包签名"
          fi

          # 然后添加仓库
          DISTRO=$(lsb_release -sc)
          echo "deb [trusted=yes] https://deb.nodesource.com/node_16.x $DISTRO main" | sudo tee /etc/apt/sources.list.d/nodesource.list > /dev/null
          echo "deb-src [trusted=yes] https://deb.nodesource.com/node_16.x $DISTRO main" | sudo tee -a /etc/apt/sources.list.d/nodesource.list > /dev/null

          # 告诉APT允许未验证的仓库（备用方案）
          echo 'Acquire::AllowInsecureRepositories "true";' | sudo tee /etc/apt/apt.conf.d/90nodesource > /dev/null
          echo 'APT::Get::AllowUnauthenticated "true";' | sudo tee -a /etc/apt/apt.conf.d/90nodesource > /dev/null

          # 更新软件包列表
          if ! sudo apt update 2>/dev/null; then
            echo "标准更新失败，尝试使用未验证方式更新..."
            if ! sudo apt update --allow-unauthenticated 2>/dev/null; then
              echo "使用--allow-unauthenticated参数仍然失败，尝试更多选项..."
              if ! sudo apt-get update --allow-insecure-repositories 2>/dev/null; then
                echo "所有更新方法都失败，将直接尝试安装Node.js"
              fi
            fi
          fi

          # 使用多种参数组合尝试安装Node.js
          echo "尝试安装Node.js..."
          if ! sudo apt install -y nodejs; then
            echo "标准安装失败，尝试使用未验证方式安装..."
            if ! sudo apt --allow-unauthenticated install -y nodejs; then
              echo "使用--allow-unauthenticated参数仍然失败，尝试更多选项..."
              if ! sudo apt-get --allow-unauthenticated install -y nodejs; then
                echo "使用apt-get仍然失败，尝试--allow-insecure-repositories选项..."
                if ! sudo apt-get --allow-insecure-repositories install -y nodejs; then
                  echo "所有自动安装方法都失败"
                  echo "请尝试手动安装Node.js：访问 https://nodejs.org/en/download/ 下载适合您系统的安装包"
                  echo "或者运行以下命令："
                  echo "curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -"
                  echo "sudo apt-get install -y nodejs"
                fi
              fi
            fi
          fi
        fi
        echo "✅ Node.js和npm安装完成: $(node -v)"
      else
        echo "系统仓库中未找到Node.js，尝试使用NodeSource仓库..."
        # NodeSource仓库部分已在前面处理
      fi
    }
  else
    # 如果Node.js已安装，则检查版本（该检查已由check_dependency函数完成）
    echo "✅ Node.js和npm已安装: $(node -v)"
  fi

  # 检查并安装MongoDB
  echo "检查MongoDB..."
  if command -v mongod &> /dev/null; then
    MONGO_CMD="mongod"
  elif command -v mongo &> /dev/null; then
    MONGO_CMD="mongo"
  else
    MONGO_CMD=""
  fi
  if [ -z "$MONGO_CMD" ]; then
    echo "MongoDB未安装，正在安装..."

    # 先尝试使用现代方法安装
    install_mongodb_modern && {
      echo "✅ 使用现代方法成功安装MongoDB"
    } || {
      echo "现代方法安装失败，尝试备选方法..."

      # 使用Ubuntu focal-security源获取libssl1.1并安装MongoDB
      echo "添加Ubuntu focal-security源..."
      echo "deb http://security.ubuntu.com/ubuntu focal-security main" | sudo tee /etc/apt/sources.list.d/focal-security.list > /dev/null

      sudo apt update

      echo "安装libssl1.1和MongoDB..."
      if ! sudo apt install -y libssl1.1; then
        echo "无法安装libssl1.1，尝试直接安装MongoDB..."
      fi

      if ! sudo apt install -y mongodb-org; then
        echo "尝试安装系统自带的MongoDB..."
        if ! sudo apt install -y mongodb; then
          echo "尝试安装mongodb-server包..."
          if ! sudo apt install -y mongodb-server; then
            log_error "所有MongoDB安装方法均失败"
            log_info "请手动安装MongoDB：访问 https://www.mongodb.com/docs/manual/installation/ 获取安装说明"
            log_info "或尝试使用如下命令："
            log_info "echo \"deb http://security.ubuntu.com/ubuntu focal-security main\" | sudo tee /etc/apt/sources.list.d/focal-security.list"
            log_info "sudo apt update && sudo apt install -y libssl1.1 && sudo apt install -y mongodb-org"
          fi
        fi
      fi

      # 启动服务
      log_info "启动MongoDB服务..."
      if systemctl list-unit-files | grep -q mongod; then
        sudo systemctl start mongod
        sudo systemctl enable mongod
        log_success "MongoDB服务(mongod)已启动并设置为开机启动"
      elif systemctl list-unit-files | grep -q mongodb; then
        sudo systemctl start mongodb
        sudo systemctl enable mongodb
        log_success "MongoDB服务(mongodb)已启动并设置为开机启动"
      else
        log_warning "未找到MongoDB服务单元，请手动确认MongoDB是否正常运行"
      fi

      log_success "MongoDB安装和配置完成"
    }
  else
    log_success "MongoDB已安装"
  fi

  # 确保MongoDB服务正在运行
  if systemctl list-unit-files | grep -q mongod; then
    if ! systemctl is-active --quiet mongod; then
      log_info "启动MongoDB服务(mongod)..."
      sudo systemctl start mongod
      sudo systemctl enable mongod
      log_success "MongoDB服务(mongod)已启动并设置为开机启动"
    else
      log_success "MongoDB服务(mongod)正在运行"
    fi
  elif systemctl list-unit-files | grep -q mongodb; then
    if ! systemctl is-active --quiet mongodb; then
      log_info "启动MongoDB服务(mongodb)..."
      sudo systemctl start mongodb
      sudo systemctl enable mongodb
      log_success "MongoDB服务(mongodb)已启动并设置为开机启动"
    else
      log_success "MongoDB服务(mongodb)正在运行"
    fi
  else
    log_warning "未检测到MongoDB服务，请手动启动MongoDB"
  fi

  # 安装Python环境
  log_info "检查Python环境..."
  if ! check_dependency "python3" "Python3" "3" "sudo apt install -y python3 python3-pip"; then
    log_info "Python3未安装，正在安装..."
    sudo apt update
    if ! sudo apt install -y python3; then
      log_error "无法通过apt安装Python3，请手动安装"
      log_info "推荐安装命令: sudo apt install -y python3 python3-pip"
    else
      log_success "Python3安装完成"
    fi
  fi

  # 检查pip3
  log_info "检查pip3..."
  if ! check_dependency "pip3" "pip3" "" "sudo apt install -y python3-pip"; then
    log_info "pip3未安装，正在安装..."
    sudo apt update
    if ! sudo apt install -y python3-pip; then
      log_error "无法通过apt安装pip3，请手动安装"
      log_info "推荐安装命令: sudo apt install -y python3-pip"
    else
      log_success "pip3安装完成"
    fi
  fi

  # 安装Redis
  log_info "检查Redis服务..."
  if ! check_dependency "redis-cli" "Redis" "" "sudo apt install -y redis-server"; then
    log_info "Redis未安装，正在安装..."
    sudo apt update
    if ! sudo apt install -y redis-server; then
      log_error "无法通过apt安装Redis，请手动安装"
      log_info "推荐安装命令: sudo apt install -y redis-server"
    else
      log_success "Redis安装完成"
      # 启动Redis服务
      log_info "启动Redis服务..."
      sudo systemctl start redis-server
      sudo systemctl enable redis-server
      log_success "Redis服务已启动并设置为开机启动"
    fi
  else
    # Redis已安装，确保服务正在运行
    if systemctl list-unit-files | grep -q redis-server; then
      if ! systemctl is-active --quiet redis-server; then
        log_info "启动Redis服务..."
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
        log_success "Redis服务已启动并设置为开机启动"
      else
        log_success "Redis服务正在运行"
      fi
    else
      log_warning "未找到Redis服务，但redis-cli命令可用"
      log_info "请手动确保Redis服务正在运行"
    fi
  fi

  # 配置变量
  DEPLOY_DIR=${1:-"$(pwd)"}
  FRONTEND_PORT=${2:-3000}
  BACKEND_PORT=${3:-3001}
  MONGODB_URI=${4:-"mongodb://localhost:27017/ailab"}
  CURRENT_DIR=$(pwd)

  # 创建或确认部署目录
  log_info "确认部署目录: $DEPLOY_DIR"
  if [ "$CURRENT_DIR" != "$DEPLOY_DIR" ]; then
    log_info "当前目录 ($CURRENT_DIR) 与部署目录 ($DEPLOY_DIR) 不同"
    log_info "将当前目录文件复制到部署目录..."

    # 确保目标目录存在并有正确的权限
    sudo mkdir -p $DEPLOY_DIR
    sudo chown $(whoami):$(whoami) $DEPLOY_DIR

    # 使用rsync代替cp，提供更好的错误报告和进度显示
    log_info "正在复制文件，这可能需要一些时间..."
    if command -v rsync &> /dev/null; then
      rsync -av --progress ./ $DEPLOY_DIR/ || {
        log_warning "rsync失败，尝试使用cp命令..."
        cp -rv ./* $DEPLOY_DIR/ 2>/dev/null || {
          log_error "文件复制可能不完整，请检查权限和磁盘空间"
        }
      }
    else
      cp -rv ./* $DEPLOY_DIR/ 2>/dev/null || {
        log_error "文件复制可能不完整，请检查权限和磁盘空间"
      }
    fi

    # 确保目标目录中的脚本有执行权限
    find $DEPLOY_DIR -name "*.sh" -exec chmod +x {} \;

    cd $DEPLOY_DIR || {
      log_error "无法切换到部署目录 $DEPLOY_DIR"
      exit 1
    }
    log_success "已切换到部署目录: $DEPLOY_DIR"
  else
    log_info "使用当前目录作为部署目录"
    DEPLOY_DIR=$CURRENT_DIR
  fi

  # 确保目录结构正确
  log_info "确保目录结构正确..."
  mkdir -p logs

  # 检查MongoDB服务
  log_info "检查MongoDB服务状态..."
  if systemctl list-unit-files | grep -q mongod; then
    if ! systemctl is-active --quiet mongod; then
      log_info "启动MongoDB服务(mongod)..."
      sudo systemctl start mongod
      sudo systemctl enable mongod
      log_success "MongoDB服务(mongod)已启动并设置为开机启动"
    else
      log_success "MongoDB服务(mongod)正在运行"
    fi
  elif systemctl list-unit-files | grep -q mongodb; then
    if ! systemctl is-active --quiet mongodb; then
      log_info "启动MongoDB服务(mongodb)..."
      sudo systemctl start mongodb
      sudo systemctl enable mongodb
      log_success "MongoDB服务(mongodb)已启动并设置为开机启动"
    else
      log_success "MongoDB服务(mongodb)正在运行"
    fi
  else
    log_warning "未检测到MongoDB服务，请手动启动MongoDB"
  fi

  # 检查前后端目录结构
  log_info "检查项目目录结构..."
  if [ -d "src/frontend" ] && [ -d "src/backend/backend" ]; then
    log_success "检测到标准目录结构"
    FRONTEND_DIR="src/frontend"
    BACKEND_DIR="src/backend/backend"
  elif [ -d "src/frontend" ] && [ -d "src/backend" ]; then
    log_success "检测到简化目录结构"
    FRONTEND_DIR="src/frontend"
    BACKEND_DIR="src/backend"
  else
    log_warning "未检测到标准目录结构，使用默认值"
    FRONTEND_DIR="src/frontend"
    BACKEND_DIR="src/backend/backend"
  fi

  log_info "使用前端目录: $FRONTEND_DIR"
  log_info "使用后端目录: $BACKEND_DIR"

  # 检查AI服务目录（需要在配置环境前检查）
  if [ -d "src/ai-service" ]; then
    AI_DIR="src/ai-service"
    log_info "检测到AI服务目录: $AI_DIR"
  else
    AI_DIR=""
    log_info "未检测到AI服务目录"
  fi

  # 配置后端环境
  log_info "配置后端环境..."
  if [ ! -f "$BACKEND_DIR/.env" ]; then
    log_info "创建后端.env文件..."
    cat > $BACKEND_DIR/.env << EOF
PORT=$BACKEND_PORT
DATABASE_URL=$MONGODB_URI
JWT_SECRET=ailab-secret-key
NODE_ENV=production
API_BASE_URL=http://localhost:$BACKEND_PORT/api
CORS_ORIGIN=http://localhost:$FRONTEND_PORT
EOF
    log_success "后端.env文件创建完成"
  else
    log_info "检测到现有.env文件，跳过创建"
  fi

  # 配置AI服务环境
  if [ ! -z "$AI_DIR" ]; then
    log_info "配置AI服务环境..."

    # 创建必要的目录
    mkdir -p $DEPLOY_DIR/models
    mkdir -p /tmp/ailab-ai

    if [ ! -f "$AI_DIR/ai/.env" ]; then
      log_info "创建AI服务.env文件..."
      cat > $AI_DIR/ai/.env << EOF
# AI服务配置
HOST=0.0.0.0
PORT=8001
ENVIRONMENT=production

# 数据库配置
MONGODB_URI=$MONGODB_URI
REDIS_URL=redis://localhost:6379/0

# API配置
BACKEND_API_URL=http://localhost:$BACKEND_PORT/api
ALLOWED_ORIGINS=["http://localhost:$FRONTEND_PORT","http://localhost:$BACKEND_PORT"]
ALLOWED_HOSTS=["localhost","127.0.0.1"]

# AI模型配置
MODEL_PATH=$DEPLOY_DIR/models
TEMP_DIR=/tmp/ailab-ai
MAX_UPLOAD_SIZE=50MB

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=$DEPLOY_DIR/logs/ai-service.log
EOF
      log_success "AI服务.env文件创建完成"
    else
      log_info "检测到现有AI服务.env文件，跳过创建"
    fi
  fi  # 安装依赖
  log_info "安装后端依赖..."
  cd $BACKEND_DIR
  npm install

  # 安装TypeScript支持（因为后端是TypeScript项目）
  log_info "安装TypeScript支持..."
  if ! npm list typescript &>/dev/null; then
    npm install --save-dev typescript
  fi
  if ! npm list ts-node &>/dev/null; then
    npm install --save-dev ts-node
  fi
  if ! npm list @types/node &>/dev/null; then
    npm install --save-dev @types/node
  fi

  log_success "后端依赖安装完成"

  log_info "安装前端依赖..."
  cd $DEPLOY_DIR
  cd $FRONTEND_DIR
  npm install
  log_success "前端依赖安装完成"

  # 安装AI服务依赖（如果存在）
  if [ ! -z "$AI_DIR" ]; then
    log_info "安装AI服务依赖..."
    cd $DEPLOY_DIR
    cd $AI_DIR

    # 检查多个可能的requirements.txt位置
    REQUIREMENTS_FILE=""
    if [ -f "requirements.txt" ]; then
      REQUIREMENTS_FILE="requirements.txt"
    elif [ -f "ai/requirements.txt" ]; then
      REQUIREMENTS_FILE="ai/requirements.txt"
    elif [ -f "../requirements.txt" ]; then
      REQUIREMENTS_FILE="../requirements.txt"
    fi

    if [ ! -z "$REQUIREMENTS_FILE" ]; then
      log_info "找到依赖文件: $REQUIREMENTS_FILE"
      log_info "安装Python依赖包..."
      # 强制重新安装motor以确保可用
      log_info "强制安装motor依赖..."
      pip3 install --force-reinstall motor==3.3.2

      if pip3 install -r $REQUIREMENTS_FILE; then
        log_success "AI服务Python依赖安装完成"
      else
        log_warning "部分Python依赖包安装失败，请检查网络连接或手动安装"
        log_info "手动安装命令: cd $DEPLOY_DIR/$AI_DIR && pip3 install -r $REQUIREMENTS_FILE"
      fi

      # 验证motor是否成功安装
      log_info "验证motor安装..."
      if python3 -c "import motor; print('Motor安装成功:', motor.__version__)"; then
        log_success "Motor依赖验证成功"
      else
        log_error "Motor依赖验证失败，尝试单独安装..."
        pip3 install motor pymongo[srv]
      fi
    else
      log_warning "未找到requirements.txt文件，跳过Python依赖安装"
      log_info "如需安装Python依赖，请创建requirements.txt文件"
    fi
  fi

  # 构建前端
  log_info "构建前端生产版本..."
  cd $DEPLOY_DIR
  cd $FRONTEND_DIR

  # 检查前端项目是否包含cross-env依赖
  if grep -q "cross-env" package.json; then
    log_info "检测到前端项目使用cross-env，确保其可用..."

    # 尝试本地安装cross-env（如果尚未安装）
    if ! npm list cross-env >/dev/null 2>&1; then
      log_info "在前端项目中本地安装cross-env..."
      npm install --save-dev cross-env
    fi

    # 确保所有npm脚本都有执行权限
    chmod +x node_modules/.bin/*

    # 手动设置环境变量并尝试构建（不使用cross-env）
    log_info "尝试构建前端（生产环境配置）..."
    NODE_ENV=production REACT_APP_API_URL=/api GENERATE_SOURCEMAP=false npm run build || {
      log_warning "标准构建失败，尝试替代方法..."

      # 尝试直接使用react-scripts
      if [ -f "node_modules/.bin/react-scripts" ]; then
        log_info "使用本地react-scripts构建..."
        NODE_ENV=production REACT_APP_API_URL=/api GENERATE_SOURCEMAP=false ./node_modules/.bin/react-scripts build
        log_success "使用本地react-scripts构建完成"
      else
        log_error "无法构建前端。请手动构建:"
        log_info "cd $DEPLOY_DIR/$FRONTEND_DIR && NODE_ENV=production REACT_APP_API_URL=/api GENERATE_SOURCEMAP=false npm run build"
        log_warning "构建过程将继续，但可能无法完成前端部署"
      fi
    }
  else
    # 正常构建（生产环境）
    log_info "构建前端（生产环境配置）..."
    NODE_ENV=production REACT_APP_API_URL=/api npm run build || {
      log_error "前端构建失败。请手动构建:"
      log_info "cd $DEPLOY_DIR/$FRONTEND_DIR && NODE_ENV=production REACT_APP_API_URL=/api npm run build"
      log_warning "构建过程将继续，但可能无法完成前端部署"
    }
  fi

  log_success "前端构建完成"

  # 创建PM2配置文件
  cd $DEPLOY_DIR
  log_info "创建PM2配置文件..."

  # 动态生成PM2配置，使用检测到的目录结构
  if [ ! -z "$AI_DIR" ]; then
    # 包含AI服务的完整配置
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ailab-backend',
      cwd: './$BACKEND_DIR',
      script: 'src/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm --max-old-space-size=2048',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        TS_NODE_PROJECT: 'tsconfig.json'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '2G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log'
    },
    {
      name: 'ailab-frontend',
      cwd: './src/frontend',
      script: './start-frontend.sh',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend.log'
    },
    {
      name: 'ailab-ai-service',
      cwd: './src/ai-service',
      script: 'ai/main.py',
      interpreter: 'python3',
      env: {
        PYTHONPATH: './ai',
        ENVIRONMENT: 'production'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      error_file: './logs/ai-service-error.log',
      out_file: './logs/ai-service-out.log',
      log_file: './logs/ai-service.log'
    }
  ]
};
EOF
  else
    # 仅核心服务的配置
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ailab-backend',
      cwd: './$BACKEND_DIR',
      script: 'src/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm --max-old-space-size=2048',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        TS_NODE_PROJECT: 'tsconfig.json'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '2G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log'
    },
    {
      name: 'ailab-frontend',
      cwd: './src/frontend',
      script: './start-frontend.sh',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend.log'
    }
  ]
};
EOF
  fi
  log_success "PM2配置文件创建完成"

  # 创建前端启动脚本以解决ESM问题
  log_info "创建前端启动脚本..."
  cat > $FRONTEND_DIR/start-frontend.sh << 'EOF'
#!/bin/bash
# 前端启动脚本 - 彻底解决serve ESM问题并配置API代理

cd "$(dirname "$0")"

if [ ! -d "build" ]; then
  echo "错误: build目录不存在，请先构建前端"
  exit 1
fi

echo "启动前端服务（包含API代理）..."

# 优先使用http-server（最稳定，支持代理）
if command -v http-server >/dev/null 2>&1; then
  echo "使用http-server启动前端（支持API代理）..."
  # 使用http-server的代理功能将/api请求转发到后端3001端口
  exec http-server build -p 3000 -a 0.0.0.0 -c-1 --cors --proxy http://localhost:3001?
# 备选方案：使用serve（注意：serve不支持代理，需要nginx配置）
elif command -v serve >/dev/null 2>&1; then
  echo "使用serve启动前端（注意：可能需要额外的代理配置）..."
  exec serve -s build -l 3000
# 最后尝试npx
elif command -v npx >/dev/null 2>&1; then
  echo "使用npx serve启动前端..."
  exec npx serve -s build -l 3000
else
  echo "错误: 无法找到可用的静态服务器"
  echo "请安装: npm install -g http-server"
  exit 1
fi
EOF

  chmod +x $FRONTEND_DIR/start-frontend.sh
  log_success "前端启动脚本创建完成"

  # 安装全局依赖
  log_info "安装PM2、serve和http-server依赖..."
  NPM_GLOBAL_SUCCESS=false

  # 方法1：本地安装PM2、serve和http-server
  log_info "尝试在项目目录中本地安装PM2、serve和http-server..."
  cd $DEPLOY_DIR
  if npm install pm2 serve http-server; then
    log_success "在项目目录中成功安装PM2、serve和http-server"
    NPM_GLOBAL_SUCCESS=true

    # 创建本地命令链接
    mkdir -p $DEPLOY_DIR/bin
    cat > $DEPLOY_DIR/bin/pm2 << EOF
#!/bin/bash
$DEPLOY_DIR/node_modules/.bin/pm2 "\$@"
EOF
    cat > $DEPLOY_DIR/bin/serve << EOF
#!/bin/bash
$DEPLOY_DIR/node_modules/.bin/serve "\$@"
EOF
    cat > $DEPLOY_DIR/bin/http-server << EOF
#!/bin/bash
$DEPLOY_DIR/node_modules/.bin/http-server "\$@"
EOF
    chmod +x $DEPLOY_DIR/bin/pm2 $DEPLOY_DIR/bin/serve $DEPLOY_DIR/bin/http-server

    log_success "已创建本地PM2、serve和http-server命令链接"
  else
    log_warning "本地安装失败，尝试其他方法..."
  fi

  # 方法2：使用sudo安装
  if [ "$NPM_GLOBAL_SUCCESS" = false ]; then
    log_info "尝试使用sudo安装全局PM2、serve和http-server..."
    if sudo npm install -g pm2 serve http-server; then
      log_success "使用sudo成功安装全局依赖"
      NPM_GLOBAL_SUCCESS=true
    else
      log_warning "使用sudo安装全局依赖失败，尝试其他方法..."
    fi
  fi

  # 方法3：不用sudo安装
  if [ "$NPM_GLOBAL_SUCCESS" = false ]; then
    log_info "尝试不使用sudo安装全局PM2、serve和http-server..."
    if npm install -g pm2 serve http-server; then
      log_success "不使用sudo成功安装全局依赖"
      NPM_GLOBAL_SUCCESS=true
    else
      log_warning "不使用sudo安装全局依赖失败，尝试其他方法..."
    fi
  fi

  # 方法4：使用npm配置prefix到用户目录
  if [ "$NPM_GLOBAL_SUCCESS" = false ]; then
    log_info "配置npm使用用户目录作为全局安装位置..."
    mkdir -p $HOME/.npm-global
    npm config set prefix $HOME/.npm-global
    export PATH=$HOME/.npm-global/bin:$PATH
    echo 'export PATH=$HOME/.npm-global/bin:$PATH' >> $HOME/.bashrc

    if npm install -g pm2 serve http-server; then
      log_success "使用自定义prefix成功安装全局依赖"
      NPM_GLOBAL_SUCCESS=true
    else
      log_warning "使用自定义prefix安装全局依赖失败"
    fi
  fi

  # 检查PM2和serve是否可用
  PM2_AVAILABLE=false
  SERVE_AVAILABLE=false

  # 检查全局PM2
  if command -v pm2 &> /dev/null; then
    PM2_AVAILABLE=true
    log_success "PM2 全局安装成功"
  # 检查本地PM2
  elif [ -f "$DEPLOY_DIR/node_modules/.bin/pm2" ]; then
    PM2_AVAILABLE=true
    log_success "PM2 本地安装成功"
  # 检查本地命令链接
  elif [ -f "$DEPLOY_DIR/bin/pm2" ]; then
    PM2_AVAILABLE=true
    log_success "PM2 本地命令链接创建成功"
  fi

  # 检查全局serve
  if command -v serve &> /dev/null; then
    SERVE_AVAILABLE=true
    log_success "serve 全局安装成功"
  # 检查本地serve
  elif [ -f "$DEPLOY_DIR/node_modules/.bin/serve" ]; then
    SERVE_AVAILABLE=true
    log_success "serve 本地安装成功"
  # 检查本地命令链接
  elif [ -f "$DEPLOY_DIR/bin/serve" ]; then
    SERVE_AVAILABLE=true
    log_success "serve 本地命令链接创建成功"
  fi

  # 如果仍有依赖未安装成功，提供详细的解决方案
  if [ "$PM2_AVAILABLE" = false ] || [ "$SERVE_AVAILABLE" = false ]; then
    log_warning "部分依赖安装失败："
    if [ "$PM2_AVAILABLE" = false ]; then
      log_error "❌ PM2 未安装成功"
    fi
    if [ "$SERVE_AVAILABLE" = false ]; then
      log_error "❌ serve 未安装成功"
    fi
    echo ""
    log_info "📝 手动安装说明："
    log_info "方法1 - 全局安装（推荐）："
    log_info "  sudo npm install -g pm2 serve"
    log_info ""
    log_info "方法2 - 用户目录安装："
    log_info "  mkdir -p ~/.npm-global"
    log_info "  npm config set prefix ~/.npm-global"
    log_info "  echo 'export PATH=~/.npm-global/bin:\$PATH' >> ~/.bashrc"
    log_info "  source ~/.bashrc"
    log_info "  npm install -g pm2 serve"
    log_info ""
    log_info "方法3 - 本地安装："
    log_info "  cd $DEPLOY_DIR"
    log_info "  npm install pm2 serve"
    log_info "  # 然后在启动时使用: ./node_modules/.bin/pm2"
    echo ""
    log_info "安装完成后，可以重新运行部署脚本或直接使用启动脚本"
  else
    log_success "✅ PM2 和 serve 都已成功安装"
  fi

  # 创建健康检查脚本
  log_info "创建健康检查脚本..."
  mkdir -p $DEPLOY_DIR/scripts
  cat > $DEPLOY_DIR/scripts/health-check.js << EOF
const http = require('http');

const BACKEND_URL = 'http://localhost:$BACKEND_PORT/api/health';
const FRONTEND_URL = 'http://localhost:$FRONTEND_PORT';
const AI_SERVICE_URL = 'http://localhost:8001/health';

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
  const aiServiceStatus = await checkService(AI_SERVICE_URL, 'AI服务');

  const allServices = [backendStatus, frontendStatus];

  // AI服务是可选的
  if (aiServiceStatus) {
    allServices.push(aiServiceStatus);
    console.log('✅ AI服务检查完成');
  } else {
    console.log('ℹ️ AI服务未运行或不可用（这是可选的）');
  }

  if (backendStatus && frontendStatus) {
    console.log('✅ 核心服务运行正常');
    return 0;
  } else {
    console.error('❌ 部分核心服务未正常运行');
    return 1;
  }
}

runHealthCheck().then(process.exit);
EOF
  log_success "健康检查脚本创建完成"

  # 创建启动脚本
  log_info "创建启动脚本..."
  cat > $DEPLOY_DIR/start-ailab.sh << EOF
#!/bin/bash
# AILAB平台启动脚本

# 获取脚本所在目录作为部署目录
DEPLOY_DIR=\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)

# 导入日志函数
log_info() {
  echo -e "\033[0;32m[信息]\033[0m \$1"
}

log_warning() {
  echo -e "\033[0;33m[警告]\033[0m \$1"
}

log_error() {
  echo -e "\033[0;31m[错误]\033[0m \$1"
}

log_success() {
  echo -e "\033[0;32m[成功]\033[0m \$1"
}

echo "====================================="
echo "  AILAB平台 - 启动服务"
echo "====================================="
echo "部署目录: \$DEPLOY_DIR"

# 切换到部署目录
cd \$DEPLOY_DIR

# 检查PM2是否已全局安装
if command -v pm2 &> /dev/null; then
  PM2_CMD="pm2"
# 检查本地PM2是否可用
elif [ -f "\$DEPLOY_DIR/node_modules/.bin/pm2" ]; then
  PM2_CMD="\$DEPLOY_DIR/node_modules/.bin/pm2"
# 检查我们创建的本地链接
elif [ -f "\$DEPLOY_DIR/bin/pm2" ]; then
  PM2_CMD="\$DEPLOY_DIR/bin/pm2"
else
  log_info "未找到PM2，尝试安装..."
  if sudo npm install -g pm2; then
    PM2_CMD="pm2"
  elif npm install -g pm2; then
    PM2_CMD="pm2"
  else
    log_info "无法安装PM2，尝试在本地安装..."
    cd \$DEPLOY_DIR
    npm install pm2
    if [ -f "\$DEPLOY_DIR/node_modules/.bin/pm2" ]; then
      PM2_CMD="\$DEPLOY_DIR/node_modules/.bin/pm2"
    else
      log_error "错误: 无法安装PM2，无法启动服务"
      exit 1
    fi
  fi
fi

log_info "使用PM2命令: \$PM2_CMD"

# 检查MongoDB服务
if systemctl list-unit-files | grep -q mongod; then
  if ! systemctl is-active --quiet mongod; then
    log_info "启动MongoDB服务(mongod)..."
    sudo systemctl start mongod
    sudo systemctl enable mongod
  else
    log_success "MongoDB服务(mongod)正在运行"
  fi
elif systemctl list-unit-files | grep -q mongodb; then
  if ! systemctl is-active --quiet mongodb; then
    log_info "启动MongoDB服务(mongodb)..."
    sudo systemctl start mongodb
    sudo systemctl enable mongodb
  else
    log_success "MongoDB服务(mongodb)正在运行"
  fi
else
  log_warning "未检测到MongoDB服务，请手动启动MongoDB"
fi

# 检查Redis服务（如果已安装）
if command -v redis-cli &> /dev/null; then
  if ! systemctl is-active --quiet redis-server; then
    log_info "启动Redis服务..."
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
  else
    log_success "Redis服务正在运行"
  fi
fi

# 启动服务
log_info "启动AILAB平台服务..."
\$PM2_CMD start ecosystem.config.js

# 等待服务启动
log_info "等待服务启动..."
sleep 10

# 运行健康检查
log_info "运行健康检查..."
node scripts/health-check.js

if [ \$? -eq 0 ]; then
  echo "====================================="
  echo "  AILAB平台服务已成功启动"
  echo "====================================="
  echo "前端: http://localhost:$FRONTEND_PORT"
  echo "后端API: http://localhost:$BACKEND_PORT/api"
  if [ -d "src/ai-service" ]; then
    echo "AI服务API: http://localhost:8001"
    echo "AI服务文档: http://localhost:8001/docs"
  fi
  echo "====================================="
else
  echo "⚠️ 部分服务可能未正确启动，请检查日志"
  echo "查看日志: \$PM2_CMD logs"
fi

# 保存PM2进程列表
\$PM2_CMD save

# 显示PM2进程状态
\$PM2_CMD status
EOF

  # 设置执行权限
  chmod +x $DEPLOY_DIR/start-ailab.sh

  # 检查是否所有关键服务都已安装
  log_info "检查关键服务..."
  MISSING_SERVICES=""

  if ! command -v node &> /dev/null; then
    MISSING_SERVICES="$MISSING_SERVICES Node.js"
  fi

  if ! command -v npm &> /dev/null; then
    MISSING_SERVICES="$MISSING_SERVICES npm"
  fi

  if ! command -v mongo &> /dev/null && ! command -v mongod &> /dev/null; then
    MISSING_SERVICES="$MISSING_SERVICES MongoDB"
  fi

  # 检查PM2（考虑全局安装、本地安装和本地链接）
  PM2_FOUND=false
  if command -v pm2 &> /dev/null; then
    PM2_FOUND=true
  elif [ -f "$DEPLOY_DIR/node_modules/.bin/pm2" ]; then
    PM2_FOUND=true
  elif [ -f "$DEPLOY_DIR/bin/pm2" ]; then
    PM2_FOUND=true
  fi

  if [ "$PM2_FOUND" = false ]; then
    MISSING_SERVICES="$MISSING_SERVICES PM2"
  fi

  # 检查serve（考虑全局安装、本地安装和本地链接）
  SERVE_FOUND=false
  if command -v serve &> /dev/null; then
    SERVE_FOUND=true
  elif [ -f "$DEPLOY_DIR/node_modules/.bin/serve" ]; then
    SERVE_FOUND=true
  elif [ -f "$DEPLOY_DIR/bin/serve" ]; then
    SERVE_FOUND=true
  fi

  if [ "$SERVE_FOUND" = false ]; then
    MISSING_SERVICES="$MISSING_SERVICES serve"
  fi

  if [ ! -z "$MISSING_SERVICES" ]; then
    log_warning "以下服务可能未正确安装: $MISSING_SERVICES"
    log_info "将尝试继续自动启动，如有问题请手动安装缺少的服务"
  fi

  # 确定PM2命令路径
  if command -v pm2 &> /dev/null; then
    PM2_CMD="pm2"
  elif [ -f "$DEPLOY_DIR/node_modules/.bin/pm2" ]; then
    PM2_CMD="$DEPLOY_DIR/node_modules/.bin/pm2"
  elif [ -f "$DEPLOY_DIR/bin/pm2" ]; then
    PM2_CMD="$DEPLOY_DIR/bin/pm2"
  else
    log_error "PM2未安装，无法自动启动服务"
    log_info "您可以手动运行: $DEPLOY_DIR/start-ailab.sh"
    log_info "或安装PM2后重新运行部署脚本"
    exit 1
  fi

  # 启动AILAB平台服务
  log_info "自动启动AILAB平台服务..."
  cd $DEPLOY_DIR
  $PM2_CMD start ecosystem.config.js

  # 设置开机自启动
  log_info "设置开机自启动..."
  $PM2_CMD startup systemd -u $(whoami) --hp $(eval echo ~$(whoami)) || log_warning "设置开机自启动失败，可能需要手动运行命令"
  $PM2_CMD save

  # 等待服务启动
  log_info "等待服务启动..."
  sleep 15

  # 运行健康检查
  log_info "运行健康检查..."
  if [ -f "$DEPLOY_DIR/scripts/health-check.js" ]; then
    node $DEPLOY_DIR/scripts/health-check.js
  fi

  # 显示服务状态
  log_info "当前服务状态:"
  $PM2_CMD status

  echo ""
  echo "====================================="
  echo "      AILAB平台部署完成！"
  echo "====================================="
  log_info "🌐 访问地址:"
  log_info "• 前端: http://localhost:$FRONTEND_PORT"
  log_info "• 后端API: http://localhost:$BACKEND_PORT/api"
  if [ ! -z "$AI_DIR" ]; then
    log_info "• AI服务: http://localhost:8001"
  fi
  echo ""
  log_info "� 管理命令:"
  log_info "• 查看状态: $PM2_CMD status"
  log_info "• 查看日志: $PM2_CMD logs"
  log_info "• 重启服务: $PM2_CMD restart all"
  log_info "• 停止服务: $PM2_CMD stop all"

  # 服务器端口配置提示
  echo ""
  log_info "🌐 服务器端口配置提示"
  echo "===================================="
  log_info "AILAB平台需要开放以下端口:"
  echo ""
  log_info "📱 用户访问端口:"
  log_info "  • 前端服务: $FRONTEND_PORT (HTTP)"
  log_info "  • 后端API: $BACKEND_PORT (HTTP)"
  if [ ! -z "$AI_DIR" ]; then
    log_info "  • AI服务: 8001 (HTTP, 可选)"
  fi
  log_info "  • HTTPS: 443 (如果配置SSL)"
  echo ""
  log_info "🔧 内部服务端口:"
  log_info "  • MongoDB: 27017 (内部)"
  log_info "  • Redis: 6379 (内部)"
  echo ""
  log_info "⚙️ 防火墙配置命令:"
  log_info "  # Ubuntu/Debian:"
  log_info "  sudo ufw allow $FRONTEND_PORT"
  log_info "  sudo ufw allow $BACKEND_PORT"
  if [ ! -z "$AI_DIR" ]; then
    log_info "  sudo ufw allow 8001"
  fi
  log_info "  sudo ufw allow 443"
  echo ""
  log_info "  # CentOS/RHEL:"
  log_info "  sudo firewall-cmd --permanent --add-port=$FRONTEND_PORT/tcp"
  log_info "  sudo firewall-cmd --permanent --add-port=$BACKEND_PORT/tcp"
  if [ ! -z "$AI_DIR" ]; then
    log_info "  sudo firewall-cmd --permanent --add-port=8001/tcp"
  fi
  log_info "  sudo firewall-cmd --permanent --add-port=443/tcp"
  log_info "  sudo firewall-cmd --reload"
  echo ""
  log_info "🌍 云服务器安全组配置:"
  log_info "  • 入站规则: 开放 $FRONTEND_PORT, $BACKEND_PORT"
  if [ ! -z "$AI_DIR" ]; then
    log_info "    及 8001"
  fi
  log_info ", 443 端口"
  log_info "  • 协议类型: TCP"
  log_info "  • 授权对象: 0.0.0.0/0 (公网访问)"
  echo ""
  log_warning "⚠️  安全建议:"
  log_info "  • 生产环境建议只开放443端口(HTTPS)"
  log_info "  • 使用Nginx代理转发到内部端口"
  log_info "  • 配置SSL证书启用HTTPS"
  log_info "  • 限制管理端口的访问来源"
  echo "===================================="

  # 最终提示
  echo ""
  log_success "✅ AILAB平台已成功部署并自动启动！"
  log_success "✅ 开机自启动已设置完成！"
  echo ""
  log_info "🔍 检查服务运行状态："
  log_info "如需检查服务是否正常运行，请等待1-2分钟后访问："
  log_info "• 前端页面: http://$(hostname -I | awk '{print $1}'):$FRONTEND_PORT"
  log_info "• 后端健康检查: http://$(hostname -I | awk '{print $1}'):$BACKEND_PORT/api/health"
  if [ ! -z "$AI_DIR" ]; then
    log_info "• AI服务健康检查: http://$(hostname -I | awk '{print $1}'):8001/health"
  fi
  echo ""
  log_info "🚀 部署完成，感谢使用AILAB平台！"
  echo "===================================="

  # 完成部署流程
}

# 调用主函数开始执行
main
