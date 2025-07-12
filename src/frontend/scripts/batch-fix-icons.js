const fs = require('fs');
const path = require('path');

// 批量修复图标问题
const batchFixes = [
  // DeviceStatusCard.tsx
  {
    file: 'src/components/domain/devices/DeviceStatusCard.tsx',
    replacements: [
      { from: 'NoSignalIcon', to: 'WifiIcon' },
      { from: 'MediumSignalIcon', to: 'WifiIcon' },
      { from: 'SignalIcon', to: 'WifiIcon' },
      { from: 'TemperatureIcon', to: 'ThermostatIcon' },
      { from: 'BatteryIcon', to: 'BatteryFullIcon' },
      { from: 'VisibilityIcon', to: 'VisibilityIcon' }
    ]
  },
  // DeviceMonitorListV2_Clean.tsx
  {
    file: 'src/components/domain/devices/DeviceMonitorListV2_Clean.tsx',
    replacements: [
      { from: 'NoSignalIcon', to: 'WifiIcon' },
      { from: 'MediumSignalIcon', to: 'WifiIcon' },
      { from: 'SignalIcon', to: 'WifiIcon' },
      { from: '<visibility fontSize="small" />', to: '<VisibilityIcon fontSize="small" />' }
    ]
  },
  // DeviceReservations.tsx
  {
    file: 'src/components/devices/DeviceReservations.tsx',
    replacements: [
      { from: 'BlockIcon', to: 'BlockIcon' }
    ]
  },
  // RealTimeCollaboration.tsx
  {
    file: 'src/components/media/RealTimeCollaboration.tsx',
    replacements: [
      { from: 'ChatIcon', to: 'chat' },
      { from: 'ShareIcon', to: 'share' }
    ]
  },
  // NotificationSettings.tsx
  {
    file: 'src/pages/settings/NotificationSettings.tsx',
    replacements: [
      { from: 'SmsIconIcon', to: 'SmsIcon' },
      { from: 'PhoneIcon', to: 'PhoneIcon' }
    ]
  },
  // 其他设置文件
  {
    file: 'src/pages/settings/dataSettings.tsx',
    replacements: [
      { from: 'ImportIcon', to: 'GetAppIcon' },
      { from: '<restore />', to: '<RestoreIcon />' }
    ]
  },
  {
    file: 'src/pages/settings/generalSettings.tsx',
    replacements: [
      { from: 'UploadIcon', to: 'UploadFileIcon' }
    ]
  },
  {
    file: 'src/pages/settings/securitySettings.tsx',
    replacements: [
      { from: 'VisibilityOffIcon', to: 'VisibilityOffIcon' }
    ]
  },
  // 模板和资源文件
  {
    file: 'src/components/templates/AdvancedTemplateManager.tsx',
    replacements: [
      { from: 'UploadIcon', to: 'UploadFileIcon' },
      { from: '<share />', to: '<ShareIcon />' }
    ]
  },
  {
    file: 'src/components/templates/TemplateSearch.tsx',
    replacements: [
      { from: 'ClearIcon', to: 'ClearIcon' }
    ]
  },
  {
    file: 'src/components/resources/ResourceRecommendations.tsx',
    replacements: [
      { from: 'ClearIcon', to: 'ClearIcon' }
    ]
  },
  // 可视化组件
  {
    file: 'src/components/visualizations/ExperimentResultsNew.tsx',
    replacements: [
      { from: 'ScatterPlotIconIcon', to: 'ScatterPlotIcon' },
      { from: 'TableChartIcon', to: 'TableChartIcon' }
    ]
  },
  // 媒体组件
  {
    file: 'src/components/media/BatchProcessingComponent.tsx',
    replacements: [
      { from: 'UploadIcon', to: 'UploadFileIcon' }
    ]
  },
  {
    file: 'src/components/media/ExperimentMediaIntegration.tsx',
    replacements: [
      { from: 'ReportIcon', to: 'ReportIcon' }
    ]
  },
  // 移动端组件
  {
    file: 'src/components/mobile/MobileDeviceCard.tsx',
    replacements: [
      { from: '<visibility />', to: '<VisibilityIcon />' }
    ]
  },
  // 监控组件
  {
    file: 'src/components/monitoring/ExperimentLogsViewer.tsx',
    replacements: [
      { from: 'ClearIcon', to: 'ClearIcon' }
    ]
  },
  // K12 组件
  {
    file: 'src/components/K12ExperimentManager.tsx',
    replacements: [
      { from: 'ExperimentIcon', to: 'ScienceIcon' },
      { from: 'EngineeringIconIcon', to: 'BuildIcon' }
    ]
  },
  // 页面文件
  {
    file: 'src/pages/data/DataCollectionAnalysis.tsx',
    replacements: [
      { from: 'CloudUploadIcon', to: 'CloudUploadIcon' }
    ]
  },
  {
    file: 'src/pages/media/MediaAnalysisPage.tsx',
    replacements: [
      { from: 'SettingsIcon', to: 'SettingsIcon' }
    ]
  },
  // 布局文件
  {
    file: 'src/layouts/MainLayout.tsx',
    replacements: [
      { from: 'DevicesIcon', to: 'devices' }
    ]
  },
  // 演示文件
  {
    file: 'src/demos/DeviceMetricsChartDemo.tsx',
    replacements: [
      { from: 'EventIcon', to: 'EventIcon' }
    ]
  }
];

