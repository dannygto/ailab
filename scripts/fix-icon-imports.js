const fs = require('fs');
const path = require('path');

console.log('=== 修复图标导入问题 ===');

// 需要修复的文件和它们需要的图标
const filesToFix = [
  {
    path: 'src/components/analytics/NLPAnalytics.tsx',
    icons: ['CategoryIcon', 'ReportIcon', 'CopyIcon']
  },
  {
    path: 'src/components/analytics/NLPAnalytics-fixed.tsx',
    icons: ['CategoryIcon', 'ReportIcon', 'CopyIcon']
  },
  {
    path: 'src/components/common/BatchOperations.tsx',
    icons: ['ContentCopyIcon', 'ArchiveIcon', 'LabelIcon', 'CategoryIcon', 'ShareIcon', 'VisibilityIcon', 'UndoIcon']
  }
];

filesToFix.forEach(fileInfo => {
  const fullPath = path.join(__dirname, '../frontend', fileInfo.path);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 查找现有的图标导入行
    const importMatch = content.match(/import\s*\{[^}]*\}\s*from\s*['"]\.\.\/\.\.\/utils\/icons['"];?/);
    
    if (importMatch) {
      // 获取现有导入的图标
      const existingImports = importMatch[0];
      const iconNames = existingImports.match(/(\w+Icon|\w+)/g) || [];
      
      // 添加缺失的图标
      const allIcons = [...new Set([...iconNames, ...fileInfo.icons])];
      const newImportLine = `import { ${allIcons.join(', ')} } from '../../utils/icons';`;
      
      content = content.replace(importMatch[0], newImportLine);
      
      fs.writeFileSync(fullPath, content);
      console.log(`修复文件: ${fileInfo.path}`);
      console.log(`添加图标: ${fileInfo.icons.join(', ')}`);
    } else {
      // 如果没有找到现有导入，在顶部添加新的导入
      const lines = content.split('\n');
      const insertIndex = lines.findIndex(line => line.includes('import')) + 1;
      
      const newImportLine = `import { ${fileInfo.icons.join(', ')} } from '../../utils/icons';`;
      lines.splice(insertIndex, 0, newImportLine);
      
      content = lines.join('\n');
      fs.writeFileSync(fullPath, content);
      console.log(`为文件添加新的图标导入: ${fileInfo.path}`);
    }
  }
});

console.log('=== 图标导入修复完成 ===');
