#!/usr/bin/env node

/**
 * AICAM 项目清理工具
 * 清理临时文件、构建产物、日志文件等
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

function cleanup() {
    log('开始清理 AICAM 项目...', 'blue');
    
    const dirsToClean = [
        'node_modules',
        'dist',
        'build',
        '.cache',
        'logs',
        'temp',
        'coverage',
        '.nyc_output',
        '源代码/前端/build',
        '源代码/前端/dist',
        '源代码/前端/node_modules',
        '源代码/后端/dist',
        '源代码/后端/node_modules'
    ];
    
    let cleanedCount = 0;
    let totalSize = 0;
    
    dirsToClean.forEach(dir => {
        if (fs.existsSync(dir)) {
            try {
                // 计算目录大小
                const size = getDirSize(dir);
                totalSize += size;
                
                // 删除目录
                fs.rmSync(dir, { recursive: true, force: true });
                log(`清理目录: ${dir} (${formatSize(size)})`, 'green');
                cleanedCount++;
            } catch (error) {
                log(`清理失败: ${dir} - ${error.message}`, 'red');
            }
        }
    });
    
    // 清理临时文件
    const tempFiles = [
        '*.log',
        '*.tmp',
        '*.temp',
        '.DS_Store',
        'Thumbs.db'
    ];
    
    log(`清理完成！删除了 ${cleanedCount} 个目录，释放空间 ${formatSize(totalSize)}`, 'green');
}

function getDirSize(dirPath) {
    let size = 0;
    try {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                size += getDirSize(filePath);
            } else {
                size += stat.size;
            }
        });
    } catch (error) {
        // 忽略权限错误
    }
    return size;
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 执行清理
cleanup(); 