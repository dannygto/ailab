const fs = require('fs');
const path = require('path');

// 标准化目录结构配置
const directoryStructure = {
  // 源代码目录
  '源代码/前端': ['frontend'],
  '源代码/后端': ['backend'],
  '源代码/AI服务': ['ai'],
  
  // 配置目录
  '配置/环境配置': ['env.example'],
  '配置/部署配置': ['docker-compose.yml', '容器编排配置.yml'],
  '配置/数据库配置': [],
  
  // 资源目录
  '资源/图片': ['logo18060.png', 'bitbug_favicon.ico'],
  '资源/图标': [],
  '资源/静态文件': [],
  
  // 项目管理目录
  '项目管理/进度报告': [],
  '项目管理/计划文档': [],
  '项目管理/验收文档': []
};

// 脚本文件分类
const scriptCategories = {
  'scripts/启动脚本': [
    'start-with-health-check.ps1',
    'ascii-compatible-start.ps1',
    'smart-start.ps1',
    'quick-start.ps1',
    'start-simple.bat'
  ],
  'scripts/部署脚本': [
    'auto-devops.ps1',
    'auto-devops.sh',
    'quick-delivery.ps1'
  ],
  'scripts/维护脚本': [
    'fix-critical-batch4.js',
    'fix-critical-batch5.js',
    'fix-experiment-data-visualization.js'
  ],
  'scripts/测试脚本': []
};

// 文档文件分类
const documentCategories = {
  '文档/用户手册': [],
  '文档/开发文档': [
    '项目说明.md',
    'DOCUMENT_CLEANUP_PLAN.md',
    'QUICK-DELIVERY-PLAN.md'
  ],
  '文档/API文档': [],
  '文档/部署指南': [
    'production-readiness-report.md'
  ]
};

