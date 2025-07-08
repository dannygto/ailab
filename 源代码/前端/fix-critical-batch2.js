const fs = require('fs');
const path = require('path');

// 继续修复剩余的严重错误文件
const moreFiles = [
  {
    file: 'src/components/visualizations/ExperimentResultsNew.tsx',
    content: `import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  BarChartIcon,
  LineChartIcon,
  PieChartIcon,
  ScatterPlotIcon,
  TableViewIcon,
  DownloadIcon,
  RefreshIcon
} from '../utils/icons';

interface ExperimentResult {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
  type: string;
}

interface ExperimentResultsProps {
  experimentId: string;
  results: ExperimentResult[];
  isLoading?: boolean;
  error?: string;
}

const ExperimentResultsNew: React.FC<ExperimentResultsProps> = ({
  experimentId,
  results,
  isLoading = false,
  error
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'scatter'>('line');

  const handleRefresh = () => {
    console.log('刷新实验结果');
  };

  const handleExport = () => {
    console.log('导出实验结果');
  };

  const renderChart = () => {
    if (!results || results.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">暂无可用数据</Typography>
        </Box>
      );
    }

    // 模拟图表渲染
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {chartType === 'line' && '线形图'}
          {chartType === 'bar' && '柱状图'}
          {chartType === 'pie' && '饼图'}
          {chartType === 'scatter' && '散点图'}
          占位符
        </Typography>
      </Box>
    );
  };

  const renderTable = () => {
    if (!results || results.length === 0) {
      return (
        <Typography color="text.secondary">暂无数据</Typography>
      );
    }

    return (
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>名称</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>值</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>类型</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>时间</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{result.name}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{result.value}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{result.type}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  {result.timestamp.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">实验结果</Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="刷新数据">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="导出数据">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>加载数据中...</Typography>
        </Box>
      ) : results.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            暂无实验结果数据
          </Typography>
        </Box>
      ) : (
        <>
          {/* 图表类型选择 */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>图表类型:</Typography>
            
            <Tooltip title="线形图">
              <IconButton
                size="small"
                color={chartType === 'line' ? 'primary' : 'default'}
                onClick={() => setChartType('line')}
              >
                <LineChartIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="柱状图">
              <IconButton
                size="small"
                color={chartType === 'bar' ? 'primary' : 'default'}
                onClick={() => setChartType('bar')}
              >
                <BarChartIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="饼图">
              <IconButton
                size="small"
                color={chartType === 'pie' ? 'primary' : 'default'}
                onClick={() => setChartType('pie')}
              >
                <PieChartIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="散点图">
              <IconButton
                size="small"
                color={chartType === 'scatter' ? 'primary' : 'default'}
                onClick={() => setChartType('scatter')}
              >
                <ScatterPlotIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* 图表显示 */}
          <Box sx={{ mb: 3 }}>
            {renderChart()}
          </Box>

          {/* 数据表格 */}
          <Box>
            <Typography variant="h6" gutterBottom>
              数据详情
            </Typography>
            {renderTable()}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default ExperimentResultsNew;
`
  },
  {
    file: 'src/pages/Dashboard.tsx',
    content: `import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { RefreshIcon, ExperimentIcon, DeviceIcon, ChatIcon } from '../utils/icons';
import { useQuery } from 'react-query';
import api from '../api';

interface DashboardStats {
  runningExperiments: number;
  completedExperiments: number;
  totalExperiments: number;
  activeDevices: number;
}

interface RecentExperiment {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
}

const Dashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery<DashboardStats>('dashboardStats', async () => {
    try {
      const response = await api.getDashboardStats();
      return response.data || {
        runningExperiments: 0,
        completedExperiments: 0,
        totalExperiments: 0,
        activeDevices: 0
      };
    } catch (error) {
      console.error('获取仪表板统计失败:', error);
      return {
        runningExperiments: 0,
        completedExperiments: 0,
        totalExperiments: 0,
        activeDevices: 0
      };
    }
  });

  const { 
    data: recentExperiments, 
    isLoading: experimentsLoading,
    error: experimentsError 
  } = useQuery<RecentExperiment[]>('recentExperiments', async () => {
    try {
      const response = await api.getRecentExperiments();
      return response.data || [];
    } catch (error) {
      console.error('获取最近实验失败:', error);
      return [];
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  const isLoading = statsLoading || experimentsLoading;
  const error = statsError || experimentsError;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          系统仪表板
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? '刷新中...' : '刷新'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          加载数据时出现错误，请稍后重试。
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {/* 统计卡片 */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">{stats?.runningExperiments || 0}</Typography>
                  <Typography variant="body2">正在运行的实验</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">{stats?.completedExperiments || 0}</Typography>
                  <Typography variant="body2">已完成的实验</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">{stats?.totalExperiments || 0}</Typography>
                  <Typography variant="body2">实验总数</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4">{stats?.activeDevices || 0}</Typography>
                  <Typography variant="body2">活跃设备数</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* 快速操作 */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  快速操作
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="contained"
                      startIcon={<ExperimentIcon />}
                      fullWidth
                      href="/experiments/create"
                    >
                      创建新实验
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      startIcon={<DeviceIcon />}
                      fullWidth
                      href="/devices"
                    >
                      设备管理
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Button
                      variant="outlined"
                      startIcon={<ChatIcon />}
                      fullWidth
                      href="/ai-assistant"
                    >
                      咨询AI助手
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* 最近实验 */}
            {recentExperiments && recentExperiments.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    最近实验
                  </Typography>
                  <Grid container spacing={2}>
                    {recentExperiments.slice(0, 5).map((experiment) => (
                      <Grid item xs={12} sm={6} md={4} key={experiment.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" noWrap>
                              {experiment.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              状态: {experiment.status}
                            </Typography>
                            <Typography variant="caption">
                              创建时间: {experiment.createdAt.toLocaleString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
`
  },
  {
    file: 'src/pages/devices/DeviceManagement.tsx',
    content: `import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import { useQuery } from 'react-query';
import api from '../../api';
import DeviceList from '../../components/domain/devices/DeviceList';
import DeviceReservations from '../../components/domain/devices/DeviceReservations';
import DeviceRemoteControl from '../../components/domain/devices/DeviceRemoteControl';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={\`device-tabpanel-\${index}\`}
      aria-labelledby={\`device-tab-\${index}\`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const DeviceManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const {
    data: devicesData,
    isLoading: devicesLoading,
    error: devicesError
  } = useQuery('devices', async () => {
    try {
      const response = await api.getDevices();
      return response.data || [];
    } catch (error) {
      console.error('获取设备列表失败:', error);
      return [];
    }
  });

  const {
    data: reservationsData,
    isLoading: reservationsLoading,
    error: reservationsError
  } = useQuery('deviceReservations', async () => {
    try {
      const response = await api.getDeviceReservations();
      return response.data || [];
    } catch (error) {
      console.error('获取设备预约列表失败:', error);
      return [];
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          设备管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理实验设备、预约和远程控制
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="设备管理标签页"
          >
            <Tab label="设备列表" />
            <Tab label="设备预约" />
            <Tab label="远程控制" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box>
            {devicesError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                获取设备列表失败，请重试
              </Alert>
            )}
            <DeviceList 
              devices={devicesData || []} 
              loading={devicesLoading}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box>
            {reservationsError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                获取预约列表失败，请重试
              </Alert>
            )}
            <DeviceReservations 
              reservations={reservationsData || []} 
              loading={reservationsLoading}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box>
            {devicesData && devicesData.length > 0 ? (
              <DeviceRemoteControl devices={devicesData} />
            ) : (
              <Alert severity="info">请先选择要控制的设备</Alert>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default DeviceManagement;
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
moreFiles.forEach(({ file, content }) => {
  rewriteFile(file, content);
});

console.log('\n🎉 第二批修复完成！');
console.log('已重写以下文件:');
moreFiles.forEach(({ file }) => {
  console.log(`  - ${file}`);
});
