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
  Tabs,
  Tab
} from '@mui/material';
import { RefreshIcon, ExperimentIcon, DeviceIcon, ChatIcon } from '../utils/icons';
import { useQuery } from 'react-query';
import api from '../services/api';
import { DashboardStats } from '../types';
import QuickStartGuide from '../components/guides/QuickStartGuide';
import LoadingState from '../components/common/ui/LoadingState';
import DataContainer from '../components/common/ui/DataContainer';

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
        }
      };
    } catch (error) {
      console.error('获取仪表板统计信息失败:', error);
      throw error;
    }
  });

  const {
    data: experiments,
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

        {/* 使用LoadingState组件处理加载状态 */}
        <LoadingState
          loading={isLoading}
          error={error?.message}
          isEmpty={!isLoading && !error && (!stats || (experiments && experiments.length === 0))}
          emptyMessage="暂无数据可供显示"
          onRetry={handleRefresh}
          skeletonProps={{ type: 'card', rows: 4 }}
        >
          {/* 数据统计标签页 */}
          {tabValue === 0 && (
            <Box sx={{ p: 1 }}>
              <Grid container spacing={3}>
                {/* 统计卡片 */}
                <Grid item xs={12} sm={6} md={3}>
                  <DataContainer title="运行中实验" showRefresh={false}>
                    <Typography variant="h4">{stats?.runningExperiments || 0}</Typography>
                  </DataContainer>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DataContainer title="已完成实验" showRefresh={false}>
                    <Typography variant="h4">{stats?.completedExperiments || 0}</Typography>
                  </DataContainer>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DataContainer title="实验总数" showRefresh={false}>
                    <Typography variant="h4">{stats?.totalExperiments || 0}</Typography>
                  </DataContainer>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DataContainer title="活跃设备" showRefresh={false}>
                    <Typography variant="h4">{stats?.activeDevices || 0}</Typography>
                  </DataContainer>
                </Grid>

                {/* 系统健康状态 */}
                <Grid item xs={12}>
                  <DataContainer
                    title="系统健康状态"
                    showRefresh
                    onRefresh={handleRefresh}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        状态: {stats?.systemHealth?.status === 'healthy' ? '正常' : '异常'}
                      </Typography>
                      <Typography variant="body2">
                        运行时间: {stats?.systemHealth?.uptime ? `${Math.floor(stats.systemHealth.uptime / 86400)}天` : '未知'}
                      </Typography>
                      <Typography variant="body2">
                        最后检查: {stats?.systemHealth?.lastCheck || '未知'}
                      </Typography>
                    </Box>
                  </DataContainer>
                </Grid>

                {/* 最近实验 */}
                <Grid item xs={12}>
                  <DataContainer
                    title="最近实验"
                    showRefresh
                    onRefresh={handleRefresh}
                  >
                    {experiments && experiments.length > 0 ? (
                      <Box>
                        {experiments.map((experiment) => (
                          <Box
                            key={experiment.id}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              p: 1,
                              borderBottom: '1px solid #eee'
                            }}
                          >
                            <Typography>{experiment.name}</Typography>
                            <Typography color={
                              experiment.status === 'running' ? 'primary' :
                              experiment.status === 'completed' ? 'success.main' :
                              'text.secondary'
                            }>
                              {experiment.status === 'running' ? '运行中' :
                               experiment.status === 'completed' ? '已完成' :
                               experiment.status}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        暂无最近实验
                      </Typography>
                    )}
                  </DataContainer>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* 快速开始标签页 */}
          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <QuickStartGuide />
            </Box>
          )}
        </LoadingState>
      </Box>
    </Fragment>
  );
};

export default Dashboard;
