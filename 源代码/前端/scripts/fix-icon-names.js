#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取所有使用了@mui/icons-material的文件
const srcDir = path.join(__dirname, '..', 'src');

// 常见的图标映射
const iconMappings = {
  'Menu': 'MenuIcon',
  'Brightness4': 'Brightness4Icon',
  'Brightness7': 'Brightness7Icon',
  'PersonOutline': 'PersonOutlineIcon',
  'ExitToApp': 'LogoutIcon',
  'Add': 'AddIcon',
  'Delete': 'DeleteIcon',
  'Edit': 'EditIcon',
  'Save': 'SaveIcon',
  'Search': 'SearchIcon',
  'Clear': 'ClearIcon',
  'Close': 'CloseIcon',
  'Check': 'CheckIcon',
  'ArrowBack': 'ArrowBackIcon',
  'Refresh': 'RefreshIcon',
  'Settings': 'SettingsIcon',
  'MoreVert': 'MoreVertIcon',
  'Home': 'HomeIcon',
  'Dashboard': 'DashboardIcon',
  'ExpandMore': 'ExpandMoreIcon',
  'ExpandLess': 'ExpandLessIcon',
  'NavigateNext': 'NavigateNextIcon',
  'NavigateBefore': 'NavigateBeforeIcon',
  'PlayArrow': 'PlayArrowIcon',
  'Pause': 'PauseIcon',
  'Stop': 'StopIcon',
  'Mic': 'MicIcon',
  'Image': 'ImageIcon',
  'Download': 'DownloadIcon',
  'Upload': 'UploadIcon',
  'ContentCopy': 'ContentCopyIcon',
  'BarChart': 'BarChartIcon',
  'LineAxis': 'LineAxisIcon',
  'PieChart': 'PieChartIcon',
  'Assessment': 'AssessmentIcon',
  'ShowChart': 'ShowChartIcon',
  'Timeline': 'TimelineIcon',
  'DataObject': 'DataObjectIcon',
  'Functions': 'FunctionsIcon',
  'CheckCircle': 'CheckCircleIcon',
  'Error': 'ErrorIcon',
  'Warning': 'WarningIcon',
  'Info': 'InfoIcon',
  'CheckCircleOutline': 'CheckCircleOutlineIcon',
  'RadioButtonUnchecked': 'RadioButtonUncheckedIcon',
  'FiberManualRecord': 'FiberManualRecordIcon',
  'LightMode': 'LightModeIcon',
  'DarkMode': 'DarkModeIcon',
  'BrightnessAuto': 'BrightnessAutoIcon',
  'Palette': 'PaletteIcon',
  'Person': 'PersonIcon',
  'Group': 'GroupIcon',
  'Share': 'ShareIcon',
  'Favorite': 'FavoriteIcon',
  'FavoriteBorder': 'FavoriteBorderIcon',
  'Science': 'ScienceIcon',
  'Biotech': 'BiotechIcon',
  'MenuBook': 'MenuBookIcon',
  'Code': 'CodeIcon',
  'Security': 'SecurityIcon',
  'Lock': 'LockIcon',
  'LockOpen': 'LockOpenIcon',
  'Visibility': 'VisibilityIcon',
  'VisibilityOff': 'VisibilityOffIcon',
  'Devices': 'DevicesIcon',
  'Computer': 'ComputerIcon',
  'Monitor': 'MonitorIcon',
  'SignalCellularAlt': 'SignalCellularAltIcon',
  'NetworkCheck': 'NetworkCheckIcon',
  'Wifi': 'WifiIcon',
  'Bluetooth': 'BluetoothIcon',
  'Notifications': 'NotificationsIcon',
  'NotificationsOff': 'NotificationsOffIcon',
  'VolumeUp': 'VolumeUpIcon',
  'VolumeOff': 'VolumeOffIcon',
  'Storage': 'StorageIcon',
  'Backup': 'BackupIcon',
  'Restore': 'RestoreIcon',
  'Sync': 'SyncIcon',
  'CloudDownload': 'CloudDownloadIcon',
  'CloudUpload': 'CloudUploadIcon',
  'SmartToy': 'SmartToyIcon',
  'Psychology': 'PsychologyIcon',
  'AutoAwesome': 'AutoAwesomeIcon',
  'Tune': 'TuneIcon'
};

function getAllTsxFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files = files.concat(getAllTsxFiles(fullPath));
    } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixRemainingIconImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // 检查是否有utils/icons导入但使用了错误的变量名
    if (content.includes('from \'../../utils/icons\'') || content.includes('from \'../utils/icons\'')) {
      // 修复常见的错误映射
      Object.entries(iconMappings).forEach(([oldName, newName]) => {
        const regex = new RegExp(`\\b${oldName}\\b(?=\\s*[</>])`, 'g');
        content = content.replace(regex, newName);
      });
      
      // 修复ProfileIcon到PersonOutlineIcon
      content = content.replace(/ProfileIcon/g, 'PersonOutlineIcon');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed icon names in: ${filePath}`);
      }
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// 获取所有文件并处理
const files = getAllTsxFiles(srcDir);
console.log(`Found ${files.length} TypeScript files`);

files.forEach(fixRemainingIconImports);

console.log('Icon naming fixes completed!');
