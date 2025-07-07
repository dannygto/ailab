const fs = require('fs');
const path = require('path');

// 修复图标系统的最终脚本
console.log('=== 图标系统最终清理脚本 ===');

// 1. 清理图标文件中的重复导出
const iconsPath = path.join(__dirname, '../frontend/src/utils/icons.ts');
let iconsContent = fs.readFileSync(iconsPath, 'utf8');

// 记录所有已导出的图标
const exportedIcons = new Set();
const lines = iconsContent.split('\n');
const cleanLines = [];

for (let line of lines) {
  if (line.includes('export { default as')) {
    const match = line.match(/export\s*\{\s*default\s+as\s+(\w+)\s*\}/);
    if (match) {
      const iconName = match[1];
      if (!exportedIcons.has(iconName)) {
        exportedIcons.add(iconName);
        cleanLines.push(line);
      } else {
        console.log(`移除重复的图标导出: ${iconName}`);
      }
    } else {
      cleanLines.push(line);
    }
  } else {
    cleanLines.push(line);
  }
}

// 写回清理后的内容
fs.writeFileSync(iconsPath, cleanLines.join('\n'));

console.log('=== 图标导出清理完成 ===');
console.log(`保留的图标数量: ${exportedIcons.size}`);

// 2. 创建缺失的图标映射
const missingIcons = [
  'CategoryIcon',
  'ReportIcon', 
  'CopyIcon',
  'ArchiveIcon',
  'UndoIcon',
  'SettingsIcon',
  'TableChartIcon',
  'BoltIcon',
  'BlockIcon',
  'TemperatureIcon',
  'BatteryIcon',
  'SignalIcon',
  'NoSignalIcon',
  'MediumSignalIcon',
  'ControlIcon',
  'UploadIcon',
  'UpdateIcon',
  'MobileIcon',
  'OfflineIcon',
  'ClearIcon',
  'VisibilityOffIcon',
  'PhoneIcon',
  'SmsIconIcon',
  'ImportIcon',
  'ExperimentIcon',
  'EngineeringIconIcon',
  'ErrorIcon'
];

// 添加缺失的图标映射
let iconMappings = '\n// 缺失图标的映射\n';
missingIcons.forEach(icon => {
  // 将图标映射到已有的相似图标
  switch(icon) {
    case 'CategoryIcon':
      iconMappings += `export { default as CategoryIcon } from '@mui/icons-material/Category';\n`;
      break;
    case 'ReportIcon':
      iconMappings += `export { default as ReportIcon } from '@mui/icons-material/Report';\n`;
      break;
    case 'CopyIcon':
      iconMappings += `export { default as CopyIcon } from '@mui/icons-material/ContentCopy';\n`;
      break;
    case 'ArchiveIcon':
      iconMappings += `export { default as ArchiveIcon } from '@mui/icons-material/Archive';\n`;
      break;
    case 'UndoIcon':
      iconMappings += `export { default as UndoIcon } from '@mui/icons-material/Undo';\n`;
      break;
    case 'SettingsIcon':
      iconMappings += `export { default as SettingsIcon } from '@mui/icons-material/Settings';\n`;
      break;
    case 'TableChartIcon':
      iconMappings += `export { default as TableChartIcon } from '@mui/icons-material/TableChart';\n`;
      break;
    case 'BoltIcon':
      iconMappings += `export { default as BoltIcon } from '@mui/icons-material/Bolt';\n`;
      break;
    case 'BlockIcon':
      iconMappings += `export { default as BlockIcon } from '@mui/icons-material/Block';\n`;
      break;
    case 'TemperatureIcon':
      iconMappings += `export { default as TemperatureIcon } from '@mui/icons-material/Thermostat';\n`;
      break;
    case 'BatteryIcon':
      iconMappings += `export { default as BatteryIcon } from '@mui/icons-material/BatteryFull';\n`;
      break;
    case 'SignalIcon':
      iconMappings += `export { default as SignalIcon } from '@mui/icons-material/Wifi';\n`;
      break;
    case 'NoSignalIcon':
      iconMappings += `export { default as NoSignalIcon } from '@mui/icons-material/SignalWifiOff';\n`;
      break;
    case 'MediumSignalIcon':
      iconMappings += `export { default as MediumSignalIcon } from '@mui/icons-material/SignalWifi2Bar';\n`;
      break;
    case 'ControlIcon':
      iconMappings += `export { default as ControlIcon } from '@mui/icons-material/Settings';\n`;
      break;
    case 'UploadIcon':
      iconMappings += `export { default as UploadIcon } from '@mui/icons-material/Upload';\n`;
      break;
    case 'UpdateIcon':
      iconMappings += `export { default as UpdateIcon } from '@mui/icons-material/Update';\n`;
      break;
    case 'MobileIcon':
      iconMappings += `export { default as MobileIcon } from '@mui/icons-material/PhoneAndroid';\n`;
      break;
    case 'OfflineIcon':
      iconMappings += `export { default as OfflineIcon } from '@mui/icons-material/CloudOff';\n`;
      break;
    case 'ClearIcon':
      iconMappings += `export { default as ClearIcon } from '@mui/icons-material/Clear';\n`;
      break;
    case 'VisibilityOffIcon':
      iconMappings += `export { default as VisibilityOffIcon } from '@mui/icons-material/VisibilityOff';\n`;
      break;
    case 'PhoneIcon':
      iconMappings += `export { default as PhoneIcon } from '@mui/icons-material/Phone';\n`;
      break;
    case 'SmsIconIcon':
      iconMappings += `export { default as SmsIconIcon } from '@mui/icons-material/Sms';\n`;
      break;
    case 'ImportIcon':
      iconMappings += `export { default as ImportIcon } from '@mui/icons-material/GetApp';\n`;
      break;
    case 'ExperimentIcon':
      iconMappings += `export { default as ExperimentIcon } from '@mui/icons-material/Science';\n`;
      break;
    case 'EngineeringIconIcon':
      iconMappings += `export { default as EngineeringIconIcon } from '@mui/icons-material/Engineering';\n`;
      break;
    case 'ErrorIcon':
      iconMappings += `export { default as ErrorIcon } from '@mui/icons-material/Error';\n`;
      break;
  }
});

