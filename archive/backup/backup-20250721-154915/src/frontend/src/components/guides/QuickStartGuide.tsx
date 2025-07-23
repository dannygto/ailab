import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  DeviceHub as DeviceIcon,
  Settings as ConfigIcon,
  DataUsage as DataIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickStartGuide: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      label: '添加设备',
      description: '在设备管理中添加新设备并选择数据源类型',
      icon: <DeviceIcon />,
      action: () => navigate('/devices'),
      actionText: '前往设备管理'
    },
    {
      label: '配置数据源',
      description: '为设备配置具体的数据采集参数',
      icon: <ConfigIcon />,
      action: () => navigate('/devices'),
      actionText: '配置数据源'
    },
    {
      label: '开始采集',
      description: '启动数据采集进程，实时监控数据流',
      icon: <DataIcon />,
      action: () => navigate('/devices'),
      actionText: '查看监控'
    },
    {
      label: '分析结果',
      description: '使用AI工具分析采集的数据并生成报告',
      icon: <AnalyticsIcon />,
      action: () => navigate('/data-analysis'),
      actionText: '数据分析'
    }
  ];

  const features = [
    {
      title: 'AI智能识别',
      description: '自动识别设备数据格式，无需手动配置',
      color: 'primary'
    },
    {
      title: '多种数据源',
      description: '支持USB、MQTT、Modbus、HTTP API、数据库等',
      color: 'secondary'
    },
    {
      title: '实时监控',
      description: '实时采集和展示设备数据变化',
      color: 'success'
    },
    {
      title: '智能分析',
      description: 'AI驱动的数据分析和洞察生成',
      color: 'info'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        设备数据采集快速开始
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        按照以下步骤，快速完成设备接入和数据分析的完整流程
      </Typography>

      {/* 流程步骤 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          操作流程
        </Typography>
        
        <Stepper orientation="vertical">
          {steps.map((step, index) => (
            <Step key={index} active={true}>
              <StepLabel icon={step.icon}>
                <Typography variant="subtitle1">{step.label}</Typography>
              </StepLabel>
              <Box sx={{ ml: 3, mt: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {step.description}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={step.action}
                  endIcon={<ArrowIcon />}
                >
                  {step.actionText}
                </Button>
              </Box>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* 功能特色 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          功能特色
        </Typography>
        
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center' }}>
                <CardContent>
                  <Chip 
                    label={feature.title} 
                    color={feature.color as any}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 支持的数据源类型 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          支持的数据源类型
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="USB串口" 
              secondary="支持RS232、RS485等串口通信，自动识别波特率和数据格式"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="MQTT消息队列" 
              secondary="支持MQTT协议，实时接收设备发布的消息数据"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="Modbus RTU/TCP" 
              secondary="支持工业标准Modbus协议，自动探测寄存器映射"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="HTTP API" 
              secondary="通过REST API获取设备数据，支持多种认证方式"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CheckIcon color="success" />
            </ListItemIcon>
            <ListItemText 
              primary="数据库直读" 
              secondary="直接从数据库读取设备数据，支持多种数据库类型"
            />
          </ListItem>
        </List>
      </Paper>

      {/* 快速操作 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          快速操作
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DeviceIcon />}
              onClick={() => navigate('/devices')}
              sx={{ py: 1.5 }}
            >
              添加新设备
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={() => navigate('/demo/device-flow')}
              sx={{ py: 1.5 }}
            >
              查看演示流程
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate('/data-analysis')}
              sx={{ py: 1.5 }}
            >
              数据分析
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default QuickStartGuide;
