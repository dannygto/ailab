/**
 * 权限系统类型定义
 * 实现基于角色的访问控制(RBAC)模型
 */

/**
 * 权限类型
 * 定义用户可以对资源执行的操作
 */
export interface Permission {
  id: string;
  code: string;  // 权限唯一代码，如 'create:experiment'
  name: string;  // 权限名称，如 '创建实验'
  description?: string;  // 权限描述
  resource: ResourceType;  // 资源类型
  action: ActionType;  // 操作类型
  scope?: string;  // 权限范围，如 'global', 'team', 'personal'
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 角色类型
 * 角色是权限的集合，用户通过角色获取权限
 */
export interface Role {
  id: string;
  name: string;  // 角色名称，如 '系统管理员'
  code: string;  // 角色代码，如 'system_admin'
  description?: string;  // 角色描述
  permissions: Permission[] | string[];  // 角色包含的权限列表或权限ID列表
  isSystemRole: boolean;  // 是否为系统预定义角色
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用户权限扩展
 * 扩展用户模型，添加角色和权限信息
 */
export interface UserWithPermissions {
  id: string;
  roles: Role[] | string[];  // 用户所属角色或角色ID列表
  directPermissions: Permission[] | string[];  // 直接分配给用户的权限或权限ID列表
}

/**
 * 资源类型枚举
 * 系统中所有可授权的资源类型
 */
export enum ResourceType {
  // 系统资源
  SYSTEM = 'system',

  // 用户资源
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',

  // 实验相关资源
  EXPERIMENT = 'experiment',
  TEMPLATE = 'template',
  DATASET = 'dataset',
  MODEL = 'model',
  RESULT = 'result',

  // 团队相关资源
  TEAM = 'team',
  TEAM_MEMBER = 'team_member',
  TEAM_RESOURCE = 'team_resource',

  // 设备相关资源
  DEVICE = 'device',
  DEVICE_GROUP = 'device_group',

  // 其他资源
  REPORT = 'report',
  LOG = 'log',
  NOTIFICATION = 'notification',
  SETTING = 'setting'
}

/**
 * 操作类型枚举
 * 可对资源执行的操作类型
 */
export enum ActionType {
  // 基础操作
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',

  // 特殊操作
  EXECUTE = 'execute',  // 执行实验等
  ASSIGN = 'assign',    // 分配权限、角色等
  SHARE = 'share',      // 共享资源
  EXPORT = 'export',    // 导出数据
  IMPORT = 'import',    // 导入数据
  PUBLISH = 'publish',  // 发布模板、实验等
  APPROVE = 'approve',  // 审批操作
  CONFIGURE = 'configure', // 配置设置
  MONITOR = 'monitor'   // 监控设备等
}

/**
 * 权限验证结果
 */
export interface PermissionCheckResult {
  granted: boolean;
  resource?: ResourceType;
  action?: ActionType;
  message?: string;
}

/**
 * 权限审计日志记录
 */
export interface PermissionAuditLog {
  id: string;
  userId: string;
  resource: ResourceType;
  resourceId?: string;
  action: ActionType;
  granted: boolean;
  timestamp: Date;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 预定义的系统角色
 */
export enum SystemRoles {
  SYSTEM_ADMIN = 'system_admin',
  TEAM_ADMIN = 'team_admin',
  EXPERIMENT_MANAGER = 'experiment_manager',
  DEVICE_MANAGER = 'device_manager',
  TEACHER = 'teacher',
  STUDENT = 'student',
  GUEST = 'guest'
}

/**
 * 权限请求上下文
 */
export interface PermissionContext {
  userId: string;
  resourceType: ResourceType;
  resourceId?: string;
  action: ActionType;
  teamId?: string;
  metadata?: Record<string, any>;
}

/**
 * 资源层级关系定义
 * 用于构建资源继承关系图，辅助权限传播和验证
 */
export const ResourceHierarchy = {
  [ResourceType.TEAM]: {
    children: [ResourceType.TEAM_MEMBER, ResourceType.TEAM_RESOURCE]
  },
  [ResourceType.EXPERIMENT]: {
    children: [ResourceType.DATASET, ResourceType.MODEL, ResourceType.RESULT]
  },
  [ResourceType.DEVICE_GROUP]: {
    children: [ResourceType.DEVICE]
  }
};
