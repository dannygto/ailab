const fs = require('fs');
const path = require('path');

// Define missing icons that need to be added
const missingIcons = [
  'CloudOffIcon',
  'PhoneAndroidIcon',
  'CopyIcon',
  'NotificationsActiveIcon',
  'ElectricBoltIcon',
  'PowerSettingsNewIcon',
  'ThermostatAutoIcon',
  'WaterDropIcon',
  'BlockIcon',
  'ReportIcon',
  'ControlIcon',
  'UploadFileIcon',
  'ScreenShareIcon',
  'SummarizeIcon',
  'CategoryIcon',
  'TextFieldsIcon',
  'BookmarkIcon',
  'BookmarkBorderIcon',
  'DragIndicatorIcon',
  'LabelIcon',
  'SortIcon',
  'TitleIcon',
  'ScheduleIcon',
  'AccessTimeIcon',
  'LanguageIcon',
  'BusinessIcon',
  'SchoolIcon',
  'SmartToyIcon',
  'VideoLibraryIcon',
  'DeleteOutlineIcon',
  'CloudCheckCircleIcon',
  'HelpIconOutline',
  'AdminPanelsettings',
  'restore',
  'visibility',
  'settings',
  'email',
  'chat',
  'share',
  'analytics',
  'logout',
  'devices',
  'Screenshare',
  'GetAppIcon',
  'RestoreIcon',
  'DataSettings',
  'GeneralSettings',
  'SecuritySettings',
  'ThemeSettings',
  'NotificationSettings',
  'SimpleSettings',
  'TestSecuritySettings',
  'SimpleSettingsTest'
];

// Map of icon names to their correct MUI icon imports
const iconMappings = {
  'CloudOffIcon': 'CloudOff',
  'PhoneAndroidIcon': 'PhoneAndroid',
  'CopyIcon': 'ContentCopy',
  'NotificationsActiveIcon': 'NotificationsActive',
  'ElectricBoltIcon': 'ElectricBolt',
  'PowerSettingsNewIcon': 'PowerSettingsNew',
  'ThermostatAutoIcon': 'ThermostatAuto',
  'WaterDropIcon': 'WaterDrop',
  'BlockIcon': 'Block',
  'ReportIcon': 'Report',
  'ControlIcon': 'ControlPoint',
  'UploadFileIcon': 'UploadFile',
  'ScreenShareIcon': 'ScreenShare',
  'SummarizeIcon': 'Summarize',
  'CategoryIcon': 'Category',
  'TextFieldsIcon': 'TextFields',
  'BookmarkIcon': 'Bookmark',
  'BookmarkBorderIcon': 'BookmarkBorder',
  'DragIndicatorIcon': 'DragIndicator',
  'LabelIcon': 'Label',
  'SortIcon': 'Sort',
  'TitleIcon': 'Title',
  'ScheduleIcon': 'Schedule',
  'AccessTimeIcon': 'AccessTime',
  'LanguageIcon': 'Language',
  'BusinessIcon': 'Business',
  'SchoolIcon': 'School',
  'SmartToyIcon': 'SmartToy',
  'VideoLibraryIcon': 'VideoLibrary',
  'DeleteOutlineIcon': 'DeleteOutline',
  'CloudCheckCircleIcon': 'CheckCircle',
  'HelpIconOutline': 'HelpOutline',
  'AdminPanelsettings': 'AdminPanelSettings',
  'restore': 'Restore',
  'visibility': 'Visibility',
  'settings': 'Settings',
  'email': 'Email',
  'chat': 'Chat',
  'share': 'Share',
  'analytics': 'Analytics',
  'logout': 'Logout',
  'devices': 'Devices',
  'Screenshare': 'ScreenShare'
};

