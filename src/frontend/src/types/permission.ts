/**
 * 权限类型定义
 * 前端权限模型和权限验证组件使用
 */
import { User } from './index';

// 资源类型枚举
export enum ResourceType {
  EXPERIMENT = 'experiment',
  TEMPLATE = 'template',
  DEVICE = 'device',
  RESOURCE = 'resource',
  TEAM = 'team',
  REPORT = 'report',
  SETTING = 'setting',
  USER = 'user',
  ORGANIZATION = 'organization'
}

// 权限操作枚举
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  SHARE = 'share',
  APPROVE = 'approve',
  ASSIGN = 'assign',
  MANAGE = 'manage'
}

// 权限目标类型枚举
export enum PermissionTargetType {
  USER = 'user',
  ROLE = 'role',
  TEAM = 'team',
  ORGANIZATION = 'organization',
  PUBLIC = 'public'
}

// 权限定义接口
export interface Permission {
  _id?: string;
  resourceType: ResourceType;
  resourceId?: string;
  action: PermissionAction;
  targetType: PermissionTargetType;
  targetId?: string;
  conditions?: {
    timeRange?: {
      start?: Date;
      end?: Date;
    };
    ipRestrictions?: string[];
    deviceRestrictions?: string[];
    custom?: Record<string, any>;
  };
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// 权限规则接口 - 用于前端显示和管理
export interface PermissionRule {
  _id?: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isBuiltIn?: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 资源权限配置接口 - 用于资源权限设置
export interface ResourcePermissionConfig {
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  ownerId: string;
  owner?: User;
  isPublic: boolean;
  sharedWith: {
    users: Array<{
      userId: string;
      user?: User;
      actions: PermissionAction[];
    }>;
    teams: Array<{
      teamId: string;
      teamName?: string;
      actions: PermissionAction[];
    }>;
    organizations: Array<{
      organizationId: string;
      organizationName?: string;
      actions: PermissionAction[];
    }>;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// 权限检查结果接口
export interface PermissionCheckResult {
  hasPermission: boolean;
  deniedReason?: string;
  requiredPermissions?: Permission[];
}

// 创建权限请求接口
export interface CreatePermissionRequest {
  resourceType: ResourceType;
  resourceId?: string;
  action: PermissionAction;
  targetType: PermissionTargetType;
  targetId?: string;
  conditions?: {
    timeRange?: {
      start?: Date;
      end?: Date;
    };
    ipRestrictions?: string[];
    deviceRestrictions?: string[];
    custom?: Record<string, any>;
  };
  expiresAt?: Date;
}

// 创建权限规则请求接口
export interface CreatePermissionRuleRequest {
  name: string;
  description?: string;
  permissions: CreatePermissionRequest[];
}

// 更新资源权限配置请求接口
export interface UpdateResourcePermissionConfigRequest {
  isPublic?: boolean;
  sharedWith?: {
    users?: Array<{
      userId: string;
      actions: PermissionAction[];
    }>;
    teams?: Array<{
      teamId: string;
      actions: PermissionAction[];
    }>;
    organizations?: Array<{
      organizationId: string;
      actions: PermissionAction[];
    }>;
  };
}
