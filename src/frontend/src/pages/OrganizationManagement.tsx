import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import OrganizationManager from '../components/Organization/OrganizationManager';

/**
 * 组织管理页面
 */
const OrganizationManagementPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          组织管理
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          在此页面，您可以管理学校、院系、部门、班级等组织结构，以及各组织内的成员和权限。
        </Typography>

        <OrganizationManager />
      </Box>
    </Container>
  );
};

export default OrganizationManagementPage;
