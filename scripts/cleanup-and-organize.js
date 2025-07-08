#!/usr/bin/env node

/**
 * AICAM 项目脚本整理和清理工具
 * 清理重复、过时的脚本文件，整理文件夹结构
 * 作者: AICAM 开发团队
 * 版本: 1.0.0
 */

const fs = require('fs');
const path = require('path');

// 颜色定义
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'blue') {
    console.log(`${colors[color]}[${new Date().toISOString()}]${colors.reset} ${message}`);
}

// 需要删除的重复/过时文件列表
const filesToDelete = [
    // 根目录重复文件
    'scripts/fix-go-error.bat',
    'scripts/final-jsx-fix.js',
    'scripts/comprehensive-typescript-fix.js',
    'scripts/fix-device-metrics-chart.js',
    'scripts/fix-jsx-structure.js',
    'scripts/fix-device-detail-dialog.js',
    'scripts/fix-device-reservations.js',
    'scripts/fix-device-list.js',
    'scripts/fix-edition-switcher.js',
    'scripts/fix-device-remote-control.js',
    'scripts/fix-icons-and-modules.js',
    'scripts/fix-div-sx-to-box.js',
    'scripts/fix-final-jsx-errors.js',
    'scripts/fix-remaining-sx-issues.js',
    'scripts/fix-sx-safely.js',
    'scripts/fix-complex-sx-issues.js',
    'scripts/fix-sx-attribute.js',
    'scripts/fix-icon-imports.js',
    'scripts/fix-icon-duplicates.js',
    'scripts/fix-icons-final.js',
    
    // PowerShell 脚本（保留最新的）
    'scripts/fix-remaining-icon-imports-simple.ps1',
    'scripts/fix-remaining-icon-imports.ps1',
    'scripts/fix-icon-imports-advanced.ps1',
    'scripts/simple-icon-fix.ps1',
    'scripts/fix-icon-imports-simple.ps1',
    'scripts/fix-icon-imports.ps1',
    'scripts/health-check-final.ps1',
    'scripts/health-check-simple.ps1',
    'scripts/health-check-stable.ps1',
    'scripts/health-check.ps1',
    'scripts/add-autostart-task.ps1',
    'scripts/install-dependencies.ps1',
    'scripts/optimize-tasks.ps1',
    'scripts/setup-remote-autostart.ps1',
    'scripts/add-new-tasks.ps1',
    'scripts/remote-deploy-start.bat',
    'scripts/setup-linux-autostart.sh',
    'scripts/start-remote-server.ps1',
    'scripts/stop-remote-server.ps1',
    'scripts/test-remote-connection.bat',
    'scripts/linux-server-start.sh',
    'scripts/linux-server-stop.sh',
    'scripts/sync-linux-incremental.bat',
    'scripts/integration-test.ps1',
    'scripts/cleanup-documents.bat',
    'scripts/sync-docs-abs.bat',
    'scripts/sync-docs-en.bat',
    'scripts/sync-docs.bat',
    'scripts/linux-sync-ssh.bat',
    'scripts/linux-sync-expect.bat',
    'scripts/openssh-sync.bat',
    'scripts/ssh-sync.bat',
    'scripts/setup-ssh-keys.bat',
    'scripts/setup-ssh-key.bat',
    'scripts/remote-login-putty.bat',
    'scripts/create-linux-scripts.bat',
    'scripts/linux-sync-new.bat',
    'scripts/remote-login-new.bat',
    'scripts/linux-sync.bat',
    'scripts/simple-sync.bat',
    'scripts/auto-sync-full.bat',
    'scripts/auto-sync-quick.bat',
    'scripts/auto-sync.ps1',
    'scripts/sync-project-full.bat',
    'scripts/sync-project.bat',
    'scripts/sync-to-remote.ps1',
    'scripts/exec-on-remote.ps1',
    'scripts/remote-login.bat',
    'scripts/login-remote.ps1',
    'scripts/setup-auto-login.ps1',
    'scripts/create-remote-scripts.ps1',
    'scripts/setup-remote-auto-login.ps1',
    'scripts/setup-remote-connection.ps1',
    'scripts/test-remote-connection.ps1',
    'scripts/setup-ssh.ps1',
    'scripts/fix-frontend-tests.ps1',
    'scripts/check-settings-health-fixed.ps1',
    'scripts/check-settings-health.ps1',
    'scripts/check-settings-simple.ps1',
    'scripts/check-settings.ps1',
    'scripts/run-api-tests.ps1',
    'scripts/settings-check.ps1',
    'scripts/performance-test.ps1',
    'scripts/run-all-frontend-tests.ps1',
    'scripts/run-settings-tests.ps1',
    'scripts/security-check.ps1',
    'scripts/security-hardening.ps1',
    'scripts/test-settings.ps1',
    'scripts/ai-health-check.ps1',
    'scripts/auto-fix-typescript.ps1',
    'scripts/enhanced-env-validator.ps1',
    'scripts/env-validator.ps1',
    'scripts/smart-start.ps1',
    
    // 部署脚本中的重复文件
    'scripts/部署脚本/deploy.sh',
    'scripts/部署脚本/auto-devops.sh',
    'scripts/部署脚本/auto-devops.ps1',
    'scripts/部署脚本/quick-delivery.ps1',
    
    // 其他过时文件
    'scripts/server-config.json',
    'scripts/standardize-directory-structure.js',
    'scripts/完善部署配置.js'
];

