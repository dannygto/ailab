const fs = require('fs');
const path = require('path');

// 第五轮错误修复 - 修正剩余的路径和变量名错误
const fixMappings = {
  // 修复剩余的导入和声明错误
  'system./settings/SettingsService': 'systemSettingsService',
  'System./settings/SettingsService': 'SystemSettingsService',
  'User./settings/Settings': 'UserSettings',
  'Data./settings/Settings': 'dataSettings',
  'Theme./settings/Settings': 'themeSettings',
  'Security./settings/Settings': 'securitySettings',
  'General./settings/Settings': 'generalSettings',
  'notification./settings/Settings': 'notificationSettings',
  'Simple./settings/Settings': 'simpleSettings',
  'Simple./settings/SettingsTest': 'simpleSettingsTest',
  'TestSecurity./settings/Settings': 'testSecuritySettings',
  './settings/SettingsRoutes': 'SettingsRoutes',
  './devices/DeviceManagement': 'DeviceManagement',
  './devices/DeviceMonitoring': 'DeviceMonitoring',
  './ExperimentCreateV2': 'ExperimentCreateV2',
  './ExperimentResultsNew': 'ExperimentResultsNew',
  'set./settings/Settings': 'setSettings',
  
  // 修复剩余的方法调用
  'saveTheme./settings/Settings': 'saveThemeSettings',
  'saveData./settings/Settings': 'saveDataSettings',
  'saveGeneral./settings/Settings': 'saveGeneralSettings',
  'saveBranding./settings/Settings': 'saveBrandingSettings',
  'saveSecurity./settings/Settings': 'saveSecuritySettings',
  'getSystem./settings/Settings': 'getSystemSettings',

  // 修复剩余的JSX属性
  'show./settings/Settings': 'showSettings',

  // 修复剩余的类型引用
  'Physics./ExperimentResults': 'PhysicsExperimentResults',
  'Chemistry./ExperimentResults': 'ChemistryExperimentResults',
  'Biology./ExperimentResults': 'BiologyExperimentResults',

  // 修复剩余的组件错误
  './components/ExperimentDataPanel': 'ExperimentDataPanel',
  'Cloud CheckCircleIcon': 'CloudCheckCircleIcon',
  
  // 修复正则表达式引起的错误
  './devices/./devices/DeviceMonitoringV2': 'DeviceMonitoringV2'
};

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // 应用修复映射
  for (const [wrong, correct] of Object.entries(fixMappings)) {
    if (content.includes(wrong)) {
      const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(regex, correct);
      changed = true;
      console.log(`Fixed: ${wrong} -> ${correct} in ${filePath}`);
    }
  }

  // 修复特定的语法问题
  
  // 修复 const ./xxx = 语法错误
  content = content.replace(/const \.\/([A-Za-z][^:]+): React\.FC/g, 'const $1: React.FC');
  
  // 修复JSX标签错误
  content = content.replace(/<\.\/([A-Za-z][^>\s]+)/g, '<$1');
  content = content.replace(/<\/\.\/([A-Za-z][^>]+)>/g, '</$1>');
  
  // 修复导入语句中的路径错误
  content = content.replace(/import \.\/([A-Za-z][^\s]+)/g, 'import $1');
  content = content.replace(/from '\.\/([A-Za-z][^']+)'/g, "from './$1'");
  
  // 修复interface定义错误
  content = content.replace(/interface \.\/([A-Za-z][^{]+)/g, 'interface $1');
  
  // 修复export语句错误
  content = content.replace(/export default \.\/([A-Za-z][^\s;]+)/g, 'export default $1');
  content = content.replace(/export const \.\/([A-Za-z][^=\s]+)/g, 'export const $1');
  content = content.replace(/export class \.\/([A-Za-z][^{]+)/g, 'export class $1');
  
  // 修复变量赋值错误
  content = content.replace(/= \.\/([A-Za-z][^\s;]+)/g, '= $1');
  
  // 修复方法调用错误
  content = content.replace(/\.([A-Za-z]+)\.\/settings\/Settings/g, '.$1Settings');
  
  // 修复类型导入中的路径问题
  content = content.replace(/\{\s*\.\/([A-Za-z][^}]+)\s*\}/g, '{ $1 }');
  
  // 修复正则表达式问题导致的语法错误
  content = content.replace(/const ([A-Za-z]+)\.\/([A-Za-z]+)\//g, 'const $1$2');
  
  // 修复对象属性错误
  content = content.replace(/([A-Za-z]+)\.\/settings\/Settings\./g, '$1Settings.');
  content = content.replace(/([A-Za-z]+)\.\/settings\/Settings\[/g, '$1Settings[');
  content = content.replace(/([A-Za-z]+)\.\/settings\/Settings\(/g, '$1Settings(');

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const entries = fs.readdirSync(dirPath);
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!entry.startsWith('.') && entry !== 'node_modules') {
        processDirectory(fullPath);
      }
    } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
      fixFile(fullPath);
    }
  }
}

console.log('开始第五轮TypeScript错误修复...');

// 处理src目录
processDirectory(path.join(__dirname, 'src'));

console.log('第五轮TypeScript错误修复完成！');
