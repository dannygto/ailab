import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const SimpleSettingsTest: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          设置测试页面
        </Typography>

        <Paper elevation={2}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="settings tabs">
              <Tab label="通用设置" />
              <Tab label="AI模型设置" />
              <Tab label="安全设置" />
              <Tab label="通知设置" />
              <Tab label="备份设置" />
              <Tab label="高级设置" />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <Typography variant="h6">通用设置</Typography>
            <Typography>配置系统通用参数</Typography>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <Typography variant="h6">AI模型设置</Typography>
            <Typography>配置AI模型相关参数</Typography>
          </TabPanel>

          <TabPanel value={value} index={2}>
            <Typography variant="h6">安全设置</Typography>
            <Typography>配置系统安全相关设置</Typography>
          </TabPanel>

          <TabPanel value={value} index={3}>
            <Typography variant="h6">通知设置</Typography>
            <Typography>配置系统通知相关设置</Typography>
          </TabPanel>

          <TabPanel value={value} index={4}>
            <Typography variant="h6">备份设置</Typography>
            <Typography>配置系统备份相关设置</Typography>
          </TabPanel>

          <TabPanel value={value} index={5}>
            <Typography variant="h6">高级设置</Typography>
            <Typography>配置系统高级参数</Typography>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default SimpleSettingsTest;
