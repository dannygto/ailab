const fs = require('fs');
const path = require('path');

// 复杂的 sx 属性修复脚本
const fixComplexSxIssues = () => {
  const frontendDir = path.join(__dirname, '..', 'frontend');
  
  // 修复 AlertManagement.tsx 中的特定问题
  const alertManagementPath = path.join(frontendDir, 'src/components/alerts/AlertManagement.tsx');
  
  if (fs.existsSync(alertManagementPath)) {
    let content = fs.readFileSync(alertManagementPath, 'utf8');
    
    // 修复 TabPanel 中的问题 - 将外层div替换为Box
    content = content.replace(
      /function TabPanel\(props: TabPanelProps\) \{[\s\S]*?<div\s+role="tabpanel"[\s\S]*?<\/div>\s*\);[\s\S]*?\}/,
      `function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={\`alert-tabpanel-\${index}\`}
      aria-labelledby={\`alert-tab-\${index}\`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
}`
    );
    
    fs.writeFileSync(alertManagementPath, content, 'utf8');
    console.log('修复了 AlertManagement.tsx 中的 TabPanel 问题');
  }
  
  // 修复其他文件中的通用问题
  const filesToFix = [
    'src/layouts/MainLayout.tsx',
    'src/pages/admin/SystemSettings.tsx',
    'src/pages/data/AdvancedDataAnalysis.tsx',
    'src/pages/ExperimentResourceManager.tsx'
  ];
  
  filesToFix.forEach(filePath => {
    const fullPath = path.join(frontendDir, filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // 替换所有的 <div sx={{ 为 <Box sx={{
        content = content.replace(/<div(\s+)sx=\{\{/g, '<Box$1sx={{');
        
        // 查找并替换对应的 </div> 为 </Box>
        // 这里需要更智能的匹配，但先做简单替换
        const divWithSxPattern = /<div\s+sx=\{\{[^}]*\}\}[^>]*>/g;
        const matches = content.match(divWithSxPattern);
        
        if (matches) {
          matches.forEach(match => {
            const replacement = match.replace('<div', '<Box');
            content = content.replace(match, replacement);
          });
          
          // 尝试替换对应的 </div> 标签
          // 这是一个简化的方法，可能需要手动调整
          const closingDivCount = (content.match(/<\/div>/g) || []).length;
          const closingBoxCount = (content.match(/<\/Box>/g) || []).length;
          const openingBoxCount = (content.match(/<Box[^>]*>/g) || []).length;
          
          if (openingBoxCount > closingBoxCount) {
            // 需要替换一些 </div> 为 </Box>
            const needToReplace = openingBoxCount - closingBoxCount;
            let count = 0;
            content = content.replace(/<\/div>/g, (match) => {
              if (count < needToReplace) {
                count++;
                return '</Box>';
              }
              return match;
            });
          }
        }
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`修复文件: ${filePath}`);
      } catch (error) {
        console.error(`修复文件 ${filePath} 时出错:`, error.message);
      }
    }
  });
};

fixComplexSxIssues();
console.log('复杂的 sx 属性修复完成');