// Function to add missing icons to icons.ts
function addMissingIcons() {
  const iconsPath = path.join(__dirname, '../src/utils/icons.ts');
  let content = fs.readFileSync(iconsPath, 'utf8');
  
  // Find the end of the existing exports
  const lines = content.split('\n');
  let insertIndex = -1;
  
  // Find where to insert new icons (before the tracking system)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// 使用统计追踪')) {
      insertIndex = i;
      break;
    }
  }
  
  if (insertIndex === -1) {
    // If no tracking system found, add before the end
    insertIndex = lines.length - 10;
  }
  
  // Add missing icons
  const newIcons = [];
  missingIcons.forEach(iconName => {
    if (iconMappings[iconName] && !content.includes(`${iconName} from`)) {
      newIcons.push(`export { default as ${iconName} } from '@mui/icons-material/${iconMappings[iconName]}';`);
    }
  });
  
  if (newIcons.length > 0) {
    lines.splice(insertIndex, 0, '', '// 补充缺失的图标', ...newIcons);
    fs.writeFileSync(iconsPath, lines.join('\n'));
    console.log(`Added ${newIcons.length} missing icons to icons.ts`);
  }
}

// Function to fix icon usage in files
function fixIconUsages() {
  const srcPath = path.join(__dirname, '../src');
  
  // Define replacements for common icon usage issues
  const replacements = [
    // Fix incorrect icon references
    { from: /OnlineIcon/g, to: 'WifiIcon' },
    { from: /NoSignalIcon/g, to: 'WifiIcon' },
    { from: /OfflineIcon/g, to: 'CloudOffIcon' },
    { from: /CloudOffIcon/g, to: 'CloudOffIcon' },
    { from: /NotificationsIconActiveIcon/g, to: 'NotificationsActiveIcon' },
    { from: /CheckAccountCircleIcon/g, to: 'AccountCircleIcon' },
    { from: /AccountAccountCircleIcon/g, to: 'AccountCircleIcon' },
    { from: /BarChartIconIcon/g, to: 'BarChartIcon' },
    { from: /ShowChartIconIcon/g, to: 'ShowChartIcon' },
    { from: /PieChartIconIcon/g, to: 'PieChartIcon' },
    { from: /BookmarkIconIcon/g, to: 'BookmarkIcon' },
    { from: /BookmarkBorderIconIcon/g, to: 'BookmarkBorderIcon' },
    { from: /DragIndicator/g, to: 'DragIndicatorIcon' },
    { from: /HelpIconOutline/g, to: 'HelpOutlineIcon' },
    { from: /AdminPanelsettings/g, to: 'AdminPanelSettingsIcon' },
    { from: /CloudBackupIcon/g, to: 'BackupIcon' },
    { from: /CloudInfoIcon/g, to: 'CloudIcon' },
    { from: /ChevronLeftIconIcon/g, to: 'ChevronLeftIcon' },
    { from: /ScheduleIconIcon/g, to: 'ScheduleIcon' },
    { from: /DataUsageIconIcon/g, to: 'DataUsageIcon' },
    
    // Fix JSX usage of lowercase icons
    { from: /<devices\s/g, to: '<DevicesIcon ' },
    { from: /<devices>/g, to: '<DevicesIcon>' },
    { from: /<devices\s\/>/g, to: '<DevicesIcon />' },
    { from: /<settings\s/g, to: '<SettingsIcon ' },
    { from: /<settings>/g, to: '<SettingsIcon>' },
    { from: /<settings\s\/>/g, to: '<SettingsIcon />' },
    { from: /<logout\s/g, to: '<LogoutIcon ' },
    { from: /<logout>/g, to: '<LogoutIcon>' },
    { from: /<logout\s\/>/g, to: '<LogoutIcon />' },
    { from: /<email\s/g, to: '<EmailIcon ' },
    { from: /<email>/g, to: '<EmailIcon>' },
    { from: /<email\s\/>/g, to: '<EmailIcon />' },
    { from: /<chat\s/g, to: '<ChatIcon ' },
    { from: /<chat>/g, to: '<ChatIcon>' },
    { from: /<chat\s\/>/g, to: '<ChatIcon />' },
    { from: /<share\s/g, to: '<ShareIcon ' },
    { from: /<share>/g, to: '<ShareIcon>' },
    { from: /<share\s\/>/g, to: '<ShareIcon />' },
    { from: /<analytics\s/g, to: '<AnalyticsIcon ' },
    { from: /<analytics>/g, to: '<AnalyticsIcon>' },
    { from: /<analytics\s\/>/g, to: '<AnalyticsIcon />' },
    { from: /<visibility\s/g, to: '<VisibilityIcon ' },
    { from: /<visibility>/g, to: '<VisibilityIcon>' },
    { from: /<visibility\s\/>/g, to: '<VisibilityIcon />' },
    { from: /<restore\s/g, to: '<RestoreIcon ' },
    { from: /<restore>/g, to: '<RestoreIcon>' },
    { from: /<restore\s\/>/g, to: '<RestoreIcon />' },
    
    // Fix property access issues
    { from: /\.devices\s*(?!\w)/g, to: '.DevicesIcon' },
    { from: /\.settings\s*(?!\w)/g, to: '.SettingsIcon' },
    { from: /\.logout\s*(?!\w)/g, to: '.LogoutIcon' },
    { from: /\.email\s*(?!\w)/g, to: '.EmailIcon' },
    { from: /\.chat\s*(?!\w)/g, to: '.ChatIcon' },
    { from: /\.share\s*(?!\w)/g, to: '.ShareIcon' },
    { from: /\.analytics\s*(?!\w)/g, to: '.AnalyticsIcon' },
    { from: /\.visibility\s*(?!\w)/g, to: '.VisibilityIcon' },
    { from: /\.restore\s*(?!\w)/g, to: '.RestoreIcon' }
  ];
  
  function processFile(filePath) {
    if (path.extname(filePath) !== '.tsx' && path.extname(filePath) !== '.ts') {
      return;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      
      replacements.forEach(({ from, to }) => {
        if (content.match(from)) {
          content = content.replace(from, to);
          changed = true;
        }
      });
      
      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed icon usage in: ${path.relative(srcPath, filePath)}`);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }
  
  function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDirectory(fullPath);
      } else {
        processFile(fullPath);
      }
    });
  }
  
  walkDirectory(srcPath);
}

// Function to update icon aliases
function updateIconAliases() {
  const iconsPath = path.join(__dirname, '../src/utils/icons.ts');
  let content = fs.readFileSync(iconsPath, 'utf8');
  
  // Update the iconAliases object
  const aliasesSection = `// 图标别名映射（为了兼容旧代码）
export const iconAliases = {
  'devices': DevicesIcon,
  'settings': SettingsIcon,
  'logout': LogoutIcon,
  'email': EmailIcon,
  'chat': ChatIcon,
  'share': ShareIcon,
  'analytics': AnalyticsIcon,
  'visibility': VisibilityIcon,
  'restore': RestoreIcon,
  'label': LabelIcon,
  'sort': SortIcon,
  'title': TitleIcon,
  'screenshare': ScreenShareIcon,
  'copy': CopyIcon,
  'report': ReportIcon,
  'control': ControlIcon,
  'upload': UploadFileIcon,
  'block': BlockIcon,
  'electric': ElectricBoltIcon,
  'power': PowerSettingsNewIcon,
  'thermostat': ThermostatAutoIcon,
  'water': WaterDropIcon,
  'phone': PhoneAndroidIcon,
  'cloudoff': CloudOffIcon,
  'notifications': NotificationsActiveIcon,
  'bookmark': BookmarkIcon,
  'category': CategoryIcon,
  'textfields': TextFieldsIcon,
  'summarize': SummarizeIcon,
  'drag': DragIndicatorIcon,
  'schedule': ScheduleIcon,
  'access': AccessTimeIcon,
  'language': LanguageIcon,
  'business': BusinessIcon,
  'school': SchoolIcon,
  'smart': SmartToyIcon,
  'video': VideoLibraryIcon,
  'delete': DeleteOutlineIcon,
  'check': CloudCheckCircleIcon,
  'help': HelpOutlineIcon,
  'admin': AdminPanelSettingsIcon
};`;
  
  // Replace the existing aliases section
  content = content.replace(
    /\/\/ 图标别名映射.*?};/s,
    aliasesSection
  );
  
  fs.writeFileSync(iconsPath, content);
  console.log('Updated icon aliases');
}

// Main execution
console.log('Starting comprehensive icon fix...');

try {
  addMissingIcons();
  fixIconUsages();
  updateIconAliases();
  console.log('✅ All icon issues fixed successfully!');
} catch (error) {
  console.error('❌ Error during icon fix:', error);
}
