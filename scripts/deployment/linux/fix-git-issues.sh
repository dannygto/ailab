#!/bin/bash

# AICAM Git 拉取问题修复脚本
# 解决 "GnuTLS recv error (-110): The TLS connection was non-properly terminated" 问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_info "开始修复 Git 拉取问题..."

# 1. 更新 Git 配置
log_info "更新 Git 配置..."

# 设置 Git 缓冲区大小
git config --global http.postBuffer 524288000
git config --global http.maxRequestBuffer 100M
git config --global core.compression 9

# 设置 Git 超时时间
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999

# 禁用 SSL 验证（临时解决方案）
git config --global http.sslVerify false

# 设置 Git 用户信息
git config --global user.name "AICAM Deploy"
git config --global user.email "deploy@aicam.com"

log_success "Git 配置更新完成"

# 2. 清理 Git 缓存
log_info "清理 Git 缓存..."
git config --global credential.helper cache
git config --global credential.helper 'cache --timeout=3600'

# 清理可能损坏的缓存
rm -rf ~/.git-credentials 2>/dev/null || true
rm -rf ~/.git-cache 2>/dev/null || true

log_success "Git 缓存清理完成"

# 3. 测试网络连接
log_info "测试网络连接..."

# 测试 GitHub 连接
if curl -I https://github.com --connect-timeout 10 >/dev/null 2>&1; then
    log_success "GitHub 连接正常"
else
    log_warning "GitHub 连接异常，尝试使用代理..."
    
    # 尝试设置代理（如果有的话）
    # export http_proxy=http://proxy:port
    # export https_proxy=http://proxy:port
fi

# 4. 尝试不同的 Git 协议
log_info "尝试不同的 Git 协议..."

GIT_REPO="https://github.com/dannygto/ailab.git"
GIT_SSH_REPO="git@github.com:dannygto/ailab.git"

# 方法1: 使用 HTTPS 协议
log_info "方法1: 使用 HTTPS 协议..."
if git clone --depth 1 $GIT_REPO /tmp/test-clone 2>/dev/null; then
    log_success "HTTPS 协议工作正常"
    rm -rf /tmp/test-clone
else
    log_warning "HTTPS 协议失败，尝试其他方法..."
fi

# 方法2: 使用 SSH 协议（如果配置了 SSH 密钥）
log_info "方法2: 尝试 SSH 协议..."
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    log_success "SSH 密钥配置正常"
    if git clone --depth 1 $GIT_SSH_REPO /tmp/test-clone-ssh 2>/dev/null; then
        log_success "SSH 协议工作正常"
        rm -rf /tmp/test-clone-ssh
        # 更新部署脚本使用 SSH
        sed -i 's|https://github.com/dannygto/ailab.git|git@github.com:dannygto/ailab.git|g' auto-deploy.sh
    fi
else
    log_warning "SSH 密钥未配置或无效"
fi

# 方法3: 使用镜像源
log_info "方法3: 尝试使用镜像源..."
MIRROR_REPO="https://ghproxy.com/https://github.com/dannygto/ailab.git"
if git clone --depth 1 $MIRROR_REPO /tmp/test-clone-mirror 2>/dev/null; then
    log_success "镜像源工作正常"
    rm -rf /tmp/test-clone-mirror
    # 更新部署脚本使用镜像源
    sed -i 's|https://github.com/dannygto/ailab.git|https://ghproxy.com/https://github.com/dannygto/ailab.git|g' auto-deploy.sh
fi

# 5. 创建备用拉取脚本
log_info "创建备用拉取脚本..."

cat > git-pull-fallback.sh << 'EOF'
#!/bin/bash

# Git 拉取备用脚本
# 提供多种拉取方式

GIT_REPO="https://github.com/dannygto/ailab.git"
GIT_SSH_REPO="git@github.com:dannygto/ailab.git"
MIRROR_REPO="https://ghproxy.com/https://github.com/dannygto/ailab.git"
DEPLOY_DIR="/opt/aicam"

echo "尝试多种方式拉取代码..."

# 方法1: 标准 HTTPS
echo "方法1: 标准 HTTPS..."
if git clone -b master $GIT_REPO $DEPLOY_DIR 2>/dev/null; then
    echo "✓ 标准 HTTPS 成功"
    exit 0
fi

# 方法2: 镜像源
echo "方法2: 镜像源..."
if git clone -b master $MIRROR_REPO $DEPLOY_DIR 2>/dev/null; then
    echo "✓ 镜像源成功"
    exit 0
fi

