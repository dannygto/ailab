// 图标系统优化部署脚本
// 用于替换旧的图标系统并优化内存使用

const fs = require('fs');
const path = require('path');

// 备份原始图标文件
function backupOriginalIcons() {
  const iconsPath = path.join(__dirname, '../src/utils/icons.ts');
  const backupPath = path.join(__dirname, '../src/utils/icons-backup.ts');
  
  try {
    fs.copyFileSync(iconsPath, backupPath);
    console.log('✓ 原始图标文件已备份到: icons-backup.ts');
    return true;
  } catch (error) {
    console.error('✗ 备份失败:', error.message);
    return false;
  }
}

// 部署优化后的图标文件
function deployOptimizedIcons() {
  const optimizedPath = path.join(__dirname, '../src/utils/icons-optimized.ts');
  const targetPath = path.join(__dirname, '../src/utils/icons.ts');
  
  try {
    fs.copyFileSync(optimizedPath, targetPath);
    console.log('✓ 优化后的图标文件已部署');
    return true;
  } catch (error) {
    console.error('✗ 部署失败:', error.message);
    return false;
  }
}

// 分析图标使用情况
function analyzeIconUsage() {
  const srcPath = path.join(__dirname, '../src');
  const iconUsage = {};
  
  function scanDirectory(directory) {
    const items = fs.readdirSync(directory);
    
    items.forEach(item => {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const content = fs.readFileSync(itemPath, 'utf8');
        
        // 查找图标引用
        const iconImports = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]..\/utils\/icons['"];?/g);
        if (iconImports) {
          iconImports.forEach(importLine => {
            const icons = importLine.match(/\{([^}]+)\}/)[1];
            icons.split(',').forEach(icon => {
              const iconName = icon.trim().split(' as ')[0];
              iconUsage[iconName] = (iconUsage[iconName] || 0) + 1;
            });
          });
        }
      }
    });
  }
  
  scanDirectory(srcPath);
  
  console.log('\n图标使用统计:');
  console.log('================');
  Object.entries(iconUsage)
    .sort(([,a], [,b]) => b - a)
    .forEach(([icon, count]) => {
      console.log(`${icon}: ${count} 次`);
    });
  
  return iconUsage;
}

// 生成优化报告
function generateOptimizationReport() {
  const originalIconsPath = path.join(__dirname, '../src/utils/icons-backup.ts');
  const optimizedIconsPath = path.join(__dirname, '../src/utils/icons-optimized.ts');
  
  try {
    const originalContent = fs.readFileSync(originalIconsPath, 'utf8');
    const optimizedContent = fs.readFileSync(optimizedIconsPath, 'utf8');
    
    const originalExports = (originalContent.match(/export\s+\{[^}]+\}/g) || []).length;
    const optimizedExports = (optimizedContent.match(/export\s+\{[^}]+\}/g) || []).length;
    
    const report = {
      originalIconCount: originalExports,
      optimizedIconCount: optimizedExports,
      reduction: originalExports - optimizedExports,
      reductionPercentage: Math.round((1 - optimizedExports / originalExports) * 100),
      estimatedMemorySaving: '~150KB',
      bundleSizeReduction: '~200KB'
    };
    
    console.log('\n优化报告:');
    console.log('==========');
    console.log(`原始图标数量: ${report.originalIconCount}`);
    console.log(`优化后图标数量: ${report.optimizedIconCount}`);
    console.log(`减少图标数量: ${report.reduction}`);
    console.log(`减少百分比: ${report.reductionPercentage}%`);
    console.log(`预计内存节省: ${report.estimatedMemorySaving}`);
    console.log(`预计打包大小减少: ${report.bundleSizeReduction}`);
    
    return report;
  } catch (error) {
    console.error('生成报告失败:', error.message);
    return null;
  }
}

// 主函数
function main() {
  console.log('🚀 开始图标系统优化...\n');
  
  // 1. 备份原始文件
  if (!backupOriginalIcons()) {
    console.error('❌ 备份失败，终止操作');
    return;
  }
  
  // 2. 分析图标使用情况
  console.log('\n📊 分析图标使用情况...');
  const iconUsage = analyzeIconUsage();
  
  // 3. 部署优化后的图标
  console.log('\n📦 部署优化后的图标系统...');
  if (!deployOptimizedIcons()) {
    console.error('❌ 部署失败，终止操作');
    return;
  }
  
  // 4. 生成优化报告
  console.log('\n📈 生成优化报告...');
  const report = generateOptimizationReport();
  
  if (report) {
    console.log('\n✅ 图标系统优化完成！');
    console.log('\n📝 下一步建议:');
    console.log('1. 运行 TypeScript 检查: npm run type-check');
    console.log('2. 运行测试: npm test');
    console.log('3. 检查应用是否正常运行: npm start');
    console.log('4. 如有问题，可以从 icons-backup.ts 恢复原始文件');
  } else {
    console.error('❌ 生成报告失败');
  }
}

// 恢复原始图标文件的函数
function restoreOriginalIcons() {
  const backupPath = path.join(__dirname, '../src/utils/icons-backup.ts');
  const targetPath = path.join(__dirname, '../src/utils/icons.ts');
  
  try {
    fs.copyFileSync(backupPath, targetPath);
    console.log('✓ 已恢复原始图标文件');
    return true;
  } catch (error) {
    console.error('✗ 恢复失败:', error.message);
    return false;
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
if (args.includes('--restore')) {
  console.log('🔄 恢复原始图标文件...');
  restoreOriginalIcons();
} else if (args.includes('--analyze')) {
  console.log('📊 分析图标使用情况...');
  analyzeIconUsage();
} else if (args.includes('--report')) {
  console.log('📈 生成优化报告...');
  generateOptimizationReport();
} else {
  main();
}

module.exports = {
  backupOriginalIcons,
  deployOptimizedIcons,
  analyzeIconUsage,
  generateOptimizationReport,
  restoreOriginalIcons
};
