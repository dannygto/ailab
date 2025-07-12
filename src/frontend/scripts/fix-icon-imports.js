#!/usr/bin/env node

/**
 * 图标导入修复脚本
 * 将直接导入的 Material-UI 图标替换为使用 icons.ts 文件
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 获取 icons.ts 中导出的所有图标
function getExportedIcons() {
  const iconsPath = path.join(__dirname, '../src/utils/icons.ts');
  const content = fs.readFileSync(iconsPath, 'utf8');
  
  const iconExports = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    // 匹配 export { default as IconName } from '@mui/icons-material/IconName';
    const match = line.match(/export\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from\s+['"]@mui\/icons-material\/(\w+)['"]/);
    if (match) {
      iconExports.push({
        exportName: match[1],
        iconName: match[2]
      });
    }
  }
  
  return iconExports;
}

// 修复单个文件中的图标导入
function fixFileImports(filePath, exportedIcons) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // 查找直接导入的 Material-UI 图标
  const directImportRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@mui\/icons-material['"]/g;
  const matches = [...content.matchAll(directImportRegex)];
  
  if (matches.length === 0) {
    return false;
  }
  
  const usedIcons = new Set();
  
  for (const match of matches) {
    const importContent = match[1];
    const iconNames = importContent.split(',').map(name => name.trim());
    
    for (const iconName of iconNames) {
      // 处理 "IconName as AliasName" 的情况
      const [originalName, alias] = iconName.split(/\s+as\s+/);
      const cleanName = originalName.trim();
      
      // 查找对应的导出名称
      const exportedIcon = exportedIcons.find(icon => icon.iconName === cleanName);
      if (exportedIcon) {
        const finalName = alias ? `${exportedIcon.exportName} as ${alias.trim()}` : exportedIcon.exportName;
        usedIcons.add(finalName);
      }
    }
  }
  
  if (usedIcons.size > 0) {
    // 移除原有的直接导入
    content = content.replace(directImportRegex, '');
    
    // 计算相对路径
    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, '../src/utils'));
    const iconsImport = `import { ${Array.from(usedIcons).join(', ')} } from '${relativePath}/icons';`;
    
    // 在第一个 import 语句后插入
    const firstImportIndex = content.indexOf('import');
    if (firstImportIndex !== -1) {
      const nextLineIndex = content.indexOf('\n', firstImportIndex);
      content = content.slice(0, nextLineIndex + 1) + iconsImport + '\n' + content.slice(nextLineIndex + 1);
    }
    
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 修复了 ${filePath}`);
    console.log(`   添加图标: ${Array.from(usedIcons).join(', ')}`);
  }
  
  return modified;
}

// 主函数
function main() {
  console.log('🔧 开始修复图标导入...');
  
  const exportedIcons = getExportedIcons();
  console.log(`📦 找到 ${exportedIcons.length} 个导出的图标`);
  
  // 查找所有 TypeScript/TSX 文件
  const files = glob.sync('src/**/*.{ts,tsx}', {
    cwd: path.join(__dirname, '..'),
    ignore: ['src/utils/icons.ts', 'src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}']
  });
  
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    if (fixFileImports(filePath, exportedIcons)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 完成！修复了 ${fixedCount} 个文件`);
  console.log('\n📝 使用说明：');
  console.log('1. 运行此脚本后，请检查修改的文件');
  console.log('2. 确保所有图标都正确导入');
  console.log('3. 运行测试确保功能正常');
  console.log('4. 提交代码前请进行代码审查');
}

if (require.main === module) {
  main();
}

module.exports = { getExportedIcons, fixFileImports }; 