# 方法3: SSH
echo "方法3: SSH..."
if git clone -b master $GIT_SSH_REPO $DEPLOY_DIR 2>/dev/null; then
    echo "✓ SSH 成功"
    exit 0
fi

# 方法4: 手动下载
echo "方法4: 手动下载..."
cd /tmp
wget -O aicam.zip https://github.com/dannygto/ailab/archive/refs/heads/master.zip
if [ $? -eq 0 ]; then
    unzip aicam.zip
    mv ailab-master $DEPLOY_DIR
    echo "✓ 手动下载成功"
    exit 0
fi

echo "✗ 所有方法都失败了"
exit 1
EOF

chmod +x git-pull-fallback.sh
log_success "备用拉取脚本创建完成"

# 6. 更新部署脚本
log_info "更新部署脚本..."

# 备份原脚本
cp auto-deploy.sh auto-deploy.sh.backup

# 修改拉取代码部分
sed -i '/clone_or_pull_code()/,/}/c\
clone_or_pull_code() {\
    if [[ -d "$DEPLOY_DIR" ]]; then\
        log_info "更新现有代码库..."\
        cd $DEPLOY_DIR\
        git fetch origin || {\
            log_warning "Git fetch 失败，尝试备用方法..."\
            cd /tmp\
            ./git-pull-fallback.sh\
            return\
        }\
        git reset --hard origin/master\
        git clean -fd\
    else\
        log_info "克隆代码库..."\
        if ! git clone -b master $GIT_REPO $DEPLOY_DIR; then\
            log_warning "Git clone 失败，尝试备用方法..."\
            ./git-pull-fallback.sh\
            return\
        fi\
    fi\
    \
    cd $DEPLOY_DIR\
    log_success "代码拉取完成，当前提交: $(git rev-parse --short HEAD)"\
}' auto-deploy.sh

log_success "部署脚本更新完成"

# 7. 创建网络诊断脚本
log_info "创建网络诊断脚本..."

cat > network-diagnosis.sh << 'EOF'
#!/bin/bash

echo "=== 网络诊断报告 ==="
echo "时间: $(date)"
echo ""

echo "1. 系统信息:"
echo "   OS: $(lsb_release -d | cut -f2)"
echo "   Kernel: $(uname -r)"
echo ""

echo "2. 网络连接:"
echo "   DNS: $(cat /etc/resolv.conf | grep nameserver | head -1)"
echo "   Gateway: $(ip route | grep default | awk '{print $3}')"
echo ""

echo "3. GitHub 连接测试:"
echo "   HTTPS: $(curl -I https://github.com --connect-timeout 5 2>/dev/null | head -1 || echo "失败")"
echo "   SSH: $(ssh -T git@github.com 2>&1 | grep -o "successfully authenticated\|Permission denied" || echo "连接失败")"
echo ""

echo "4. Git 配置:"
echo "   SSL Verify: $(git config --global http.sslVerify)"
echo "   Post Buffer: $(git config --global http.postBuffer)"
echo "   User: $(git config --global user.name)"
echo ""

echo "5. 代理设置:"
echo "   HTTP_PROXY: ${HTTP_PROXY:-未设置}"
echo "   HTTPS_PROXY: ${HTTPS_PROXY:-未设置}"
echo ""

echo "6. 防火墙状态:"
ufw status 2>/dev/null || echo "   UFW 未安装或未运行"
echo ""
EOF

chmod +x network-diagnosis.sh
log_success "网络诊断脚本创建完成"

# 8. 提供解决方案建议
log_info "=== 解决方案建议 ==="
echo ""
echo "如果 Git 拉取仍然失败，请尝试以下解决方案："
echo ""
echo "1. 网络问题："
echo "   - 检查网络连接"
echo "   - 尝试使用 VPN 或代理"
echo "   - 更换 DNS 服务器"
echo ""
echo "2. 防火墙问题："
echo "   - 检查防火墙设置"
echo "   - 开放 22, 80, 443 端口"
echo ""
echo "3. 系统问题："
echo "   - 更新系统: sudo apt update && sudo apt upgrade"
echo "   - 更新 Git: sudo apt install --only-upgrade git"
echo ""
echo "4. 手动下载："
echo "   - 使用备用脚本: ./git-pull-fallback.sh"
echo "   - 手动下载 ZIP 文件并解压"
echo ""
echo "5. 诊断网络："
echo "   - 运行诊断脚本: ./network-diagnosis.sh"
echo ""

log_success "Git 问题修复脚本执行完成！"
echo ""
echo "建议在部署前运行: ./network-diagnosis.sh"
echo "如果问题持续，请运行: ./git-pull-fallback.sh" 