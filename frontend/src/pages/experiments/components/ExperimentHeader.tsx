import React from 'react';
import { 
  Box, 
  Typography, 
  Chip,
  Stack
} from '@mui/material';
import { Experiment } from '../../../types';
import { getExperimentTypeText } from '../../../utils/experimentUtils';

interface ExperimentHeaderProps {
  experiment: Experiment;
}

const ExperimentHeader: React.FC<ExperimentHeaderProps> = ({
  experiment
}) => {
  return (
    <div sx={{ mb: 3 }}>
      <Typography variant="h4" gutterBottom>
        {experiment.name}
      </Typography>
      
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <Chip 
          label={getExperimentTypeText(experiment.type)}
          color="primary"
          variant="outlined"
        />
        {experiment.metadata?.tags && experiment.metadata.tags.map((tag: string, index: number) => (
          <Chip
            key={index}
            label={tag}
            variant="outlined"
            size="small"
          />
        ))}
      </Stack>
      
      {experiment.description && (
        <Typography variant="body1" color="text.secondary">
          {experiment.description}
        </Typography>
      )}
    </div>
  );
};

export default ExperimentHeader;

