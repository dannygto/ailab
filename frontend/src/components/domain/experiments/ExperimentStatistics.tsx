import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tooltip,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DownloadIcon } from '../../../utils/icons';
import { RefreshIcon } from '../../../utils/icons';
import { CalendarTodayIcon } from '../../../utils/icons';
import { TrendingUpIcon } from '../../../utils/icons';
import { AssignmentTurnedInIcon } from '../../../utils/icons';
import { ErrorOutlineIcon } from '../../../utils/icons';

// ��������һ��api����
const experimentService = {
  getExperimentStats: async (timeRange: string) => {
    // ģ��api����
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: {
            total: 125,
            completed: 98,
            running: 12,
            failed: 8,
            pending: 7
          },
          byType: {
            cognitive: 45,
            behavioral: 38,
            neurological: 27,
            physiological: 15
          },
          recentTrends: {
            completionRate: [
              { period: '1��', rate: 82 },
              { period: '2��', rate: 85 },
              { period: '3��', rate: 79 },
              { period: '4��', rate: 88 },
              { period: '5��', rate: 91 },
              { period: '6��', rate: 94 }
            ],
            averageDuration: [
              { period: '1��', minutes: 68 },
              { period: '2��', minutes: 72 },
              { period: '3��', minutes: 65 },
              { period: '4��', minutes: 59 },
              { period: '5��', minutes: 62 },
              { period: '6��', minutes: 58 }
            ],
            experimentCounts: [
              { period: '1��', count: 18 },
              { period: '2��', count: 22 },
              { period: '3��', count: 19 },
              { period: '4��', count: 25 },
              { period: '5��', count: 21 },
              { period: '6��', count: 20 }
            ]
          }
        });
      }, 800);
    });
  }
};

interface ExperimentStatisticsProps {
  /** ��ѡ���Զ������ */
  title?: string;
  /** ��ѡ��ʵ��ID������ */
  experimentId?: number;
  /** ��ѡ��ʵ�����͹����� */
  experimentType?: string;
  /** �����û�ѡ��ʱ�䷶Χ */
  enableTimeRangeSelection?: boolean;
  /** Ĭ����ʾ��ʱ�䷶Χ */
  defaultTimeRange?: '30d' | '90d' | '6m' | '1y';
  /** ��ѡ���Զ���CSS�� */
  className?: string;
}

/**
 * ʵ��ͳ�����
 * 
 * ��ʾʵ�����ݵ�ͳ����Ϣ�Ϳ��ӻ�ͼ��������ʵ������ʡ�
 * ƽ��ʱ���������ͷֲ������ݡ�֧��ʱ�䷶Χѡ������ݵ�����
 */