// 新的标准化目录结构
const newStructure = {
    'scripts': {
        'deployment': {
            'linux': {
                'auto-deploy.sh': '服务器端全自动部署脚本.sh',
                'deployment-guide.md': '一键部署指南.md',
                'quick-commands.md': '快速部署命令.md'
            },
            'windows': {
                'deploy.ps1': 'Windows部署脚本.ps1',
                'deployment-guide.md': 'Windows部署指南.md'
            }
        },
        'maintenance': {
            'cleanup.js': '项目清理脚本.js',
            'backup.js': '备份脚本.js',
            'health-check.js': '健康检查脚本.js'
        },
        'development': {
            'build.js': '构建脚本.js',
            'test.js': '测试脚本.js',
            'lint.js': '代码检查脚本.js'
        },
        'utils': {
            'git-utils.js': 'Git工具脚本.js',
            'file-utils.js': '文件工具脚本.js'
        }
    }
};

function deleteFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            log(`删除文件: ${filePath}`, 'green');
            return true;
        }
    } catch (error) {
        log(`删除文件失败: ${filePath} - ${error.message}`, 'red');
    }
    return false;
}

function createDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            log(`创建目录: ${dirPath}`, 'green');
            return true;
        }
    } catch (error) {
        log(`创建目录失败: ${dirPath} - ${error.message}`, 'red');
    }
    return false;
}

function moveFile(source, destination) {
    try {
        if (fs.existsSync(source)) {
            const destDir = path.dirname(destination);
            createDirectory(destDir);
            fs.renameSync(source, destination);
            log(`移动文件: ${source} -> ${destination}`, 'green');
            return true;
        }
    } catch (error) {
        log(`移动文件失败: ${source} -> ${destination} - ${error.message}`, 'red');
    }
    return false;
}

function cleanupFiles() {
    log('开始清理重复和过时文件...', 'yellow');
    
    let deletedCount = 0;
    for (const file of filesToDelete) {
        if (deleteFile(file)) {
            deletedCount++;
        }
    }
    
    log(`清理完成，删除了 ${deletedCount} 个文件`, 'green');
}

function organizeStructure() {
    log('开始整理目录结构...', 'yellow');
    
    // 移动部署相关文件到新结构
    const moves = [
        ['scripts/部署脚本/服务器端全自动部署脚本.sh', 'scripts/deployment/linux/auto-deploy.sh'],
        ['scripts/部署脚本/一键部署指南.md', 'scripts/deployment/linux/deployment-guide.md'],
        ['scripts/部署脚本/快速部署命令.md', 'scripts/deployment/linux/quick-commands.md']
    ];
    
    let movedCount = 0;
    for (const [source, dest] of moves) {
        if (moveFile(source, dest)) {
            movedCount++;
        }
    }
    
    // 删除旧的部署脚本目录
    try {
        if (fs.existsSync('scripts/部署脚本')) {
            fs.rmdirSync('scripts/部署脚本');
            log('删除旧目录: scripts/部署脚本', 'green');
        }
    } catch (error) {
        log(`删除目录失败: scripts/部署脚本 - ${error.message}`, 'red');
    }
    
    log(`整理完成，移动了 ${movedCount} 个文件`, 'green');
}

