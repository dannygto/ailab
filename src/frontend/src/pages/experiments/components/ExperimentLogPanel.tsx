import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography,
  Box
} from '@mui/material';
import { Experiment } from '../../../types';
import ExperimentLogsViewer from '../../../components/monitoring/ExperimentLogsViewer';

interface ExperimentLogPanelProps {
  experiment: Experiment;
  loading: boolean;
}

const ExperimentLogPanel: React.FC<ExperimentLogPanelProps> = ({
  experiment,
  loading
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          实验日志
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <ExperimentLogsViewer 
            logs={experiment.metadata?.logs || []} 
            loading={loading}
            autoScroll={experiment.status === 'running'}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExperimentLogPanel;
