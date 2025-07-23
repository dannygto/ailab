// 用户相关类型定义

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

/**
 * 用户角色枚举
 */
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  RESEARCHER = 'researcher',
  GUEST = 'guest'
}

/**
 * 用户在线状态
 */
export enum OnlineStatus {
  ONLINE = 'online',
  AWAY = 'away',
  OFFLINE = 'offline'
}

/**
 * 用户基本信息接口
 */
export interface UserBasic {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

/**
 * 完整用户信息接口
 */
export interface User extends UserBasic {
  email: string;
  phone?: string;
  department?: string;
  title?: string;
  status: UserStatus;
  roles: UserRole[];
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  onlineStatus?: OnlineStatus;
  bio?: string;
  metadata?: Record<string, any>;
}

/**
 * 用户创建请求
 */
export interface UserCreateRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  title?: string;
  roles: UserRole[];
  avatar?: string;
}

/**
 * 用户更新请求
 */
export interface UserUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  title?: string;
  status?: UserStatus;
  roles?: UserRole[];
  password?: string;
  avatar?: string;
  bio?: string;
  metadata?: Record<string, any>;
}

/**
 * 用户搜索参数
 */
export interface UserSearchParams {
  search?: string;
  status?: UserStatus | UserStatus[];
  roles?: UserRole | UserRole[];
  department?: string;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
  onlineStatus?: OnlineStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 用户统计信息
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  usersByRole: Record<UserRole, number>;
  usersByDepartment: Record<string, number>;
  newUsersThisMonth: number;
  activeUsersPercentage: number;
}

/**
 * 用户活动日志项
 */
export interface UserActivityLogItem {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 用户会话
 */
export interface UserSession {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  lastActive: string;
  device?: string;
  location?: string;
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    experimentComplete: boolean;
    systemAnnouncements: boolean;
    teamInvites: boolean;
  };
  experimentDefaultView: 'list' | 'grid' | 'table';
  dashboardLayout?: Record<string, any>;
}

/**
 * 用户权限项
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

/**
 * 用户认证响应
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}