// 需要添加到 icons.ts 的图标
const additionalIcons = [
  'export { default as VisibilityOffIcon } from \'@mui/icons-material/VisibilityOff\';',
  'export { default as ThermostatIcon } from \'@mui/icons-material/Thermostat\';',
  'export { default as BatteryFullIcon } from \'@mui/icons-material/BatteryFull\';',
  'export { default as PhoneAndroidIcon } from \'@mui/icons-material/PhoneAndroid\';',
  'export { default as SmsIcon } from \'@mui/icons-material/Sms\';',
  'export { default as TableChartIcon } from \'@mui/icons-material/TableChart\';',
  'export { default as ScatterPlotIcon } from \'@mui/icons-material/ScatterPlot\';',
  'export { default as BlockIcon } from \'@mui/icons-material/Block\';',
  'export { default as ClearIcon } from \'@mui/icons-material/Clear\';',
  'export { default as ReportIcon } from \'@mui/icons-material/Report\';',
  'export { default as GetAppIcon } from \'@mui/icons-material/GetApp\';',
  'export { default as PhoneIcon } from \'@mui/icons-material/Phone\';',
  'export { default as RestoreIcon } from \'@mui/icons-material/Restore\';'
];

// 首先添加缺失的图标
const iconsPath = path.join(__dirname, '../src/utils/icons.ts');
let iconsContent = fs.readFileSync(iconsPath, 'utf8');

let needsNewIcons = false;
additionalIcons.forEach(iconExport => {
  const iconName = iconExport.match(/as\s+(\w+)/)[1];
  if (!iconsContent.includes(`as ${iconName}`)) {
    needsNewIcons = true;
  }
});

if (needsNewIcons) {
  const newIconsSection = '\n// 额外补充的图标\n' + additionalIcons.join('\n') + '\n';
  fs.appendFileSync(iconsPath, newIconsSection);
  console.log('已添加额外的图标到 icons.ts');
}

// 应用批量修复
let totalFixes = 0;
batchFixes.forEach(fix => {
  const filePath = path.join(__dirname, '../', fix.file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      fix.replacements.forEach(replacement => {
        if (content.includes(replacement.from) && replacement.from !== replacement.to) {
          const beforeCount = (content.match(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
          content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
          const afterCount = (content.match(new RegExp(replacement.to.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
          
          if (beforeCount > 0) {
            modified = true;
            totalFixes++;
            console.log(`✓ ${fix.file}: ${replacement.from} -> ${replacement.to} (${beforeCount} 处)`);
          }
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content);
      }
    } catch (error) {
      console.error(`❌ 修复 ${fix.file} 时出错:`, error.message);
    }
  } else {
    console.warn(`⚠️ 文件不存在: ${fix.file}`);
  }
});

console.log(`\n🎉 批量修复完成! 共修复了 ${totalFixes} 个图标问题。`);

// 特别处理一些复杂的导入修复
const importFixes = [
  {
    file: 'src/components/domain/devices/DeviceStatusCard.tsx',
    check: 'import.*icons.*from',
    add: 'ThermostatIcon, BatteryFullIcon'
  },
  {
    file: 'src/components/domain/devices/DeviceMonitorListV2_Clean.tsx',
    check: 'import.*icons.*from',
    add: 'VisibilityIcon'
  }
];

importFixes.forEach(fix => {
  const filePath = path.join(__dirname, '../', fix.file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 查找现有的图标导入行
      const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]*icons[^'"]*)['"]/);
      if (importMatch) {
        const currentImports = importMatch[1].trim();
        const importPath = importMatch[2];
        
        // 检查是否需要添加新的图标
        const iconsToAdd = fix.add.split(', ').filter(icon => !currentImports.includes(icon));
        
        if (iconsToAdd.length > 0) {
          const newImports = currentImports + ', ' + iconsToAdd.join(', ');
          const newImportStatement = `import { ${newImports} } from '${importPath}';`;
          content = content.replace(importMatch[0], newImportStatement);
          fs.writeFileSync(filePath, content);
          console.log(`✓ 已更新 ${fix.file} 的图标导入: ${iconsToAdd.join(', ')}`);
        }
      }
    } catch (error) {
      console.error(`❌ 修复 ${fix.file} 导入时出错:`, error.message);
    }
  }
});

console.log('\n🚀 全部图标修复完成！');
