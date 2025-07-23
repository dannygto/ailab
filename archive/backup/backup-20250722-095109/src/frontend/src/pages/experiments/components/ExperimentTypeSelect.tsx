import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box } from '@mui/material';
import { ExperimentType } from '../../../utils/experimentTypes';

interface Props {
  value?: string;
  onChange: (value: string) => void;
}

const ExperimentTypeSelect: React.FC<Props> = ({ value = '', onChange }) => {
  const handleChange = (Event: SelectChangeEvent) => {
    onChange(Event.target.value);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Experiment Type</InputLabel>
      <Select value={value} onChange={handleChange} label="Experiment Type">
        <MenuItem value={ExperimentType.OBSERVATION}>Observation</MenuItem>
        <MenuItem value={ExperimentType.MEASUREMENT}>Measurement</MenuItem>
        <MenuItem value={ExperimentType.COMPARISON}>Comparison</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ExperimentTypeSelect;

