// 图标使用情况分析和优化方案
// 项目内存优化：减少不必要的图标引用

// 1. 当前问题分析
// - utils/icons.ts 导出了 279 个图标，但实际使用的只有约 60-80 个
// - 大量冗余图标占用内存
// - 图标引用路径混乱，有些有错误（如 ./settings/Settings）
// - 没有使用 tree-shaking 优化

// 2. 实际使用的图标统计（基于搜索结果）
const actuallyUsedIcons = [
  // 基础UI图标
  'MenuIcon', 'CloseIcon', 'AddIcon', 'EditIcon', 'DeleteIcon', 'SearchIcon', 
  'MoreVertIcon', 'ExpandMoreIcon', 'ExpandLessIcon', 'RefreshIcon',
  
  // 导航图标
  'DashboardIcon', 'ScienceIcon', 'devices', 'StorageIcon', 'PersonIcon',
  'AccountCircleIcon', 'ArrowBackIcon', 'ChevronLeftIcon',
  
  // 主题图标
  'Brightness4Icon', 'Brightness7Icon', 'PaletteIcon', 'ColorLensIcon',
  
  // 设置图标
  'settings', 'SecurityIcon', 'NotificationsIcon', 'LanguageIcon', 'SaveIcon',
  
  // 文件操作图标
  'DownloadIcon', 'UploadFileIcon', 'CloudUploadIcon', 'BackupIcon', 'restore',
  
  // 状态图标
  'CheckCircleIcon', 'ErrorIcon', 'WarningIcon', 'InfoIcon', 'PlayArrowIcon',
  'PauseIcon', 'StopIcon',
  
  // 数据图标
  'DataUsageIcon', 'analytics', 'AnalyticsIcon', 'TrendingUpIcon', 'TrendingDownIcon',
  
  // 媒体图标
  'ImageIcon', 'VideoIcon', 'AudioIcon', 'share', 'FavoriteIcon', 'FavoriteBorderIcon',
  
  // 其他图标
  'SmartToyIcon', 'HelpIcon', 'SchoolIcon', 'LibraryBooksIcon', 'MonitorIcon',
  'GroupIcon', 'ComputerIcon', 'TuneIcon', 'visibility', 'email'
];

// 3. 优化策略
// - 创建精简版 icons.ts，只导出实际使用的图标
// - 使用动态导入减少初始加载
// - 统一图标命名规范
// - 建立图标使用指南

module.exports = {
  actuallyUsedIcons,
  totalIconsInFile: 279,
  actuallyUsedCount: actuallyUsedIcons.length,
  reductionPercentage: Math.round((1 - actuallyUsedIcons.length / 279) * 100)
};
