const fs = require('fs');

// 手动修复一些复杂的 JSX 结构问题
function fixSpecificJSXIssues() {
  const fixes = [
    {
      file: 'src/components/domain/devices/DeviceMonitorListV2_Clean.tsx',
      fixes: [
        {
          search: /return\s*\(\s*<Box sx/,
          replace: 'return (\n    <Box sx'
        },
        {
          search: /<\/Card>\s*<\/>\s*<\/div>/,
          replace: '</Card>\n    </Box>'
        }
      ]
    },
    {
      file: 'src/components/guidance/GuidanceGenerator.tsx',
      fixes: [
        {
          search: /return\s*\(\s*<div>/,
          replace: 'return (\n    <div>'
        },
        {
          search: /<\/div>\s*<\/div>/,
          replace: '</div>\n    </div>'
        }
      ]
    },
    {
      file: 'src/components/mobile/MobileNavigation.tsx',
      fixes: [
        {
          search: /return\s*\(\s*<Box sx/,
          replace: 'return (\n    <Box sx'
        }
      ]
    },
    {
      file: 'src/pages/templates/TemplateDetailFixed.tsx',
      fixes: [
        {
          search: /return\s*\(\s*<Box sx/,
          replace: 'return (\n    <Box sx'
        }
      ]
    }
  ];

  fixes.forEach(({ file, fixes: fileFixes }) => {
    try {
      if (!fs.existsSync(file)) {
        console.log(`文件不存在: ${file}`);
        return;
      }

      let content = fs.readFileSync(file, 'utf8');
      let changeCount = 0;

      fileFixes.forEach(({ search, replace }) => {
        if (content.match(search)) {
          content = content.replace(search, replace);
          changeCount++;
        }
      });

      if (changeCount > 0) {
        fs.writeFileSync(file, content);
        console.log(`✅ 修复了 ${file} (${changeCount} 处更改)`);
      } else {
        console.log(`⚪ ${file} 无需修复`);
      }
    } catch (error) {
      console.error(`❌ 修复 ${file} 时出错:`, error.message);
    }
  });
}

// 修复 JSX 元素必须有一个父元素的问题
function fixJSXMultipleRoots() {
  const filesToFix = [
    'src/components/domain/devices/DeviceMonitorListV2_Clean.tsx',
    'src/components/guidance/GuidanceGenerator.tsx',
    'src/components/guidance/SessionHistory.tsx',
    'src/components/mobile/MobileNavigation.tsx',
    'src/pages/devices/DeviceMonitorDashboard.tsx',
    'src/pages/TeacherDashboard.tsx',
    'src/pages/templates/TemplateDetail.tsx',
    'src/pages/templates/TemplateDetailFixed.tsx'
  ];

  filesToFix.forEach(file => {
    try {
      if (!fs.existsSync(file)) {
        console.log(`文件不存在: ${file}`);
        return;
      }

      let content = fs.readFileSync(file, 'utf8');
      let changeCount = 0;

      // 查找 JSX 表达式必须有一个父元素的问题
      // 匹配 return ( 后面有多个顶级 JSX 元素的情况
      const multipleRootPattern = /return\s*\(\s*(<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>)\s*(<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>)/;
      
      if (multipleRootPattern.test(content)) {
        content = content.replace(multipleRootPattern, (match, firstElement, secondElement) => {
          return `return (\n    <React.Fragment>\n      ${firstElement}\n      ${secondElement}\n    </React.Fragment>`;
        });
        changeCount++;
      }

      // 确保 React 已导入
      if (changeCount > 0 && !content.includes('import React')) {
        if (content.includes('import {')) {
          content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]react['"];?/, 'import React, { $1 } from "react";');
        } else {
          content = 'import React from "react";\n' + content;
        }
        changeCount++;
      }

      if (changeCount > 0) {
        fs.writeFileSync(file, content);
        console.log(`✅ 修复了 ${file} 的多根元素问题 (${changeCount} 处更改)`);
      } else {
        console.log(`⚪ ${file} 无多根元素问题`);
      }
    } catch (error) {
      console.error(`❌ 修复 ${file} 时出错:`, error.message);
    }
  });
}

console.log('开始修复特定的 JSX 结构问题...');
fixSpecificJSXIssues();
console.log('\n开始修复多根元素问题...');
fixJSXMultipleRoots();
console.log('\n修复完成！');
