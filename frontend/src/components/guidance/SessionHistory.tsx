import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Grid,
  Button,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { GuidanceSession, LearningObjective } from '../../types/guidance';
import { PersonIcon } from '../../utils/icons';
import { SmartToyIcon } from '../../utils/icons';
import { SchoolIcon } from '../../utils/icons';
import { AccountCircleIcon } from '../../utils/icons';
import { RadioButtonUncheckedIcon } from '../../utils/icons';

interface SessionHistoryProps {
  session: GuidanceSession | null;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ session }) => {
  if (!session) {
    return (
      <Alert severity="info">
        û�л�Ծ��ָ���Ự����ʼ�µ�ʵ����AIָ�����ɿ�ʼ��ϵͳ���Զ������Ự��
      </Alert>
    );
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'student':
        return <PersonIcon />;
      case 'system':
        return <SmartToyIcon />;
      case 'teacher':
        return <SchoolIcon />;
      default:
        return <SmartToyIcon />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'student':
        return '#3f51b5';
      case 'system':
        return '#009688';
      case 'teacher':
        return '#e91e63';
      default:
        return '#757575';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'question':
        return '����';
      case 'guidance':
        return 'ָ��';
      case 'feedback':
        return '����';
      case 'action':
        return '�ж�';
      default:
        return '����';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <div sx={{ mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            �Ự��Ϣ
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                �ỰID: {session.id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                ѧ��ID: {session.studentId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                ʵ��ID: {session.experimentId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                ��ʼʱ��: {formatDate(session.startTime)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                ����ʱ��: {session.endTime ? formatDate(session.endTime) : '������'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                ״̬: {
                  session.status === 'active' ? '��Ծ' :
                  session.status === 'paused' ? '����ͣ' :
                  session.status === 'completed' ? '�����' : 'δ֪'
                }
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </div>

      <Typography variant="h6" gutterBottom>
        ѧϰĿ��
      </Typography>

      <div sx={{ mb: 3 }}>
        {session.learningObjectives.length > 0 ? (
          <Grid container spacing={2}>
            {session.learningObjectives.map((objective: LearningObjective) => (
              <Grid item xs={12} sm={6} md={4} key={objective.id}>
                <Card variant={objective.achieved ? 'outlined' : 'elevation'}>
                  <CardContent>
                    <div sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      {objective.achieved ? (
                        <AccountCircleIcon color="success" sx={{ mr: 1 }} />
                      ) : (
                        <RadioButtonUncheckedIcon color="disabled" sx={{ mr: 1 }} />
                      )}
                      <div>
                        <Typography variant="body1">
                          {objective.description}
                        </Typography>
                        {objective.evidence && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            ֤��: {objective.evidence}
                          </Typography>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            �˻Ự��δ����ѧϰĿ��
          </Alert>
        )}
      </div>

      <Typography variant="h6" gutterBottom>
        ������ʷ
      </Typography>

      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {session.interactions.map((interaction, index) => (
          <React.Fragment key={index}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getSourceColor(interaction.source) }}>
                  {getSourceIcon(interaction.source)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography component="span" variant="body1">
                      {interaction.source === 'student' ? 'ѧ��' : 
                       interaction.source === 'system' ? 'ϵͳ' : 
                       interaction.source === 'teacher' ? '��ʦ' : 'δ֪'}
                    </Typography>
                    <div>
                      <Chip 
                        label={getTypeLabel(interaction.type)} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <Typography component="span" variant="caption" color="text.secondary">
                        {formatDate(interaction.timestamp)}
                      </Typography>
                    </div>
                  </div>
                }
                secondary={
                  <div sx={{ mt: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ whiteSpace: 'pre-line' }}
                    >
                      {interaction.content}
                    </Typography>
                    
                    {interaction.relatedStage && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        ��ؽ׶�: {interaction.relatedStage}
                      </Typography>
                    )}
                  </div>
                }
              />
            </ListItem>
            {index < session.interactions.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
      
      <div sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => {
            // ���ػỰ��ʷΪJSON�ļ�
            const element = document.createElement("a");
            const file = new Blob([JSON.stringify(session, null, 2)], {type: 'application/json'});
            element.href = URL.createObjectURL(file);
            element.download = `session-${session.id}.json`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}
        >
          �����Ự��¼
        </Button>
      </div>
    </div>
  );
};

export default SessionHistory;


