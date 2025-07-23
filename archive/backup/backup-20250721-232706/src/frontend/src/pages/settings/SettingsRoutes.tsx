import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Tabs, Tab } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import Settings from './GeneralSettings';
import AIModelSettings from './AIModelSettings';

const SettingsRoutes: React.FC = () => {
  const location = useLocation();
  
  // 获取当前选中的tab
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes('/settings/ai-models')) return 1;
    return 0;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          系统设置
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={getCurrentTab()} aria-label="settings tabs">
            <Tab 
              label="通用设置" 
              component={Link} 
              to="/settings"
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              label="AI模型设置" 
              component={Link} 
              to="/settings/ai-models"
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Box>
        
        <Routes>
          <Route index element={<Settings />} />
          <Route path="ai-models" element={<AIModelSettings />} />
          <Route path="*" element={<Navigate to="/settings" replace />} />
        </Routes>
      </Paper>
    </Container>
  );
};

export default SettingsRoutes;
