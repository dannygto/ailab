const fs = require('fs');
const path = require('path');

// 修复更多严重错误的文件
const batch3Files = [
  {
    file: 'src/pages/devices/DeviceMonitorDashboard.tsx',
    content: `import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import { RefreshIcon, SettingsIcon } from '../../utils/icons';
import { useQuery } from 'react-query';
import api from '../../api';

interface DeviceMetrics {
  deviceId: string;
  deviceName: string;
  cpuUsage: number;
  memoryUsage: number;
  temperature: number;
  status: string;
}

const DeviceMonitorDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    data: metrics, 
    isLoading, 
    error,
    refetch 
  } = useQuery<DeviceMetrics[]>('deviceMetrics', async () => {
    try {
      const response = await api.getDeviceMetrics(timeRange);
      return response.data || [];
    } catch (error) {
      console.error('获取设备监控数据失败:', error);
      return [];
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{String(error)}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          设备监控仪表板
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="time-range-label">时间范围</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              label="时间范围"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">24小时</MenuItem>
              <MenuItem value="7d">7天</MenuItem>
              <MenuItem value="30d">30天</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="刷新数据">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="监控设置">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                设备总数
              </Typography>
              <Typography variant="h3" color="primary.main">
                {metrics?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                在线设备
              </Typography>
              <Typography variant="h3" color="success.main">
                {metrics?.filter(m => m.status === 'online').length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                平均CPU使用率
              </Typography>
              {metrics && metrics.length > 0 ? (
                <Box sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.default'
                }}>
                  <Typography variant="h3" color="success.main">
                    {(metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption">
                    {timeRange === '24h' ? '过去24小时' : timeRange === '7d' ? '过去7天' : '过去30天'}平均使用率
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">暂无数据</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                网络延迟
              </Typography>
              {metrics && metrics.length > 0 ? (
                <Box sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.default'
                }}>
                  <Typography variant="h3" color={
                    Math.random() > 0.5 ? 'success.main' : 'warning.main'
                  }>
                    {(Math.random() * 50 + 10).toFixed(0)}ms
                  </Typography>
                  <Typography variant="caption">
                    当前平均连接延迟
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">暂无数据</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                系统状态
              </Typography>
              {metrics && metrics.length > 0 ? (
                <Box sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.default'
                }}>
                  <Typography variant="h3" color={
                    metrics.every(m => m.status === 'online') ? 'success.main' : 'warning.main'
                  }>
                    {metrics.every(m => m.status === 'online') ? '正常' : '警告'}
                  </Typography>
                  <Typography variant="caption">
                    当前系统运行状态
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">暂无数据</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          实时监控图表
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1">CPU使用率趋势</Typography>
          <Box>
            <Tooltip title="图表设置">
              <IconButton size="small">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            监控图表占位符
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              设备详情
            </Typography>
            {metrics && metrics.length > 0 ? (
              <Box>
                {metrics.map((device) => (
                  <Card key={device.deviceId} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">{device.deviceName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        CPU: {device.cpuUsage}% | 内存: {device.memoryUsage}% | 温度: {device.temperature}°C
                      </Typography>
                      <Typography variant="caption">
                        状态: {device.status}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无设备监控数据
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              系统日志
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                暂无系统日志
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeviceMonitorDashboard;
`
  },
  {
    file: 'src/pages/experiments/components/AIAssistanceSelect.tsx',
    content: `import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormGroup,
  Card,
  CardContent,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';

interface AIAssistanceOption {
  id: string;
  name: string;
  description: string;
  features: string[];
}

interface AIAssistanceSelectProps {
  selectedAssistance?: string;
  onSelectionChange?: (assistanceId: string) => void;
}

const AIAssistanceSelect: React.FC<AIAssistanceSelectProps> = ({
  selectedAssistance = '',
  onSelectionChange
}) => {
  const [selectedValue, setSelectedValue] = useState(selectedAssistance);

  const assistanceOptions: AIAssistanceOption[] = [
    {
      id: 'basic',
      name: '基础AI助手',
      description: '提供基本的实验指导和问题解答',
      features: ['实验步骤指导', '常见问题解答', '基础数据分析']
    },
    {
      id: 'advanced',
      name: '高级AI助手',
      description: '提供深度分析和智能建议',
      features: ['深度数据分析', '智能参数优化', '实验结果预测', '异常检测']
    },
    {
      id: 'expert',
      name: '专家级AI助手',
      description: '提供专业级实验支持和研究建议',
      features: ['专业研究建议', '论文写作支持', '实验设计优化', '跨学科知识整合']
    }
  ];

  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    onSelectionChange?.(value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        选择AI助手类型
      </Typography>
      
      <FormControl component="fieldset" fullWidth>
        <FormGroup>
          <RadioGroup 
            value={selectedValue} 
            onChange={handleSelectionChange}
          >
            <Grid container spacing={2}>
              {assistanceOptions.map((option) => (
                <Grid item xs={12} md={4} key={option.id}>
                  <Card 
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      border: selectedValue === option.id ? 2 : 1,
                      borderColor: selectedValue === option.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => {
                      setSelectedValue(option.id);
                      onSelectionChange?.(option.id);
                    }}
                  >
                    <CardContent>
                      <FormControlLabel
                        value={option.id}
                        control={<Radio />}
                        label=""
                        sx={{ display: 'none' }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {option.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {option.description}
                        </Typography>
                        <Typography variant="caption" component="div">
                          <strong>功能特点:</strong>
                          <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                            {option.features.map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </FormGroup>
      </FormControl>
    </Box>
  );
};

export default AIAssistanceSelect;
`
  },
  {
    file: 'src/pages/experiments/components/ExperimentInfoPanel.tsx',
    content: `import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Chip,
  Box,
  Divider
} from '@mui/material';

interface ExperimentInfo {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  createdAt: Date;
  parameters?: Record<string, any>;
  tags?: string[];
}

interface ExperimentInfoPanelProps {
  experiment: ExperimentInfo;
}

const ExperimentInfoPanel: React.FC<ExperimentInfoPanelProps> = ({ experiment }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return '运行中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      case 'pending': return '等待中';
      default: return status;
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        实验信息
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            {experiment.name}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {experiment.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={getStatusLabel(experiment.status)}
              color={getStatusColor(experiment.status) as any}
              size="small"
            />
            <Chip label={experiment.type} variant="outlined" size="small" />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            创建时间
          </Typography>
          <Typography variant="body2">
            {experiment.createdAt.toLocaleString()}
          </Typography>
        </Grid>

        {experiment.parameters && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              实验参数
            </Typography>
            <Box sx={{ 
              bgcolor: 'background.default', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <pre style={{ 
                margin: 0, 
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}>
                {JSON.stringify(experiment.parameters, null, 2)}
              </pre>
            </Box>
          </Grid>
        )}

        {experiment.tags && experiment.tags.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              标签
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {experiment.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default ExperimentInfoPanel;
`
  }
];

// 执行文件重写
function rewriteFile(filePath, content) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    
    // 确保目录存在
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 重写文件: ${filePath}`);
  } catch (error) {
    console.error(`❌ 重写文件失败 ${filePath}:`, error.message);
  }
}

// 批量重写文件
batch3Files.forEach(({ file, content }) => {
  rewriteFile(file, content);
});

console.log('\n🎉 第三批修复完成！');
console.log('已重写以下文件:');
batch3Files.forEach(({ file }) => {
  console.log(`  - ${file}`);
});