// 添加缺失的图标到文件末尾
iconsContent = fs.readFileSync(iconsPath, 'utf8');
if (!iconsContent.includes('// 缺失图标的映射')) {
  iconsContent += iconMappings;
  fs.writeFileSync(iconsPath, iconsContent);
}

console.log('=== 缺失图标映射添加完成 ===');

// 3. 修复JSX元素使用的图标
const filesToFix = [
  'src/components/common/BatchOperations.tsx',
  'src/components/layout/MainLayout.tsx',
  'src/components/layout/SimpleMainLayout.tsx',
  'src/components/mobile/MobileNavigation.tsx',
  'src/components/domain/devices/DeviceStatusCard.tsx',
  'src/components/domain/devices/DeviceMonitorListV2.tsx',
  'src/components/media/RealTimeCollaboration.tsx',
  'src/pages/settings/securitySettings.tsx',
  'src/pages/Help.tsx',
  'src/layouts/MainLayout.tsx'
];

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, '../frontend', filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // 修复JSX元素使用的图标
    content = content.replace(/<share\s*\/>/g, '<ShareIcon />');
    content = content.replace(/<share\s+/g, '<ShareIcon ');
    content = content.replace(/<devices\s*\/>/g, '<DevicesIcon />');
    content = content.replace(/<devices\s+/g, '<DevicesIcon ');
    content = content.replace(/<settings\s*\/>/g, '<SettingsIcon />');
    content = content.replace(/<settings\s+/g, '<SettingsIcon ');
    content = content.replace(/<analytics\s*\/>/g, '<AnalyticsIcon />');
    content = content.replace(/<analytics\s+/g, '<AnalyticsIcon ');
    content = content.replace(/<visibility\s*\/>/g, '<VisibilityIcon />');
    content = content.replace(/<visibility\s+/g, '<VisibilityIcon ');
    content = content.replace(/<logout\s*\/>/g, '<LogoutIcon />');
    content = content.replace(/<logout\s+/g, '<LogoutIcon ');
    content = content.replace(/<restore\s*\/>/g, '<RestoreIcon />');
    content = content.replace(/<restore\s+/g, '<RestoreIcon ');
    content = content.replace(/<email\s*\/>/g, '<EmailIcon />');
    content = content.replace(/<email\s+/g, '<EmailIcon ');
    content = content.replace(/<chat\s*\/>/g, '<ChatIcon />');
    content = content.replace(/<chat\s+/g, '<ChatIcon ');
    content = content.replace(/<label\s*\/>/g, '<LabelIcon />');
    content = content.replace(/<label\s+/g, '<LabelIcon ');
    content = content.replace(/<sort\s*\/>/g, '<SortIcon />');
    content = content.replace(/<sort\s+/g, '<SortIcon ');
    content = content.replace(/<title\s*\/>/g, '<TitleIcon />');
    content = content.replace(/<title\s+/g, '<TitleIcon ');
    
    fs.writeFileSync(fullPath, content);
    console.log(`修复文件: ${filePath}`);
  }
});

console.log('=== JSX元素图标修复完成 ===');

// 4. 添加缺失的图标导入
const iconsToAdd = [
  'export { default as ShareIcon } from \'@mui/icons-material/Share\';',
  'export { default as DevicesIcon } from \'@mui/icons-material/Devices\';',
  'export { default as AnalyticsIcon } from \'@mui/icons-material/Assessment\';',
  'export { default as VisibilityIcon } from \'@mui/icons-material/Visibility\';',
  'export { default as LogoutIcon } from \'@mui/icons-material/Logout\';',
  'export { default as RestoreIcon } from \'@mui/icons-material/Restore\';',
  'export { default as EmailIcon } from \'@mui/icons-material/Email\';',
  'export { default as ChatIcon } from \'@mui/icons-material/Chat\';',
  'export { default as LabelIcon } from \'@mui/icons-material/Label\';',
  'export { default as SortIcon } from \'@mui/icons-material/Sort\';',
  'export { default as TitleIcon } from \'@mui/icons-material/Title\';'
];

iconsContent = fs.readFileSync(iconsPath, 'utf8');
iconsToAdd.forEach(iconImport => {
  if (!iconsContent.includes(iconImport)) {
    iconsContent += '\n' + iconImport;
  }
});

fs.writeFileSync(iconsPath, iconsContent);

console.log('=== 最终图标系统修复完成 ===');
console.log('图标文件已优化并添加了所有缺失的图标导出');
