const fs = require('fs');
const path = require('path');

// 批量修复TypeScript错误的脚本
console.log('开始综合修复TypeScript错误...');

const frontendDir = path.join(__dirname, '..', 'frontend');
const srcDir = path.join(frontendDir, 'src');

// 1. 修复所有 <div sx={...}> 为 <Box sx={...}>
function fixDivSx(content) {
  // 匹配 <div sx={...} 的模式
  content = content.replace(/<div(\s+)sx=\{/g, '<Box$1sx={');
  
  // 修复对应的闭合标签 </div>
  const lines = content.split('\n');
  let divStack = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 检查是否包含 <Box sx={
    if (line.includes('<Box') && line.includes('sx={')) {
      // 检查这一行是否有自闭合标签
      if (!line.includes('/>')) {
        divStack.push(i);
      }
    }
    
    // 如果遇到 </div> 且stack中有对应的Box
    if (line.includes('</div>') && divStack.length > 0) {
      // 查找最近的Box开始
      const lastBoxLine = divStack.pop();
      if (lastBoxLine !== undefined) {
        lines[i] = line.replace('</div>', '</Box>');
      }
    }
  }
  
  return lines.join('\n');
}

// 2. 添加必要的Box导入
function addBoxImport(content) {
  // 检查是否已经导入了Box
  if (!content.includes('import') || content.includes('Box')) {
    return content;
  }
  
  // 查找@mui/material的导入
  const muiImportRegex = /import\s*{([^}]+)}\s*from\s*['"]@mui\/material['"]/;
  const match = content.match(muiImportRegex);
  
  if (match) {
    const imports = match[1];
    if (!imports.includes('Box')) {
      const newImports = imports.trim() + ', Box';
      content = content.replace(muiImportRegex, `import { ${newImports} } from '@mui/material'`);
    }
  } else {
    // 如果没有找到@mui/material导入，在文件开头添加
    const firstImportIndex = content.indexOf('import');
    if (firstImportIndex !== -1) {
      const beforeImport = content.substring(0, firstImportIndex);
      const afterImport = content.substring(firstImportIndex);
      content = beforeImport + "import { Box } from '@mui/material';\n" + afterImport;
    }
  }
  
  return content;
}

// 3. 修复常见的图标问题
function fixIconIssues(content) {
  const iconFixes = {
    'visibility': 'VisibilityIcon',
    'settings': 'SettingsIcon', 
    'devices': 'DevicesIcon',
    'analytics': 'AnalyticsIcon',
    'email': 'EmailIcon',
    'share': 'ShareIcon',
    'logout': 'LogoutIcon',
    'chat': 'ChatIcon',
    'restore': 'RestoreIcon'
  };
  
  // 修复错误的图标导入
  for (const [wrongName, correctName] of Object.entries(iconFixes)) {
    const regex = new RegExp(`\\b${wrongName}\\b(?=\\s*(as\\s+\\w+)?\\s*[,}])`, 'g');
    content = content.replace(regex, correctName);
  }
  
  // 修复重复的as重命名
  content = content.replace(/(\w+)\s+as\s+\1\b/g, '$1');
  
  return content;
}

// 4. 修复component属性错误
function fixComponentProps(content) {
  // 修复 <div component="span"> 为 <Typography component="span">
  content = content.replace(/<div\s+component=/g, '<Typography component=');
  content = content.replace(/<\/div>(\s*\/\*[^*]*\*\/\s*)?(?=\s*<\/Typography>)/g, '</Typography>$1');
  
  // 修复 display="flex" 等HTML属性
  content = content.replace(/\s+display="[^"]*"/g, '');
  content = content.replace(/\s+justifyContent="[^"]*"/g, '');
  content = content.replace(/\s+alignItems="[^"]*"/g, '');
  content = content.replace(/\s+textAlign="[^"]*"/g, '');
  content = content.replace(/\s+minHeight="[^"]*"/g, '');
  content = content.replace(/\s+mb=\{[^}]*\}/g, '');
  content = content.replace(/\s+mt=\{[^}]*\}/g, '');
  content = content.replace(/\s+gap=\{[^}]*\}/g, '');
  content = content.replace(/\s+flexWrap="[^"]*"/g, '');
  
  return content;
}

// 5. 添加缺失的导出语句
function addExportStatement(content, fileName) {
  // 检查是否有export default
  if (!content.includes('export default') && !content.includes('export {')) {
    // 查找主要的函数或组件定义
    const componentMatch = content.match(/(?:const|function)\s+(\w+)/);
    if (componentMatch) {
      const componentName = componentMatch[1];
      content += `\n\nexport default ${componentName};\n`;
    }
  }
  return content;
}

// 6. 处理isolatedModules问题
function fixIsolatedModules(content, fileName) {
  // 如果文件没有任何import或export，添加空的export
  if (!content.includes('import') && !content.includes('export')) {
    content = 'export {};\n\n' + content;
  }
  return content;
}

// 递归处理所有文件
function processFiles(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 跳过node_modules和其他不需要的目录
      if (!['node_modules', '.git', 'build', 'dist'].includes(file)) {
        processFiles(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      console.log(`处理文件: ${filePath}`);
      
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // 应用所有修复
        content = fixDivSx(content);
        content = addBoxImport(content);
        content = fixIconIssues(content);
        content = fixComponentProps(content);
        content = addExportStatement(content, file);
        content = fixIsolatedModules(content, file);
        
        // 只有在内容发生变化时才写入文件
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`已修复: ${filePath}`);
        }
      } catch (error) {
        console.error(`处理文件 ${filePath} 时出错:`, error.message);
      }
    }
  }
}

// 7. 创建缺失的fixture文件
function createFixtures() {
  const fixturesDir = path.join(srcDir, 'fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }
  
  const devicesFixturePath = path.join(fixturesDir, 'devices.ts');
  if (!fs.existsSync(devicesFixturePath)) {
    const deviceFixtureContent = `export const deviceFixtures = [
  {
    id: '1',
    name: 'Test Device 1',
    type: 'sensor',
    status: 'online',
    lastSeen: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Test Device 2',
    type: 'actuator',
    status: 'offline',
    lastSeen: new Date().toISOString()
  }
];

export default deviceFixtures;
`;
    fs.writeFileSync(devicesFixturePath, deviceFixtureContent);
    console.log('已创建设备fixtures文件');
  }
}

// 8. 修复特定的重复标识符问题
function fixDuplicateIdentifiers() {
  const iconsPath = path.join(srcDir, 'utils', 'icons.ts');
  if (fs.existsSync(iconsPath)) {
    let content = fs.readFileSync(iconsPath, 'utf8');
    
    // 移除重复的导出
    const exports = [];
    const lines = content.split('\n');
    const uniqueLines = [];
    
    for (const line of lines) {
      const exportMatch = line.match(/export\s*{\s*default\s+as\s+(\w+)\s*}/);
      if (exportMatch) {
        const exportName = exportMatch[1];
        if (!exports.includes(exportName)) {
          exports.push(exportName);
          uniqueLines.push(line);
        }
      } else {
        uniqueLines.push(line);
      }
    }
    
    const newContent = uniqueLines.join('\n');
    if (newContent !== content) {
      fs.writeFileSync(iconsPath, newContent);
      console.log('已修复icons.ts中的重复导出');
    }
  }
}

// 执行修复
console.log('开始处理文件...');
createFixtures();
fixDuplicateIdentifiers();
processFiles(srcDir);

console.log('综合修复完成！');
