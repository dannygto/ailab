#!/usr/bin/env node

/**
 * AILAB 项目最终源码目录标准化工具
 * 清理多余的目录和文件，进一步精简和标准化src目录结构
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
const srcDir = path.join(rootDir, 'src');

// 要删除的中文目录
const chineseDirsToDelete = [
    path.join(srcDir, 'AI服务'),
    path.join(srcDir, '前端'),
    path.join(srcDir, '后端')
];

// 主函数
async function main() {
    log('开始执行最终源码目录标准化...', 'green');
    log(`项目根目录: ${rootDir}`, 'blue');

    // 检查和删除中文目录
    log('检查并删除中文命名目录...', 'yellow');
    let deletedDirCount = 0;

    for (const dirPath of chineseDirsToDelete) {
        if (fs.existsSync(dirPath)) {
            try {
                log(`删除目录: ${dirPath}`, 'yellow');
                deleteDirRecursive(dirPath);
                deletedDirCount++;
            } catch (err) {
                log(`删除失败: ${dirPath}, 错误: ${err.message}`, 'red');
            }
        }
    }

    log(`完成删除 ${deletedDirCount} 个中文命名目录`, 'green');

    // 检查config目录中的中文目录
    const configDir = path.join(rootDir, 'config');
    log('正在标准化config目录...', 'yellow');
    await standardizeConfigDir(configDir);

    // 最终统计
    log('源码目录标准化完成!', 'green');
    log(`删除中文命名目录: ${deletedDirCount}个`, 'green');
}

// 递归删除目录及其内容
function deleteDirRecursive(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach((file) => {
            const curPath = path.join(dirPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // 递归删除子目录
                deleteDirRecursive(curPath);
            } else {
                // 删除文件
                fs.unlinkSync(curPath);
            }
        });
        // 删除当前目录
        fs.rmdirSync(dirPath);
    }
}

// 标准化Config目录
async function standardizeConfigDir(configDir) {
    // 创建新的标准目录名
    const dirMappings = {
        'SSL配置': 'ssl',
        '备份配置': 'backup',
        '安全配置': 'security',
        '日志配置': 'logging',
        '环境配置': 'environment',
        '监控配置': 'monitoring',
        '部署配置': 'deployment'
    };

    for (const [oldName, newName] of Object.entries(dirMappings)) {
        const oldPath = path.join(configDir, oldName);
        const newPath = path.join(configDir, newName);

        if (fs.existsSync(oldPath)) {
            try {
                // 检查新目录是否已存在
                if (!fs.existsSync(newPath)) {
                    // 创建新目录
                    fs.mkdirSync(newPath, { recursive: true });
                    log(`创建目录: ${newPath}`, 'green');
                }

                // 复制文件
                const files = fs.readdirSync(oldPath);
                for (const file of files) {
                    const oldFilePath = path.join(oldPath, file);
                    const newFilePath = path.join(newPath, file);

                    // 只处理文件
                    if (fs.lstatSync(oldFilePath).isFile()) {
                        fs.copyFileSync(oldFilePath, newFilePath);
                        log(`复制文件: ${oldFilePath} -> ${newFilePath}`, 'blue');
                    }
                }

                // 删除旧目录
                deleteDirRecursive(oldPath);
                log(`删除旧目录: ${oldPath}`, 'yellow');
            } catch (err) {
                log(`处理目录 ${oldPath} 时出错: ${err.message}`, 'red');
            }
        }
    }
}

// 执行主函数
main().catch(err => {
    log(`执行过程中出错: ${err.message}`, 'red');
    process.exit(1);
});
