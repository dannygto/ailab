import React, { useState, useEffect } from 'react';
import { PlayArrowIcon as PlayArrowIcon, PauseIcon as PauseIcon, StopIcon as StopIcon, RefreshIcon as RefreshIcon } from '..\..\..\utils/icons';
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
  Grid
} from '@mui/material';
;

interface ExperimentStatusPanelProps {
  experimentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress?: number;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onRefresh?: () => void;
}

const ExperimentStatusPanel: React.FC<ExperimentStatusPanelProps> = ({
  experimentId,
  status,
  progress = 0,
  onStart,
  onPause,
  onStop,
  onRefresh
}) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentProgress, setCurrentProgress] = useState(progress);

  useEffect(() => {
    setCurrentStatus(status);
    setCurrentProgress(progress);
  }, [status, progress]);

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (currentStatus) {
      case 'pending': return '等待中';
      case 'running': return '运行中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      case 'paused': return '已暂停';
      default: return '未知';
    }
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              实验状态监控
            </Typography>
            <Tooltip title="刷新状态">
              <IconButton onClick={onRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                实验 ID: {experimentId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
              <Chip
                label={getStatusLabel()}
                color={getStatusColor()}
                variant="filled"
                size="small"
              />
            </Grid>
          </Grid>

          {currentStatus === 'running' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  进度
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(currentProgress)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={currentProgress} 
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          )}

          {currentStatus === 'failed' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              实验执行失败，请检查实验配置或联系管理员
            </Alert>
          )}

          <Stack direction="row" spacing={1}>
            {currentStatus === 'pending' && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={onStart}
                size="small"
              >
                开始
              </Button>
            )}
            
            {currentStatus === 'running' && (
              <React.Fragment>
                <Button
                  variant="outlined"
                  startIcon={<PauseIcon />}
                  onClick={onPause}
                  size="small"
                >
                  暂停
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={onStop}
                  size="small"
                >
                  停止
                </Button>
              </React.Fragment>
            )}

            {currentStatus === 'paused' && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={onStart}
                size="small"
              >
                继续
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ExperimentStatusPanel;
