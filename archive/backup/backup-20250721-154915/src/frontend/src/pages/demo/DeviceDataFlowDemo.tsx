import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  DeviceHub as DeviceIcon,
  DataUsage as DataIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';

const DeviceDataFlowDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      label: '设备添加',
      description: '添加新设备并选择数据源类型',
      component: 'device'
    },
    {
      label: '数据源配置',
      description: '配置设备的数据采集参数',
      component: 'datasource'
    },
    {
      label: '数据采集',
      description: '开始采集设备数据',
      component: 'data'
    },
    {
      label: '数据分析',
      description: '对采集的数据进行分析处理',
      component: 'analysis'
    }
  ];

  const handleNext = () => {
    setCompletedSteps(prev => [...prev, activeStep]);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompletedSteps([]);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DeviceIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">添加新设备</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>设备信息</Typography>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography><strong>设备名称：</strong>温湿度传感器-001</Typography>
                    <Typography><strong>设备类型：</strong>传感器</Typography>
                    <Typography><strong>制造商：</strong>SensorTech</Typography>
                    <Typography><strong>型号：</strong>DHT22-Pro</Typography>
                    <Typography><strong>位置：</strong>实验室A-101</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>数据源类型选择</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label="USB串口" 
                      color="primary" 
                      variant="filled"
                      icon={<CheckIcon />}
                    />
                    <Chip label="MQTT" variant="outlined" />
                    <Chip label="Modbus RTU" variant="outlined" />
                    <Chip label="HTTP API" variant="outlined" />
                    <Chip label="数据库" variant="outlined" />
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    已选择 USB串口 作为数据源类型
                  </Typography>
                </Grid>
              </Grid>

              <Alert severity="success" sx={{ mt: 2 }}>
                设备添加成功！下一步需要配置USB串口数据源参数。
              </Alert>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DataIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">USB串口数据源配置</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>连接参数</Typography>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography><strong>串口：</strong>COM3</Typography>
                    <Typography><strong>波特率：</strong>9600</Typography>
                    <Typography><strong>数据位：</strong>8</Typography>
                    <Typography><strong>停止位：</strong>1</Typography>
                    <Typography><strong>校验位：</strong>无</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>AI数据格式识别</Typography>
                  <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="body2">
                      🤖 AI已自动识别数据格式：
                    </Typography>
                    <Typography><strong>格式：</strong>JSON</Typography>
                    <Typography><strong>字段：</strong>temperature, humidity, timestamp</Typography>
                    <Typography><strong>置信度：</strong>95%</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>数据样本预览</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.900', color: 'white', fontFamily: 'monospace' }}>
                    <Typography variant="body2">
                      {`{"temperature": 23.5, "humidity": 65.2, "timestamp": "2025-07-11T12:15:30Z"}`}
                    </Typography>
                    <Typography variant="body2">
                      {`{"temperature": 23.8, "humidity": 64.8, "timestamp": "2025-07-11T12:16:30Z"}`}
                    </Typography>
                    <Typography variant="body2">
                      {`{"temperature": 24.1, "humidity": 64.5, "timestamp": "2025-07-11T12:17:30Z"}`}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 2 }}>
                数据源配置完成！AI已自动生成解析规则，可以开始数据采集。
              </Alert>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DataIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">数据采集进行中</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">156</Typography>
                    <Typography variant="subtitle2">已采集数据条数</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">23.7°C</Typography>
                    <Typography variant="subtitle2">当前温度</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">64.9%</Typography>
                    <Typography variant="subtitle2">当前湿度</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>采集状态</Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">数据采集进度</Typography>
                    <LinearProgress variant="determinate" value={75} sx={{ mt: 1 }} />
                    <Typography variant="body2" sx={{ mt: 0.5 }}>75% 完成 (预计还需5分钟)</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>实时数据流</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      [12:18:30] 温度: 23.7°C, 湿度: 64.9%, 状态: 正常
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      [12:18:00] 温度: 23.5°C, 湿度: 65.1%, 状态: 正常
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      [12:17:30] 温度: 23.8°C, 湿度: 64.8%, 状态: 正常
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      [12:17:00] 温度: 24.1°C, 湿度: 64.5%, 状态: 正常
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Alert severity="success" sx={{ mt: 2 }}>
                数据采集运行正常！已收集到足够的数据，可以进行分析。
              </Alert>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AnalyticsIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">数据分析与洞察</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>统计分析</Typography>
                  <Paper sx={{ p: 2 }}>
                    <Typography><strong>平均温度：</strong>23.8°C</Typography>
                    <Typography><strong>温度范围：</strong>22.1°C - 25.3°C</Typography>
                    <Typography><strong>标准差：</strong>0.8°C</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography><strong>平均湿度：</strong>64.7%</Typography>
                    <Typography><strong>湿度范围：</strong>61.2% - 68.1%</Typography>
                    <Typography><strong>标准差：</strong>1.5%</Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>AI分析结果</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                    <Typography variant="body2">
                      🎯 <strong>环境状态：</strong>良好
                    </Typography>
                    <Typography variant="body2">
                      📊 <strong>数据质量：</strong>高 (99.2%有效数据)
                    </Typography>
                    <Typography variant="body2">
                      📈 <strong>趋势：</strong>温度稳定，湿度略有下降
                    </Typography>
                    <Typography variant="body2">
                      ⚠️ <strong>建议：</strong>环境条件适宜，建议继续监控
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>数据可视化</Typography>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      📊 温湿度变化趋势图
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      (这里将显示实时的温湿度变化曲线图)
                    </Typography>
                    <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2">🏃‍♂️ 图表渲染中...</Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>实验报告</Typography>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" paragraph>
                      <strong>实验名称：</strong>实验室环境监控
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>数据采集周期：</strong>2025-07-11 12:00:00 - 12:30:00
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>主要发现：</strong>实验室温湿度条件稳定，符合标准要求。温度保持在23.8±0.8°C范围内，
                      湿度维持在64.7±1.5%，为实验提供了良好的环境条件。
                    </Typography>
                    <Typography variant="body2">
                      <strong>数据质量：</strong>采集数据完整性为99.2%，无异常值，数据可靠性高。
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Alert severity="success" sx={{ mt: 2 }}>
                🎉 完整的设备→数据源→数据→分析流程演示完成！
                您已成功体验了从设备添加到数据分析的全过程。
              </Alert>
            </CardContent>
          </Card>
        );

      default:
        return <Typography>未知步骤</Typography>;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        设备数据流程演示
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        体验完整的设备→数据源→数据→分析端到端流程
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">{step.label}</Typography>
                  {completedSteps.includes(index) && (
                    <CheckIcon sx={{ ml: 1, color: 'success.main' }} />
                  )}
                </Box>
              </StepLabel>
              <StepContent>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                
                {renderStepContent(index)}
                
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={activeStep === steps.length - 1 ? handleReset : handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    startIcon={activeStep === steps.length - 1 ? <PlayIcon /> : undefined}
                  >
                    {activeStep === steps.length - 1 ? '重新演示' : '下一步'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    上一步
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Container>
  );
};

export default DeviceDataFlowDemo;
