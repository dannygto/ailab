import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material';

// 从统一的图标文件导入一些示例图标
import {
  SearchIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  DashboardIcon,
  SettingsIcon,
  ScienceIcon,
  SchoolIcon,
  CheckCircleIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon
} from '../utils/icons';

const IconSystemDemo: React.FC = () => {
  const iconExamples = [
    { name: 'SearchIcon', component: SearchIcon, category: '基础 UI' },
    { name: 'AddIcon', component: AddIcon, category: '基础 UI' },
    { name: 'EditIcon', component: EditIcon, category: '基础 UI' },
    { name: 'DeleteIcon', component: DeleteIcon, category: '基础 UI' },
    { name: 'DashboardIcon', component: DashboardIcon, category: '导航' },
    { name: 'SettingsIcon', component: SettingsIcon, category: '导航' },
    { name: 'ScienceIcon', component: ScienceIcon, category: '科学实验' },
    { name: 'SchoolIcon', component: SchoolIcon, category: '教育' },
    { name: 'CheckCircleIcon', component: CheckCircleIcon, category: '状态' },
    { name: 'ErrorIcon', component: ErrorIcon, category: '状态' },
    { name: 'WarningIcon', component: WarningIcon, category: '状态' },
    { name: 'InfoIcon', component: InfoIcon, category: '状态' }
  ];

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
            <Grid item>
              <Chip 
                icon={<CheckCircleIcon />} 
                label="219 个图标" 
                color="primary" 
              />
            </Grid>
            <Grid item>
              <Chip 
                icon={<SettingsIcon />} 
                label="15 个分类" 
                color="secondary" 
              />
            </Grid>
            <Grid item>
              <Chip 
                icon={<InfoIcon />} 
                label="0 个重复" 
                color="success" 
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        图标示例
      </Typography>
      
      <Grid container spacing={2}>
        {iconExamples.map((icon) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={icon.name}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <icon.component sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="caption" display="block">
                {icon.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {icon.category}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            使用方法
          </Typography>
          <Typography variant="body2" paragraph>
            推荐导入方式：
          </Typography>
          <Box component="pre" sx={{ 
            backgroundColor: 'grey.100', 
            p: 2, 
            borderRadius: 1,
            overflow: 'auto'
          }}>
{`import { 
  SearchIcon, 
  AddIcon, 
  EditIcon, 
  DeleteIcon 
} from '../utils/icons';`}
          </Box>
          
          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            不推荐方式：
          </Typography>
          <Box component="pre" sx={{ 
            backgroundColor: 'grey.100', 
            p: 2, 
            borderRadius: 1,
            overflow: 'auto'
          }}>
{`// ❌ 不要这样做
;`}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IconSystemDemo; 