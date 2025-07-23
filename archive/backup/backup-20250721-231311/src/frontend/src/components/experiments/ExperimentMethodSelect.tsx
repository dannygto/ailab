import React from 'react';
import { FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  SelectChangeEvent } from '@mui/material';

interface ExperimentMethodSelectProps {
  value: string;
  onChange: (Event: SelectChangeEvent) => void;
  error?: boolean;
  helperText?: string;
}

/**
 * 实验方法选择组件
 * 允许用户选择不同的实验方法
 */
const ExperimentMethodSelect: React.FC<ExperimentMethodSelectProps> = ({
  value,
  onChange,
  error = false,
  helperText = ''
}) => {
  const methods = [
    { id: 'control-group', name: '对照组实验' },
    { id: 'comparison', name: '比较实验' },
    { id: 'observation', name: '观察实验' },
    { id: 'exploratory', name: '探索性实验' },
    { id: 'simulation', name: '模拟实验' }
  ];

  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="experiment-method-LabelIcon">实验方法</InputLabel>
      <Select
        labelId="experiment-method-LabelIcon"
        id="experiment-method"
        value={value}
        label="实验方法"
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

