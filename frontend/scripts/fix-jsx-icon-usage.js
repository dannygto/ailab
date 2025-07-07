const fs = require('fs');
const path = require('path');

// 修复JSX中小写图标名称的脚本
const fixIconUsageInFiles = () => {
  const srcDir = path.join(__dirname, '../src');
  
  // 图标映射表 - 小写名称映射到正确的组件名称
  const iconMappings = [
    { from: '<devices', to: '<DevicesIcon' },
    { from: '</devices>', to: '</DevicesIcon>' },
    { from: '<settings', to: '<SettingsIcon' },
    { from: '</settings>', to: '</SettingsIcon>' },
    { from: '<logout', to: '<LogoutIcon' },
    { from: '</logout>', to: '</LogoutIcon>' },
    { from: '<email', to: '<EmailIcon' },
    { from: '</email>', to: '</EmailIcon>' },
    { from: '<chat', to: '<ChatIcon' },
    { from: '</chat>', to: '</ChatIcon>' },
    { from: '<share', to: '<ShareIcon' },
    { from: '</share>', to: '</ShareIcon>' },
    { from: '<analytics', to: '<AssessmentIcon' },
    { from: '</analytics>', to: '</AssessmentIcon>' },
    { from: '<visibility', to: '<VisibilityIcon' },
    { from: '</visibility>', to: '</VisibilityIcon>' },
    { from: '<restore', to: '<RestoreIcon' },
    { from: '</restore>', to: '</RestoreIcon>' },
    { from: '<label', to: '<LabelIcon' },
    { from: '</label>', to: '</LabelIcon>' },
    { from: '<sort', to: '<SortIcon' },
    { from: '</sort>', to: '</SortIcon>' },
    { from: '<title', to: '<TitleIcon' },
    { from: '</title>', to: '</TitleIcon>' },
  ];

  // 递归遍历文件
  const processDirectory = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // 跳过 node_modules 和其他不需要处理的目录
        if (!['node_modules', '.git', 'build', 'dist'].includes(entry.name)) {
          processDirectory(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        processFile(fullPath);
      }
    }
  };

  // 处理单个文件
  const processFile = (filePath) => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // 应用图标映射
      iconMappings.forEach(mapping => {
        if (content.includes(mapping.from)) {
          const beforeCount = (content.match(new RegExp(mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
          content = content.replace(new RegExp(mapping.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), mapping.to);
          
          if (beforeCount > 0) {
            modified = true;
            console.log(\`✓ \${path.relative(srcDir, filePath)}: \${mapping.from} -> \${mapping.to} (\${beforeCount} 处)\`);
          }
        }
      });
      
      // 写回文件
      if (modified) {
        fs.writeFileSync(filePath, content);
      }
    } catch (error) {
      console.error(\`❌ 处理文件 \${filePath} 时出错:\`, error.message);
    }
  };

  console.log('🚀 开始修复JSX中的图标使用...');
  processDirectory(srcDir);
  console.log('✅ JSX图标使用修复完成!');
};

// 运行修复
fixIconUsageInFiles();
