/**
 * 🔗 系统集成管理页面
 * 
 * 🎯 完成度: 100%
 * 
 * ✅ 页面功能:
 * - 系统集成配置管理
 * - 第三方系统连接监控
 * - API网关管理
 * - 数据同步状态查看
 * - 外部认证配置
 * 
 * 📡 管理员功能:
 * - 集成配置的增删改查
 * - 系统连接状态监控
 * - 数据同步任务管理
 * - 安全设置和权限控制
 */

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper
} from '@mui/material';
import SystemIntegration from '../../components/integration/SystemIntegration';

const SystemIntegrationPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          🔗 系统集成管理
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          管理第三方系统集成、API网关、数据同步和外部认证配置
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <SystemIntegration />
      </Paper>
    </Container>
  );
};

export default SystemIntegrationPage;
