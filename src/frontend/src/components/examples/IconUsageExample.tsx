import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';

// 从统一的图标文件导入图标
import {
  // 基础 UI 图标
  SearchIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  RefreshIcon,
  CheckIcon,
  
  // 导航图标
  DashboardIcon,
  SettingsIcon,
  HomeIcon,
  ScienceIcon,
  
  // 状态图标
  CheckCircleIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon,
  
  // 文件操作图标
  DownloadIcon,
  UploadIcon,
  SaveIcon,
  
  // 媒体控制图标
  PlayArrowIcon,
  PauseIcon,
  StopIcon,
  
  // 科学实验图标
  ExperimentIcon,
  SchoolIcon,
  SmartToyIcon
} from '../../utils/icons';

const IconUsageExample: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const statusIcons = {
    success: CheckCircleIcon,
    error: ErrorIcon,
    warning: WarningIcon,
    info: InfoIcon
  };

  const StatusIcon = statusIcons[selectedStatus];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        图标系统使用示例
      </Typography>
      
      {/* 基础 UI 图标示例 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            基础 UI 图标
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<AddIcon />}>
              添加项目
            </Button>
            <Button variant="outlined" startIcon={<EditIcon />}>
              编辑
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
              删除
            </Button>
            <IconButton color="primary">
              <SearchIcon />
            </IconButton>
            <IconButton color="secondary">
              <RefreshIcon />
            </IconButton>
            <IconButton color="success">
              <CheckIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* 导航图标示例 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            导航图标
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="仪表板" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="首页" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ScienceIcon />
              </ListItemIcon>
              <ListItemText primary="科学实验" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="设置" />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* 状态图标示例 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            状态图标
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              icon={<CheckCircleIcon />}
              label="成功"
              color="success"
              onClick={() => setSelectedStatus('success')}
              clickable
            />
            <Chip
              icon={<ErrorIcon />}
              label="错误"
              color="error"
              onClick={() => setSelectedStatus('error')}
              clickable
            />
            <Chip
              icon={<WarningIcon />}
              label="警告"
              color="warning"
              onClick={() => setSelectedStatus('warning')}
              clickable
            />
            <Chip
              icon={<InfoIcon />}
              label="信息"
              color="info"
              onClick={() => setSelectedStatus('info')}
              clickable
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StatusIcon sx={{ fontSize: 40 }} />
            <Typography>
              当前选择的状态图标: {selectedStatus}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 媒体控制图标示例 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            媒体控制图标
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <IconButton
              color="primary"
              size="large"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton color="secondary" size="large">
              <StopIcon />
            </IconButton>
            <Typography>
              播放状态: {isPlaying ? '播放中' : '已暂停'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* 文件操作图标示例 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            文件操作图标
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" startIcon={<UploadIcon />}>
              上传文件
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              下载文件
            </Button>
            <Button variant="outlined" startIcon={<SaveIcon />}>
              保存
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 科学实验图标示例 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            科学实验图标
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip icon={<ExperimentIcon />} label="实验" />
            <Chip icon={<SchoolIcon />} label="教育" />
            <Chip icon={<SmartToyIcon />} label="智能设备" />
          </Box>
        </CardContent>
      </Card>

      {/* 最佳实践说明 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            最佳实践
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="统一导入" 
                secondary="始终从 '../utils/icons' 导入图标，避免直接导入 @mui/icons-material"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="语义化命名" 
                secondary="使用有意义的图标名称，如 SearchIcon 而不是 Search"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="按需导入" 
                secondary="只导入需要的图标，避免导入整个图标库"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="保持一致性" 
                secondary="在整个项目中使用统一的图标风格和大小"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IconUsageExample; 