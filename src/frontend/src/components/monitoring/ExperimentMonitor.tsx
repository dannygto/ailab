import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress, 
  Chip, 
  Grid,
  Button,
  IconButton,
  Collapse,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tab,
  Tabs,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import { PlayArrowIcon } from '../../utils/icons';
import { PauseIcon } from '../../utils/icons';
import { StopIcon } from '../../utils/icons';
import { ExpandMoreIcon } from '../../utils/icons';
import { ExpandLessIcon } from '../../utils/icons';
import { RefreshIcon } from '../../utils/icons';
import { experimentService } from '../../services';
import { Experiment } from '../../types';

interface ExperimentMonitorProps {
  experiment: Experiment;
  onControl?: (action: 'start' | 'pause' | 'stop', experimentId: string) => void;
  RefreshIconInterval?: number; // ˢ�¼������λΪ����
  autoRefreshIcon?: boolean;    // �Ƿ��Զ�ˢ��
}

interface ExperimentExecution {
  id: string;
  status: 'preparing' | 'running' | 'paused' | 'completed' | 'failed' | 'CancelIconled';
  progress: number;
  logs: Array<{timestamp: Date; level: string; message: string}>;
  metrics?: {
    currentLoss?: number;
    currentAccuracy?: number;
    currentValLoss?: number;
    currentValAccuracy?: number;
    timeElapsed?: number;
    eta?: number;
    [key: string]: any;
  };
  startedAt?: Date;
  updatedAt?: Date;
}

const ExperimentMonitor: React.FC<ExperimentMonitorProps> = ({ 
  experiment, 
  onControl,
  RefreshIconInterval = 5000, // Ĭ��5��ˢ��һ��
  autoRefreshIcon = true 
}) => {
  const [executionData, setExecutionData] = useState<ExperimentExecution | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // ��ʽ��ʱ��
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleString();
  };

  // ��ȡʵ��ִ����Ϣ
  const fetchExecutionData = useCallback(async () => {
    if (!experiment?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // ����api��ȡʵ��ִ������
      const response = await experimentService.getExperimentExecution(experiment.id);
      
      if (response.success && response.data) {
        setExecutionData(response.data);
      } else {
        setError((response as any).error || '获取执行数据失败');
      }
    } catch (error: any) {
      console.error('��ȡʵ��ִ������ʧ��:', error);
      setError(error?.message || 'δ֪����');
    } finally {
      setLoading(false);
    }
  }, [experiment?.id]);

  // �������ư�ť���
  const handleControl = (action: 'start' | 'pause' | 'stop') => {
    if (onControl && experiment?.id) {
      onControl(action, experiment.id);
    }
  };

  // �Զ�ˢ��
  useEffect(() => {
    if (autoRefreshIcon && experiment?.status === 'running') {
      // �״μ�������
      fetchExecutionData();
      
      // ���ö�ʱˢ��
      const intervalId = setInterval(fetchExecutionData, RefreshIconInterval);
      
      // �����ʱ��
      return () => clearInterval(intervalId);
    }
  }, [autoRefreshIcon, experiment?.status, fetchExecutionData, RefreshIconInterval]);

  // ״̬��ɫӳ��
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'default',
      'ready': 'info',
      'running': 'primary',
      'paused': 'warning',
      'completed': 'success',
      'failed': 'error',
      'CancelIconled': 'error'
    };
    
    return statusMap[status] || 'default';
  };

  // ��ȡ����
  const getProgress = () => {
    if (executionData?.progress !== undefined) {
      return executionData.progress;
    }
    
    // ���û��ִ�����ݣ����Դ�experiment��ȡ
    const progress = (experiment as any).progress || 0;
    return progress;
  };

  // չ��/�۵�����
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // �л���ǩҳ
  const handleTabChange = (Event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // �ֶ�ˢ��
  const handleManualRefreshIcon = () => {
    fetchExecutionData();
  };

  return (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6">{experiment.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
              <Chip 
                size="small" 
                label={experiment.status} 
                color={getStatusColor(experiment.status) as any}
                sx={{ mr: 1 }}
              />
              {executionData?.startedAt && (
                <Typography variant="body2" sx={{ mr: 1 }}>
                  ��ʼ: {formatDate(executionData.startedAt)}
                </Typography>
              )}
              {executionData?.updatedAt && (
                <Typography variant="body2">
                  ����: {formatDate(executionData.updatedAt)}
                </Typography>
              )}
            </Box>
            <Box sx={{ mt: 1, mb: 1 }}>
              <Typography variant="body2">����: {Math.round(getProgress())}%</Typography>
              <LinearProgress 
                variant="determinate" 
                value={getProgress()} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {onControl && (
              <div>
                <Tooltip title="����ʵ��">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleControl('start')}
                    disabled={experiment.status === 'running' || experiment.status === 'completed'}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="��ͣʵ��">
                  <IconButton 
                    color="warning" 
                    onClick={() => handleControl('pause')}
                    disabled={experiment.status !== 'running'}
                  >
                    <PauseIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="ֹͣʵ��">
                  <IconButton 
                    color="error" 
                    onClick={() => handleControl('stop')}
                    disabled={experiment.status !== 'running' && experiment.status !== 'paused'}
                  >
                    <StopIcon />
                  </IconButton>
                </Tooltip>
              </div>
            )}
            
            <Tooltip title="�ֶ�ˢ��">
              <IconButton 
                color="primary" 
                onClick={handleManualRefreshIcon}
                sx={{ mr: 1 }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="text"
              size="small"
              onClick={toggleExpanded}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {expanded ? '��������' : '�鿴����'}
            </Button>
          </Grid>
        </Grid>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="experiment monitor tabs">
              <Tab label="ִ��ָ��" />
              <Tab label="ִ����־" />
            </Tabs>
          </Box>
          
          <Box sx={{ pt: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <>
                {activeTab === 0 && (
                  <Grid container spacing={2}>
                    {executionData?.metrics ? (
                      Object.entries(executionData.metrics).map(([key, value]) => (
                        <Grid item xs={12} sm={6} md={4} key={key}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="caption" color="textSecondary">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Typography>
                            <Typography variant="h6">
                              {typeof value === 'number' ? value.toFixed(4) : value?.toString() || 'N/A'}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Typography>�޿���ָ������</Typography>
                      </Grid>
                    )}
                  </Grid>
                )}
                
                {activeTab === 1 && (
                  <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List dense>
                      {executionData?.logs && executionData.logs.length > 0 ? (
                        executionData.logs.map((log, index) => (
                          <React.Fragment key={index}>
                            <ListItem>
                              <ListItemText
                                primary={log.message}
                                secondary={formatDate(log.timestamp)}
                                primaryTypographyProps={{
                                  color: log.level === 'error' ? 'error' : 'textPrimary',
                                  variant: 'body2'
                                }}
                              />
                            </ListItem>
                            {index < executionData.logs.length - 1 && <Divider component="li" />}
                          </React.Fragment>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="�޿�����־" />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                )}
              </>
            )}
          </Box>
        </Collapse>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperimentMonitor;


