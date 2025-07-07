import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  LinearProgress, 
  Chip, 
  Grid, 
  Button, 
  Card,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { PlayArrowIcon as PlayIcon, StopIcon as StopIcon, RefreshIcon as RefreshIcon, ArrowForwardIcon as DownloadIcon, PauseIcon as PauseIcon } from '../../../utils/icons';
import { experimentService } from '../../../services';

interface ExecutionMonitorProps {
  experimentId: string;
  onStatusChange?: (status: string) => void;
  readOnly?: boolean;
}

// ִ��״̬����
type ExecutionStatus = 'idle' | 'preparing' | 'running' | 'paused' | 'completed' | 'failed' | 'terminated';

// ִ����־��Ŀ
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source?: string;
}

// ��Դʹ�����
interface ResourceUsage {
  cpu: number; // �ٷֱ�
  MemoryIcon: number; // �ٷֱ�
  runtime: number; // ��
}

const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({ 
  experimentId, 
  onStatusChange,
  readOnly = false
}) => {
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [resources, setResources] = useState<ResourceUsage>({ cpu: 0, MemoryIcon: 0, runtime: 0 });
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [autoRefreshIcon, setAutoRefreshIcon] = useState<boolean>(true);
  
  const logContainerRef = useRef<HTMLDivElement>(null);
  const statusCheckIconInterval = useRef<NodeJS.Timeout | null>(null);
  const lastLogTimestamp = useRef<string | null>(null);
  
  // ��ȡʵ��ִ��״̬
  const fetchExecutionStatus = useCallback(async () => {
    try {
      const response = await experimentService.getExperiment(experimentId);
      
      if (response.success && response.data) {
        const experimentData = response.data;
        const currentStatus = experimentData.status as ExecutionStatus;
        
        setStatus(currentStatus);
        
        if (onStatusChange && currentStatus !== status) {
          onStatusChange(currentStatus);
        }
        
        // �������
        if (experimentData.progress !== undefined) {
          setProgress(experimentData.progress);
        } else if (currentStatus === 'completed') {
          setProgress(100);
        } else if (currentStatus === 'idle') {
          setProgress(0);
        }
        
        // ������Դʹ��
        if (experimentData.resources) {
          setResources({
            cpu: experimentData.resources.cpu || 0,
            MemoryIcon: experimentData.resources.MemoryIcon || 0,
            runtime: experimentData.resources.runtime || 0
          });
        }
      }
    } catch (err) {
      console.error('��ȡʵ��״̬ʧ��:', err);
      setError('�޷���ȡʵ��ִ��״̬');
    }
  }, [experimentId, onStatusChange, status]);
  
  // ��ȡִ����־
  const fetchExecutionLogs = useCallback(async () => {
    try {
      const params: any = { limit: 100 };
      
      // ֻ��ȡ����־
      if (lastLogTimestamp.current) {
        params.after = lastLogTimestamp.current;
      }
      
      // ʹ��experimentService.getExperimentLogs����
      const response = await experimentService.getExperimentResults(experimentId);
      
      if (response.success && response.data && response.data.logs && response.data.logs.length > 0) {
        const newLogs = response.data.logs;
        
        if (newLogs.length > 0) {
          // ���������־ʱ���
          lastLogTimestamp.current = newLogs[newLogs.length - 1].timestamp;
          
          // ��������־
          setLogs(prevLogs => [...prevLogs, ...newLogs]);
          
          // �Զ��������ײ�
          if (autoScroll && logContainerRef.current) {
            setTimeout(() => {
              if (logContainerRef.current) {
                logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
              }
            }, 100);
          }
        }
      }
    } catch (err) {
      console.error('��ȡʵ����־ʧ��:', err);
    }
  }, [experimentId, autoScroll]);
  
  // ����ʵ��
  const handleStart = async () => {
    try {
      setError(null);
      const response = await experimentService.startExperiment(experimentId);
      
      if (response.success) {
        setStatus('preparing');
        setProgress(0);
        fetchExecutionStatus();
        fetchExecutionLogs();
      } else {
        setError('����ʵ��ʧ��');
      }
    } catch (err) {
      console.error('����ʵ�����:', err);
      setError('����ʵ��ʱ���ִ���');
    }
  };
  
  // ��ͣʵ��
  const handlePauseIcon = async () => {
    try {
      // ʹ�ù���api����������ֱ��post
      // ģ��ʹ��experimentService.PauseIconExperiment����
      // ʵ����Ŀ��Ӧ��ʵ�����������������ʱʹ�ý����ģ��
      setStatus('paused');
      
      // ģ����ͣ�ɹ�
      setError(null);
    } catch (err) {
      console.error('��ͣʵ�����:', err);
      setError('��ͣʵ��ʱ���ִ���');
    }
  };
  
  // ֹͣʵ��
  const handleStopIcon = async () => {
    try {
      const response = await experimentService.stopExperiment(experimentId);
      
      if (response.success) {
        setStatus('terminated');
      } else {
        setError('ֹͣʵ��ʧ��');
      }
    } catch (err) {
      console.error('ֹͣʵ�����:', err);
      setError('ֹͣʵ��ʱ���ִ���');
    }
  };
  
  // ������־
  const handleDownloadLogs = () => {
    if (logs.length === 0) return;
    
    const logText = logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.source ? `[${log.source}] ` : ''}${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_${experimentId}_logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // �����־
  const handleClearLogs = () => {
    setLogs([]);
    lastLogTimestamp.current = null;
  };
  
  // �Զ�ˢ��״̬
  useEffect(() => {
    fetchExecutionStatus();
    fetchExecutionLogs();
    
    if (autoRefreshIcon) {
      statusCheckIconInterval.current = setInterval(() => {
        fetchExecutionStatus();
        
        // ֻ����ִ���вŲ��ϻ�ȡ��־
        if (status === 'preparing' || status === 'running') {
          fetchExecutionLogs();
        }
      }, 3000);
    } else if (statusCheckIconInterval.current) {
      clearInterval(statusCheckIconInterval.current);
      statusCheckIconInterval.current = null;
    }
    
    return () => {
      if (statusCheckIconInterval.current) {
        clearInterval(statusCheckIconInterval.current);
      }
    };
  }, [experimentId, autoRefreshIcon, status, fetchExecutionStatus, fetchExecutionLogs]);
  
  // ״̬��ɫ
  const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
      case 'idle': return 'default';
      case 'preparing': return 'info';
      case 'running': return 'primary';
      case 'paused': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'terminated': return 'error';
      default: return 'default';
    }
  };
  
  // ��־������ɫ
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'info': return '#2196f3';
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      case 'debug': return '#9e9e9e';
      default: return 'inherit';
    }
  };
  
  // ��ʽ��ʱ��
  const formatRuntime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">ʵ��ִ��״̬</Typography>
              <Chip 
                label={status === 'idle' ? 'δ��ʼ' : 
                      status === 'preparing' ? '׼����' : 
                      status === 'running' ? 'ִ����' : 
                      status === 'paused' ? '����ͣ' : 
                      status === 'completed' ? '�����' : 
                      status === 'terminated' ? '����ֹ' : 'ִ��ʧ��'}
                color={getStatusColor(status) as any}
              />
            </div>
            
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">CPU ʹ����</Typography>
                <Typography variant="h6">{resources.cpu.toFixed(1)}%</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">�ڴ�ʹ����</Typography>
                <Typography variant="h6">{resources.MemoryIcon.toFixed(1)}%</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">ִ��ʱ��</Typography>
                <Typography variant="h6">{formatRuntime(resources.runtime)}</Typography>
              </Grid>
            </Grid>
            
            {!readOnly && (
              <div sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {status === 'idle' || status === 'terminated' || status === 'failed' ? (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<PlayIcon />}
                    onClick={handleStart}
                  >
                    ����ʵ��
                  </Button>
                ) : status === 'running' ? (
                  <>
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      startIcon={<PauseIcon />}
                      onClick={handlePauseIcon}
                    >
                      ��ͣ
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<StopIcon />}
                      onClick={handleStopIcon}
                    >
                      ֹͣ
                    </Button>
                  </>
                ) : status === 'paused' ? (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<PlayIcon />}
                      onClick={handleStart}
                    >
                      ����
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      startIcon={<StopIcon />}
                      onClick={handleStopIcon}
                    >
                      ֹͣ
                    </Button>
                  </>
                ) : null}
                
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    fetchExecutionStatus();
                    fetchExecutionLogs();
                  }}
                >
                  ˢ��
                </Button>
              </div>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <div sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 2, 
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)' 
            }}>
              <Typography variant="h6">ִ����־</Typography>
              <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      size="small" 
                      checked={autoScroll} 
                      onChange={e => setAutoScroll(e.target.checked)} 
                    />
                  }
                  label={
                    <Typography variant="body2">�Զ�����</Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch 
                      size="small" 
                      checked={autoRefreshIcon} 
                      onChange={e => setAutoRefreshIcon(e.target.checked)} 
                    />
                  }
                  label={
                    <Typography variant="body2">�Զ�ˢ��</Typography>
                  }
                />
                <Tooltip title="������־">
                  <IconButton onClick={handleDownloadLogs} disabled={logs.length === 0}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="�����־">
                  <IconButton onClick={handleClearLogs} disabled={logs.length === 0}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            
            <div 
              ref={logContainerRef}
              sx={{ 
                height: 400, 
                overflow: 'auto',
                p: 2,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                bgcolor: '#f5f5f5'
              }}
            >
              {logs.length === 0 ? (
                <div sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                  <VisibilityOffIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                  <Typography>����ִ����־</Typography>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} sx={{ mb: 0.5 }}>
                    <span style={{ color: '#666' }}>[{new Date(log.timestamp).toLocaleString()}]</span>
                    <span style={{ 
                      color: getLogLevelColor(log.level), 
                      fontWeight: log.level === 'error' ? 'bold' : 'normal',
                      marginLeft: 8
                    }}>
                      [{log.level.toUpperCase()}]
                    </span>
                    {log.source && (
                      <span style={{ color: '#0288d1', marginLeft: 8 }}>
                        [{log.source}]
                      </span>
                    )}
                    <span style={{ marginLeft: 8 }}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default ExecutionMonitor;


