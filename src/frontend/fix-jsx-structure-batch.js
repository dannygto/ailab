const fs = require('fs');
const path = require('path');

// 需要修复的文件列表
const filesToFix = [
  'src/components/domain/devices/DeviceMonitorListV2_Clean.tsx',
  'src/components/domain/experiments/ExperimentDataVisualization.tsx',
  'src/components/domain/experiments/ExperimentFilterV2.tsx',
  'src/components/domain/experiments/ExperimentStatistics.tsx',
  'src/components/domain/experiments/ExperimentTypeSelect.tsx',
  'src/components/experiments/execution/ExecutionMonitor.tsx',
  'src/components/guidance/GuidanceGenerator.tsx',
  'src/components/guidance/SessionHistory.tsx',
  'src/components/layout/MainLayout.tsx',
  'src/components/layout/SimpleMainLayout.tsx',
  'src/components/media/RealTimeCollaboration.tsx',
  'src/components/media/SpeechToTextComponent.tsx',
  'src/components/mobile/MobileDeviceCard.tsx',
  'src/components/mobile/MobileNavigation.tsx',
  'src/components/visualizations/ExperimentResultsNew.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/devices/DeviceManagement.tsx',
  'src/pages/devices/DeviceMonitorDashboard.tsx',
  'src/pages/experiments/components/AIAssistanceSelect.tsx',
  'src/pages/experiments/components/ExperimentInfoPanel.tsx',
  'src/pages/experiments/components/ExperimentStatusPanel.tsx',
  'src/pages/experiments/ExperimentCreateV2.tsx',
  'src/pages/experiments/ExperimentDetail.tsx',
  'src/pages/experiments/ExperimentDetailV2.tsx',
  'src/pages/Login.tsx',
  'src/pages/NotFound.tsx',
  'src/pages/Register.tsx',
  'src/pages/resources/ResourceManagement.tsx',
  'src/pages/SimpleSettings.tsx',
  'src/pages/SimpleSettingsTest.tsx',
  'src/pages/TeacherDashboard.tsx',
  'src/pages/templates/TemplateDetail.tsx',
  'src/pages/templates/TemplateDetailFixed.tsx'
];

