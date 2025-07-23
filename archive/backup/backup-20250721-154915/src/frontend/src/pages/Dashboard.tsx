import React, { useState, Fragment } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { RefreshIcon, ExperimentIcon, DeviceIcon, ChatIcon } from '../utils/icons';
import { useQuery } from 'react-query';
import api from '../services/api';
import { DashboardStats } from '../types';
import QuickStartGuide from '../components/guides/QuickStartGuide';

interface RecentExperiment {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
}

const Dashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery('dashboardStats', async (): Promise<DashboardStats> => {
    try {
      const response = await api.getDashboardStats();
      return response || {
        runningExperiments: 0,
        completedExperiments: 0,
        totalExperiments: 0,
        totalDevices: 0,
        activeDevices: 0,
        systemHealth: {
          status: 'healthy' as const,
          uptime: 0,
          lastCheck: '',
          services: {},
          cpu: 0,
          memory: 0,
          disk: 0
        }
      };
    } catch (error) {
      console.error('获取仪表板统计失败:', error);
      return {
        runningExperiments: 0,
        completedExperiments: 0,
        totalExperiments: 0,
        totalDevices: 0,
        activeDevices: 0,
        systemHealth: {
          status: 'healthy' as const,
          uptime: 0,
          lastCheck: '',
          services: {},
          cpu: 0,
          memory: 0,
          disk: 0
        }
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
      return response || [];
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
  const error = (statsError || experimentsError) as Error | null;

  return (
    <Fragment>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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

        {/* 标签页 */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(event, newValue) => setTabValue(newValue)}
            aria-label="仪表板标签页"
          >
            <Tab label="数据统计" />
            <Tab label="快速开始" />
          </Tabs>
        </Paper>
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
          {/* 数据统计标签页 */}
          {tabValue === 0 && (
            <Box sx={{ p: 3 }}>
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
            </Box>
          )}

          {/* 快速开始标签页 */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <QuickStartGuide />
            </Box>
          )}
        </>
      )}
    </Fragment>
  );
};

export default Dashboard;
