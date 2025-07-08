const fs = require('fs');
const path = require('path');

console.log('开始修复 ExecutionMonitor.tsx...');

const filePath = path.join(__dirname, 'src/components/experiments/execution/ExecutionMonitor.tsx');

// 完全重写修复的内容
const fixedContent = `import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  Collapse,
  CircularProgress
} from '@mui/material';
import {
  PlayArrowIcon,
  PauseIcon,
  StopIcon,
  RefreshIcon,
  DownloadIcon,
  ClearIcon
} from '../../utils/icons';

interface ExecutionMonitorProps {
  experimentId?: string;
  className?: string;
}

interface ExecutionStatus {
  status: 'running' | 'paused' | 'stopped' | 'completed' | 'error';
  progress: number;
  duration: number;
  cpuUsage: number;
  memoryUsage: number;
  logs: LogEntry[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  experimentId,
  className
}) => {
  const [execution, setExecution] = useState<ExecutionStatus>({
    status: 'stopped',
    progress: 0,
    duration: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    logs: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showLogs, setShowLogs] = useState(true);

  const handleStart = async () => {
    try {
      setLoading(true);
      // 模拟启动实验
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExecution(prev => ({ ...prev, status: 'running' }));
    } catch (err) {
      setError('启动实验失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setExecution(prev => ({ ...prev, status: 'paused' }));
    } catch (err) {
      setError('暂停实验失败');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setExecution(prev => ({ 
        ...prev, 
        status: 'stopped',
        progress: 0 
      }));
    } catch (err) {
      setError('停止实验失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLogs = () => {
    console.log('下载日志');
  };

  const handleClearLogs = () => {
    setExecution(prev => ({ ...prev, logs: [] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'paused':
        return 'warning';
      case 'stopped':
        return 'default';
      case 'completed':
        return 'primary';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'paused':
        return '已暂停';
      case 'stopped':
        return '已停止';
      case 'completed':
        return '已完成';
      case 'error':
        return '错误';
      default:
        return status;
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && execution.status === 'running') {
      interval = setInterval(() => {
        setExecution(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 5, 100),
          duration: prev.duration + 1,
          cpuUsage: Math.random() * 100,
          memoryUsage: Math.random() * 100,
          logs: [
            ...prev.logs.slice(-10),
            {
              id: Date.now().toString(),
              timestamp: new Date().toLocaleTimeString(),
              level: 'info',
              message: \`实验执行中... 进度: \${Math.floor(prev.progress)}%\`
            }
          ]
        }));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, execution.status]);

  if (error) {
    return (
      <React.Fragment>
        <Alert severity="error">{error}</Alert>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Box sx={{ width: '100%' }}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6">实验执行状态</Typography>
              
              <Box sx={{ mt: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    状态:
                  </Typography>
                  <Chip 
                    label={getStatusText(execution.status)}
                    color={getStatusColor(execution.status) as any}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    执行进度: {execution.progress.toFixed(1)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={execution.progress}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">CPU 使用率</Typography>
                    <Typography variant="h6">{execution.cpuUsage.toFixed(1)}%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">内存使用率</Typography>
                    <Typography variant="h6">{execution.memoryUsage.toFixed(1)}%</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">执行时间</Typography>
                    <Typography variant="h6">{execution.duration}s</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStart}
                  disabled={loading || execution.status === 'running'}
                  fullWidth
                >
                  启动
                </Button>
                
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<PauseIcon />}
                  onClick={handlePause}
                  disabled={loading || execution.status !== 'running'}
                  fullWidth
                >
                  暂停
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={handleStop}
                  disabled={loading || execution.status === 'stopped'}
                  fullWidth
                >
                  停止
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">执行日志</Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoRefresh}
                          onChange={(e) => setAutoRefresh(e.target.checked)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">自动刷新</Typography>}
                    />
                    
                    <Tooltip title="下载日志">
                      <IconButton onClick={handleDownloadLogs} disabled={execution.logs.length === 0}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="清空日志">
                      <IconButton onClick={handleClearLogs} disabled={execution.logs.length === 0}>
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Collapse in={showLogs}>
                  <Box sx={{ 
                    maxHeight: 300, 
                    overflow: 'auto',
                    bgcolor: 'grey.50',
                    p: 2,
                    borderRadius: 1,
                    fontFamily: 'monospace'
                  }}>
                    {execution.logs.length > 0 ? (
                      execution.logs.map((log) => (
                        <Box key={log.id} sx={{ mb: 0.5 }}>
                          <Typography variant="caption" component="span">
                            [{log.timestamp}] [{log.level.toUpperCase()}] {log.message}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography>暂无执行日志</Typography>
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </React.Fragment>
  );
};

export default ExecutionMonitor;
`;

try {
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  console.log('✓ ExecutionMonitor.tsx 修复完成');
} catch (error) {
  console.error('修复失败:', error);
}
