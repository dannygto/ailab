const fs = require('fs');
const path = require('path');

// 第四轮错误修复 - 修正严重的路径和语法错误
const fixMappings = {
  // 修复导入错误的组件名
  'import ./ExperimentCreate': 'import ExperimentCreate',
  'import ./ExperimentCreateV2': 'import ExperimentCreateV2',
  'import ./ExperimentCreateNew': 'import ExperimentCreateNew',
  'import ./ExperimentCreateFinal': 'import ExperimentCreateFinal',
  'import ./ExperimentResults': 'import ExperimentResults',
  'import ./ExperimentResultsNew': 'import ExperimentResultsNew',
  'import ./devices/DeviceManagement': 'import DeviceManagement',
  'import ./devices/DeviceMonitoring': 'import DeviceMonitoring',
  'import ./templates/TemplateCreate': 'import TemplateCreate',
  'import ./components/ExperimentDataPanel': 'import ExperimentDataPanel',
  'import ./ApiIntegrationCheck': 'import ApiIntegrationCheck',
  'import ./settings/Settings': 'import Settings',
  'import ././ExperimentCreateNew': 'import ExperimentCreateNew',
  'import ././ExperimentCreateFinal': 'import ExperimentCreateFinal',
  'import ././ExperimentResultsNew': 'import ExperimentResultsNew',
  'import System./settings/Settings': 'import SystemSettings',
  'import AIModel./settings/Settings': 'import AIModelSettings',
  'import Security./settings/Settings': 'import SecuritySettings',
  'import Notification./settings/Settings': 'import NotificationSettings',
  'import Theme./settings/Settings': 'import ThemeSettings',
  'import Data./settings/Settings': 'import DataSettings',
  'import General./settings/Settings': 'import GeneralSettings',
  'import system./settings/SettingsService': 'import systemSettingsService',

  // 修复JSX元素错误
  '<./ExperimentCreate': '<ExperimentCreate',
  '</./ExperimentCreate>': '</ExperimentCreate>',
  '<./ExperimentCreateV2': '<ExperimentCreateV2',
  '</./ExperimentCreateV2>': '</ExperimentCreateV2>',
  '<./ExperimentResults': '<ExperimentResults',
  '</./ExperimentResults>': '</ExperimentResults>',
  '<././ExperimentCreateNew': '<ExperimentCreateNew',
  '</././ExperimentCreateNew>': '</ExperimentCreateNew>',
  '<././ExperimentCreateFinal': '<ExperimentCreateFinal',
  '</././ExperimentCreateFinal>': '</ExperimentCreateFinal>',
  '<./devices/DeviceManagement': '<DeviceManagement',
  '</./devices/DeviceManagement>': '</DeviceManagement>',
  '<./devices/DeviceMonitoring': '<DeviceMonitoring',
  '</./devices/DeviceMonitoring>': '</DeviceMonitoring>',
  '<./devices/./devices/DeviceMonitoringV2': '<DeviceMonitoringV2',
  '</./devices/./devices/DeviceMonitoringV2>': '</DeviceMonitoringV2>',
  '<./templates/TemplateCreate': '<TemplateCreate',
  '</./templates/TemplateCreate>': '</TemplateCreate>',
  '<./ApiIntegrationCheck': '<ApiIntegrationCheck',
  '</./ApiIntegrationCheck>': '</ApiIntegrationCheck>',
  '<./settings/Settings': '<Settings',
  '</./settings/Settings>': '</Settings>',
  '<System./settings/Settings': '<SystemSettings',
  '<AIModel./settings/Settings': '<AIModelSettings',
  '<Security./settings/Settings': '<SecuritySettings',
  '<Notification./settings/Settings': '<NotificationSettings',
  '<Theme./settings/Settings': '<ThemeSettings',
  '<Data./settings/Settings': '<DataSettings',
  '<General./settings/Settings': '<GeneralSettings',

  // 修复变量和常量声明
  'const ./ExperimentCreate =': 'const ExperimentCreate =',
  'const ./ExperimentCreateV2 =': 'const ExperimentCreateV2 =',
  'const ./ExperimentResults =': 'const ExperimentResults =',
  'const ./ExperimentResultsNew =': 'const ExperimentResultsNew =',
  'const ./devices/DeviceManagement =': 'const DeviceManagement =',
  'const ./devices/DeviceMonitoring =': 'const DeviceMonitoring =',
  'const ./devices/./devices/DeviceMonitoringV2 =': 'const DeviceMonitoringV2 =',
  'const System./settings/Settings =': 'const SystemSettings =',
  'const ./settings/Settings =': 'const Settings =',
  'const ./settings/SettingsRoutes =': 'const SettingsRoutes =',
  'const Data./settings/Settings =': 'const DataSettings =',
  'const Theme./settings/Settings =': 'const ThemeSettings =',
  'const General./settings/Settings =': 'const GeneralSettings =',
  'const Security./settings/Settings =': 'const SecuritySettings =',
  'const notification./settings/Settings =': 'const NotificationSettings =',
  'const Simple./settings/Settings =': 'const SimpleSettings =',
  'const Simple./settings/SettingsTest =': 'const SimpleSettingsTest =',
  'const TestSecurity./settings/Settings =': 'const TestSecuritySettings =',

  // 修复接口声明
  'interface ./ExperimentResults': 'interface ExperimentResults',
  'interface ./ExperimentResultsProps': 'interface ExperimentResultsProps',
  'interface ./settings/SettingsState': 'interface SettingsState',
  'interface ./devices/DeviceMonitoringConfig': 'interface DeviceMonitoringConfig',
  'interface ./devices/DeviceMonitoringData': 'interface DeviceMonitoringData',
  'interface User./settings/Settings': 'interface UserSettings',
  'interface Physics./ExperimentResults': 'interface PhysicsExperimentResults',
  'interface Chemistry./ExperimentResults': 'interface ChemistryExperimentResults',
  'interface Biology./ExperimentResults': 'interface BiologyExperimentResults',

  // 修复export声明
  'export default ./ExperimentCreate': 'export default ExperimentCreate',
  'export default ./ExperimentCreateV2': 'export default ExperimentCreateV2',
  'export default ./ExperimentResults': 'export default ExperimentResults',
  'export default ./ExperimentResultsNew': 'export default ExperimentResultsNew',
  'export default ./devices/DeviceManagement': 'export default DeviceManagement',
  'export default ./devices/DeviceMonitoring': 'export default DeviceMonitoring',
  'export default ./settings/Settings': 'export default Settings',
  'export default ./settings/SettingsRoutes': 'export default SettingsRoutes',
  'export default Data./settings/Settings': 'export default DataSettings',
  'export default Theme./settings/Settings': 'export default ThemeSettings',
  'export default General./settings/Settings': 'export default GeneralSettings',
  'export default Security./settings/Settings': 'export default SecuritySettings',
  'export default notification./settings/Settings': 'export default NotificationSettings',
  'export default Simple./settings/Settings': 'export default SimpleSettings',
  'export default Simple./settings/SettingsTest': 'export default SimpleSettingsTest',
  'export default TestSecurity./settings/Settings': 'export default TestSecuritySettings',
  'export default system./settings/SettingsService': 'export default systemSettingsService',

  // 修复export named
  'export { default as ./ExperimentCreate }': 'export { default as ExperimentCreate }',
  'export { default as ./ExperimentCreateV2 }': 'export { default as ExperimentCreateV2 }',

  // 修复类声明
  'export class System./settings/SettingsService': 'export class SystemSettingsService',

  // 修复方法调用
  'system./settings/SettingsService.': 'systemSettingsService.',
  'get./ExperimentResults(': 'getExperimentResults(',
  'get./devices/DeviceMonitoringData(': 'getDeviceMonitoringData(',

  // 修复变量使用
  'use./settings/SettingsStore': 'useSettingsStore',
  'mockSystem./settings/Settings': 'mockSystemSettings',
  'set./settings/Settings(': 'setSettings(',
  'setData./settings/Settings(': 'setDataSettings(',
  'setTheme./settings/Settings(': 'setThemeSettings(',
  'setnotification./settings/Settings(': 'setNotificationSettings(',
  'setSecurity./settings/Settings(': 'setSecuritySettings(',
  'Data./settings/Settings.': 'dataSettings.',
  'Theme./settings/Settings.': 'themeSettings.',
  'General./settings/Settings.': 'generalSettings.',
  'Security./settings/Settings.': 'securitySettings.',
  'notification./settings/Settings.': 'notificationSettings.',
  'new./settings/Settings': 'newSettings',
  'current./settings/Settings': 'currentSettings',

  // 修复方法声明
  'async saveTheme./settings/Settings(': 'async saveThemeSettings(',
  'async saveData./settings/Settings(': 'async saveDataSettings(',
  'async saveGeneral./settings/Settings(': 'async saveGeneralSettings(',
  'async saveBranding./settings/Settings(': 'async saveBrandingSettings(',
  'async saveSecurity./settings/Settings(': 'async saveSecuritySettings(',
  'async getSystem./settings/Settings(': 'async getSystemSettings(',
  'async get./ExperimentResults(': 'async getExperimentResults(',
  'async get./devices/DeviceMonitoringData(': 'async getDeviceMonitoringData(',

  // 修复函数声明
  'canView./ExperimentResults =': 'canViewExperimentResults =',
  'preload./devices/DeviceMonitoring =': 'preloadDeviceMonitoring =',

  // 修复reset和其他方法
  'reset./settings/Settings:': 'resetSettings:',

  // 修复类型导入
  '} from \'././ExperimentCreate\';': '} from \'./ExperimentCreate\';',
  '} from \'././ExperimentCreateV2\';': '} from \'./ExperimentCreateV2\';',
  '} from \'././ExperimentResultsNew\';': '} from \'./ExperimentResultsNew\';',
  'from \'../pages/experiments/././ExperimentCreateNew\'': 'from \'../pages/experiments/ExperimentCreateNew\'',
  'from \'../pages/experiments/././ExperimentCreateFinal\'': 'from \'../pages/experiments/ExperimentCreateFinal\'',
  'from \'./pages/experiments/././ExperimentCreateNew\'': 'from \'./pages/experiments/ExperimentCreateNew\'',
  'from \'./pages/experiments/././ExperimentCreateFinal\'': 'from \'./pages/experiments/ExperimentCreateFinal\'',

  // 修复导入路径
  'from \'../pages/./settings/Settings\'': 'from \'../pages/settings/Settings\'',
  'from \'./pages/./settings/Settings\'': 'from \'./pages/settings/Settings\'',
  'from \'../pages/Simple./settings/Settings\'': 'from \'../pages/SimpleSettings\'',
  'from \'./pages/Simple./settings/Settings\'': 'from \'./pages/SimpleSettings\'',

  // 修复重复路径
  'from \'./components/./components/ExperimentDataPanel\'': 'from \'./components/ExperimentDataPanel\'',
  'from \'./pages/devices/./devices/DeviceManagement\'': 'from \'./pages/devices/DeviceManagement\'',
  'from \'./pages/devices/./devices/DeviceMonitoring\'': 'from \'./pages/devices/DeviceMonitoring\'',
  'from \'./pages/devices/./devices/./devices/DeviceMonitoringV2\'': 'from \'./pages/devices/DeviceMonitoringV2\'',
  'from \'./pages/templates/./templates/TemplateCreate\'': 'from \'./pages/templates/TemplateCreate\'',

  // 修复服务导入
  'from \'./system./settings/SettingsService\'': 'from \'./systemSettingsService\'',

  // 修复解构赋值
  'const { system./settings/SettingsService }': 'const { systemSettingsService }',

  // 修复图标导入错误
  'Cloud CheckAccountCircleIcon': 'CloudIcon',
  'Cloud BackupIcon': 'CloudBackupIcon',
  'Power./settings/SettingsNewIcon': 'PowerSettingsNewIcon',
  'CheckIconAccountCircleIconIcon': 'CheckCircleIcon'
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

  // 修复其他常见问题
  
  // 修复重复的./路径
  content = content.replace(/\.\/\.\/(.+)/g, './$1');
  
  // 修复错误的state destructuring模式
  content = content.replace(/const \[([^,]+)\.\/settings\/Settings, set([^,]+)\.\/settings\/Settings\]/g, 'const [$1Settings, set$2Settings]');
  
  // 修复JSX attribute错误
  content = content.replace(/show\.\/settings\/Settings=/g, 'showSettings=');
  
  // 修复type annotations里的错误路径
  content = content.replace(/Promise<\.\/([^>]+)>/g, 'Promise<$1>');
  content = content.replace(/React\.FC<\.\/([^>]+)>/g, 'React.FC<$1>');

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

console.log('开始第四轮TypeScript错误修复...');

// 处理src目录
processDirectory(path.join(__dirname, 'src'));

console.log('第四轮TypeScript错误修复完成！');
