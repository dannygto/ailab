import React, { useState, useEffect, useRef } from 'react';
import { PlayArrowIcon, PauseIcon, StopIcon, RefreshIcon, ExpandMoreIcon, InfoIcon } from '../../../utils/icons';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Stack,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { experimentStatusService, ExperimentStatus } from '../../../services/experimentStatus.service';

interface ExperimentStatusPanelV2Props {
  experimentId: string;
  autoRefresh?: boolean;
  showDetails?: boolean;
  compact?: boolean;
}

const ExperimentStatusPanelV2: React.FC<ExperimentStatusPanelV2Props> = ({
  experimentId,
  autoRefresh = true,
  showDetails = true,
  compact = false
}) => {
  const [status, setStatus] = useState<ExperimentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controlLoading, setControlLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const statusSubscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!experimentId) return;

    setLoading(true);
    setError(null);

    // 订阅实验状态
    if (autoRefresh) {
      statusSubscriptionRef.current = experimentStatusService
        .getExperimentStatus(experimentId)
        .subscribe({
          next: (status) => {
            setStatus(status);
            setLoading(false);
            if (!status) {
              setError('无法获取实验状态');
            }
          },
          error: (error) => {
            console.error('获取实验状态失败:', error);
            setError('获取实验状态失败');
            setLoading(false);
          }
        });
    } else {
      // 只获取一次状态
      const cachedStatus = experimentStatusService.getCachedStatus(experimentId);
      if (cachedStatus) {
        setStatus(cachedStatus);
        setLoading(false);
      } else {
        experimentStatusService.refreshStatus(experimentId).then(() => {
          const refreshedStatus = experimentStatusService.getCachedStatus(experimentId);
          setStatus(refreshedStatus);
          setLoading(false);
        }).catch((error) => {
          setError('获取实验状态失败');
          setLoading(false);
        });
      }
    }

    return () => {
      if (statusSubscriptionRef.current) {
        statusSubscriptionRef.current.unsubscribe();
      }
    };
  }, [experimentId, autoRefresh]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'paused': return 'warning';
      case 'cancelled': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return '等待中';
      case 'running': return '运行中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      case 'paused': return '已暂停';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const handleControlAction = async (action: 'start' | 'pause' | 'stop' | 'cancel') => {
    if (!status) return;

    setControlLoading(true);
    try {
      await experimentStatusService.controlExperiment(experimentId, action);
    } catch (error) {
      console.error(`实验控制操作失败:`, error);
      setError(`操作失败: ${action}`);
    } finally {
      setControlLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await experimentStatusService.refreshStatus(experimentId);
    } catch (error) {
      setError('刷新状态失败');
    } finally {
      setLoading(false);
    }
  };

  const formatLogLevel = (level: string) => {
    switch (level) {
      case 'error': return { color: 'error', label: '错误' };
      case 'warning': return { color: 'warning', label: '警告' };
      case 'info': return { color: 'info', label: '信息' };
      case 'debug': return { color: 'secondary', label: '调试' };
      default: return { color: 'default', label: level };
    }
  };

  if (loading && !status) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              加载实验状态中...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error && !status) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Alert severity="error">
            {error}
            <Button size="small" onClick={handleRefresh} sx={{ ml: 2 }}>
              重试
            </Button>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Alert severity="warning">
            找不到实验状态信息
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={compact ? 2 : 3}>
          {/* 标题和刷新按钮 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant={compact ? "body1" : "h6"}>
              实验状态监控
            </Typography>
            <Stack direction="row" spacing={1}>
              {status.lastUpdated && (
                <Tooltip title={`最后更新: ${new Date(status.lastUpdated).toLocaleString()}`}>
                  <InfoIcon color="action" fontSize="small" />
                </Tooltip>
              )}
              <Tooltip title="刷新状态">
                <IconButton
                  onClick={handleRefresh}
                  size="small"
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* 基本信息 */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={compact ? 12 : 6}>
              <Typography variant="body2" color="text.secondary">
                实验 ID: {experimentId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={compact ? 12 : 6} sx={{ textAlign: { sm: compact ? 'left' : 'right' } }}>
              <Chip
                label={getStatusLabel(status.status)}
                color={getStatusColor(status.status)}
                variant="filled"
                size="small"
              />
            </Grid>
          </Grid>

          {/* 进度条 */}
          {status.status === 'running' && status.progress !== undefined && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  {status.currentStep ? `当前步骤: ${status.currentStep}` : '进度'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {status.completedSteps && status.totalSteps
                    ? `${status.completedSteps}/${status.totalSteps} (${Math.round(status.progress)}%)`
                    : `${Math.round(status.progress)}%`
                  }
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={status.progress}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          )}

          {/* 时间信息 */}
          {!compact && (status.startTime || status.endTime) && (
            <Grid container spacing={2}>
              {status.startTime && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    开始时间: {new Date(status.startTime).toLocaleString()}
                  </Typography>
                </Grid>
              )}
              {status.endTime && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    结束时间: {new Date(status.endTime).toLocaleString()}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}

          {/* 错误信息 */}
          {status.status === 'failed' && status.errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {status.errorMessage}
            </Alert>
          )}

          {/* 控制按钮 */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {status.status === 'pending' && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleControlAction('start')}
                disabled={controlLoading}
                size={compact ? "small" : "medium"}
              >
                开始
              </Button>
            )}

            {status.status === 'running' && (
              <React.Fragment>
                <Button
                  variant="outlined"
                  startIcon={<PauseIcon />}
                  onClick={() => handleControlAction('pause')}
                  disabled={controlLoading}
                  size={compact ? "small" : "medium"}
                >
                  暂停
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={() => handleControlAction('stop')}
                  disabled={controlLoading}
                  size={compact ? "small" : "medium"}
                >
                  停止
                </Button>
              </React.Fragment>
            )}

            {status.status === 'paused' && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleControlAction('start')}
                disabled={controlLoading}
                size={compact ? "small" : "medium"}
              >
                继续
              </Button>
            )}

            {controlLoading && (
              <CircularProgress size={20} sx={{ ml: 1 }} />
            )}
          </Stack>

          {/* 详细信息 */}
          {showDetails && !compact && (
            <Stack spacing={2}>
              {/* 资源使用情况 */}
              {status.resources && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">资源使用情况</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {status.resources.cpu !== undefined && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">CPU</Typography>
                          <Typography variant="body1">{status.resources.cpu.toFixed(1)}%</Typography>
                        </Grid>
                      )}
                      {status.resources.memory !== undefined && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">内存</Typography>
                          <Typography variant="body1">{status.resources.memory.toFixed(1)}%</Typography>
                        </Grid>
                      )}
                      {status.resources.gpu !== undefined && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">GPU</Typography>
                          <Typography variant="body1">{status.resources.gpu.toFixed(1)}%</Typography>
                        </Grid>
                      )}
                      {status.resources.disk !== undefined && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">磁盘</Typography>
                          <Typography variant="body1">{status.resources.disk.toFixed(1)}%</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* 实验日志 */}
              {status.logs && status.logs.length > 0 && (
                <Accordion expanded={showLogs} onChange={(_, expanded) => setShowLogs(expanded)}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      实验日志 ({status.logs.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {status.logs.slice(0, 50).map((log, index) => {
                        const logFormat = formatLogLevel(log.level);
                        return (
                          <ListItem key={index} divider>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={logFormat.label}
                                    size="small"
                                    color={logFormat.color as any}
                                    variant="outlined"
                                  />
                                  <Typography variant="body2">
                                    {log.message}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(log.timestamp).toLocaleString()}
                                  {log.source && ` • ${log.source}`}
                                </Typography>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* 实验指标 */}
              {status.metrics && status.metrics.length > 0 && (
                <Accordion expanded={showMetrics} onChange={(_, expanded) => setShowMetrics(expanded)}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">
                      实验指标 ({status.metrics.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>指标名称</TableCell>
                            <TableCell align="right">数值</TableCell>
                            <TableCell>单位</TableCell>
                            <TableCell>类别</TableCell>
                            <TableCell>时间</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {status.metrics.slice(0, 20).map((metric, index) => (
                            <TableRow key={index}>
                              <TableCell>{metric.name}</TableCell>
                              <TableCell align="right">{metric.value}</TableCell>
                              <TableCell>{metric.unit || '-'}</TableCell>
                              <TableCell>{metric.category || '-'}</TableCell>
                              <TableCell>
                                {new Date(metric.timestamp).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ExperimentStatusPanelV2;
