import React from 'react';
import { Box } from '@mui/material';

interface ExperimentTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const ExperimentTabPanel: React.FC<ExperimentTabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`experiment-tabpanel-${index}`}
      aria-labelledby={`experiment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default ExperimentTabPanel;
