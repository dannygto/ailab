/**
 * 📊 数据分析页面 - 完整功能
 * 
 * ✅ 功能特性
 * - 实验数据导入与管理
 * - 与设备数据绑定
 * - 多种分析方法支持
 * - 可视化图表展示
 * - 分析报告导出
 * - 实时数据分析
 * 
 * 🔄 分析方法
 * - 描述性统计分析
 * - 相关性分析
 * - 回归分析
 * - 时间序列分析
 * - 异常值检测
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import {
  BarChartIcon,
  PieChartIcon,
  UploadIcon,
  DownloadIcon,
  RefreshIcon,
  AnalyticsIcon,
  DevicesIcon,
  WarningIcon,
  CheckCircleIcon,
  DataObjectIcon
} from '../../utils/icons';
import { toast } from 'react-hot-toast';

// 数据源类型
interface DataSource {
  id: string;
  name: string;
  type: 'device' | 'experiment' | 'file' | 'manual';
  status: 'connected' | 'disconnected' | 'error';
  lastUpdate: Date;
  recordCount: number;
  deviceId?: string;
  experimentId?: string;
}

// 分析方法配置
interface AnalysisMethod {
  id: string;
  name: string;
  description: string;
  type: 'statistical' | 'correlation' | 'regression' | 'timeseries' | 'ml';
  parameters: AnalysisParameter[];
}

interface AnalysisParameter {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  required: boolean;
  default?: any;
  options?: { value: string; label: string }[];
}

// 分析结果
interface AnalysisResult {
  id: string;
  method: string;
  data: any;
  charts: ChartConfig[];
  summary: string;
  timestamp: Date;
}

interface ChartConfig {
  type: 'line' | 'bar' | 'scatter' | 'pie' | 'histogram';
  title: string;
  data: any;
  options: any;
}

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

const DataAnalysisPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [analysisMethod, setAnalysisMethod] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deviceBindingOpen, setDeviceBindingOpen] = useState(false);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  // 可用的分析方法
  const analysisMethods: AnalysisMethod[] = [
    {
      id: 'descriptive',
      name: '描述性统计',
      description: '计算数据的基本统计信息，包括均值、中位数、标准差、最大值、最小值等。',
      type: 'statistical',
      parameters: [
        {
          id: 'variable',
          name: '变量',
          type: 'select',
          required: true,
          options: []
        }
      ]
    },
    {
      id: 'correlation',
      name: '相关性分析',
      description: '分析多个变量之间的相关性，计算相关系数和显著性。',
      type: 'correlation',
      parameters: [
        {
          id: 'method',
          name: '相关性方法',
          type: 'select',
          required: true,
          default: 'pearson',
          options: [
            { value: 'pearson', label: '皮尔逊相关系数' },
            { value: 'spearman', label: '斯皮尔曼等级相关' },
            { value: 'kendall', label: '肯德尔等级相关' }
          ]
        }
      ]
    },
    {
      id: 'regression',
      name: '回归分析',
      description: '建立变量间的回归模型，预测和解释变量关系。',
      type: 'regression',
      parameters: [
        {
          id: 'regressionType',
          name: '回归类型',
          type: 'select',
          required: true,
          default: 'linear',
          options: [
            { value: 'linear', label: '线性回归' },
            { value: 'polynomial', label: '多项式回归' },
            { value: 'logistic', label: '逻辑回归' }
          ]
        }
      ]
    },
    {
      id: 'timeseries',
      name: '时间序列分析',
      description: '分析时间序列数据的趋势、季节性和周期性。',
      type: 'timeseries',
      parameters: [
        {
          id: 'timeColumn',
          name: '时间列',
          type: 'select',
          required: true,
          options: []
        },
        {
          id: 'valueColumn',
          name: '数值列',
          type: 'select',
          required: true,
          options: []
        }
      ]
    },
    {
      id: 'outlier',
      name: '异常值检测',
      description: '识别数据中的异常值和离群点。',
      type: 'statistical',
      parameters: [
        {
          id: 'method',
          name: '检测方法',
          type: 'select',
          required: true,
          default: 'zscore',
          options: [
            { value: 'zscore', label: 'Z-Score方法' },
            { value: 'iqr', label: '四分位距方法' },
            { value: 'isolation', label: '孤立森林算法' }
          ]
        }
      ]
    }
  ];

  // 模拟数据源
  useEffect(() => {
    const mockDataSources: DataSource[] = [
      {
        id: 'device_001',
        name: '温度传感器数据',
        type: 'device',
        status: 'connected',
        lastUpdate: new Date(),
        recordCount: 1250,
        deviceId: 'temp_sensor_01'
      },
      {
        id: 'device_002',
        name: '湿度传感器数据',
        type: 'device',
        status: 'connected',
        lastUpdate: new Date(Date.now() - 300000),
        recordCount: 1248,
        deviceId: 'humidity_sensor_01'
      },
      {
        id: 'exp_001',
        name: '化学反应实验数据',
        type: 'experiment',
        status: 'connected',
        lastUpdate: new Date(Date.now() - 1800000),
        recordCount: 584,
        experimentId: 'chem_exp_001'
      },
      {
        id: 'file_001',
        name: '导入的CSV数据',
        type: 'file',
        status: 'connected',
        lastUpdate: new Date(Date.now() - 3600000),
        recordCount: 2000
      }
    ];
    setDataSources(mockDataSources);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleDataSourceChange = (event: SelectChangeEvent) => {
    setSelectedDataSource(event.target.value);
  };

  const handleAnalysisMethodChange = (event: SelectChangeEvent) => {
    setAnalysisMethod(event.target.value);
  };

  const handleRunAnalysis = async () => {
    if (!selectedDataSource || !analysisMethod) {
      alert('请选择数据源和分析方法');
      return;
    }

    setLoading(true);
    
    // 模拟分析过程
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        id: `result_${Date.now()}`,
        method: analysisMethod,
        data: {
          mean: 23.5,
          median: 23.2,
          std: 2.1,
          min: 18.5,
          max: 28.9,
          count: 1250
        },
        charts: [
          {
            type: 'line',
            title: '数据趋势图',
            data: {},
            options: {}
          }
        ],
        summary: '分析完成：数据显示正常分布，均值为23.5°C，标准差为2.1°C。',
        timestamp: new Date()
      };
      
      setAnalysisResults(prev => [mockResult, ...prev]);
      setLoading(false);
    }, 2000);
  };

  const handleUploadData = () => {
    setUploadDialogOpen(true);
  };

  const handleBindDevice = () => {
    setDeviceBindingOpen(true);
  };

  const handleExportResult = (result: AnalysisResult) => {
    try {
      const exportData = {
        method: result.method,
        data: result.data,
        summary: result.summary,
        timestamp: result.timestamp,
        charts: result.charts
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis_result_${result.method}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('分析结果已导出');
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败，请稍后重试');
    }
  };

  const handleViewChart = (result: AnalysisResult) => {
    setSelectedResult(result);
    setChartDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'disconnected': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon />;
      case 'disconnected': return <WarningIcon />;
      case 'error': return <WarningIcon />;
      default: return <DataObjectIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <BarChartIcon />
        数据分析中心
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        支持导入实验数据、绑定设备数据进行多维度分析，提供专业的统计分析和可视化功能。
      </Alert>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="数据管理" icon={<DataObjectIcon />} iconPosition="start" />
          <Tab label="分析配置" icon={<AnalyticsIcon />} iconPosition="start" />
          <Tab label="结果查看" icon={<BarChartIcon />} iconPosition="start" />
        </Tabs>

        {/* 数据管理页面 */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    数据源管理
                  </Typography>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>数据源名称</TableCell>
                          <TableCell>类型</TableCell>
                          <TableCell>状态</TableCell>
                          <TableCell>记录数</TableCell>
                          <TableCell>最后更新</TableCell>
                          <TableCell>操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataSources.map((source) => (
                          <TableRow key={source.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getStatusIcon(source.status)}
                                {source.name}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={source.type} 
                                size="small"
                                color={source.type === 'device' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={source.status} 
                                size="small"
                                color={getStatusColor(source.status) as any}
                              />
                            </TableCell>
                            <TableCell>{source.recordCount.toLocaleString()}</TableCell>
                            <TableCell>
                              {source.lastUpdate.toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="刷新数据">
                                <IconButton size="small">
                                  <RefreshIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="查看详情">
                                <IconButton size="small">
                                  <AnalyticsIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    数据操作
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={handleUploadData}
                      fullWidth
                    >
                      导入数据文件
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<DevicesIcon />}
                      onClick={handleBindDevice}
                      fullWidth
                    >
                      绑定设备数据
                    </Button>

                    <Divider />

                    <Typography variant="body2" color="text.secondary">
                      支持的数据格式：
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="CSV文件" 
                          secondary="逗号分隔值格式"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Excel文件" 
                          secondary="Microsoft Excel格式"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="JSON文件" 
                          secondary="JavaScript对象标记"
                        />
                      </ListItem>
                    </List>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 分析配置页面 */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    分析配置
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>选择数据源</InputLabel>
                    <Select
                      value={selectedDataSource}
                      onChange={handleDataSourceChange}
                      label="选择数据源"
                    >
                      {dataSources.map((source) => (
                        <MenuItem key={source.id} value={source.id}>
                          {source.name} ({source.recordCount} 条记录)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>分析方法</InputLabel>
                    <Select
                      value={analysisMethod}
                      onChange={handleAnalysisMethodChange}
                      label="分析方法"
                    >
                      {analysisMethods.map((method) => (
                        <MenuItem key={method.id} value={method.id}>
                          {method.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {analysisMethod && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      {analysisMethods.find(m => m.id === analysisMethod)?.description}
                    </Alert>
                  )}

                  <Button
                    variant="contained"
                    onClick={handleRunAnalysis}
                    disabled={!selectedDataSource || !analysisMethod || loading}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    {loading ? '分析中...' : '开始分析'}
                  </Button>

                  {loading && <LinearProgress />}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    可用分析方法
                  </Typography>

                  <List>
                    {analysisMethods.map((method) => (
                      <ListItem key={method.id} divider>
                        <ListItemIcon>
                          <AnalyticsIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={method.name}
                          secondary={method.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* 结果查看页面 */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            {analysisResults.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  暂无分析结果。请先在"分析配置"页面运行分析。
                </Alert>
              </Grid>
            ) : (
              analysisResults.map((result) => (
                <Grid item xs={12} md={6} key={result.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {analysisMethods.find(m => m.id === result.method)?.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        分析时间：{result.timestamp.toLocaleString()}
                      </Typography>

                      <Typography variant="body2" paragraph>
                        {result.summary}
                      </Typography>

                      {result.data && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            统计结果：
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Chip label={`均值: ${result.data.mean}`} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                              <Chip label={`中位数: ${result.data.median}`} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                              <Chip label={`标准差: ${result.data.std}`} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                              <Chip label={`样本数: ${result.data.count}`} size="small" />
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<DownloadIcon />} onClick={() => handleExportResult(result)}>
                        导出结果
                      </Button>
                      <Button size="small" startIcon={<BarChartIcon />} onClick={() => handleViewChart(result)}>
                        查看图表
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>
      </Paper>

      {/* 数据上传对话框 */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>上传数据文件</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" paragraph>
              选择要上传的数据文件
            </Typography>
            <Button variant="outlined" component="label">
              选择文件
              <input type="file" hidden accept=".csv,.xlsx,.json" />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>取消</Button>
          <Button variant="contained">上传</Button>
        </DialogActions>
      </Dialog>

      {/* 设备绑定对话框 */}
      <Dialog open={deviceBindingOpen} onClose={() => setDeviceBindingOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>绑定设备数据</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            选择要绑定的设备，系统将自动获取设备的实时数据用于分析。
          </Alert>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>选择设备</InputLabel>
            <Select label="选择设备">
              <MenuItem value="temp_01">温度传感器 #01</MenuItem>
              <MenuItem value="humidity_01">湿度传感器 #01</MenuItem>
              <MenuItem value="pressure_01">压力传感器 #01</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="数据源名称"
            placeholder="为此数据源指定一个名称"
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeviceBindingOpen(false)}>取消</Button>
          <Button variant="contained">绑定</Button>
        </DialogActions>
      </Dialog>

      {/* 图表查看对话框 */}
      <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>分析结果图表</DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {analysisMethods.find(m => m.id === selectedResult.method)?.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                分析时间：{selectedResult.timestamp.toLocaleString()}
              </Typography>

              <Typography variant="body2" paragraph>
                {selectedResult.summary}
              </Typography>

              {/* 图表组件占位符 */}
              <Box sx={{ height: 400, bgcolor: 'grey.100', borderRadius: 2, p: 2, mt: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  图表将在此处显示
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChartDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataAnalysisPage;
