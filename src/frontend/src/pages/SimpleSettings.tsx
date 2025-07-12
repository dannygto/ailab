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

const SimpleSettings: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          系统设置
        </Typography>

        <Paper elevation={2}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="settings tabs">
              <Tab label="通用设置" />
              <Tab label="用户管理" />
              <Tab label="系统配置" />
              <Tab label="安全设置" />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <Typography variant="h6">通用设置</Typography>
            <Typography>配置系统的通用参数</Typography>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <Typography variant="h6">用户管理</Typography>
            <Typography>管理系统用户和权限</Typography>
          </TabPanel>

          <TabPanel value={value} index={2}>
            <Typography variant="h6">系统配置</Typography>
            <Typography>配置系统核心参数</Typography>
          </TabPanel>

          <TabPanel value={value} index={3}>
            <Typography variant="h6">安全设置</Typography>
            <Typography>配置系统安全相关设置</Typography>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default SimpleSettings;
