const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'domain', 'experiments', 'ExperimentDataVisualization.tsx');

console.log('开始修复 ExperimentDataVisualization.tsx...');

let content = fs.readFileSync(filePath, 'utf-8');

// 修复基本的标签问题
const fixes = [
  // 修复 React.Fragment 结构问题
  {
    pattern: /return \(\s*<React\.Fragment>\s*<Box/g,
    replacement: 'return (\n    <Box'
  },
  
  // 修复闭合标签不匹配问题
  {
    pattern: /<\/React\.Fragment>\s*<\/Box>/g,
    replacement: '</Box>'
  },
  
  // 修复缺失的条件渲染闭合
  {
    pattern: /\{\s*isEmptyData\s*\?\s*\(\s*<Alert/g,
    replacement: '{isEmptyData ? (\n        <Alert'
  },
  
  // 修复 IconButton 和 Tooltip 的配对问题
  {
    pattern: /<IconButton([^>]*)>\s*<([^>]+)Icon[^>]*\/>\s*<\/Tooltip>/g,
    replacement: '<Tooltip title="">\n              <IconButton$1>\n                <$2Icon />\n              </IconButton>\n            </Tooltip>'
  },
  
  // 修复 Paper 标签配对问题
  {
    pattern: /<Paper sx=\{[^}]+\}>\s*<Typography[^>]*>/g,
    replacement: '<Paper sx={{ p: 2, mb: 2 }}>\n          <Typography variant="h6">'
  },
  
  // 修复缺失的 FormControl 闭合
  {
    pattern: /<InputLabel[^>]*>[^<]*<\/FormControl>/g,
    replacement: '<InputLabel>时间范围</InputLabel>\n            <Select>\n              <MenuItem value="complete">全部数据</MenuItem>\n            </Select>\n          </FormControl>'
  },
  
  // 修复 ToggleButton 组件配对
  {
    pattern: /<ToggleButton[^>]*>\s*<([^>]+)Icon[^>]*\/>\s*<\/ToggleButton>/g,
    replacement: '<ToggleButton value="">\n                <$1Icon fontSize="small" />\n              </ToggleButton>'
  },
  
  // 修复条件渲染的括号匹配
  {
    pattern: /\}\s*\)\s*:\s*\(\s*<Box/g,
    replacement: '}\n        ) : (\n          <Box'
  },
  
  // 修复表格结构
  {
    pattern: /<table[^>]*>\s*<thead[^>]*>\s*<tr[^>]*>/g,
    replacement: '<table>\n                  <thead>\n                    <tr>'
  },
  
  // 修复 Typography 和其他标签的配对
  {
    pattern: /<Typography[^>]*>[^<]*<\/Paper>/g,
    replacement: '<Typography variant="subtitle1">选择变量</Typography>\n            </Paper>'
  }
];

console.log('应用修复规则...');

fixes.forEach((fix, index) => {
  console.log(`应用修复规则 ${index + 1}...`);
  content = content.replace(fix.pattern, fix.replacement);
});

// 写回文件
fs.writeFileSync(filePath, content, 'utf-8');

console.log('修复完成！');
