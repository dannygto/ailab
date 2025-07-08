const fs = require('fs');
const path = require('path');

// 修复 DeviceDetailDialog.tsx
const filePath = path.join(__dirname, '../frontend/src/components/domain/devices/DeviceDetailDialog.tsx');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 替换所有 <div sx={...}> 为 <Box sx={...}>
    content = content.replace(/<div\s+sx=\{/g, '<Box sx={');
    
    // 修复闭合标签
    let lines = content.split('\n');
    let openBoxCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 计算 <Box 开启
        const boxOpenings = (line.match(/<Box(\s|>)/g) || []).length;
        openBoxCount += boxOpenings;
        
        // 计算 </Box> 闭合
        const boxClosings = (line.match(/<\/Box>/g) || []).length;
        openBoxCount -= boxClosings;
        
        // 如果有未闭合的Box且找到 </div>，可能需要改为 </Box>
        if (openBoxCount > 0 && line.includes('</div>')) {
            // 只在这行没有相应的 <div> 开启时替换
            if (!line.includes('<div')) {
                lines[i] = line.replace('</div>', '</Box>');
                console.log(`修复闭合标签在第 ${i + 1} 行: ${line.trim()}`);
            }
        }
    }
    
    content = lines.join('\n');
    
    // 确保 Box 被导入
    const muiImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]@mui\/material['"]/);
    if (muiImportMatch) {
        const imports = muiImportMatch[1];
        if (!imports.includes('Box')) {
            const newImports = imports.trim() + ', Box';
            content = content.replace(muiImportMatch[0], `import { ${newImports} } from '@mui/material'`);
            console.log('添加了Box导入');
        }
    }
    
    fs.writeFileSync(filePath, content);
    console.log('修复了DeviceDetailDialog.tsx');
    
} catch (error) {
    console.error('修复DeviceDetailDialog.tsx时出错:', error);
}
