import React from 'react';
import { 
  FormControl, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  FormLabel, 
  Typography,
  Box,
  Slider,
  Grid,
  Paper
} from '@mui/material';

interface AIAssistanceSelectProps {
  value: string;
  level: number;
  onTypeChange: (Event: React.ChangeEvent<HTMLInputElement>) => void;
  onLevelChange: (Event: Event, newValue: number | number[]) => void;
}

/**
 * AI����ѡ�����
 * �����û�ѡ��AI�������ͺͼ���
 */
const AIAssistanceSelect: React.FC<AIAssistanceSelectProps> = ({
  value,
  level,
  onTypeChange,
  onLevelChange
}) => {
  const assistanceTypes = [
    { id: 'none', name: '��ʹ��AI����', description: '��ȫ�ֶ�����ʵ��' },
    { id: 'guidance', name: '����ʽ����', description: '�ṩʵ�鲽��ָ������ʾ' },
    { id: 'analysis', name: '����ʽ����', description: '��������ʵ�����ݺͽ��' },
    { id: 'full', name: 'ȫ��λ����', description: '�ṩȫ��ָ���������ͽ���' }
  ];

  const getLevelDescription = (level: number) => {
    if (level === 0) return '��ʹ��AI����';
    if (level < 30) return '��������';
    if (level < 70) return '�еȸ���';
    return '�߼�����';
  };

  return (
    <div>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">AI��������</FormLabel>
        <RadioGroup
          name="ai-assistance-type"
          value={value}
          onChange={onTypeChange}
        >
          {assistanceTypes.map(type => (
            <Paper 
              key={type.id} 
              elevation={value === type.id ? 3 : 1}
              sx={{ 
                mb: 1, 
                p: 1, 
                border: value === type.id ? '1px solid primary.main' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <FormControlLabel 
                value={type.id} 
                control={<Radio />} 
                label={
                  <div>
                    <Typography variant="subtitle1">{type.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                  </div>
                }
              />
            </Paper>
          ))}
        </RadioGroup>
      </FormControl>
      
      {value !== 'none' && (
        <div mt={3}>
          <Typography id="ai-level-slider" gutterBottom>
            AI��������: {getLevelDescription(level)}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Slider
                value={level}
                onChange={onLevelChange}
                aria-labelledby="ai-level-slider"
                valueLabelDisplay="auto"
                step={10}
                marks
                min={0}
                max={100}
                disabled={value === 'none'}
              />
            </Grid>
            <Grid item>
              <Typography>{level}%</Typography>
            </Grid>
          </Grid>
        </div>
      )}
    </div>
  );
};

export default AIAssistanceSelect;

