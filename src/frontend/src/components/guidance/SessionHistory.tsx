import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Grid,
  Divider,
  Button,
} from '@mui/material';
import {
  PersonIcon,
  SchoolIcon,
  QuizIcon,
  ScienceIcon,
} from '../../utils/icons';

interface SessionHistoryProps {
  sessions: any[];
  loading?: boolean;
  error?: string | null;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions = [],
  loading = false,
  error = null,
}) => {
  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'student':
        return <PersonIcon />;
      case 'teacher':
        return <SchoolIcon />;
      case 'system':
        return <ScienceIcon />;
      default:
        return <QuizIcon />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'student':
        return 'primary';
      case 'teacher':
        return 'secondary';
      case 'system':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'question':
        return '问题咨询';
      case 'guidance':
        return '指导建议';
      case 'resource':
        return '资源推荐';
      case 'feedback':
        return '反馈评价';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6">会话历史</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              总会话数: {sessions.length}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              最后活动: {sessions.length > 0 ? formatDate(sessions[0]?.updatedAt || '') : '无数据'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          学习目标
        </Typography>
        {sessions.length > 0 ? (
          <Grid container spacing={2}>
            {sessions.slice(0, 5).map((session, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getSourceIcon(session.source)}
                    <Chip
                      label={getTypeLabel(session.type)}
                      color={getSourceColor(session.source)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Typography variant="body1">
                    {session.title || '会话记录'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(session.createdAt)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">暂无学习目标</Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          交流历史
        </Typography>
        <List>
          {sessions.map((session, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>{getSourceIcon(session.source)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {session.title || '会话记录'}
                      </Typography>
                      <Chip
                        label={getTypeLabel(session.type)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {formatDate(session.createdAt)}
                      </Typography>
                      {session.relatedStage && (
                        <Chip
                          label={session.relatedStage}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < sessions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => {
            // 处理查看更多逻辑
          }}
        >
          查看更多历史记录
        </Button>
      </Box>
    </Box>
  );
};

export default SessionHistory;
