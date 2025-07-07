const fs = require('fs');
const path = require('path');

// 读取 icons.ts 文件获取所有可用图标
const iconsPath = path.join(__dirname, '../src/utils/icons.ts');
const iconsContent = fs.readFileSync(iconsPath, 'utf8');

// 提取所有导出的图标名
const exportedIcons = [];
const exportLines = iconsContent.split('\n');
exportLines.forEach(line => {
  const match = line.match(/export\s+{\s*default\s+as\s+(\w+)\s*}/);
  if (match) {
    exportedIcons.push(match[1]);
  }
});

console.log('找到的已导出图标:', exportedIcons.slice(0, 10), '...(共', exportedIcons.length, '个)');

// 需要添加的缺失图标映射
const missingIcons = [
  'OfflineIcon',
  'UpdateIcon', 
  'MobileIcon',
  'SignalIcon',
  'NoSignalIcon',
  'MediumSignalIcon',
  'TemperatureIcon',
  'BatteryIcon',
  'BoltIcon',
  'ExperimentIcon',
  'EngineeringIconIcon',
  'UploadIcon',
  'ReportIcon',
  'ChatIcon',
  'ShareIcon',
  'ClearIcon',
  'VisibilityOffIcon',
  'PhoneIcon',
  'SmsIconIcon',
  'ImportIcon',
  'ErrorIcon',
  'LogoutIcon',
  'EmailIcon',
  'TableChartIcon',
  'ScatterPlotIconIcon',
  'AnalyticsIcon',
  'DevicesIcon',
  'BlockIcon'
];

// 图标映射到实际的MUI图标
const iconMappings = {
  'OfflineIcon': 'CloudOff',
  'UpdateIcon': 'Update',
  'MobileIcon': 'PhoneAndroid',
  'SignalIcon': 'Wifi',
  'NoSignalIcon': 'SignalWifiOff',
  'MediumSignalIcon': 'SignalWifi2Bar',
  'TemperatureIcon': 'Thermostat',
  'BatteryIcon': 'BatteryFull',
  'BoltIcon': 'Bolt',
  'ExperimentIcon': 'Science',
  'EngineeringIconIcon': 'Engineering',
  'UploadIcon': 'Upload',
  'ReportIcon': 'Report',
  'ChatIcon': 'Chat',
  'ShareIcon': 'Share',
  'ClearIcon': 'Clear',
  'VisibilityOffIcon': 'VisibilityOff',
  'PhoneIcon': 'Phone',
  'SmsIconIcon': 'Sms',
  'ImportIcon': 'GetApp',
  'ErrorIcon': 'Error',
  'LogoutIcon': 'Logout',
  'EmailIcon': 'Email',
  'TableChartIcon': 'TableChart',
  'ScatterPlotIconIcon': 'ScatterPlot',
  'AnalyticsIcon': 'Analytics',
  'DevicesIcon': 'Devices',
  'BlockIcon': 'Block'
};

// 检查哪些图标缺失
const reallyMissingIcons = missingIcons.filter(icon => !exportedIcons.includes(icon));

console.log('需要添加的缺失图标:', reallyMissingIcons);

// 生成新的图标导出
let newExports = '\n// 缺失图标的修复\n';
reallyMissingIcons.forEach(iconName => {
  const muiIcon = iconMappings[iconName];
  if (muiIcon) {
    newExports += `export { default as ${iconName} } from '@mui/icons-material/${muiIcon}';\n`;
  } else {
    console.warn(`警告: 未找到 ${iconName} 的映射`);
  }
});

// 添加到 icons.ts 文件
if (newExports.trim() !== '// 缺失图标的修复') {
  fs.appendFileSync(iconsPath, newExports);
  console.log('已添加缺失图标到 icons.ts');
} else {
  console.log('没有缺失的图标需要添加');
}

// 修复一些常见的图标使用错误
const fixes = [
  {
    // 修复 PWAPrompt.tsx 中的 OnlineIcon
    file: 'src/components/common/PWAPrompt.tsx',
    search: 'OnlineIcon',
    replace: 'WifiIcon'
  },
  {
    // 修复设备监控中的图标
    file: 'src/components/domain/devices/DeviceMonitorListV2_Clean.tsx',
    search: '<visibility fontSize="small" />',
    replace: '<VisibilityIcon fontSize="small" />'
  }
];

// 应用修复
fixes.forEach(fix => {
  const filePath = path.join(__dirname, '../', fix.file);
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(fix.search)) {
        content = content.replace(new RegExp(fix.search, 'g'), fix.replace);
        fs.writeFileSync(filePath, content);
        console.log(`已修复 ${fix.file} 中的 ${fix.search}`);
      }
    } catch (error) {
      console.error(`修复 ${fix.file} 时出错:`, error.message);
    }
  }
});

console.log('图标修复完成！');