function createNewScripts() {
    log('创建新的标准化脚本...', 'yellow');
    
    // 创建项目清理脚本
    const cleanupScript = `#!/usr/bin/env node
/**
 * AICAM 项目清理工具
 * 清理临时文件、构建产物、日志文件等
 */

const fs = require('fs');
const path = require('path');

function cleanup() {
    const dirsToClean = [
        'node_modules',
        'dist',
        'build',
        '.cache',
        'logs',
        'temp'
    ];
    
    dirsToClean.forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(\`清理目录: \${dir}\`);
        }
    });
    
    console.log('项目清理完成');
}

cleanup();
`;
    
    fs.writeFileSync('scripts/maintenance/cleanup.js', cleanupScript);
    log('创建: scripts/maintenance/cleanup.js', 'green');
    
    // 创建健康检查脚本
    const healthCheckScript = `#!/usr/bin/env node
/**
 * AICAM 项目健康检查工具
 * 检查项目状态、依赖、配置等
 */

const fs = require('fs');
const path = require('path');

function healthCheck() {
    console.log('=== AICAM 项目健康检查 ===');
    
    // 检查必要文件
    const requiredFiles = [
        'package.json',
        'README.md',
        '源代码/前端/package.json',
        '源代码/后端/package.json'
    ];
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(\`✓ \${file}\`);
        } else {
            console.log(\`✗ \${file} (缺失)\`);
        }
    });
    
    console.log('健康检查完成');
}

healthCheck();
`;
    
    fs.writeFileSync('scripts/maintenance/health-check.js', healthCheckScript);
    log('创建: scripts/maintenance/health-check.js', 'green');
}

function generateReadme() {
    const readme = `# AICAM 脚本目录

## 目录结构

\`\`\`
scripts/
├── deployment/          # 部署相关脚本
│   ├── linux/          # Linux 部署脚本
│   └── windows/        # Windows 部署脚本
├── maintenance/         # 维护脚本
├── development/         # 开发脚本
└── utils/              # 工具脚本
\`\`\`

## 快速开始

### Linux 部署
\`\`\`bash
# 一键部署
wget -O deploy.sh https://raw.githubusercontent.com/dannygto/ailab/master/scripts/deployment/linux/auto-deploy.sh
chmod +x deploy.sh
./deploy.sh
\`\`\`

### 项目维护
\`\`\`bash
# 清理项目
node scripts/maintenance/cleanup.js

# 健康检查
node scripts/maintenance/health-check.js
\`\`\`

## 脚本说明

- **auto-deploy.sh**: Linux 服务器全自动部署脚本
- **deployment-guide.md**: 详细部署指南
- **quick-commands.md**: 快速部署命令
- **cleanup.js**: 项目清理工具
- **health-check.js**: 项目健康检查工具

## 注意事项

1. 部署前请确保服务器满足最低配置要求
2. 建议在部署前备份重要数据
3. 如遇问题请查看部署日志
`;

    fs.writeFileSync('scripts/README.md', readme);
    log('创建: scripts/README.md', 'green');
}

function main() {
    log('开始 AICAM 项目脚本整理和清理...', 'blue');
    
    // 1. 清理重复和过时文件
    cleanupFiles();
    
    // 2. 整理目录结构
    organizeStructure();
    
    // 3. 创建新的标准化脚本
    createNewScripts();
    
    // 4. 生成 README
    generateReadme();
    
    log('脚本整理和清理完成！', 'green');
    log('新的目录结构已创建，请查看 scripts/README.md 了解详情', 'blue');
}

// 执行主函数
main(); 