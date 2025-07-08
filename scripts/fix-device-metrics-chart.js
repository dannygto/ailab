const fs = require('fs');
const path = require('path');

// 修复 DeviceMetricsChart.tsx
const filePath = path.join(__dirname, '../frontend/src/components/domain/devices/DeviceMetricsChart.tsx');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 清理不必要的重命名导入
    content = content.replace(/RefreshIcon as RefreshIcon/g, 'RefreshIcon');
    content = content.replace(/DownloadIcon as DownloadIcon/g, 'DownloadIcon');
    content = content.replace(/ZoomInIcon as ZoomInIcon/g, 'ZoomInIcon');
    content = content.replace(/ZoomOutIcon as ZoomOutIcon/g, 'ZoomOutIcon');
    
    // 添加SettingsIcon导入
    const iconImportMatch = content.match(/import { ([^}]+) } from '\.\.\/\.\.\/\.\.\/utils\/icons';/);
    if (iconImportMatch) {
        const imports = iconImportMatch[1];
        if (!imports.includes('SettingsIcon')) {
            const newImports = imports + ', SettingsIcon';
            content = content.replace(iconImportMatch[0], `import { ${newImports} } from '../../../utils/icons';`);
            console.log('添加了SettingsIcon导入');
        }
    }
    
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
    
    fs.writeFileSync(filePath, content);
    console.log('修复了DeviceMetricsChart.tsx');
    
} catch (error) {
    console.error('修复DeviceMetricsChart.tsx时出错:', error);
}
