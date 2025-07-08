import React from 'react';
import { FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  SelectChangeEvent, Box } from '@mui/material';

interface ExperimentMethodSelectProps {
  value: string;
  onChange: (Event: SelectChangeEvent) => void;
  error?: boolean;
  helperText?: string;
}

/**
 * ʵ�鷽��ѡ�����
 * �����û�ѡ��ͬ��ʵ�鷽��
 */
const ExperimentMethodSelect: React.FC<ExperimentMethodSelectProps> = ({
  value,
  onChange,
  error = false,
  helperText = ''
}) => {
  const methods = [
    { id: 'control-group', name: '������ʵ��' },
    { id: 'comparison', name: '�Ƚ�ʵ��' },
    { id: 'observation', name: '�۲�ʵ��' },
    { id: 'exploratory', name: '̽����ʵ��' },
    { id: 'simulation', name: 'ģ��ʵ��' }
  ];

  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="experiment-method-LabelIcon">ʵ�鷽��</InputLabel>
      <Select
        labelId="experiment-method-LabelIcon"
        id="experiment-method"
        value={value}
        label="ʵ�鷽��"
        onChange={onChange}
      >
        {methods.map(method => (
          <MenuItem key={method.id} value={method.id}>
            {method.name}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default ExperimentMethodSelect;

