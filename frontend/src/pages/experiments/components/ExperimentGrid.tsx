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

// 状态颜色映射
const statusColors: Record<string, any> = {
  running: { color: 'info', label: '运行中' },
  completed: { color: 'success', label: '已完成' },
  pending: { color: 'warning', label: '等待中' },
  failed: { color: 'error', label: '失败' },
  stopped: { color: 'default', label: '已停止' },
  draft: { color: 'default', label: '草稿' },
  ready: { color: 'primary', label: '就绪' },
  paused: { color: 'warning', label: '已暂停' }
};

// 格式化时间
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取类型显示名称
const getTypeDisplayName = (type: string) => {
  const typeMap: Record<string, string> = {
    // AI实验类型
    'image_classification': '图像分类',
    'object_detection': '目标检测',
    'text_classification': '文本分类',
    'sentiment_analysis': '情感分析',
    'speech_recognition': '语音识别',
    'robot_control': '机器人控制',
    'nlp_experiment': '自然语言处理',
    
    // 普教学科实验
    'physics_experiment': '物理实验',
    'physics_simulation': '物理模拟',
    'chemistry_experiment': '化学实验',
    'biology_experiment': '生物实验',
    'integrated_ScienceIcon': '综合科学',
    'info_technology': '信息技术',
    'math_modeling': '数学建模',
    
    // 高教学科实验
    'EngineeringIcon_lab': '工程实验',
    'electronics_circuit': '电子电路',
    'mechanical_design': '机械设计',
    'material_testing': '材料测试',
    'medical_lab': '医学实验',
    'environmental_ScienceIcon': '环境科学',
    'computer_ScienceIcon_lab': '计算机科学',
    
    'custom': '自定义实验'
  };
  return typeMap[type] || type.replace(/_/g, ' ');
};

// 单个实验卡片组件
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
          {experiment.description || '无描述'}
        </Typography>
        
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>
          创建: {formatDate(experiment.createdAt)}
        </Typography>
        
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1.5 }}>
          更新: {formatDate(experiment.updatedAt)}
        </Typography>
        
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate(`/experiments/${experiment.id}`)}
          sx={{ mt: 'auto' }}
        >
          查看详情
        </Button>
      </CardContent>
    </Card>
  );
};

// 实验网格组件
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

