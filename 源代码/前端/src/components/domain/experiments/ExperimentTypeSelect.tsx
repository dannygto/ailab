import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { ScienceIcon, ComputerIcon, MemoryIcon, InfoIcon } from '../../../utils/icons';

interface ExperimentType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

interface ExperimentTypeSelectProps {
  onSelect?: (type: ExperimentType) => void;
  selectedType?: string;
  className?: string;
}

const experimentTypes: ExperimentType[] = [
  {
    id: 'physics',
    name: '物理实验',
    description: '包括力学、光学、电学等物理现象的研究',
    icon: <ScienceIcon />,
    category: '理科',
    difficulty: 'intermediate',
    estimatedTime: '30-60分钟'
  },
  {
    id: 'chemistry',
    name: '化学实验',
    description: '化学反应、分析化学、有机合成等实验',
    icon: <ScienceIcon />,
    category: '理科',
    difficulty: 'intermediate',
    estimatedTime: '45-90分钟'
  },
  {
    id: 'computer',
    name: '计算机实验',
    description: '编程、算法、数据结构等计算机科学实验',
    icon: <ComputerIcon />,
    category: '工科',
    difficulty: 'beginner',
    estimatedTime: '60-120分钟'
  },
  {
    id: 'engineering',
    name: '工程实验',
    description: '机械工程、电子工程等工程技术实验',
    icon: <MemoryIcon />,
    category: '工科',
    difficulty: 'advanced',
    estimatedTime: '90-180分钟'
  }
];

const ExperimentTypeSelect: React.FC<ExperimentTypeSelectProps> = ({
  onSelect,
  selectedType,
  className
}) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  const handleTypeClick = (type: ExperimentType) => {
    if (onSelect) {
      onSelect(type);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '初级';
      case 'intermediate':
        return '中级';
      case 'advanced':
        return '高级';
      default:
        return difficulty;
    }
  };

  return (
    <React.Fragment>
      <Box className={className}>
        <Typography variant="h6" gutterBottom>
          选择实验类型
        </Typography>
        
        <Grid container spacing={3}>
          {experimentTypes.map((type) => (
            <Grid item xs={12} sm={6} md={4} key={type.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedType === type.id ? 2 : 1,
                  borderColor: selectedType === type.id ? 'primary.main' : 'divider',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => handleTypeClick(type)}
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2, color: 'primary.main' }}>
                      {type.icon}
                    </Box>
                    <Typography variant="h6" component="h3">
                      {type.name}
                    </Typography>
                    <Box sx={{ ml: 'auto' }}>
                      <Tooltip title={type.description}>
                        <IconButton size="small">
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {type.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={type.category}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={getDifficultyLabel(type.difficulty)}
                      size="small"
                      color={getDifficultyColor(type.difficulty) as any}
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    预计时间: {type.estimatedTime}
                  </Typography>

                  {hoveredType === type.id && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption">
                        点击选择此实验类型
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {selectedType && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
            <Typography variant="body2" color="primary.main">
              已选择: {experimentTypes.find(t => t.id === selectedType)?.name}
            </Typography>
          </Box>
        )}
      </Box>
    </React.Fragment>
  );
};

export default ExperimentTypeSelect;
