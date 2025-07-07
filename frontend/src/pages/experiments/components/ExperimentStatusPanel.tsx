import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Button, 
  IconButton, 
  Stack,
  CircularProgress
} from '@mui/material';
import { PlayArrowIcon as PlayIcon, PauseIcon as PauseIcon, StopIcon as StopIcon, DeleteOutlineIcon as DeleteIcon, EditIcon as EditIcon, RefreshIcon as RefreshIcon, share as share, ArticleIcon as ReportIcon } from '../../../utils/icons';
import { Experiment } from '../../../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ExperimentStatusPanelProps {
  experiment: Experiment;
  onAction: (action: 'start' | 'pause' | 'stop' | 'delete' | 'edit' | 'refresh' | 'share' | 'report') => void;
  actionLoading: string | null;
}

// ��ʽ������
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString('zh-CN', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// ��ȡ״̬��ǩ��ɫ
const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'default';
    case 'ready': return 'info';
    case 'running': return 'primary';
    case 'paused': return 'warning';
    case 'completed': return 'success';
    case 'failed': return 'error';
    case 'StopIconped': return 'error';
    case 'CancelIconled': return 'error';
    case 'pending': return 'secondary';
    default: return 'default';
  }
};

// ��ȡ״̬�ı�
const getStatusText = (status: string) => {
  switch (status) {
    case 'draft': return '�ݸ�';
    case 'ready': return '����';
    case 'running': return '������';
    case 'paused': return '����ͣ';
    case 'completed': return '�����';
    case 'failed': return 'ʧ��';
    case 'StopIconped': return '��ֹͣ';
    case 'CancelIconled': return '��ȡ��';
    case 'pending': return '�ȴ���';
    default: return status;
  }
};

const ExperimentStatusPanel: React.FC<ExperimentStatusPanelProps> = ({
  experiment,
  onAction,
  actionLoading
}) => {
  return (
    <div 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        mb: 3
      }}
    >
      <div sx={{ mb: { xs: 2, md: 0 } }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip 
            label={getStatusText(experiment.status)} 
            color={getStatusColor(experiment.status) as any} 
            sx={{ fontWeight: 'bold' }}
          />
          
          {experiment.createdAt && (
            <Typography variant="body2" color="text.secondary">
              ������: {formatDate(experiment.createdAt)}
            </Typography>
          )}
          
          {experiment.startedAt && (
            <Typography variant="body2" color="text.secondary">
              ��ʼ��: {formatDate(experiment.startedAt)}
            </Typography>
          )}
          
          {experiment.completedAt && (
            <Typography variant="body2" color="text.secondary">
              �����: {formatDate(experiment.completedAt)}
            </Typography>
          )}
          
          {experiment.startedAt && !experiment.completedAt && experiment.status === 'running' && (
            <Typography variant="body2" color="text.secondary">
              ������: {formatDistanceToNow(new Date(experiment.startedAt), { locale: zhCN })}
            </Typography>
          )}
        </Stack>
      </div>
      
      <Stack direction="row" spacing={1}>
        {['draft', 'ready', 'paused', 'failed'].includes(experiment.status) && (
          <Button
            variant="contained"
            color="primary"
            startIcon={actionLoading === 'start' ? <CircularProgress size={20} color="inherit" /> : <PlayIcon />}
            onClick={() => onAction('start')}
            disabled={!!actionLoading}
          >
            {actionLoading === 'start' ? '������...' : '����'}
          </Button>
        )}
        
        {experiment.status === 'running' && (
          <>
            <Button
              variant="outlined"
              color="warning"
              startIcon={actionLoading === 'pause' ? <CircularProgress size={20} color="inherit" /> : <PauseIcon />}
              onClick={() => onAction('pause')}
              disabled={!!actionLoading}
            >
              {actionLoading === 'pause' ? '��ͣ��...' : '��ͣ'}
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={actionLoading === 'stop' ? <CircularProgress size={20} color="inherit" /> : <StopIcon />}
              onClick={() => onAction('stop')}
              disabled={!!actionLoading}
            >
              {actionLoading === 'stop' ? 'ֹͣ��...' : 'ֹͣ'}
            </Button>
          </>
        )}
        
        <IconButton 
          color="primary" 
          onClick={() => onAction('refresh')}
          disabled={!!actionLoading}
        >
          {actionLoading === 'refresh' ? <CircularProgress size={20} /> : <RefreshIcon />}
        </IconButton>
        
        <IconButton 
          color="info" 
          onClick={() => onAction('edit')}
          disabled={!!actionLoading || experiment.status === 'running'}
        >
          <EditIcon />
        </IconButton>
        
        <IconButton 
          color="secondary" 
          onClick={() => onAction('share')}
          disabled={!!actionLoading}
        >
          <ShareIcon />
        </IconButton>
        
        {experiment.status === 'completed' && (
          <IconButton 
            color="success" 
            onClick={() => onAction('report')}
            disabled={!!actionLoading}
          >
            <ReportIcon />
          </IconButton>
        )}
        
        <IconButton 
          color="error" 
          onClick={() => onAction('delete')}
          disabled={!!actionLoading}
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    </div>
  );
};

export default ExperimentStatusPanel;


