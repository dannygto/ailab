import React from 'react';
import { TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent, Box } from '@mui/material';

interface BasicInfoFormProps {
  name: string;
  description: string;
  type: string;
  difficulty: string;
  duration: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (e: SelectChangeEvent) => void;
  onDifficultyChange: (e: SelectChangeEvent) => void;
  onDurationChange: (e: SelectChangeEvent) => void;
  errors: {
    name?: string;
    description?: string;
    type?: string;
    difficulty?: string;
    duration?: string;
  };
  helperText?: {
    name?: string;
    description?: string;
    type?: string;
    difficulty?: string;
    duration?: string;
  };
}

/**
 * ʵ�������Ϣ�������
 * �����ռ�ʵ��Ļ�����Ϣ
 */
const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  name,
  description,
  type,
  difficulty,
  duration,
  onNameChange,
  onDescriptionChange,
  onTypeChange,
  onDifficultyChange,
  onDurationChange,
  errors
}) => {
  // ʵ������ѡ��
  const experimentTypes = [
    { id: 'physics', name: '����ʵ��' },
    { id: 'chemistry', name: '��ѧʵ��' },
    { id: 'biology', name: '����ʵ��' },
    { id: 'computer', name: '�����ʵ��' },
    { id: 'interdisciplinary', name: '��ѧ��ʵ��' }
  ];

  // �Ѷȼ���ѡ��
  const difficultyLevels = [
    { id: 'beginner', name: '����' },
    { id: 'intermediate', name: '�м�' },
    { id: 'advanced', name: '�߼�' },
    { id: 'expert', name: 'ר��' }
  ];

  // ����ʱ��ѡ��
  const durationOptions = [
    { id: 'lessThan30m', name: '30��������' },
    { id: '30m-1h', name: '30����-1Сʱ' },
    { id: '1h-2h', name: '1-2Сʱ' },
    { id: 'moreThan2h', name: '2Сʱ����' }
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="experiment-name"
          label="ʵ������"
          variant="outlined"
          value={name}
          onChange={onNameChange}
          error={!!errors.name}
          helperText={errors.name || ''}
          required
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="experiment-description"
          label="ʵ������"
          variant="outlined"
          value={description}
          onChange={onDescriptionChange}
          multiline
          rows={4}
          error={!!errors.description}
          helperText={errors.description || ''}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth error={!!errors.type}>
          <InputLabel id="experiment-type-LabelIcon">ʵ������</InputLabel>
          <Select
            labelId="experiment-type-LabelIcon"
            id="experiment-type"
            value={type}
            label="ʵ������"
            onChange={onTypeChange}
            required
          >
            {experimentTypes.map(expType => (
              <MenuItem key={expType.id} value={expType.id}>
                {expType.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth error={!!errors.difficulty}>
          <InputLabel id="experiment-difficulty-LabelIcon">�Ѷȼ���</InputLabel>
          <Select
            labelId="experiment-difficulty-LabelIcon"
            id="experiment-difficulty"
            value={difficulty}
            label="�Ѷȼ���"
            onChange={onDifficultyChange}
            required
          >
            {difficultyLevels.map(level => (
              <MenuItem key={level.id} value={level.id}>
                {level.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth error={!!errors.duration}>
          <InputLabel id="experiment-duration-LabelIcon">Ԥ��ʱ��</InputLabel>
          <Select
            labelId="experiment-duration-LabelIcon"
            id="experiment-duration"
            value={duration}
            label="Ԥ��ʱ��"
            onChange={onDurationChange}
            required
          >
            {durationOptions.map(option => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default BasicInfoForm;

