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

console.log('已导出的图标数量:', exportedIcons.length);

// 从TypeScript错误中找到的需要修复的图标问题
const iconFixes = [
  // PWAPrompt.tsx 中的问题
  {
    file: 'src/components/common/PWAPrompt.tsx',
    fixes: [
      { search: 'OnlineIcon', replace: 'WifiIcon' },
      { search: 'OfflineIcon', replace: 'CloudOffIcon' },
      { search: 'UpdateIcon', replace: 'RefreshIcon' },
      { search: 'MobileIcon', replace: 'PhoneAndroidIcon' }
    ]
  },
  // DeviceMonitorListV2.tsx 中的问题
  {
    file: 'src/components/domain/devices/DeviceMonitorListV2.tsx',
    fixes: [
      { search: 'SignalIcon', replace: 'WifiIcon' },
      { search: 'NoSignalIcon', replace: 'SignalWifiOffIcon' },
      { search: 'MediumSignalIcon', replace: 'SignalWifi2BarIcon' },
      { search: 'VisibilityIcon', replace: 'visibility' }
    ]
  },
  // DeviceStatusCard.tsx 中的问题
  {
    file: 'src/components/domain/devices/DeviceStatusCard.tsx',
    fixes: [
      { search: 'SignalIcon', replace: 'WifiIcon' },
      { search: 'NoSignalIcon', replace: 'SignalWifiOffIcon' },
      { search: 'MediumSignalIcon', replace: 'SignalWifi2BarIcon' },
      { search: 'TemperatureIcon', replace: 'ThermostatIcon' },
      { search: 'BatteryIcon', replace: 'BatteryFullIcon' },
      { search: 'VisibilityIcon', replace: 'visibility' }
    ]
  },
  // DeviceMonitor.tsx 中的问题
  {
    file: 'src/components/devices/DeviceMonitor.tsx',
    fixes: [
      { search: 'TableChartIcon', replace: 'InsertChartIcon' },
      { search: 'BoltIcon', replace: 'ElectricBoltIcon' }
    ]
  },
  // MobileNavigation.tsx 中的问题
  {
    file: 'src/components/mobile/MobileNavigation.tsx',
    fixes: [
      { search: 'DevicesIcon', replace: 'devices' },
      { search: 'AnalyticsIcon', replace: 'analytics' },
      { search: 'LogoutIcon', replace: 'logout' }
    ]
  },
  // Layout 文件中的问题
  {
    file: 'src/components/layout/MainLayout.tsx',
    fixes: [
      { search: 'LogoutIcon', replace: 'logout' }
    ]
  },
  {
    file: 'src/components/layout/SimpleMainLayout.tsx',
    fixes: [
      { search: 'LogoutIcon', replace: 'logout' }
    ]
  },
  // NotFound.tsx 中的问题
  {
    file: 'src/pages/NotFound.tsx',
    fixes: [
      { search: 'ErrorIcon', replace: 'ErrorIcon' } // 这个已经存在，检查导入
    ]
  },
  // Help.tsx 中的问题
  {
    file: 'src/pages/Help.tsx',
    fixes: [
      { search: 'EmailIcon', replace: 'email' }
    ]
  }
];

// 需要添加的缺失图标
const missingIconsToAdd = [
  'export { default as SignalWifiOffIcon } from \'@mui/icons-material/SignalWifiOff\';',
  'export { default as SignalWifi2BarIcon } from \'@mui/icons-material/SignalWifi2Bar\';',
  'export { default as ThermostatIcon } from \'@mui/icons-material/Thermostat\';',
  'export { default as BatteryFullIcon } from \'@mui/icons-material/BatteryFull\';',
  'export { default as PhoneAndroidIcon } from \'@mui/icons-material/PhoneAndroid\';'
];

// 检查并添加缺失的图标
let needsNewIcons = false;
missingIconsToAdd.forEach(exportLine => {
  const iconName = exportLine.match(/as\s+(\w+)/)[1];
  if (!exportedIcons.includes(iconName)) {
    needsNewIcons = true;
  }
});

if (needsNewIcons) {
  const newIconsSection = '\n// 补充缺失的图标\n' + missingIconsToAdd.join('\n') + '\n';
  fs.appendFileSync(iconsPath, newIconsSection);
  console.log('已添加缺失的图标到 icons.ts');
}

// 应用文件修复
iconFixes.forEach(filefix => {
  const filePath = path.join(__dirname, '../', filefix.file);
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      filefix.fixes.forEach(fix => {
        if (content.includes(fix.search) && fix.search !== fix.replace) {
          content = content.replace(new RegExp(fix.search, 'g'), fix.replace);
          modified = true;
          console.log(`已修复 ${filefix.file} 中的 ${fix.search} -> ${fix.replace}`);
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content);
      }
    } catch (error) {
      console.error(`修复 ${filefix.file} 时出错:`, error.message);
    }
  } else {
    console.warn(`文件不存在: ${filefix.file}`);
  }
});

// 特殊修复：DeviceMonitorListV2_Clean.tsx 中的 visibility 标签
const cleanFilePath = path.join(__dirname, '../src/components/domain/devices/DeviceMonitorListV2_Clean.tsx');
if (fs.existsSync(cleanFilePath)) {
  try {
    let content = fs.readFileSync(cleanFilePath, 'utf8');
    if (content.includes('<visibility fontSize="small" />')) {
      content = content.replace('<visibility fontSize="small" />', '<visibility fontSize="small" />');
      // 更好的修复是使用正确的图标
      content = content.replace(
        '<visibility fontSize="small" />',
        '<VisibilityIcon fontSize="small" />'
      );
      
      // 确保导入了 VisibilityIcon
      if (!content.includes('VisibilityIcon')) {
        const importMatch = content.match(/import\s+{[^}]*}\s+from\s+['"][^'"]*icons['"]/);
        if (importMatch) {
          const importStatement = importMatch[0];
          const newImport = importStatement.replace('}', ', VisibilityIcon as VisibilityIcon }');
          content = content.replace(importStatement, newImport);
        }
      }
      
      fs.writeFileSync(cleanFilePath, content);
      console.log('已修复 DeviceMonitorListV2_Clean.tsx 中的 visibility 标签');
    }
  } catch (error) {
    console.error('修复 DeviceMonitorListV2_Clean.tsx 时出错:', error.message);
  }
}

console.log('图标修复完成！');
