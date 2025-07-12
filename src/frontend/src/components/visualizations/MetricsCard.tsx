import React from 'react';
import { 
  Paper,
  Typography,
  Box,
  LinearProgress,
  Grid,
  useTheme,
  Tooltip,
  Divider
} from '@mui/material';

interface MetricItemProps {
  label: string;
  value: number | string;
  suffix?: string;
  color?: string;
  tooltip?: string;
  max?: number;
  showProgress?: boolean;
}

interface MetricsCardProps {
  title: string;
  metrics?: MetricItemProps[];
  value?: number | string;  // ���ݾɰ�api
  format?: 'percent' | 'decimal' | string; // ���ݾɰ�api
  icon?: string; // ���ݾɰ�api
}

/**
 * ����ָ����ʾ���
 */
const MetricItem: React.FC<MetricItemProps> = ({ 
  label, 
  value, 
  suffix = '', 
  color,
  tooltip,
  max = 1,
  showProgress = true
}) => {
  const theme = useTheme();
  const numericValue = typeof value === 'number' ? value : 0;
  const displayValue = typeof value === 'string' ? value : (
    suffix === '%' ? (numericValue * 100).toFixed(2) + suffix : numericValue.toFixed(4) + suffix
  );
  
  const progressValue = Math.min(100, (numericValue / max) * 100);
  
  const metricColor = color || theme.palette.primary.main;

  return (
    <Tooltip title={tooltip || ''} arrow>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {label }
          </Typography>
          <Typography variant="body2" fontWeight="bold" sx={{ color: metricColor }}>
            {displayValue}
          </Typography>
        </Box>
        {showProgress && (
          <LinearProgress 
            variant="determinate" 
            value={progressValue} 
            sx={{ 
              height: 6, 
              borderRadius: 1,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                backgroundColor: metricColor
              }
            }} 
          />
        )}
      </Box>
    </Tooltip>
  );
};

/**
 * ָ�꿨Ƭ���
 * 
 * ���������չʾһ����ص�ָ������
 */
const MetricsCard: React.FC<MetricsCardProps> = ({ title, metrics, value, format, icon }) => {
  const theme = useTheme();

  // ���ݾɰ�api
  if (value !== undefined) {
    // �ɰ浥ָ��ģʽ
    const formattedValue = format === 'percent' 
      ? (value as number * 100).toFixed(2) + '%' 
      : typeof value === 'number' ? value.toFixed(4) : value;

    let iconColor = theme.palette.primary.main;
    if (icon) {
      if (icon === 'accuracy' || icon === 'precision') iconColor = theme.palette.success.main;
      else if (icon === 'recall') iconColor = theme.palette.info.main;
      else if (icon === 'loss') iconColor = theme.palette.error.main;
      else if (icon === 'f1') iconColor = theme.palette.warning.main;
    }

    return (
      <Paper elevation={2} sx={{ p: 2, mb: 2, width: '200px', height: '100px' }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ color: iconColor, fontWeight: 'bold' }}>
          {formattedValue}
        </Typography>
      </Paper>
    );
  }
  
  // �°��ָ��ģʽ
  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {metrics && metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <MetricItem {...metric} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default MetricsCard;
