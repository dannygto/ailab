#!/usr/bin/env node

/**
 * AICAM 项目健康检查工具
 * 检查项目状态、依赖、配置等
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

function healthCheck() {
    log('=== AICAM 项目健康检查 ===', 'blue');
    
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    
    // 检查必要文件
    const requiredFiles = [
        'package.json',
        'README.md',
        '源代码/前端/package.json',
        '源代码/后端/package.json',
        '源代码/前端/src/App.tsx',
        '源代码/后端/src/index.ts'
    ];
    
    log('检查必要文件...', 'yellow');
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            log(`✓ ${file}`, 'green');
            passed++;
        } else {
            log(`✗ ${file} (缺失)`, 'red');
            failed++;
        }
    });
    
    // 检查目录结构
    log('检查目录结构...', 'yellow');
    const requiredDirs = [
        '源代码/前端/src',
        '源代码/后端/src',
        '源代码/前端/public',
        '配置',
        '文档',
        '脚本'
    ];
    
    requiredDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            log(`✓ ${dir}/`, 'green');
            passed++;
        } else {
            log(`✗ ${dir}/ (缺失)`, 'red');
            failed++;
        }
    });
    
    // 检查配置文件
    log('检查配置文件...', 'yellow');
    const configFiles = [
        '源代码/前端/tsconfig.json',
        '源代码/前端/.eslintrc.js',
        '源代码/后端/tsconfig.json',
        '配置/环境配置/.env.production'
    ];
    
    configFiles.forEach(file => {
        if (fs.existsSync(file)) {
            log(`✓ ${file}`, 'green');
            passed++;
        } else {
            log(`⚠ ${file} (建议添加)`, 'yellow');
            warnings++;
        }
    });
    
    // 检查依赖
    log('检查依赖文件...', 'yellow');
    const depFiles = [
        '源代码/前端/package-lock.json',
        '源代码/后端/package-lock.json'
    ];
    
    depFiles.forEach(file => {
        if (fs.existsSync(file)) {
            log(`✓ ${file}`, 'green');
            passed++;
        } else {
            log(`⚠ ${file} (建议运行 npm install)`, 'yellow');
            warnings++;
        }
    });
    
    // 检查构建产物
    log('检查构建产物...', 'yellow');
    const buildDirs = [
        '源代码/前端/build',
        '源代码/前端/dist',
        '源代码/后端/dist'
    ];
    
    buildDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            log(`⚠ ${dir}/ (存在构建产物，建议清理)`, 'yellow');
            warnings++;
        } else {
            log(`✓ ${dir}/ (无构建产物)`, 'green');
            passed++;
        }
    });
    
    // 检查 Git 状态
    log('检查 Git 状态...', 'yellow');
    if (fs.existsSync('.git')) {
        log('✓ Git 仓库已初始化', 'green');
        passed++;
    } else {
        log('✗ Git 仓库未初始化', 'red');
        failed++;
    }
    
    // 生成报告
    log('=== 健康检查报告 ===', 'blue');
    log(`通过: ${passed} 项`, 'green');
    log(`失败: ${failed} 项`, failed > 0 ? 'red' : 'green');
    log(`警告: ${warnings} 项`, warnings > 0 ? 'yellow' : 'green');
    
    if (failed === 0) {
        log('项目状态: 健康 ✓', 'green');
    } else {
        log('项目状态: 需要修复 ✗', 'red');
    }
    
    return { passed, failed, warnings };
}

// 执行健康检查
healthCheck(); 