import React, { ReactNode, ReactElement } from 'react';
import { Alert, Typography, Tooltip } from '@mui/material';
import { ResourceType, PermissionAction } from '../../types/permission';
import { usePermission } from '../../contexts/PermissionContext';
import { UserRole } from '../../types';

// 基于角色的权限守卫
interface RolePermissionGuardProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  fallback?: React.ReactElement;
}

// 基于资源和操作的权限守卫
interface ResourcePermissionGuardProps {
  resourceType: ResourceType;
  action: PermissionAction;
  resourceId?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showTooltip?: boolean;
  tooltipText?: string;
  disableIfNoPermission?: boolean;
}

type PermissionGuardProps = RolePermissionGuardProps | ResourcePermissionGuardProps;

// 判断是否为基于资源的权限
const isResourcePermission = (props: PermissionGuardProps): props is ResourcePermissionGuardProps => {
  return 'resourceType' in props && 'action' in props;
};

/**
 * 权限守卫组件
 * 根据用户权限条件性地渲染子组件
 */
const PermissionGuard = (props: PermissionGuardProps): ReactElement => {
  // 如果是基于资源和操作的权限控制
  if (isResourcePermission(props)) {
    return <ResourcePermissionGuard {...props} />;
  }

  // 否则使用基于角色的权限控制（兼容旧版本）
  return <RolePermissionGuard {...props} />;
};

/**
 * 基于角色的权限守卫（兼容旧版本）
 */
const RolePermissionGuard: React.FC<RolePermissionGuardProps> = ({
  children,
  requiredRoles,
  fallback
}): React.ReactElement => {
  const { user, isAdmin } = usePermission();

  // 管理员拥有所有权限
  if (isAdmin) {
    return <>{children}</>;
  }

  // 如果用户未登录
  if (!user) {
    return fallback || (
      <Alert severity="warning" sx={{ m: 2 }}>
        <Typography variant="h6">访问受限</Typography>
        <Typography>请先登录以访问此功能。</Typography>
      </Alert>
    );
  }

  // 如果用户角色不在允许的角色列表中
  if (!requiredRoles.includes(user.role as UserRole)) {
    return fallback || (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6">权限不足</Typography>
        <Typography>
          您的当前角色是 "{user.role}"，访问此功能需要以下角色之一：
          {requiredRoles.join('、')}
        </Typography>
      </Alert>
    );
  }

  // 权限检查通过，渲染子组件
  return <>{children}</>;
};

/**
 * 基于资源和操作的权限守卫
 */
const ResourcePermissionGuard: React.FC<ResourcePermissionGuardProps> = ({
  resourceType,
  action,
  resourceId,
  children,
  fallback = null,
  showTooltip = false,
  tooltipText = '您没有执行此操作的权限',
  disableIfNoPermission = false
}) => {
  const { canAccess, isAdmin } = usePermission();

  // 检查权限
  const hasPermission = isAdmin || canAccess(resourceType, action, resourceId);

  // 如果没有权限
  if (!hasPermission) {
    // 如果需要禁用而不是隐藏
    if (disableIfNoPermission) {
      return (
        <Tooltip title={tooltipText} arrow placement="top" disableHoverListener={!showTooltip}>
          <span style={{ opacity: 0.5, pointerEvents: 'none' }}>
            {children}
          </span>
        </Tooltip>
      );
    }

    // 返回备用内容或空
    return <>{fallback}</>;
  }

  // 有权限时直接渲染子内容
  return <>{children}</>;
};

/**
 * 权限按钮属性
 */
interface PermissionButtonWrapperProps {
  resourceType: ResourceType;
  action: PermissionAction;
  resourceId?: string;
  render: (hasPermission: boolean) => ReactNode;
  tooltipText?: string;
  showTooltip?: boolean;
}

/**
 * 权限按钮包装器
 * 用于根据权限控制按钮的禁用状态和提示
 */
export const PermissionButtonWrapper: React.FC<PermissionButtonWrapperProps> = ({
  resourceType,
  action,
  resourceId,
  render,
  tooltipText = '您没有执行此操作的权限',
  showTooltip = true
}) => {
  const { canAccess, isAdmin } = usePermission();

  // 检查权限
  const hasPermission = isAdmin || canAccess(resourceType, action, resourceId);

  // 如果需要显示工具提示
  if (showTooltip && !hasPermission) {
    return (
      <Tooltip title={tooltipText} arrow placement="top">
        <span>
          {render(hasPermission)}
        </span>
      </Tooltip>
    );
  }

  // 无提示时直接渲染
  return <>{render(hasPermission)}</>;
};

export default PermissionGuard;
