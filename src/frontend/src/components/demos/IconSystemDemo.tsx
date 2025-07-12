import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Paper
} from '@mui/material';

// 从统一的图标文件导入
import {
  // 基础 UI 图标
  SearchIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  CloseIcon,
  CheckIcon,
  
  // 导航图标
  DashboardIcon,
  HomeIcon,
  SettingsIcon,
  NotificationsIcon,
  
  // 媒体控制图标
  PlayArrowIcon,
  PauseIcon,
  StopIcon,
  ReplayIcon,
  
  // 文件操作图标
  DownloadIcon,
  UploadFileIcon,
  SaveIcon,
  FolderIcon,
  
  // 状态图标
  CheckCircleIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon,
  
  // 图表图标
  BarChartIcon,
  ShowChartIcon,
  PieChartIcon,
  AnalyticsIcon,
  
  // 设备图标
  ComputerIcon,
  MonitorIcon,
  DeviceHubIcon,
  SmartToyIcon,
  
  // 科学实验图标
  ScienceIcon,
  PsychologyIcon,
  BiotechIcon,
  ExperimentIcon,
  
  // 教育图标
  SchoolIcon,
  BookIcon,
  AssignmentIcon,
  EducationIcon,
  
  // 安全图标
  SecurityIcon,
  LockIcon,
  VpnKeyIcon,
  FingerprintIcon,
  
  // 网络图标
  WifiIcon,
  CloudIcon,
  RouterIcon,
  NetworkCheckIcon,
  
  // 时间图标
  AccessTimeIcon,
  ScheduleIcon,
  HistoryIcon,
  TodayIcon,
  
  // 其他常用图标
  FavoriteIcon,
  StarIcon,
  ThumbUpIcon,
  ShareIcon
} from '../../utils/icons';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const IconSystemDemo: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const iconCategories = [
    {
      name: '基础 UI 图标',
      icons: [
        { name: 'SearchIcon', component: SearchIcon },
        { name: 'AddIcon', component: AddIcon },
        { name: 'EditIcon', component: EditIcon },
        { name: 'DeleteIcon', component: DeleteIcon },
        { name: 'CloseIcon', component: CloseIcon },
        { name: 'CheckIcon', component: CheckIcon }
      ]
    },
    {
      name: '导航图标',
      icons: [
        { name: 'DashboardIcon', component: DashboardIcon },
        { name: 'HomeIcon', component: HomeIcon },
        { name: 'SettingsIcon', component: SettingsIcon },
        { name: 'NotificationsIcon', component: NotificationsIcon }
      ]
    },
    {
      name: '媒体控制图标',
      icons: [
        { name: 'PlayArrowIcon', component: PlayArrowIcon },
        { name: 'PauseIcon', component: PauseIcon },
        { name: 'StopIcon', component: StopIcon },
        { name: 'ReplayIcon', component: ReplayIcon }
      ]
    },
    {
      name: '文件操作图标',
      icons: [
        { name: 'DownloadIcon', component: DownloadIcon },
        { name: 'UploadFileIcon', component: UploadFileIcon },
        { name: 'SaveIcon', component: SaveIcon },
        { name: 'FolderIcon', component: FolderIcon }
      ]
    },
    {
      name: '状态图标',
      icons: [
        { name: 'CheckCircleIcon', component: CheckCircleIcon },
        { name: 'ErrorIcon', component: ErrorIcon },
        { name: 'WarningIcon', component: WarningIcon },
        { name: 'InfoIcon', component: InfoIcon }
      ]
    },
    {
      name: '图表图标',
      icons: [
        { name: 'BarChartIcon', component: BarChartIcon },
        { name: 'ShowChartIcon', component: ShowChartIcon },
        { name: 'PieChartIcon', component: PieChartIcon },
        { name: 'AnalyticsIcon', component: AnalyticsIcon }
      ]
    },
    {
      name: '设备图标',
      icons: [
        { name: 'ComputerIcon', component: ComputerIcon },
        { name: 'MonitorIcon', component: MonitorIcon },
        { name: 'DeviceHubIcon', component: DeviceHubIcon },
        { name: 'SmartToyIcon', component: SmartToyIcon }
      ]
    },
    {
      name: '科学实验图标',
      icons: [
        { name: 'ScienceIcon', component: ScienceIcon },
        { name: 'PsychologyIcon', component: PsychologyIcon },
        { name: 'BiotechIcon', component: BiotechIcon },
        { name: 'ExperimentIcon', component: ExperimentIcon }
      ]
    },
    {
      name: '教育图标',
      icons: [
        { name: 'SchoolIcon', component: SchoolIcon },
        { name: 'BookIcon', component: BookIcon },
        { name: 'AssignmentIcon', component: AssignmentIcon },
        { name: 'EducationIcon', component: EducationIcon }
      ]
    },
    {
      name: '安全图标',
      icons: [
        { name: 'SecurityIcon', component: SecurityIcon },
        { name: 'LockIcon', component: LockIcon },
        { name: 'VpnKeyIcon', component: VpnKeyIcon },
        { name: 'FingerprintIcon', component: FingerprintIcon }
      ]
    },
    {
      name: '网络图标',
      icons: [
        { name: 'WifiIcon', component: WifiIcon },
        { name: 'CloudIcon', component: CloudIcon },
        { name: 'RouterIcon', component: RouterIcon },
        { name: 'NetworkCheckIcon', component: NetworkCheckIcon }
      ]
    },
    {
      name: '时间图标',
      icons: [
        { name: 'AccessTimeIcon', component: AccessTimeIcon },
        { name: 'ScheduleIcon', component: ScheduleIcon },
        { name: 'HistoryIcon', component: HistoryIcon },
        { name: 'TodayIcon', component: TodayIcon }
      ]
    },
    {
      name: '其他常用图标',
      icons: [
        { name: 'FavoriteIcon', component: FavoriteIcon },
        { name: 'StarIcon', component: StarIcon },
        { name: 'ThumbUpIcon', component: ThumbUpIcon },
        { name: 'ShareIcon', component: ShareIcon }
      ]
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const filteredCategories = iconCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.icons.some(icon => 
      icon.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalIcons = iconCategories.reduce((sum, category) => sum + category.icons.length, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        图标系统演示
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            系统概览
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Chip 
                icon={<CheckCircleIcon />} 
                label={`${totalIcons} 个图标`} 
                color="primary" 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Chip 
                icon={<FolderIcon />} 
                label={`${iconCategories.length} 个分类`} 
                color="secondary" 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Chip 
                icon={<CheckIcon />} 
                label="0 个重复" 
                color="success" 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Chip 
                icon={<AnalyticsIcon />} 
                label="语法检查通过" 
                color="info" 
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="搜索图标或分类..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {filteredCategories.map((category, index) => (
            <Tab key={category.name} label={category.name} />
          ))}
        </Tabs>
      </Paper>

      {filteredCategories.map((category, index) => (
        <TabPanel key={category.name} value={tabValue} index={index}>
          <Typography variant="h6" gutterBottom>
            {category.name}
          </Typography>
          <Grid container spacing={2}>
            {category.icons.map((icon) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={icon.name}>
                <Card 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'scale(1.05)',
                      transition: 'all 0.2s'
                    }
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(`import { ${icon.name} } from '../../utils/icons';`);
                    // 这里可以添加一个 toast 通知
                  }}
                >
                  <icon.component sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                  <Typography variant="caption" display="block">
                    {icon.name}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      ))}

      {filteredCategories.length === 0 && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            没有找到匹配的图标
          </Typography>
          <Typography variant="body2" color="text.secondary">
            尝试使用不同的搜索词
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default IconSystemDemo; 