function createDirectories() {
  console.log('📁 创建标准化目录结构...');
  
  const allDirectories = [
    ...Object.keys(directoryStructure),
    ...Object.keys(scriptCategories),
    ...Object.keys(documentCategories)
  ];
  
  for (const dir of allDirectories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ 创建目录: ${dir}`);
    }
  }
}

function moveFiles() {
  console.log('\n📦 移动文件到标准化目录...');
  
  // 移动配置文件
  for (const [targetDir, files] of Object.entries(directoryStructure)) {
    for (const file of files) {
      if (fs.existsSync(file)) {
        const targetPath = path.join(targetDir, path.basename(file));
        try {
          fs.renameSync(file, targetPath);
          console.log(`✅ 移动: ${file} → ${targetPath}`);
        } catch (error) {
          console.log(`⚠️  跳过: ${file} (可能已存在或无法移动)`);
        }
      }
    }
  }
  
  // 移动脚本文件
  for (const [targetDir, files] of Object.entries(scriptCategories)) {
    for (const file of files) {
      if (fs.existsSync(file)) {
        const targetPath = path.join(targetDir, path.basename(file));
        try {
          fs.renameSync(file, targetPath);
          console.log(`✅ 移动脚本: ${file} → ${targetPath}`);
        } catch (error) {
          console.log(`⚠️  跳过脚本: ${file} (可能已存在或无法移动)`);
        }
      }
    }
  }
  
  // 移动文档文件
  for (const [targetDir, files] of Object.entries(documentCategories)) {
    for (const file of files) {
      if (fs.existsSync(file)) {
        const targetPath = path.join(targetDir, path.basename(file));
        try {
          fs.renameSync(file, targetPath);
          console.log(`✅ 移动文档: ${file} → ${targetPath}`);
        } catch (error) {
          console.log(`⚠️  跳过文档: ${file} (可能已存在或无法移动)`);
        }
      }
    }
  }
}

function createReadmeFiles() {
  console.log('\n📝 创建目录说明文件...');
  
  const readmeContent = `# 目录说明

此目录包含项目标准化整理后的文件。

## 目录结构
- 源代码/: 包含前端、后端和AI服务的源代码
- 配置/: 包含环境配置、部署配置和数据库配置
- 资源/: 包含图片、图标和静态文件
- 文档/: 包含用户手册、开发文档、API文档和部署指南
- 脚本/: 包含启动脚本、部署脚本、维护脚本和测试脚本
- 项目管理/: 包含进度报告、计划文档和验收文档

## 更新说明
- 创建时间: ${new Date().toLocaleString()}
- 标准化版本: v1.0.0
`;

  const directories = [
    '源代码', '配置', '资源', '文档', '项目管理'
  ];
  
  for (const dir of directories) {
    const readmePath = path.join(dir, 'README.md');
    if (!fs.existsSync(readmePath)) {
      try {
        fs.writeFileSync(readmePath, readmeContent);
        console.log(`✅ 创建说明文件: ${readmePath}`);
      } catch (error) {
        console.log(`⚠️  跳过创建说明文件: ${readmePath} (${error.message})`);
      }
    }
  }
  
  // 为scripts目录创建单独的说明文件
  const scriptsReadme = `# 脚本目录说明

此目录包含项目相关的各种脚本文件。

## 脚本分类
- 启动脚本/: 项目启动相关的脚本
- 部署脚本/: 部署和运维相关的脚本
- 维护脚本/: 代码维护和修复脚本
- 测试脚本/: 测试相关的脚本

## 更新说明
- 创建时间: ${new Date().toLocaleString()}
- 标准化版本: v1.0.0
`;

  const scriptsReadmePath = path.join('scripts', 'README.md');
  if (!fs.existsSync(scriptsReadmePath)) {
    try {
      fs.writeFileSync(scriptsReadmePath, scriptsReadme);
      console.log(`✅ 创建脚本说明文件: ${scriptsReadmePath}`);
    } catch (error) {
      console.log(`⚠️  跳过创建脚本说明文件: ${scriptsReadmePath} (${error.message})`);
    }
  }
}

function createBackupStructure() {
  console.log('\n💾 创建备份结构...');
  
  const backupDir = '备份/原始结构';
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    
    // 创建原始结构说明
    const backupReadme = `# 原始项目结构备份

此目录保存了项目标准化整理前的原始结构信息。

## 备份时间
${new Date().toLocaleString()}

## 原始目录结构
- frontend/: 前端源代码
- backend/: 后端源代码  
- ai/: AI服务源代码
- scripts/: 脚本文件
- 文档/: 项目文档
- 项目管理/: 项目管理文件

## 标准化整理说明
项目已按照标准化整理计划进行了目录结构优化，所有文件已移动到对应的标准化目录中。
`;
    
    fs.writeFileSync(path.join(backupDir, 'README.md'), backupReadme);
    console.log(`✅ 创建备份说明: ${backupDir}/README.md`);
  }
}

function generateStructureReport() {
  console.log('\n📊 生成目录结构报告...');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: 'v1.0.0',
    directories: {},
    files: {},
    statistics: {
      totalDirectories: 0,
      totalFiles: 0,
      movedFiles: 0
    }
  };
  
  // 统计目录和文件
  function scanDirectory(dirPath, relativePath = '') {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          report.statistics.totalDirectories++;
          report.directories[relativeItemPath] = {
            type: 'directory',
            size: 0,
            created: stat.birthtime,
            modified: stat.mtime
          };
          scanDirectory(fullPath, relativeItemPath);
        } else {
          report.statistics.totalFiles++;
          report.files[relativeItemPath] = {
            type: 'file',
            size: stat.size,
            created: stat.birthtime,
            modified: stat.mtime
          };
        }
      }
    } catch (error) {
      console.log(`⚠️  跳过扫描目录: ${dirPath} (${error.message})`);
    }
  }
  
  scanDirectory('.');
  
  // 保存报告
  const reportPath = '项目管理/进度报告/目录结构报告.json';
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ 生成结构报告: ${reportPath}`);
  } catch (error) {
    console.log(`⚠️  无法生成结构报告: ${error.message}`);
  }
  
  return report;
}

function main() {
  console.log('🚀 开始项目目录结构标准化...\n');
  
  try {
    // 1. 创建标准化目录
    createDirectories();
    
    // 2. 移动文件
    moveFiles();
    
    // 3. 创建说明文件
    createReadmeFiles();
    
    // 4. 创建备份结构
    createBackupStructure();
    
    // 5. 生成结构报告
    const report = generateStructureReport();
    
    console.log('\n🎉 目录结构标准化完成！');
    console.log(`📈 统计信息:`);
    console.log(`   - 总目录数: ${report.statistics.totalDirectories}`);
    console.log(`   - 总文件数: ${report.statistics.totalFiles}`);
    console.log(`   - 报告位置: 项目管理/进度报告/目录结构报告.json`);
    
  } catch (error) {
    console.error('❌ 标准化过程中出现错误:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  createDirectories,
  moveFiles,
  createReadmeFiles,
  generateStructureReport
}; 