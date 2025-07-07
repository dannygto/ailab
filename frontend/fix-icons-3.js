const fs = require('fs');
const path = require('path');

// 第三轮错误修复 - 修正路径错误和其他问题
const fixMappings = {
  // 修复过度替换的路径错误
  './settings/Settings': 'Settings',
  'use./settings/SettingsStore': 'useSettingsStore',
  'User./settings/Settings': 'UserSettings',
  'set./settings/Settings': 'setSettings',
  'reset./settings/Settings': 'resetSettings',
  'system./settings/SettingsService': 'systemSettingsService',
  'System./settings/SettingsService': 'SystemSettingsService',
  '././': './',
  'Physics./ExperimentResults': 'PhysicsExperimentResults',
  'Chemistry./ExperimentResults': 'ChemistryExperimentResults',
  'Biology./ExperimentResults': 'BiologyExperimentResults',
  './ExperimentResults': 'ExperimentResults',
  './ExperimentCreate': 'ExperimentCreate',
  './ExperimentCreateV2': 'ExperimentCreateV2',
  './ExperimentCreateNew': 'ExperimentCreateNew',
  './ExperimentCreateFinal': 'ExperimentCreateFinal',
  'get./ExperimentResults': 'getExperimentResults',
  'canView./ExperimentResults': 'canViewExperimentResults',
  'preload./devices/DeviceMonitoring': 'preloadDeviceMonitoring',
  'get./devices/DeviceMonitoringData': 'getDeviceMonitoringData',
  './devices/DeviceMonitoringData': 'DeviceMonitoringData',
  './devices/DeviceManagement': 'DeviceManagement',
  './devices/DeviceMonitoring': 'DeviceMonitoring',
  './devices/./devices/DeviceMonitoringV2': 'DeviceMonitoringV2',
  './ApiIntegrationCheck': 'ApiIntegrationCheck',
  './components/ExperimentDataPanel': 'ExperimentDataPanel',
  './templates/TemplateCreate': 'TemplateCreate',
  './settings/SettingsRoutes': 'SettingsRoutes',
  
  // 修复变量命名错误
  'new./settings/Settings': 'newSettings',
  'current./settings/Settings': 'currentSettings',
  'Data./settings/Settings': 'DataSettings',
  'Theme./settings/Settings': 'ThemeSettings',
  'General./settings/Settings': 'GeneralSettings',
  'Security./settings/Settings': 'SecuritySettings',
  'notification./settings/Settings': 'NotificationSettings',
  'setnotification./settings/Settings': 'setNotificationSettings',
  'Simple./settings/Settings': 'SimpleSettings',
  'Simple./settings/SettingsTest': 'SimpleSettingsTest',
  'TestSecurity./settings/Settings': 'TestSecuritySettings',
  'AIModel./settings/Settings': 'AIModelSettings',
  'setData./settings/Settings': 'setDataSettings',
  'setTheme./settings/Settings': 'setThemeSettings',
  'General./settings/Settings': 'GeneralSettings',
  'Security./settings/Settings': 'SecuritySettings',
  'Notification./settings/Settings': 'NotificationSettings',
  'Theme./settings/Settings': 'ThemeSettings',
  'Data./settings/Settings': 'DataSettings',
  
  // 修复方法名错误
  'saveTheme./settings/Settings': 'saveThemeSettings',
  'saveData./settings/Settings': 'saveDataSettings',
  'saveGeneral./settings/Settings': 'saveGeneralSettings',
  'saveBranding./settings/Settings': 'saveBrandingSettings',
  'saveSecurity./settings/Settings': 'saveSecuritySettings',
  'getSystem./settings/Settings': 'getSystemSettings',
  
  // 修复类名错误
  'CheckIconapiStatus': 'checkApiStatus',
  
  // 修复特殊符号错误
  'CheckIconAccountCircleIconIcon': 'CheckCircleIcon',
  'Cloud CheckAccountCircleIcon': 'CloudIcon',
  'Cloud BackupIcon': 'CloudBackupIcon',
  'Power./settings/SettingsNewIcon': 'PowerSettingsNewIcon',
  
  // 修复其他错误
  'Api_BASE_URL': 'API_BASE_URL',
  'apiResponse': 'ApiResponse',
  'MultilabelIcon': 'Multilabel'
};

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // 应用修复映射
  for (const [wrong, correct] of Object.entries(fixMappings)) {
    if (content.includes(wrong)) {
      content = content.replace(new RegExp(wrong, 'g'), correct);
      changed = true;
      console.log(`Fixed: ${wrong} -> ${correct} in ${filePath}`);
    }
  }
  
  // 修复特定的模式
  
  // 修复重复的路径
  content = content.replace(/\.\/\.\/(.+)/g, './$1');
  
  // 修复错误的导入路径模式
  const badImportPatterns = [
    [/from '\.\.\/pages\/Settings'/g, "from '../pages/settings/Settings'"],
    [/from '\.\/settings\/Settings'/g, "from './Settings'"],
    [/from '\.\/Settings'/g, "from './Settings'"],
    [/import Settings from '\.\/Settings'/g, "import Settings from './Settings'"],
    [/import (.+) from '\.\/(.+)\/\1'/g, "import $1 from './$2/$1'"]
  ];
  
  for (const [pattern, replacement] of badImportPatterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      changed = true;
      console.log(`Fixed import pattern in ${filePath}`);
    }
  }
  
  // 修复错误的JSX元素
  content = content.replace(/<\.\/([^>]+)>/g, '<$1>');
  content = content.replace(/<\/\.\/([^>]+)>/g, '</$1>');
  
  // 修复错误的文件扩展名
  content = content.replace(/\.tsx'/g, "'");
  content = content.replace(/\.ts'/g, "'");
  
  // 修复错误的接口名称
  content = content.replace(/interface \.\/(.+)/g, 'interface $1');
  content = content.replace(/export interface \.\/(.+)/g, 'export interface $1');
  
  // 修复错误的变量声明
  content = content.replace(/const \.\/(.+)/g, 'const $1');
  content = content.replace(/export const \.\/(.+)/g, 'export const $1');
  
  // 修复错误的方法声明
  content = content.replace(/async \.\/(.+)/g, 'async $1');
  content = content.replace(/get\.\/(.+)/g, 'get$1');
  
  // 修复错误的export默认
  content = content.replace(/export default \.\/(.+)/g, 'export default $1');
  
  // 修复正则表达式问题
  content = content.replace(/\.\/([A-Za-z]+):/g, '$1:');
  
  // 修复特定语法错误
  content = content.replace(/\{\s*\.\.\.([^}]+)\s*\}/g, '{ ...$1 }');
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function fixDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(fullPath);
    }
  }
}