// 常见的修复规则
const fixRules = [
  // 修复 div 标签不匹配
  { pattern: /<div([^>]*)>(.*?)<\/Box>/gs, replacement: '<Box$1>$2</Box>' },
  { pattern: /<div([^>]*)>(.*?)<\/div>/gs, replacement: '<div$1>$2</div>' },
  
  // 修复 Box 标签不匹配
  { pattern: /<Box([^>]*)>(.*?)<\/div>/gs, replacement: '<Box$1>$2</Box>' },
  
  // 修复 Paper 标签不匹配
  { pattern: /<Paper([^>]*)>(.*?)<\/div>/gs, replacement: '<Paper$1>$2</Paper>' },
  
  // 修复 Card 标签不匹配
  { pattern: /<Card([^>]*)>(.*?)<\/div>/gs, replacement: '<Card$1>$2</Card>' },
  
  // 修复 Grid 标签不匹配
  { pattern: /<Grid([^>]*)>(.*?)<\/div>/gs, replacement: '<Grid$1>$2</Grid>' },
  
  // 修复 CardContent 标签不匹配
  { pattern: /<CardContent([^>]*)>(.*?)<\/div>/gs, replacement: '<CardContent$1>$2</CardContent>' },
  
  // 修复 TableCell 标签不匹配
  { pattern: /<TableCell([^>]*)>(.*?)<\/div>/gs, replacement: '<TableCell$1>$2</TableCell>' },
  
  // 修复 Typography 标签不匹配
  { pattern: /<Typography([^>]*)>(.*?)<\/div>/gs, replacement: '<Typography$1>$2</Typography>' },
  
  // 修复 List 标签不匹配
  { pattern: /<List([^>]*)>(.*?)<\/div>/gs, replacement: '<List$1>$2</List>' },
  
  // 修复 ListItem 标签不匹配
  { pattern: /<ListItem([^>]*)>(.*?)<\/div>/gs, replacement: '<ListItem$1>$2</ListItem>' },
  
  // 修复 Stepper 标签不匹配
  { pattern: /<Stepper([^>]*)>(.*?)<\/div>/gs, replacement: '<Stepper$1>$2</Stepper>' },
  
  // 修复 Step 标签不匹配
  { pattern: /<Step([^>]*)>(.*?)<\/div>/gs, replacement: '<Step$1>$2</Step>' },
  
  // 修复 StepContent 标签不匹配
  { pattern: /<StepContent([^>]*)>(.*?)<\/div>/gs, replacement: '<StepContent$1>$2</StepContent>' },
  
  // 修复 Dialog 标签不匹配
  { pattern: /<Dialog([^>]*)>(.*?)<\/div>/gs, replacement: '<Dialog$1>$2</Dialog>' },
  
  // 修复 DialogContent 标签不匹配
  { pattern: /<DialogContent([^>]*)>(.*?)<\/div>/gs, replacement: '<DialogContent$1>$2</DialogContent>' },
  
  // 修复 Table 标签不匹配
  { pattern: /<Table([^>]*)>(.*?)<\/div>/gs, replacement: '<Table$1>$2</Table>' },
  
  // 修复 TableContainer 标签不匹配
  { pattern: /<TableContainer([^>]*)>(.*?)<\/div>/gs, replacement: '<TableContainer$1>$2</TableContainer>' },
  
  // 修复 TableBody 标签不匹配
  { pattern: /<TableBody([^>]*)>(.*?)<\/div>/gs, replacement: '<TableBody$1>$2</TableBody>' },
  
  // 修复 TableRow 标签不匹配
  { pattern: /<TableRow([^>]*)>(.*?)<\/div>/gs, replacement: '<TableRow$1>$2</TableRow>' },
  
  // 修复 Collapse 标签不匹配
  { pattern: /<Collapse([^>]*)>(.*?)<\/div>/gs, replacement: '<Collapse$1>$2</Collapse>' },
  
  // 修复 React.Fragment 标签不匹配
  { pattern: /<React\.Fragment([^>]*)>(.*?)<\/div>/gs, replacement: '<React.Fragment$1>$2</React.Fragment>' }
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changeCount = 0;

    // 应用修复规则
    fixRules.forEach(rule => {
      const matches = content.match(rule.pattern);
      if (matches) {
        content = content.replace(rule.pattern, rule.replacement);
        changeCount += matches.length;
      }
    });

    // 特殊修复：处理多个连续的 JSX 元素，需要包装在 Fragment 中
    const jsxElementPattern = /return\s*\(\s*(<[^>]+>.*?<\/[^>]+>\s*<[^>]+>.*?<\/[^>]+>)/gs;
    if (jsxElementPattern.test(content)) {
      content = content.replace(jsxElementPattern, (match, jsx) => {
        return match.replace(jsx, `<React.Fragment>\n${jsx}\n</React.Fragment>`);
      });
      changeCount++;
    }

    // 处理不完整的 JSX 结构
    const incompleteJsxPattern = /(<[A-Z][^>]*>[\s\S]*?)(<\/[A-Z][^>]*>)/g;
    content = content.replace(incompleteJsxPattern, (match, opening, closing) => {
      // 确保开闭标签匹配
      const openingTag = opening.match(/<([A-Z][^>\s]*)/)?.[1];
      const closingTag = closing.match(/<\/([A-Z][^>\s]*)/)?.[1];
      
      if (openingTag && closingTag && openingTag !== closingTag) {
        return opening + closing.replace(closingTag, openingTag);
      }
      return match;
    });

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ 修复了 ${filePath} (${changeCount} 处更改)`);
    } else {
      console.log(`⚪ ${filePath} 无需修复`);
    }
  } catch (error) {
    console.error(`❌ 修复 ${filePath} 时出错:`, error.message);
  }
}

// 批量修复文件
console.log('开始批量修复 JSX 结构...');
filesToFix.forEach(file => {
  fixFile(file);
});
console.log('批量修复完成！');
