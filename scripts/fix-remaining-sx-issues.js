const fs = require('fs');
const path = require('path');

// 安全地修复剩余的sx属性问题
const fixRemainingSxIssues = () => {
  const frontendDir = path.join(__dirname, '..', 'frontend');
  
  // 需要修复的文件列表
  const filesToFix = [
    'src/pages/admin/SystemSettings.tsx',
    'src/pages/data/AdvancedDataAnalysis.tsx',
    'src/pages/ExperimentResourceManager.tsx'
  ];
  
  filesToFix.forEach(filePath => {
    const fullPath = path.join(frontendDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // 简单的修复 - 只替换明显的错误
        // 替换 </div> 为 </Box>，当前面有 <Box sx={{ 时
        let lines = content.split('\n');
        let insideBoxWithSx = false;
        let boxStack = [];
        
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          
          // 检查是否是一个 <Box sx={{ 的开始
          if (line.includes('<Box') && line.includes('sx={{')) {
            boxStack.push(i);
            insideBoxWithSx = true;
          }
          
          // 检查是否是一个 </div> 需要替换为 </Box>
          if (line.includes('</div>') && boxStack.length > 0) {
            lines[i] = line.replace('</div>', '</Box>');
            boxStack.pop();
            if (boxStack.length === 0) {
              insideBoxWithSx = false;
            }
          }
          
          // 如果遇到 </Box>，也要减少栈
          if (line.includes('</Box>') && boxStack.length > 0) {
            boxStack.pop();
          }
        }
        
        content = lines.join('\n');
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`安全修复文件: ${filePath}`);
      } catch (error) {
        console.error(`修复文件 ${filePath} 时出错:`, error.message);
      }
    } else {
      console.log(`文件不存在: ${filePath}`);
    }
  });
};

fixRemainingSxIssues();
console.log('剩余的 sx 属性问题修复完成');
