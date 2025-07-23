import React, { ReactElement } from 'react';
import { Alert, Typography } from '@mui/material';
import { UserRole } from '../../types';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  fallback?: React.ReactElement;
}

// 模拟获取当前用户信息的函数
const getCurrentUser = () => {
  // 在实际应用中，这应该从认证状态管理中获取
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  
  // 开发模式下的默认用户（可以通过环境变量配置）
  return {
    id: 'dev-user',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin' as UserRole,
    isActive: true
  };
};

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRoles,
  fallback
}): React.ReactElement => {
  const currentUser = getCurrentUser();

  // 如果用户未登录
  if (!currentUser) {
    return fallback || (
      <Alert severity="warning" sx={{ m: 2 }}>
        <Typography variant="h6">访问受限</Typography>
        <Typography>请先登录以访问此功能。</Typography>
      </Alert>
    );
  }

  // 如果用户角色不在允许的角色列表中
  if (!requiredRoles.includes(currentUser.role)) {
    return fallback || (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6">权限不足</Typography>
        <Typography>
          您的当前角色是 "{currentUser.role}"，访问此功能需要以下角色之一：
          {requiredRoles.join('、')}
        </Typography>
      </Alert>
    );
  }

  // 权限检查通过，渲染子组件
  return <>{children}</>;
};

export default PermissionGuard;
