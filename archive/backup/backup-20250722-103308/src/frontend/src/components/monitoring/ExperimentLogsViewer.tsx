import React, { useState, useRef, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  Chip
} from '@mui/material';
import { SearchIcon, DownloadIcon, ArrowDownwardIcon as ScrollDownIcon, FilterListIcon as FilterIcon, ClearIcon } from '../../utils/icons';

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
}

interface ExperimentLogsViewerProps {
  logs: LogEntry[];
  loading?: boolean;
  autoScroll?: boolean;
  onDownload?: () => void;
}

/**
 * ʵ����־�鿴�����
 * 
 * ���������չʾʵ��ִ�й����е���־��֧�����������˺����ع���
 */
const ExperimentLogsViewer: React.FC<ExperimentLogsViewerProps> = ({
  logs,
  loading = false,
  autoScroll = true,
  onDownload
}) => {
  const theme = useTheme();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(autoScroll);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // ��־�ȼ���Ӧ����ɫ
  const levelColors = {
    info: theme.palette.info.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    debug: theme.palette.grey[600]
  };

  // ���˺�������־
  const filteredLogs = logs.filter(log => {
    // ������־�ȼ�����
    const levelMatch = filter === 'all' || log.level === filter;
    
    // ���������ʹ���
    const searchMatch = search === '' || 
      log.message.toLowerCase().includes(search.toLowerCase());
    
    return levelMatch && searchMatch;
  });

  // �Զ��������ײ�
  useEffect(() => {
    if (isAutoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, isAutoScroll]);

  // ��ʽ����־ʱ��
  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // ������־
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Ĭ�������߼�
      const logText = logs.map(log => 
        `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.message}`
      ).join('\n');
      
      const blob = new Blob([logText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `experiment-logs-${new Date().toISOString().slice(0,10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // �������ײ�
  const scrollToBottom = () => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          ʵ����־
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            startIcon={<DownloadIcon />} 
            size="small" 
            onClick={handleDownload}
            disabled={logs.length === 0}
          >
            ������־
          </Button>
          <Button 
            startIcon={<ScrollDownIcon />} 
            size="small"
            onClick={() => {
              setIsAutoScroll(!isAutoScroll);
              if (!isAutoScroll) scrollToBottom();
            }}
            color={isAutoScroll ? "primary" : "inherit"}
            variant={isAutoScroll ? "contained" : "outlined"}
          >
            �Զ�����
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="log-level-filter-LabelIcon">��־�ȼ�</InputLabel>
          <Select
            labelId="log-level-filter-LabelIcon"
            value={filter}
            label="��־�ȼ�"
            onChange={(e) => setFilter(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <FilterIcon fontSize="small" />
              </InputAdornment>
            }
          >
            <MenuItem value="all">ȫ��</MenuItem>
            <MenuItem value="info">��Ϣ</MenuItem>
            <MenuItem value="warning">����</MenuItem>
            <MenuItem value="error">����</MenuItem>
            <MenuItem value="debug">����</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="������־����..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Box>

      <Divider sx={{ mb: 1 }} />

      <Box 
        ref={logContainerRef}
        sx={{ 
          height: 300, 
          overflowY: 'auto', 
          backgroundColor: theme.palette.background.default,
          borderRadius: 1,
          p: 1,
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, index) => (
            <Box key={index} sx={{ mb: 0.5, display: 'flex', alignItems: 'flex-start' }}>
              <Typography 
                variant="caption" 
                component="span" 
                sx={{ 
                  mr: 1, 
                  color: theme.palette.text.secondary,
                  whiteSpace: 'nowrap'
                }}
              >
                {formatTimestamp(log.timestamp)}
              </Typography>
              <Chip
                label={log.level.toUpperCase()}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.625rem',
                  mr: 1,
                  backgroundColor: levelColors[log.level],
                  color: '#fff',
                  minWidth: 50
                }}
              />
              <Typography 
                variant="body2" 
                component="span" 
                sx={{ 
                  flexGrow: 1,
                  color: log.level === 'error' ? theme.palette.error.main : 
                         log.level === 'warning' ? theme.palette.warning.main : 
                         'inherit'
                }}
              >
                {log.message}
              </Typography>
            </Box>
          ))
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">
              {loading ? '���ڼ�����־...' : (search || filter !== 'all' ? 'û��ƥ�����־' : '������־����')}
            </Typography>
          </Box>
        )}
      </Box>

      {filteredLogs.length > 0 && (
        <Box sx={{ mt: 1, textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">
            ��ʾ {filteredLogs.length} ����־ {filter !== 'all' || search ? `(�ѹ��ˣ��� ${logs.length} ��)` : ''}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ExperimentLogsViewer;

