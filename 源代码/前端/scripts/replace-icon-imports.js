#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取所有使用了@mui/icons-material的文件
const srcDir = path.join(__dirname, '..', 'src');

function getAllTsxFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllTsxFiles(fullPath));
    } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function replaceIconImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 检查是否有@mui/icons-material导入
    if (!content.includes('@mui/icons-material')) {
      return;
    }
    
    console.log(`Processing: ${filePath}`);
    
    // 替换所有@mui/icons-material导入为从utils/icons导入
    content = content.replace(
      /import\s+\{([^}]+)\}\s+from\s+['"]@mui\/icons-material['"];?/g,
      (match, icons) => {
        const iconList = icons.split(',').map(icon => icon.trim());
        return `import { ${iconList.join(', ')} } from '../utils/icons';`;
      }
    );
    
    // 替换单个导入
    content = content.replace(
      /import\s+(\w+)\s+from\s+['"]@mui\/icons-material\/\w+['"];?/g,
      (match, iconName) => {
        return `import { ${iconName} } from '../utils/icons';`;
      }
    );
    
    // 修复相对路径
    const relativePath = path.relative(path.dirname(filePath), path.join(srcDir, 'utils', 'icons')).replace(/\\/g, '/');
    content = content.replace(
      /from\s+['"]\.\.\/utils\/icons['"];?/g,
      `from '${relativePath}';`
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// 获取所有文件并处理
const files = getAllTsxFiles(srcDir);
console.log(`Found ${files.length} TypeScript files`);

files.forEach(replaceIconImports);

console.log('Icon import replacement completed!');
