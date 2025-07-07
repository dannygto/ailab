import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Grid,
  Card,
  CardContent
} from '@mui/material';

export interface AIAssistanceOption {
  value: string;
  label: string;
  description: string;
}

// AI����Ӧ��ѡ��
export const aiAssistOptions: AIAssistanceOption[] = [
  { value: 'data_collection', label: '���ݲɼ�����', description: 'ͨ��AI�Զ���ʵ�����ݲɼ�����ע��Ԥ����' },
  { value: 'process_monitoring', label: 'ʵ����̼��', description: 'AIʵʱ���ʵ������仯��Ԥ���쳣���ṩԤ��' },
  { value: 'result_analysis', label: '������ܷ���', description: '�Զ�����ʵ�����ݣ�ʶ��ģʽ�����ƣ����ɿ��ӻ�ͼ��' },
  { value: 'knowledge_support', label: '֪ʶ��֧��', description: 'Ϊʵ���ṩ���ѧ��֪ʶ����ͺ���չ����' },
  { value: 'report_generation', label: '�������ɸ���', description: '�����ܽ�ʵ���������ɱ���ݸ壬�ṩ�Ľ�����' },
  { value: 'custom_ai', label: '�Զ���AIӦ��', description: '�����ض�ʵ��������AI��������' },
];

interface AIAssistanceSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

const AIAssistanceSelect: React.FC<AIAssistanceSelectProps> = ({
  values,
  onChange,
  error
}) => {
  const handleChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Event.target.name;
    const newValues = Event.target.checked
      ? [...values, value]
      : values.filter(v => v !== value);
    
    onChange(newValues);
  };

  return (
    <div sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        ѡ��AI��������
      </Typography>
      
      <FormControl 
        component="fieldset" 
        error={!!error}
        sx={{ width: '100%' }}
      >
        <FormGroup>
          <Grid container spacing={2}>
            {aiAssistOptions.map(option => (
              <Grid item xs={12} sm={6} md={4} key={option.value}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    bgcolor: values.includes(option.value) ? 'action.selected' : 'inherit',
                    transition: 'background-color 0.3s'
                  }}
                >
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={values.includes(option.value)}
                          onChange={handleChange}
                          name={option.value}
                        />
                      }
                      label={
                        <div>
                          <Typography variant="subtitle1">
                            {option.label}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {option.description}
                          </Typography>
                        </div>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </FormGroup>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </div>
  );
};

export default AIAssistanceSelect;

