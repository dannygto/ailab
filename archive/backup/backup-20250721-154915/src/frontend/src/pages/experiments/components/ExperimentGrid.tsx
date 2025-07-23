import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Button, 
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Experiment } from '../../../types';

interface ExperimentCardProps {
  experiment: Experiment;
}

interface ExperimentGridProps {
  experiments: Experiment[];
}

// ״̬��ɫӳ��
const statusColors: Record<string, any> = {
  running: { color: 'info', label: '������' },
  completed: { color: 'success', label: '�����' },
  pending: { color: 'warning', label: '�ȴ���' },
  failed: { color: 'error', label: 'ʧ��' },
  stopped: { color: 'default', label: '��ֹͣ' },
  draft: { color: 'default', label: '�ݸ�' },
  ready: { color: 'primary', label: '����' },
  paused: { color: 'warning', label: '����ͣ' }
};

// ��ʽ��ʱ��
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ��ȡ������ʾ����
const getTypeDisplayName = (type: string) => {
  const typeMap: Record<string, string> = {
    // AIʵ������
    'image_classification': 'ͼ�����',
    'object_detection': 'Ŀ����',
    'text_classification': '�ı�����',
    'sentiment_analysis': '��з���',
    'speech_recognition': '����ʶ��',
    'robot_control': '�����˿���',
    'nlp_experiment': '��Ȼ���Դ���',
    
    // �ս�ѧ��ʵ��
    'physics_experiment': '����ʵ��',
    'physics_simulation': '����ģ��',
    'chemistry_experiment': '��ѧʵ��',
    'biology_experiment': '����ʵ��',
    'integrated_ScienceIcon': '�ۺϿ�ѧ',
    'info_technology': '��Ϣ����',
    'math_modeling': '��ѧ��ģ',
    
    // �߽�ѧ��ʵ��
    'EngineeringIcon_lab': '����ʵ��',
    'electronics_circuit': '���ӵ�·',
    'mechanical_design': '��е���',
    'material_testing': '���ϲ���',
    'medical_lab': 'ҽѧʵ��',
    'environmental_ScienceIcon': '������ѧ',
    'computer_ScienceIcon_lab': '�������ѧ',
    
    'custom': '�Զ���ʵ��'
  };
  return typeMap[type] || type.replace(/_/g, ' ');
};

// ����ʵ�鿨Ƭ���
const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment }) => {
  const navigate = useNavigate();
  
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {experiment.name}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip 
            size="small" 
            label={getTypeDisplayName(experiment.type)} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            size="small" 
            label={statusColors[experiment.status]?.label || experiment.status} 
            color={statusColors[experiment.status]?.color || 'default'} 
          />
        </Stack>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          gutterBottom 
          sx={{ 
            mb: 1, 
            minHeight: '40px', 
            display: '-webkit-box', 
            WebkitBoxOrient: 'vertical', 
            WebkitLineClamp: 2, 
            overflow: 'hidden' 
          }}
        >
          {experiment.description || '������'}
        </Typography>
        
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
          ����: {formatDate(experiment.createdAt)}
        </Typography>
        
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
          ����: {formatDate(experiment.updatedAt)}
        </Typography>
        
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate(`/experiments/${experiment.id}`)}
          sx={{ mt: 'auto' }}
        >
          �鿴����
        </Button>
      </CardContent>
    </Card>
  );
};

// ʵ���������
const ExperimentGrid: React.FC<ExperimentGridProps> = ({ experiments }) => {
  return (
    <Grid container spacing={3}>
      {experiments.map((experiment) => (
        <Grid item xs={12} md={6} lg={4} key={experiment.id}>
          <ExperimentCard experiment={experiment} />
        </Grid>
      ))}
    </Grid>
  );
};

export { ExperimentCard, ExperimentGrid };

