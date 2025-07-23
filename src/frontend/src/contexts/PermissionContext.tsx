import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ResourceType,
  PermissionAction,
  Permission,
  PermissionCheckResult
} from '../types/permission';
import permissionService from '../services/permission.service';
import { useAuth } from '../hooks/useAuth';

// 权限上下文状态
interface PermissionContextState {
  userPermissions: Permission[];
  checkPermission: (resourceType: ResourceType, action: PermissionAction, resourceId?: string) => Promise<boolean>;
  canAccess: (resourceType: ResourceType, action: PermissionAction, resourceId?: string) => boolean;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
  isAdmin: boolean;
  hasResourcePermission: (resourceId: string, resourceType: ResourceType, action: PermissionAction) => boolean;
}

// 创建权限上下文
const PermissionContext = createContext<PermissionContextState | undefined>(undefined);

// 权限提供者组件属性
interface PermissionProviderProps {
  children: ReactNode;
}

// 权限提供者组件
export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // 判断用户是否为管理员
  const isAdmin = !!user && user.role === 'admin';

  // 获取用户权限
  const fetchUserPermissions = useCallback(async () => {
    if (!isAuthenticated) {
      setUserPermissions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const permissions = await permissionService.getUserPermissions();
      setUserPermissions(permissions);
    } catch (error) {
      console.error('获取用户权限失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // 初始加载用户权限
  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  // 检查特定权限（通过API）
  const checkPermission = useCallback(
    async (resourceType: ResourceType, action: PermissionAction, resourceId?: string): Promise<boolean> => {
      // 管理员拥有所有权限
      if (isAdmin) return true;

      try {
        const result: PermissionCheckResult = await permissionService.checkPermission(
          resourceType,
          action,
          resourceId
        );
        return result.hasPermission;
      } catch (error) {
        console.error('权限检查失败:', error);
        return false;
      }
    },
    [isAdmin]
  );

  // 本地快速检查权限（基于已缓存的权限）
  const canAccess = useCallback(
    (resourceType: ResourceType, action: PermissionAction, resourceId?: string): boolean => {
      // 管理员拥有所有权限
      if (isAdmin) return true;

      // 如果未登录，没有权限
      if (!isAuthenticated) return false;

      // 在本地权限缓存中查找
      return userPermissions.some(permission => {
        // 检查资源类型和操作是否匹配
        const typeMatches = permission.resourceType === resourceType;
        const actionMatches = permission.action === action;

        // 检查资源ID是否匹配（如果指定了）
        const resourceMatches = !resourceId ||
          !permission.resourceId ||
          permission.resourceId === resourceId;

        // 检查权限是否有效
        const isValid = permission.isActive &&
          (!permission.expiresAt || new Date(permission.expiresAt) > new Date());

        return typeMatches && actionMatches && resourceMatches && isValid;
      });
    },
    [isAdmin, isAuthenticated, userPermissions]
  );

  // 检查对特定资源的权限
  const hasResourcePermission = useCallback(
    (resourceId: string, resourceType: ResourceType, action: PermissionAction): boolean => {
      // 管理员拥有所有权限
      if (isAdmin) return true;

      // 未指定资源ID，使用通用检查
      if (!resourceId) return canAccess(resourceType, action);

      // 在缓存中查找特定资源权限
      const hasSpecificPermission = userPermissions.some(permission =>
        permission.resourceType === resourceType &&
        permission.action === action &&
        permission.resourceId === resourceId &&
        permission.isActive &&
        (!permission.expiresAt || new Date(permission.expiresAt) > new Date())
      );

      // 如果找到特定资源权限，返回true
      if (hasSpecificPermission) return true;

      // 查找适用于该类型所有资源的权限
      return userPermissions.some(permission =>
        permission.resourceType === resourceType &&
        permission.action === action &&
        !permission.resourceId &&
        permission.isActive &&
        (!permission.expiresAt || new Date(permission.expiresAt) > new Date())
      );
    },
    [canAccess, isAdmin, userPermissions]
  );

  // 刷新权限数据
  const refreshPermissions = useCallback(async () => {
    await fetchUserPermissions();
  }, [fetchUserPermissions]);

  // 上下文值
  const contextValue: PermissionContextState = {
    userPermissions,
    checkPermission,
    canAccess,
    isLoading,
    refreshPermissions,
    isAdmin,
    hasResourcePermission
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

// 使用权限上下文的钩子
export const usePermission = (): PermissionContextState => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission必须在PermissionProvider内部使用');
  }
  return context;
};

// 权限保护组件属性
interface RequirePermissionProps {
  resourceType: ResourceType;
  action: PermissionAction;
  resourceId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

// 权限保护组件
export const RequirePermission: React.FC<RequirePermissionProps> = ({
  resourceType,
  action,
  resourceId,
  children,
  fallback = null
}) => {
  const { canAccess, isAdmin } = usePermission();

  // 管理员或有权限的用户可以访问
  const hasAccess = isAdmin || canAccess(resourceType, action, resourceId);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