const ExperimentStatistics: React.FC<ExperimentStatisticsProps> = ({
  title = 'ʵ��ͳ�Ʒ���',
  experimentId,
  experimentType,
  enableTimeRangeSelection = true,
  defaultTimeRange = '6m',
  className
}) => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState<string>(defaultTimeRange);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [RefreshIconing, setRefreshIconing] = useState<boolean>(false);

  // ��ȡͳ������
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await experimentService.getExperimentStats(timeRange);
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError('�޷�����ͳ�����ݣ����Ժ�����');
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  // ����ʱ�䷶Χ���
  const handleTimeRangeChange = (Event: SelectChangeEvent<string>) => {
    setTimeRange(Event.target.value);
  };

  // ˢ������
  const handleRefreshIcon = async () => {
    if (RefreshIconing) return;
    
    setRefreshIconing(true);
    try {
      const data = await experimentService.getExperimentStats(timeRange);
      setStats(data);
    } catch (err) {
      setError('ˢ������ʧ�ܣ����Ժ�����');
    } finally {
      setRefreshIconing(false);
    }
  };

  // ���������
  const completionRate = useMemo(() => {
    if (!stats?.summary) return 0;
    return Math.round((stats.summary.completed / stats.summary.total) * 100);
  }, [stats]);

  // ����ʵ�����ͷֲ�
  const typeDistribution = useMemo(() => {
    if (!stats?.byType) return [];
    
    return Object.entries(stats.byType).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((Number(count) / stats.summary.total) * 100)
    }));
  }, [stats]);

  // ���·ݸ�ʽ����������
  const formattedTrends = useMemo(() => {
    if (!stats?.recentTrends) return {
      completionRate: [],
      averageDuration: [],
      experimentCounts: []
    };
    
    return stats.recentTrends;
  }, [stats]);

  if (loading) {
    return (
      <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">{title}</Typography>
        <div sx={{ display: 'flex', alignItems: 'center' }}>
          {enableTimeRangeSelection && (
            <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>ʱ�䷶Χ</InputLabel>
              <Select
                value={timeRange}
                label="ʱ�䷶Χ"
                onChange={handleTimeRangeChange}
              >
                <MenuItem value="30d">30��</MenuItem>
                <MenuItem value="90d">90��</MenuItem>
                <MenuItem value="6m">6����</MenuItem>
                <MenuItem value="1y">1��</MenuItem>
              </Select>
            </FormControl>
          )}
          <Tooltip title="ˢ������">
            <IconButton onClick={handleRefreshIcon} disabled={RefreshIconing}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="��������">
            <IconButton>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* ͳ��ժҪ��Ƭ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <div sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <div
                  sx={{
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <CalendarTodayIcon sx={{ color: 'white' }} />
                </div>
                <Typography variant="h6">��ʵ����</Typography>
              </div>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {stats.summary.total}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <div component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  +{formattedTrends.experimentCounts[formattedTrends.experimentCounts.length - 1].count}
                </div>{' '}
                ��������
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <div sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <div
                  sx={{
                    bgcolor: 'success.main',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <AssignmentTurnedInIcon sx={{ color: 'white' }} />
                </div>
                <Typography variant="h6">�����</Typography>
              </div>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.summary.completed} �������ʵ��
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <div sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <div
                  sx={{
                    bgcolor: 'info.main',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <TrendingUpIcon sx={{ color: 'white' }} />
                </div>
                <Typography variant="h6">ƽ��ʱ��</Typography>
              </div>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {formattedTrends.averageDuration[formattedTrends.averageDuration.length - 1].minutes}����
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ������
                <div 
                  component="span" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: formattedTrends.averageDuration[formattedTrends.averageDuration.length - 1].minutes < 
                          formattedTrends.averageDuration[formattedTrends.averageDuration.length - 2].minutes 
                      ? 'success.main' : 'error.main'
                  }}
                >
                  {' '}
                  {formattedTrends.averageDuration[formattedTrends.averageDuration.length - 1].minutes < 
                    formattedTrends.averageDuration[formattedTrends.averageDuration.length - 2].minutes ? '����' : '����'}{' '}
                  {Math.abs(formattedTrends.averageDuration[formattedTrends.averageDuration.length - 1].minutes - 
                    formattedTrends.averageDuration[formattedTrends.averageDuration.length - 2].minutes)}����
                </div>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <div sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <div
                  sx={{
                    bgcolor: 'warning.main',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <ErrorOutlineIcon sx={{ color: 'white' }} />
                </div>
                <Typography variant="h6">ʧ����</Typography>
              </div>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {Math.round((stats.summary.failed / stats.summary.total) * 100)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {stats.summary.failed} ��ʧ��ʵ��
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* ʵ����������� */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              ʵ�����������
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <div sx={{ height: 250, p: 1 }}>
              {/* ģ��ͼ��չʾ */}
              <div sx={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                {formattedTrends.completionRate.map((item: any, index: number) => (
                  <div 
                    key={index} 
                    sx={{ 
                      flex: 1,
                      mx: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <div 
                      sx={{ 
                        height: `${item.rate * 2}px`, 
                        width: '100%', 
                        bgcolor: `${theme.palette.primary.main}`,
                        borderRadius: '4px 4px 0 0'
                      }} 
                    />
                    <Typography variant="caption" sx={{ mt: 0.5 }}>
                      {item.period}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {item.rate}%
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </Paper>
        </Grid>

        {/* ʵ�����ͷֲ� */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              ʵ�����ͷֲ�
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <div sx={{ p: 1 }}>
              {typeDistribution.map((item, index) => (
                <div key={index} sx={{ mb: 2 }}>
                  <div sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {item.type}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      <>{item.count} ({item.percentage}%)</>
                    </Typography>
                  </div>
                  <div sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1, height: 8 }}>
                    <div
                      sx={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        borderRadius: 1,
                        bgcolor: 
                          index === 0 ? 'primary.main' : 
                          index === 1 ? 'success.main' : 
                          index === 2 ? 'info.main' : 'warning.main'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Paper>
        </Grid>

        {/* ʵ���������� */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              ʵ����������
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <div sx={{ height: 250, p: 1 }}>
              {/* ģ��ͼ��չʾ */}
              <div sx={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                {formattedTrends.experimentCounts.map((item: any, index: number) => (
                  <div 
                    key={index} 
                    sx={{ 
                      flex: 1,
                      mx: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <div 
                      sx={{ 
                        height: `${item.count * 8}px`, 
                        width: '100%', 
                        bgcolor: `${theme.palette.info.main}`,
                        borderRadius: '4px 4px 0 0'
                      }} 
                    />
                    <Typography variant="caption" sx={{ mt: 0.5 }}>
                      {item.period}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {item.count}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </Paper>
        </Grid>

        {/* ʵ��ƽ��ʱ�� */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              ʵ��ƽ��ʱ��
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <div sx={{ height: 250, p: 1 }}>
              {/* ģ��ͼ��չʾ */}
              <div sx={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                {formattedTrends.averageDuration.map((item: any, index: number) => (
                  <div 
                    key={index} 
                    sx={{ 
                      flex: 1,
                      mx: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <div 
                      sx={{ 
                        height: `${item.minutes * 3}px`, 
                        width: '100%', 
                        bgcolor: `${theme.palette.warning.main}`,
                        borderRadius: '4px 4px 0 0'
                      }} 
                    />
                    <Typography variant="caption" sx={{ mt: 0.5 }}>
                      {item.period}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      {item.minutes}����
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default ExperimentStatistics;


