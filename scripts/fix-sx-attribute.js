const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/layouts/MainLayout.tsx',
  'src/pages/admin/SystemSettings.tsx',
  'src/pages/data/AdvancedDataAnalysis.tsx',
  'src/pages/ExperimentResourceManager.tsx',
  'src/components/alerts/AlertManagement.tsx'
];

// 获取前端目录路径
const frontendDir = path.join(__dirname, '..', 'frontend');

filesToFix.forEach(filePath => {
  const fullPath = path.join(frontendDir, filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // 替换 <div sx={{ 为 <Box sx={{
      content = content.replace(/<div(\s+)sx=\{\{/g, '<Box$1sx={{');
      
      // 替换对应的 </div> 为 </Box>
      // 这个更复杂，需要确保正确匹配
      // 先简单替换，然后手动检查
      
      // 确保导入了 Box 组件
      if (content.includes('sx={{') && !content.includes('import { Box')) {
        // 查找 @mui/material 导入
        if (content.includes("from '@mui/material'")) {
          content = content.replace(
            /(import\s+\{[^}]*)\}\s+from\s+'@mui\/material'/,
            '$1, Box} from \'@mui/material\''
          );
        } else if (content.includes("from '@mui/material';")) {
          content = content.replace(
            /(import\s+\{[^}]*)\}\s+from\s+'@mui\/material';/,
            '$1, Box} from \'@mui/material\';'
          );
        }
      }
      
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`修复文件: ${filePath}`);
    } catch (error) {
      console.error(`修复文件 ${filePath} 时出错:`, error.message);
    }
  } else {
    console.log(`文件不存在: ${filePath}`);
  }
});

console.log('sx属性修复完成');
