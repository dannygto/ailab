import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Chip,
  Box,
  Divider
} from '@mui/material';

interface ExperimentInfo {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  createdAt: Date;
  parameters?: Record<string, any>;
  tags?: string[];
}

interface ExperimentInfoPanelProps {
  experiment: ExperimentInfo;
}

const ExperimentInfoPanel: React.FC<ExperimentInfoPanelProps> = ({ experiment }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return '运行中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      case 'pending': return '等待中';
      default: return status;
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        实验信息
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            {experiment.name}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {experiment.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={getStatusLabel(experiment.status)}
              color={getStatusColor(experiment.status) as any}
              size="small"
            />
            <Chip label={experiment.type} variant="outlined" size="small" />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            创建时间
          </Typography>
          <Typography variant="body2">
            {experiment.createdAt.toLocaleString()}
          </Typography>
        </Grid>

        {experiment.parameters && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              实验参数
            </Typography>
            <Box sx={{ 
              bgcolor: 'background.default', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <pre style={{ 
                margin: 0, 
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}>
                {JSON.stringify(experiment.parameters, null, 2)}
              </pre>
            </Box>
          </Grid>
        )}

        {experiment.tags && experiment.tags.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              标签
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {experiment.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default ExperimentInfoPanel;
