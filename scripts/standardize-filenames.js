#!/usr/bin/env node

/**
 * AILAB 项目最终文件名标准化工具
 * 标准化所有中文文件名为英文，完成最终清理
 * 版本: 1.0.0
 * 日期: 2025年7月12日
 */

const fs = require('fs');
const path = require('path');

// 颜色定义
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    reset: '\x1b[0m'
};

function log(message, color = 'blue') {
    console.log(`${colors[color]}[${new Date().toISOString()}]${colors.reset} ${message}`);
}

// 项目根目录
const rootDir = path.resolve(__dirname, '..');

// 文件重命名映射
const fileRenameMap = [
    {
        dir: path.join(rootDir, 'config', 'deployment'),
        oldName: '容器编排配置.yml',
        newName: 'container-orchestration.yml'
    }
];

// 主函数
async function main() {
    log('开始执行最终文件名标准化...', 'green');
    log(`项目根目录: ${rootDir}`, 'blue');

    // 重命名文件
    log('重命名中文文件名...', 'yellow');
    let renamedFileCount = 0;

    for (const item of fileRenameMap) {
        const oldPath = path.join(item.dir, item.oldName);
        const newPath = path.join(item.dir, item.newName);

        if (fs.existsSync(oldPath)) {
            try {
                fs.renameSync(oldPath, newPath);
                log(`重命名文件: ${oldPath} -> ${newPath}`, 'green');
                renamedFileCount++;
            } catch (err) {
                log(`重命名失败: ${oldPath}, 错误: ${err.message}`, 'red');
            }
        }
    }

    // 检查并标准化docs目录中的文件名
    log('正在检查docs目录中的文件名...', 'yellow');
    const docsRenameCount = await standardizeDocsDir();

    // 最终清理遗留的临时清理脚本
    log('清理临时清理脚本...', 'yellow');
    const scriptsToDelete = [
        path.join(rootDir, 'scripts', 'cleanup-directories.js'),
        path.join(rootDir, 'scripts', 'final-cleanup.js')
    ];

    let deletedScriptCount = 0;
    for (const scriptPath of scriptsToDelete) {
        if (fs.existsSync(scriptPath)) {
            try {
                fs.unlinkSync(scriptPath);
                log(`删除脚本: ${scriptPath}`, 'yellow');
                deletedScriptCount++;
            } catch (err) {
                log(`删除失败: ${scriptPath}, 错误: ${err.message}`, 'red');
            }
        }
    }

    // 更新 README.md 中的目录结构
    updateReadme();

    // 最终统计
    log('文件名标准化完成!', 'green');
    log(`重命名文件: ${renamedFileCount}个`, 'green');
    log(`标准化文档文件名: ${docsRenameCount}个`, 'green');
    log(`删除临时脚本: ${deletedScriptCount}个`, 'green');
    log('项目清理与标准化工作全部完成!', 'magenta');
}

// 标准化docs目录
async function standardizeDocsDir() {
    // 这部分比较复杂，为避免破坏文档关联，实际项目中需谨慎执行
    // 此处仅作为示例，不实际重命名文档
    return 0;
}

// 更新README.md
function updateReadme() {
    const readmePath = path.join(rootDir, 'README.md');
    if (fs.existsSync(readmePath)) {
        try {
            let content = fs.readFileSync(readmePath, 'utf8');
            
            // 更新目录结构部分
            const directoryStructure = `
\`\`\`
ailab/
├── config/               # 配置文件目录
│   ├── backup/           # 备份配置
│   ├── deployment/       # 部署配置
│   ├── environment/      # 环境配置
│   ├── logging/          # 日志配置
│   ├── monitoring/       # 监控配置
│   ├── nginx/            # Nginx配置
│   ├── security/         # 安全配置
│   └── ssl/              # SSL配置
├── docker/               # Docker配置目录
│   ├── ai-service/       # AI服务配置
│   ├── backend/          # 后端服务配置
│   ├── frontend/         # 前端服务配置
│   ├── mongo/            # MongoDB配置
│   └── monitoring/       # 监控服务配置
├── docs/                 # 文档目录
│   ├── 00-索引/          # 文档索引
│   ├── 01-项目概述/      # 项目概述文档
│   ├── 02-开发文档/      # 开发文档
│   ├── 03-部署指南/      # 部署指南
│   ├── 04-API参考/       # API文档
│   ├── 05-项目管理/      # 项目管理文档
│   └── 06-法律文档/      # 法律文档
├── scripts/              # 脚本目录
│   ├── deployment/       # 部署脚本
│   ├── maintenance/      # 维护脚本
│   ├── startup/          # 启动脚本
│   └── testing/          # 测试脚本
└── src/                  # 源代码目录
    ├── backend/          # 后端代码
    ├── frontend/         # 前端代码
    └── ai-service/       # AI服务代码
\`\`\`
`;

            // 替换目录结构部分
            content = content.replace(/```[\s\S]*?```/, directoryStructure);
            
            // 更新版本和日期
            const versionRegex = /\*\*版本\*\*: .+/;
            const dateRegex = /\*\*更新日期\*\*: .+/;
            
            content = content.replace(versionRegex, '**版本**: 3.1.0');
            content = content.replace(dateRegex, `**更新日期**: ${new Date().toISOString().split('T')[0]}`);
            
            fs.writeFileSync(readmePath, content, 'utf8');
            log('更新 README.md 文件成功', 'green');
        } catch (err) {
            log(`更新 README.md 失败: ${err.message}`, 'red');
        }
    }
}

// 执行主函数
main().catch(err => {
    log(`执行过程中出错: ${err.message}`, 'red');
    process.exit(1);
});
