#!/usr/bin/env node

/**
 * 修复BOM警告脚本
 * 移除文件开头的Unicode BOM字符
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 检查文件是否有BOM
function hasBOM(filePath) {
  const content = fs.readFileSync(filePath);
  return content.length >= 3 && 
         content[0] === 0xEF && 
         content[1] === 0xBB && 
         content[2] === 0xBF;
}

// 移除BOM
function removeBOM(filePath) {
  const content = fs.readFileSync(filePath);
  if (hasBOM(filePath)) {
    const contentWithoutBOM = content.slice(3);
    fs.writeFileSync(filePath, contentWithoutBOM);
    return true;
  }
  return false;
}

// 主函数
function main() {
  console.log('🔧 开始修复BOM警告...');
  
  // 查找所有TypeScript/TSX文件
  const files = glob.sync('src/**/*.{ts,tsx}', {
    cwd: path.join(__dirname, '..'),
    ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}']
  });
  
  let fixedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    if (hasBOM(filePath)) {
      removeBOM(filePath);
      console.log(`✅ 修复了 ${file}`);
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 完成！修复了 ${fixedCount} 个文件的BOM警告`);
  
  if (fixedCount === 0) {
    console.log('📝 没有发现BOM警告，所有文件都是干净的！');
  }
}

if (require.main === module) {
  main();
}

module.exports = { hasBOM, removeBOM }; 