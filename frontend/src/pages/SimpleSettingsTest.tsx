import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Container
} from '@mui/material';

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

const simpleSettingsTest: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (EventIcon: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ϵͳ���� - ���԰�
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
          <Typography variant="h6">ͨ������</Typography>
          <Typography>������ͨ����������</Typography>
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          <Typography variant="h6">AIģ������</Typography>
          <Typography>������AIģ����������</Typography>
        </TabPanel>
        
        <TabPanel value={value} index={2}>
          <Typography variant="h6">��ȫ����</Typography>
          <Typography>�����ǰ�ȫ��������</Typography>
        </TabPanel>
        
        <TabPanel value={value} index={3}>
          <Typography variant="h6">֪ͨ����</Typography>
          <Typography>������֪ͨ��������</Typography>
        </TabPanel>
        
        <TabPanel value={value} index={4}>
          <Typography variant="h6">��������</Typography>
          <Typography>������������������</Typography>
        </TabPanel>
        
        <TabPanel value={value} index={5}>
          <Typography variant="h6">��������</Typography>
          <Typography>������������������</Typography>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SimpleSettingsTest;

