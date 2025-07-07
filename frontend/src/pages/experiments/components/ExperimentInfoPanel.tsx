import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip,
  Divider
} from '@mui/material';
import { Experiment } from '../../../types';
import { getExperimentTypeText } from '../../../utils/experimentUtils';

interface ExperimentInfoPanelProps {
  experiment: Experiment;
}

const ExperimentInfoPanel: React.FC<ExperimentInfoPanelProps> = ({
  experiment
}) => {
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {experiment.name}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {experiment.description}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ʵ������
          </Typography>
          <Chip 
            label={getExperimentTypeText(experiment.type)} 
            variant="outlined" 
            sx={{ mr: 1 }} 
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ʵ��ID
          </Typography>
          <Typography variant="body2">
            {experiment.id}
          </Typography>
        </Grid>
        
        {experiment.parameters && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              ʵ�����
            </Typography>
            <div 
              sx={{ 
                backgroundColor: 'background.default', 
                p: 2, 
                borderRadius: 1,
                maxHeight: '200px',
                overflow: 'auto'
              }}
            >
              <pre style={{ margin: 0, fontFamily: '"Roboto Mono", monospace' }}>
                {JSON.stringify(experiment.parameters, null, 2)}
              </pre>
            </div>
          </Grid>
        )}
        
        {experiment.data && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              ʵ������
            </Typography>
            <div 
              sx={{ 
                backgroundColor: 'background.default', 
                p: 2, 
                borderRadius: 1,
                maxHeight: '200px',
                overflow: 'auto'
              }}
            >
              <pre style={{ margin: 0, fontFamily: '"Roboto Mono", monospace' }}>
                {JSON.stringify(experiment.data, null, 2)}
              </pre>
            </div>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default ExperimentInfoPanel;

