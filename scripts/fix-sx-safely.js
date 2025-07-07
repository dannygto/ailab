const fs = require('fs');
const path = require('path');

// 只修复关键的sx属性问题，避免破坏文件结构
const fixSxAttributesSafely = () => {
  const frontendDir = path.join(__dirname, '..', 'frontend');
  
  // 需要修复的文件及其特定的修复模式
  const fixes = [
    {
      file: 'src/layouts/MainLayout.tsx',
      find: '<div sx={{ display: \'flex\', height: \'100vh\' }}>',
      replace: '<Box sx={{ display: \'flex\', height: \'100vh\' }}>'
    },
    {
      file: 'src/pages/admin/SystemSettings.tsx',
      find: '<div sx={{ display: \'flex\', justifyContent: \'center\', alignItems: \'center\', height: \'80vh\' }}>',
      replace: '<Box sx={{ display: \'flex\', justifyContent: \'center\', alignItems: \'center\', height: \'80vh\' }}>'
    },
    {
      file: 'src/pages/admin/SystemSettings.tsx',
      find: '<div sx={{ display: \'flex\', justifyContent: \'flex-end\', gap: 2 }}>',
      replace: '<Box sx={{ display: \'flex\', justifyContent: \'flex-end\', gap: 2 }}>'
    },
    {
      file: 'src/pages/data/AdvancedDataAnalysis.tsx',
      find: '<div sx={{ display: \'flex\', justifyContent: \'center\', alignItems: \'center\', height: 300 }}>',
      replace: '<Box sx={{ display: \'flex\', justifyContent: \'center\', alignItems: \'center\', height: 300 }}>'
    },
    {
      file: 'src/pages/ExperimentResourceManager.tsx',
      find: '<div sx={{ display: \'flex\', justifyContent: \'center\', alignItems: \'center\', height: 400 }}>',
      replace: '<Box sx={{ display: \'flex\', justifyContent: \'center\', alignItems: \'center\', height: 400 }}>'
    }
  ];
  
  fixes.forEach(fix => {
    const fullPath = path.join(frontendDir, fix.file);
    
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        if (content.includes(fix.find)) {
          content = content.replace(fix.find, fix.replace);
          
          // 同时修复对应的 </div> 为 </Box>
          // 简单计算需要替换的数量
          const openBoxCount = (content.match(/<Box[^>]*sx=\{/g) || []).length;
          const closeBoxCount = (content.match(/<\/Box>/g) || []).length;
          
          if (openBoxCount > closeBoxCount) {
            const needToReplace = openBoxCount - closeBoxCount;
            let count = 0;
            content = content.replace(/<\/div>/g, (match) => {
              if (count < needToReplace) {
                count++;
                return '</Box>';
              }
              return match;
            });
          }
          
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`安全修复文件: ${fix.file}`);
        }
      } catch (error) {
        console.error(`修复文件 ${fix.file} 时出错:`, error.message);
      }
    }
  });
};

// 特别处理AlertManagement.tsx - 重新创建一个简化版本
const fixAlertManagement = () => {
  const alertManagementPath = path.join(__dirname, '..', 'frontend', 'src/components/alerts/AlertManagement.tsx');
  
  if (fs.existsSync(alertManagementPath)) {
    let content = fs.readFileSync(alertManagementPath, 'utf8');
    
    // 只修复明显的问题，不做大幅改动
    // 将所有的 </div> 在 sx 属性后面替换为 </Box>
    content = content.replace(/<Box sx=\{[^}]*\}[^>]*>[\s\S]*?<\/div>/g, (match) => {
      return match.replace(/<\/div>$/, '</Box>');
    });
    
    fs.writeFileSync(alertManagementPath, content, 'utf8');
    console.log('修复了 AlertManagement.tsx 的结构问题');
  }
};

fixSxAttributesSafely();
fixAlertManagement();
console.log('安全的 sx 属性修复完成');
