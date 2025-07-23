import React from 'react';
import { Container, Grid, Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import SettingsSidebar from '../components/settings/SettingsSidebar';

/**
 * 设置页面布局
 * 包含侧边栏导航和主内容区域
 */
const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <SettingsSidebar />
        </Grid>
        <Grid item xs={12} md={9}>
          <Box sx={{ bgcolor: 'background.paper', p: 0, borderRadius: 1, boxShadow: 1 }}>
            <Outlet />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
