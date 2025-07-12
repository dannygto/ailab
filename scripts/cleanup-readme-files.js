#!/usr/bin/env node

/**
 * AILAB 项目说明文件清理工具
 * 清理子目录中的README.md文件，将说明集中到docs目录
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

// 需要保留README.md的目录
const keepReadmeDirs = [
    path.join(rootDir, 'docs')
];

// 需要删除README.md的目录
const removeReadmeDirs = [
    path.join(rootDir, 'config'),
    path.join(rootDir, 'docker'),
    path.join(rootDir, 'scripts'),
    path.join(rootDir, 'src')
];

// 主函数
async function main() {
    log('开始清理子目录README文件...', 'green');
    log(`项目根目录: ${rootDir}`, 'blue');

    // 删除子目录中的README.md
    let deletedCount = 0;

    for (const dirPath of removeReadmeDirs) {
        const readmePath = path.join(dirPath, 'README.md');
        if (fs.existsSync(readmePath)) {
            try {
                log(`删除文件: ${readmePath}`, 'yellow');
                fs.unlinkSync(readmePath);
                deletedCount++;
            } catch (err) {
                log(`删除失败: ${readmePath}, 错误: ${err.message}`, 'red');
            }
        }
    }

    // 递归检查src目录下的README文件并删除
    if (fs.existsSync(path.join(rootDir, 'src'))) {
        const additionalDeleted = await cleanReadmeInDir(path.join(rootDir, 'src'));
        deletedCount += additionalDeleted;
    }

    log(`完成删除 ${deletedCount} 个README.md文件`, 'green');
    log('子目录README文件清理完成!', 'magenta');
}

// 递归清理目录中的README.md文件
async function cleanReadmeInDir(dirPath) {
    let count = 0;

    if (!fs.existsSync(dirPath)) {
        return count;
    }

    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        
        // 跳过node_modules目录
        if (item === 'node_modules') {
            continue;
        }
        
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
            // 递归处理子目录
            count += await cleanReadmeInDir(itemPath);
        } else if (item.toLowerCase() === 'readme.md') {
            // 删除README.md文件
            try {
                log(`删除文件: ${itemPath}`, 'yellow');
                fs.unlinkSync(itemPath);
                count++;
            } catch (err) {
                log(`删除失败: ${itemPath}, 错误: ${err.message}`, 'red');
            }
        }
    }
    
    return count;
}

// 执行主函数
main().catch(err => {
    log(`执行过程中出错: ${err.message}`, 'red');
    process.exit(1);
});
