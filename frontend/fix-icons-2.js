const fs = require('fs');
const path = require('path');

// 定义需要修复的剩余映射
const remainingMappings = {
  // 图标错误
  'NotificationsIconOffIcon': 'NotificationsOffIcon',
  'MemoryIconIcon': 'MemoryIcon',
  'buildIconIcon': 'BuildIcon',
  'DevicesIconOther': 'DevicesIcon',
  'LogoutIconIcon': 'LogoutIcon',
  'PersonOutlineIcon': 'PersonIcon',
  'CircleIcon': 'AccountCircleIcon',
  'RadioButtonUnCheckIconedIcon': 'RadioButtonUncheckedIcon',
  'BookmarkIconBorder': 'BookmarkBorderIcon',
  'BiotechIconIcon': 'ExperimentIcon',
  'ArrowDownwardIconIcon': 'ArrowForwardIcon',
  'SpeedIconIcon': 'SpeedIcon',
  'CloudQueueIcon': 'CloudIcon',
  'CheckIconCircleIconIcon': 'CheckCircleIcon',
  'ScreenShareIconIcon': 'ScreenShareIcon',
  'ChatIconIcon': 'ChatIcon',
  'PeopleIconIcon': 'PeopleIcon',
  'SendIcon': 'ShareIcon',
  'BookmarkIconSecond': 'BookmarkIcon',
  'TrendingUpIconIcon': 'TrendingUpIcon',
  'TrendingDownIconIcon': 'TrendingDownIcon',
  'FileUploadIcon': 'UploadFileIcon',
  
  // 修复属性名称错误
  'SortIconDirection': 'sortDirection',
  'SortIconColumn': 'sortColumn',
  'pointerEventIcons': 'pointerEvents',
  'addEventIconListener': 'addEventListener',
  'removeEventIconListener': 'removeEventListener',
  'prEventIconDefault': 'preventDefault',
  'mockRestoreIcon': 'mockRestore',
  'mediaDevicesIcon': 'mediaDevices',
  'VisibilityIcon': 'visibility',
  
  // 组件错误
  'StorageIconEventIcon': 'StorageEvent',
  'fireEventIcon': 'fireEvent',
  'Changeevent': 'ChangeEvent',
  'KeyboardEventIcon': 'KeyboardEvent',
  
  // Chart.js错误
  
  // API错误
  'ApiIcon': 'api',
  'ChatIcon': 'chat',
  'LogoutIcon': 'logout',
  'CompareArrowsIcon': 'compare',
  'AssessmentIcon': 'analytics',
  'ShareIcon': 'share',
  'RestoreIcon': 'restore',
  
  // DevicesIcon -> devices 路径修复
  'DevicesIcon/': 'devices/',
  'DevicesIcontatusCard': 'DeviceStatusCard',
  'DevicesIconIcon': 'DevicesIcon',
  
  // 数据属性错误
  'SortIcon': 'sort',
  'newTitleIcon': 'newTitle',
  'EmailIcon': 'email',
  'EmailIconIcon': 'EmailIcon',
  'NotificationsIconIcon': 'NotificationsIcon',
  'StorageIconIcon': 'StorageIcon',
  'LanguageIconIcon': 'LanguageIcon',
  'SettingsIcon': 'settings'
};

// 定义类型属性映射
const typePropertyMappings = {
  'Checkbox': 'checkbox',
  'subTitleIcon1': 'subtitle1',
  'subTitleIcon2': 'subtitle2',
  'DescriptionIcon': 'description',
  'CategoryIcon': 'category',
  'TitleIcon': 'title',
  'StorageIconIcon': 'StorageIcon',
  'useLocalStorageIcon': 'useLocalStorage',
  'PaletteIconIcon': 'palette'
};

