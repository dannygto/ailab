const fs = require('fs');
const path = require('path');

// 文件扫描函数
function scanDirectory(dir, extensions = ['.tsx', '.ts']) {
  const files = [];
  
  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!entry.startsWith('.') && entry !== 'node_modules') {
          scan(fullPath);
        }
      } else if (extensions.some(ext => entry.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

// 修复函数
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let modified = false;

  // 1. 修复语法错误的导入语句
  const importFixes = [
    // 移除双逗号
    { pattern: /,\s*,\s*Box\s*}/g, replacement: ', Box }' },
    { pattern: /,\s*,\s*([A-Za-z]+)\s*}/g, replacement: ', $1 }' },
    
    // 修复错误的 import 语句
    { pattern: /import\s+{\s*Box\s*}\s+from\s+'@mui\/material';/g, replacement: "import('@mui/material');" },
    { pattern: /const\s+iconModule\s*=\s*await\s+import\s*{\s*Box\s*}\s*from\s*'@mui\/material';/g, replacement: "const iconModule = await import('@mui/material');" },
    
    // 修复类型文件中的语法错误
    { pattern: /import\s*{\s*Box\s*}\s*from\s*'@mui\/material';\s*triggerConditions/g, replacement: 'triggerConditions' },
  ];

  importFixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
  });

  // 2. 修复JSX结构错误
  const jsxFixes = [
    // 修复 div 标签闭合问题
    { pattern: /<div([^>]*)>\s*<\/Box>/g, replacement: '<Box$1></Box>' },
    { pattern: /<div([^>]*)>\s*<\/div>/g, replacement: '<div$1></div>' },
    
    // 修复 Box 标签闭合问题
    { pattern: /<Box([^>]*)>\s*<\/div>/g, replacement: '<Box$1></Box>' },
    
    // 修复常见的标签不匹配
    { pattern: /<div([^>]*)>\s*<\/Paper>/g, replacement: '<Paper$1></Paper>' },
    { pattern: /<div([^>]*)>\s*<\/Card>/g, replacement: '<Card$1></Card>' },
    { pattern: /<div([^>]*)>\s*<\/Grid>/g, replacement: '<Grid$1></Grid>' },
    { pattern: /<div([^>]*)>\s*<\/CardContent>/g, replacement: '<CardContent$1></CardContent>' },
    { pattern: /<div([^>]*)>\s*<\/Typography>/g, replacement: '<Typography$1></Typography>' },
    { pattern: /<div([^>]*)>\s*<\/TableCell>/g, replacement: '<TableCell$1></TableCell>' },
    { pattern: /<div([^>]*)>\s*<\/ListItem>/g, replacement: '<ListItem$1></ListItem>' },
    { pattern: /<div([^>]*)>\s*<\/Step>/g, replacement: '<Step$1></Step>' },
    { pattern: /<div([^>]*)>\s*<\/StepContent>/g, replacement: '<StepContent$1></StepContent>' },
    { pattern: /<div([^>]*)>\s*<\/Stepper>/g, replacement: '<Stepper$1></Stepper>' },
    { pattern: /<div([^>]*)>\s*<\/Collapse>/g, replacement: '<Collapse$1></Collapse>' },
    { pattern: /<div([^>]*)>\s*<\/DialogContent>/g, replacement: '<DialogContent$1></DialogContent>' },
    { pattern: /<div([^>]*)>\s*<\/TableRow>/g, replacement: '<TableRow$1></TableRow>' },
    { pattern: /<div([^>]*)>\s*<\/TableBody>/g, replacement: '<TableBody$1></TableBody>' },
    { pattern: /<div([^>]*)>\s*<\/Table>/g, replacement: '<Table$1></Table>' },
    { pattern: /<div([^>]*)>\s*<\/TableContainer>/g, replacement: '<TableContainer$1></TableContainer>' },
    { pattern: /<div([^>]*)>\s*<\/List>/g, replacement: '<List$1></List>' },
    { pattern: /<div([^>]*)>\s*<\/React\.Fragment>/g, replacement: '<React.Fragment$1></React.Fragment>' },
    { pattern: /<div([^>]*)>\s*<\/Dialog>/g, replacement: '<Dialog$1></Dialog>' },
  ];

  jsxFixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
  });

  // 3. 修复多重根元素问题
  const multiRootFixes = [
    // 将多个根元素包装在 React.Fragment 中
    { pattern: /(\s*return\s*\(\s*)<([A-Z][A-Za-z]*[^>]*)>\s*([^<]+<[^>]+>[^<]*<\/[^>]+>[^<]*)+\s*<\/\2>/g, replacement: '$1<React.Fragment><$2>$3</$2></React.Fragment>' },
  ];

  multiRootFixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
  });

  // 4. 确保 Box 导入
  if (/<Box[\s>]/.test(content) && !content.includes('import') && !content.includes('Box')) {
    content = "import { Box } from '@mui/material';\n" + content;
    modified = true;
  } else if (/<Box[\s>]/.test(content) && content.includes('import') && !content.includes('Box')) {
    // 添加 Box 到现有导入
    content = content.replace(
      /(import\s*{\s*[^}]+)(\s*}\s*from\s*'@mui\/material';)/,
      '$1, Box$2'
    );
    modified = true;
  }

  // 5. 修复类型文件中的语法错误
  if (filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    const typeFixes = [
      { pattern: /import\s*{\s*Box\s*}\s*from\s*'@mui\/material';\s*/g, replacement: '' },
      { pattern: /\s*triggerConditions\?\s*:\s*\{/g, replacement: '\n  triggerConditions?: {' },
      { pattern: /\s*relatedResources\?\s*:\s*GuidanceResource\[\];/g, replacement: '\n  relatedResources?: GuidanceResource[];' },
    ];

    typeFixes.forEach(fix => {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        modified = true;
      }
    });
  }

  // 6. 修复无效的 JSX 属性
  const attributeFixes = [
    { pattern: /visibility\s*=\s*{[^}]*VisibilityIcon[^}]*}/g, replacement: 'sx={{ visibility: "visible" }}' },
  ];

  attributeFixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
  });

  // 写入修复后的文件
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ 修复文件: ${filePath}`);
    return true;
  }
  
  return false;
}

// 主函数
function main() {
  const frontendDir = 'd:\\AICAMV2\\frontend\\src';
  console.log('🔧 开始最终 JSX 修复...');
  
  const files = scanDirectory(frontendDir);
  let fixedCount = 0;
  
  for (const file of files) {
    try {
      if (fixFile(file)) {
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ 修复文件失败: ${file}`, error.message);
    }
  }
  
  console.log(`\n🎉 修复完成! 共修复 ${fixedCount} 个文件`);
  console.log(`📋 处理的文件总数: ${files.length}`);
}

main();
