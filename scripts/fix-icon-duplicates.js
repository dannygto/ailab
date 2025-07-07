const fs = require('fs');
const path = require('path');

console.log('=== 图标系统重复导出清理 ===');

const iconsPath = path.join(__dirname, '../frontend/src/utils/icons.ts');
let content = fs.readFileSync(iconsPath, 'utf8');

// 移除所有重复的导出
const lines = content.split('\n');
const seen = new Set();
const cleanedLines = [];

for (let line of lines) {
  if (line.includes('export { default as')) {
    const match = line.match(/export\s*\{\s*default\s+as\s+(\w+)\s*\}/);
    if (match) {
      const iconName = match[1];
      if (!seen.has(iconName)) {
        seen.add(iconName);
        cleanedLines.push(line);
      } else {
        console.log(`跳过重复导出: ${iconName}`);
      }
    } else {
      cleanedLines.push(line);
    }
  } else {
    cleanedLines.push(line);
  }
}

// 重新写入清理后的内容
fs.writeFileSync(iconsPath, cleanedLines.join('\n'));

console.log(`清理完成，保留了 ${seen.size} 个唯一图标导出`);