// 定义结构化错误修复
const structureFixMap = {
  'multilabel': 'multiLabel',
  'Settings': './settings/Settings',
  'ExperimentCreate': './ExperimentCreate',
  'ExperimentResults': './ExperimentResults',
  'ExperimentCreateNew': './ExperimentCreateNew',
  'ExperimentCreateFinal': './ExperimentCreateFinal',
  'DeviceManagement': './devices/DeviceManagement',
  'DeviceMonitoring': './devices/DeviceMonitoring',
  'DeviceMonitoringV2': './devices/DeviceMonitoringV2',
  'TemplateCreate': './templates/TemplateCreate',
  'ApiIntegrationCheck': './ApiIntegrationCheck',
  'ExperimentDataPanel': './components/ExperimentDataPanel',
  '../fixtures/DevicesIcon': '../fixtures/devices',
  '../types/DevicesIcon': '../types/devices',
  './base/ApiIconService': './base/ApiService',
  '../types/ApiIcon': '../types/api',
  './ApiIcon': './api',
  '../features/licensing': '../features/LicenseManager',
  '../hooks/usePWA': '../hooks/usePWAHook',
  '../components/ai-assistant/AIChatInterface': '../components/ai/AIChatInterface',
  'DevicesIcon': 'devices'
};

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // 修复图标和属性错误
  for (const [wrong, correct] of Object.entries(remainingMappings)) {
    const regex = new RegExp(wrong, 'g');
    if (content.includes(wrong)) {
      content = content.replace(regex, correct);
      changed = true;
      console.log(`Fixed mapping: ${wrong} -> ${correct} in ${filePath}`);
    }
  }
  
  // 修复类型属性
  for (const [wrong, correct] of Object.entries(typePropertyMappings)) {
    const quotedRegex = new RegExp(`"${wrong}"`, 'g');
    if (content.includes(`"${wrong}"`)) {
      content = content.replace(quotedRegex, `"${correct}"`);
      changed = true;
      console.log(`Fixed quoted property: "${wrong}" -> "${correct}" in ${filePath}`);
    }
  }
  
  // 修复导入路径
  for (const [wrong, correct] of Object.entries(structureFixMap)) {
    if (content.includes(wrong)) {
      content = content.replace(new RegExp(wrong, 'g'), correct);
      changed = true;
      console.log(`Fixed import: ${wrong} -> ${correct} in ${filePath}`);
    }
  }
  
  // 修复特定的错误模式
  
  // 修复 padding="Checkbox" -> padding="checkbox"
  if (content.includes('padding="Checkbox"')) {
    content = content.replace(/padding="Checkbox"/g, 'padding="checkbox"');
    changed = true;
    console.log(`Fixed padding Checkbox in ${filePath}`);
  }
  
  // 修复组件JSX错误
  if (content.includes('<settings />')) {
    content = content.replace(/<settings \/>/g, '<SettingsIcon />');
    changed = true;
    console.log(`Fixed <settings /> in ${filePath}`);
  }
  
  if (content.includes('<category />')) {
    content = content.replace(/<category \/>/g, '<CategoryIcon />');
    changed = true;
    console.log(`Fixed <category /> in ${filePath}`);
  }
  
  // 修复数组方法错误
  if (content.includes('.SortIcon(')) {
    content = content.replace(/\.SortIcon\(/g, '.sort(');
    changed = true;
    console.log(`Fixed .SortIcon( in ${filePath}`);
  }
  
  // 修复对象属性错误
  const objPropertyFixes = [
    ['CategoryIcon.category', 'category.category'],
    ['CategoryIcon.confidence', 'category.confidence'],
    ['CategoryIcon.name', 'category.name'],
    ['CategoryIcon.value', 'category.value'],
    ['CategoryIcon.label', 'category.label']
  ];
  
  for (const [wrong, correct] of objPropertyFixes) {
    if (content.includes(wrong)) {
      content = content.replace(new RegExp(wrong, 'g'), correct);
      changed = true;
      console.log(`Fixed object property: ${wrong} -> ${correct} in ${filePath}`);
    }
  }
  
  // 修复样式属性错误
  if (content.includes('link.style.VisibilityIcon')) {
    content = content.replace(/link\.style\.VisibilityIcon/g, 'link.style.visibility');
    changed = true;
    console.log(`Fixed style.VisibilityIcon in ${filePath}`);
  }
  
  // 修复缺失图标的导入
  const missingIcons = [
    'SmsIcon', 'PhoneAndroidIcon', 'VisibilityOffIcon', 'ArchiveIcon', 
    'ContentCopyIcon', 'UndoIcon', 'UpdateIcon', 'WifiOffIcon', 
    'PhoneAndroidIconIcon', 'BoltIcon', 'TableChartIcon',
    'NotificationsActiveIcon', 'PowerSettingsNewIcon', 'ThermostatAutoIcon',
    'WaterDropIcon', 'ElectricBoltIcon', 'BlockIcon', 'SignalCellular4BarIcon',
    'SignalCellularConnectedNoInternet0BarIcon', 'SignalCellularAltIcon',
    'BatteryChargingFullIcon', 'DeviceThermostatIcon', 'InsertChartIcon',
    'BubbleChartIcon', 'DownloadForOfflineIcon', 'CalendarTodayIcon',
    'AssignmentTurnedInIcon', 'ErrorOutlineIcon', 'BiotechIcon',
    'EngineeringIcon', 'AutoGraphIcon', 'LightbulbIcon', 'HelpOutline',
    'SentimentDissatisfiedIcon', 'ViewColumnIcon', 'ScatterPlotIcon',
    'UploadIcon', 'ClearIcon', 'SendIcon', 'ScreenShareIcon',
    'FileUploadIcon', 'description', 'category', 'settings'
  ];
  
  // 注释掉缺失的图标导入
  for (const icon of missingIcons) {
    const importRegex = new RegExp(`(import\\s*{[^}]*)(${icon})(\\s*as\\s*\\w+[^}]*})`, 'g');
    const match = content.match(importRegex);
    if (match) {
      // 查找并移除缺失的图标导入
      content = content.replace(new RegExp(`,\\s*${icon}\\s*as\\s*\\w+`, 'g'), '');
      content = content.replace(new RegExp(`${icon}\\s*as\\s*\\w+\\s*,`, 'g'), '');
      content = content.replace(new RegExp(`${icon}\\s*as\\s*\\w+`, 'g'), 'InfoIcon');
      changed = true;
      console.log(`Removed missing icon import: ${icon} in ${filePath}`);
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function fixDirectory(dirPath) {
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

// 开始第二轮修复
const srcDir = path.join(__dirname, 'src');
console.log('Starting second round of fixes...');
fixDirectory(srcDir);
console.log('Finished second round of fixes.');
