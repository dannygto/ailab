/**
 * ʵ������ѡ�����
 */
import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  SelectChangeEvent
} from '@mui/material';

import { experimentTypes } from '../../constants/experimentState';

interface ExperimentTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  error: string;
}

const ExperimentTypeSelect: React.FC<ExperimentTypeSelectProps> = ({
  value,
  onChange,
  error
}) => {
  const handleChange = (Event: SelectChangeEvent) => {
    onChange(Event.target.value);
  };

  return (
    <FormControl fullWidth error={!!error}>
      <InputLabel id="experiment-type-select-LabelIcon">ʵ������</InputLabel>
      <Select
        labelId="experiment-type-select-LabelIcon"
        value={value}
        onChange={handleChange}
        label="ʵ������"
      >
        {experimentTypes.map((type) => (
          <MenuItem key={type.value} value={type.value}>
            {type.label} - {type.description}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default ExperimentTypeSelect;