// 开始第三轮修复
const srcDir = path.join(__dirname, 'src');
console.log('Starting third round of fixes...');
fixDirectory(srcDir);
console.log('Finished third round of fixes.');

// 需要手动创建缺失的文件
const missingFiles = [
  {
    path: 'src/services/base/ApiService.ts',
    content: `export class BaseApiService {
  protected baseURL: string;
  
  constructor(config?: { baseURL?: string }) {
    this.baseURL = config?.baseURL || 'http://localhost:3002';
  }
  
  protected async get<T>(endpoint: string, options?: any): Promise<T> {
    // 实现GET请求
    throw new Error('Method not implemented');
  }
  
  protected async post<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    // 实现POST请求
    throw new Error('Method not implemented');
  }
  
  protected async put<T>(endpoint: string, data?: any, options?: any): Promise<T> {
    // 实现PUT请求
    throw new Error('Method not implemented');
  }
  
  protected async delete<T>(endpoint: string, options?: any): Promise<T> {
    // 实现DELETE请求
    throw new Error('Method not implemented');
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
`
  },
  {
    path: 'src/types/devices.ts',
    content: `export interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  location?: string;
}

export interface DeviceMonitoringData {
  deviceId: string;
  status: string;
  metrics: Record<string, any>;
  timestamp: Date;
  alerts?: string[];
  warnings?: string[];
  errors?: string[];
}
`
  }
];

// 创建缺失的文件
for (const file of missingFiles) {
  const dir = path.dirname(path.join(__dirname, file.path));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(path.join(__dirname, file.path))) {
    fs.writeFileSync(path.join(__dirname, file.path), file.content, 'utf8');
    console.log(`Created missing file: ${file.path}`);
  }
}
