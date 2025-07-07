import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Container
} from '@mui/material';

// �����������
import GeneralSettings from './settings/generalSettings';
import SecuritySettings from './settings/securitySettings';
import NotificationSettings from './settings/Notification./settings/Settings';
import AIModelSettings from './settings/AIModel./settings/Settings';
import ThemeSettings from './settings/themeSettings';
import DataSettings from './settings/dataSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const simpleSettings: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ϵͳ����
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="settings tabs">
            <Tab label="ͨ��" />
            <Tab label="AIģ��" />
            <Tab label="��ȫ" />
            <Tab label="֪ͨ" />
            <Tab label="����" />
            <Tab label="����" />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          <GeneralSettings />
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          <AIModelSettings />
        </TabPanel>
        
        <TabPanel value={value} index={2}>
          <SecuritySettings />
        </TabPanel>
        
        <TabPanel value={value} index={3}>
          <NotificationSettings />
        </TabPanel>
        
        <TabPanel value={value} index={4}>
          <ThemeSettings />
        </TabPanel>
        
        <TabPanel value={value} index={5}>
          <DataSettings />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SimpleSettings;
