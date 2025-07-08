const fs = require('fs');
const path = require('path');

// 修复最后的几个JSX结构错误
const fixFinalJSXErrors = () => {
  const frontendDir = path.join(__dirname, '..', 'frontend');
  
  // SystemSettings.tsx - 修复某个div标签
  const systemSettingsPath = path.join(frontendDir, 'src/pages/admin/SystemSettings.tsx');
  if (fs.existsSync(systemSettingsPath)) {
    let content = fs.readFileSync(systemSettingsPath, 'utf8');
    
    // 查找可能有问题的div标签并替换为Box（如果它有sx属性）
    content = content.replace(/<div(\s+[^>]*sx=\{[^}]*\}[^>]*)>/g, '<Box$1>');
    
    fs.writeFileSync(systemSettingsPath, content, 'utf8');
    console.log('修复了 SystemSettings.tsx');
  }
  
  // AdvancedDataAnalysis.tsx - 类似的修复
  const dataAnalysisPath = path.join(frontendDir, 'src/pages/data/AdvancedDataAnalysis.tsx');
  if (fs.existsSync(dataAnalysisPath)) {
    let content = fs.readFileSync(dataAnalysisPath, 'utf8');
    
    // 修复导入问题 - 移除重复的Box导入
    content = content.replace(/(import\s+\{[^}]*),\s*Box\s*\}\s*from\s+'@mui\/material';/, '$1} from \'@mui/material\';');
    
    // 修复sx属性div
    content = content.replace(/<div(\s+[^>]*sx=\{[^}]*\}[^>]*)>/g, '<Box$1>');
    
    fs.writeFileSync(dataAnalysisPath, content, 'utf8');
    console.log('修复了 AdvancedDataAnalysis.tsx');
  }
};

fixFinalJSXErrors();
console.log('最终JSX错误修复完成');
