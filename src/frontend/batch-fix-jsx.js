const fs = require('fs');
const path = require('path');

// 批量修复常见的 JSX 结构问题
const batchFixJSXIssues = () => {
  console.log('开始批量修复 JSX 结构问题...');

  const filesToFix = [
    'src/components/guidance/SessionHistory.tsx',
    'src/components/layout/MainLayout.tsx',
    'src/components/layout/SimpleMainLayout.tsx',
    'src/pages/Dashboard.tsx',
    'src/pages/devices/DeviceManagement.tsx',
    'src/pages/Login.tsx',
    'src/pages/Register.tsx'
  ];

  const commonFixes = [
    // 修复 <div sx={...}> 为 <Box sx={...}>
    {
      pattern: /<div\s+sx=\{\{[^}]*\}\}/g,
      replacement: '<Box sx={{..}}'
    },
    
    // 修复常见的标签配对问题
    {
      pattern: /<Typography[^>]*>[^<]*<\/([^T][^y][^p][^o][^g][^r][^a][^p][^h][^y])/g,
      replacement: (match, tag) => match.replace(new RegExp(`</${tag}`), '</Typography')
    },
    
    // 修复 React.Fragment 结构
    {
      pattern: /<React\.Fragment>\s*<([^>]+)[^>]*>/g,
      replacement: '<$1'
    },
    
    // 修复条件渲染问题
    {
      pattern: /\{\s*([^}]+)\s*\?\s*\(\s*$/gm,
      replacement: '{$1 ? ('
    },
    
    // 修复缺失的导入
    {
      pattern: /from\s+['"][^'"]*\/icons['"];?/g,
      replacement: "from '../../../utils/icons';"
    }
  ];

  filesToFix.forEach(fileName => {
    const filePath = path.join(__dirname, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`文件不存在，跳过: ${fileName}`);
      return;
    }

    console.log(`修复文件: ${fileName}`);
    
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;

      // 应用通用修复
      commonFixes.forEach((fix, index) => {
        const before = content;
        if (typeof fix.replacement === 'function') {
          content = content.replace(fix.pattern, fix.replacement);
        } else {
          content = content.replace(fix.pattern, fix.replacement);
        }
        if (content !== before) {
          modified = true;
          console.log(`  应用修复规则 ${index + 1}`);
        }
      });

      // 特定文件的修复
      if (fileName.includes('SessionHistory')) {
        // 修复 SessionHistory 特定问题
        content = content.replace(
          /return\s*\(\s*<React\.Fragment>/g,
          'return (\n    <Box>'
        );
        content = content.replace(
          /<\/React\.Fragment>\s*\);/g,
          '    </Box>\n  );'
        );
        modified = true;
      }

      if (fileName.includes('MainLayout')) {
        // 修复布局组件问题
        content = content.replace(
          /<AppBar[^>]*>\s*<Toolbar[^>]*>/g,
          '<AppBar position="fixed">\n      <Toolbar>'
        );
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✓ 修复完成: ${fileName}`);
      } else {
        console.log(`  - 无需修复: ${fileName}`);
      }
    } catch (error) {
      console.error(`  ✗ 修复失败: ${fileName}`, error.message);
    }
  });

  console.log('批量修复完成！');
};

batchFixJSXIssues();
