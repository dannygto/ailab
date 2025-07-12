#!/usr/bin/env node

/**
 * 图标系统验证脚本
 * 验证所有图标都能正确导入
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证图标系统...');

// 读取 icons.ts 文件
const iconsPath = path.join(__dirname, '../src/utils/icons.ts');
const content = fs.readFileSync(iconsPath, 'utf8');

// 统计图标数量
const exportLines = content.split('\n').filter(line => 
  line.includes('export') && line.includes('@mui/icons-material')
);

console.log(`📊 找到 ${exportLines.length} 个图标导出`);

// 检查是否有重复的导出
const exportNames = [];
const duplicates = [];

exportLines.forEach(line => {
  const match = line.match(/export\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from/);
  if (match) {
    const name = match[1];
    if (exportNames.includes(name)) {
      duplicates.push(name);
    } else {
      exportNames.push(name);
    }
  }
});

if (duplicates.length > 0) {
  console.log(`❌ 发现重复的图标导出: ${duplicates.join(', ')}`);
} else {
  console.log('✅ 没有重复的图标导出');
}

// 检查图标分类
const categories = [
  'Basic UI icons',
  'Navigation icons', 
  'Media control icons',
  'File operation icons',
  'Status icons',
  'Chart icons',
  'Device and system icons',
  'Power and energy icons',
  'Temperature and environment icons',
  'Communication icons',
  'User and security icons',
  'Content icons',
  'PWA icons',
  'Time icons',
  'Other common icons'
];

console.log('\n📂 图标分类检查:');
categories.forEach(category => {
  const hasCategory = content.includes(`// ${category}`);
  console.log(`${hasCategory ? '✅' : '❌'} ${category}`);
});

// 检查语法错误
try {
  // 简单的语法检查
  const lines = content.split('\n');
  let lineNumber = 1;
  let hasErrors = false;
  
  for (const line of lines) {
    if (line.includes('export') && line.includes('@mui/icons-material')) {
      // 检查基本的导出语法
      if (!line.includes('export {') || !line.includes('} from')) {
        console.log(`❌ 第 ${lineNumber} 行语法错误: ${line.trim()}`);
        hasErrors = true;
      }
    }
    lineNumber++;
  }
  
  if (!hasErrors) {
    console.log('✅ 语法检查通过');
  }
} catch (error) {
  console.log(`❌ 语法检查失败: ${error.message}`);
}

console.log('\n🎉 图标系统验证完成！');
console.log(`📈 总计: ${exportNames.length} 个图标`);
console.log(`📁 分类: ${categories.length} 个分类`); 