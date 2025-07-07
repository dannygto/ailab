import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  SelectChangeEvent,
  Checkbox,
  ListItemText
} from '@mui/material';

interface ExperimentResourceSelectProps {
  values: string[];
  onChange: (Event: SelectChangeEvent<string[]>) => void;
  error?: boolean;
  helperText?: string;
}

/**
 * ʵ����Դѡ�����
 * �����û�ѡ��ʵ���������Դ
 */
const ExperimentResourceSelect: React.FC<ExperimentResourceSelectProps> = ({
  values,
  onChange,
  error = false,
  helperText = ''
}) => {
  const resources = [
    { id: 'microscope', name: '��΢��' },
    { id: 'camera', name: '�������' },
    { id: 'sensors', name: '��������װ' },
    { id: 'computer', name: '�����' },
    { id: 'ai-module', name: 'AI����ģ��' },
    { id: 'chemistry-kit', name: '��ѧ�Լ���װ' },
    { id: 'physics-kit', name: '����ʵ��װ��' }
  ];

  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="experiment-resources-LabelIcon">ʵ����Դ</InputLabel>
      <Select
        labelId="experiment-resources-LabelIcon"
        id="experiment-resources"
        multiple
        value={values}
        label="ʵ����Դ"
        onChange={onChange}
        renderValue={(selected) => {
          const selectedNames = resources
            .filter(resource => selected.includes(resource.id))
            .map(resource => resource.name);
          return selectedNames.join(', ');
        }}
      >
        {resources.map(resource => (
          <MenuItem key={resource.id} value={resource.id}>
            <Checkbox checked={values.includes(resource.id)} />
            <ListItemText primary={resource.name} />
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default ExperimentResourceSelect;

