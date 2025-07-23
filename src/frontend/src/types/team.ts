/**
 * 团队相关类型定义
 */

// 团队成员角色类型
export type TeamRole = 'owner' | 'admin' | 'member';

// 团队成员类型
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: TeamRole;
  joinedAt: string | Date;
}

// 团队资源类型
export interface TeamResource {
  id: string;
  name: string;
  type: string;
  createdAt: string | Date;
  createdBy: string;
}

// 团队实验类型
export interface TeamExperiment {
  id: string;
  name: string;
  status: string;
  createdAt: string | Date;
  createdBy: string;
}

// 团队类型
export interface ITeam {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  members?: TeamMember[];
  resources?: TeamResource[];
  experiments?: TeamExperiment[];
  isOwner?: boolean;  // 当前用户是否是团队所有者
  isAdmin?: boolean;  // 当前用户是否是团队管理员
}

// 创建团队参数
export interface CreateTeamParams {
  name: string;
  description?: string;
  members?: string[];
}

// 更新团队参数
export interface UpdateTeamParams {
  id: string;
  name?: string;
  description?: string;
  members?: string[];
}

// 团队查询参数
export interface TeamQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 团队权限类型
export enum TeamPermission {
  VIEW = 'view',
  EDIT = 'edit',
  MANAGE_MEMBERS = 'manage_members',
  MANAGE_RESOURCES = 'manage_resources',
  DELETE = 'delete',
  FULL_CONTROL = 'full_control'
}

// 团队成员权限映射
export const TEAM_ROLE_PERMISSIONS: Record<TeamRole, TeamPermission[]> = {
  owner: [
    TeamPermission.VIEW,
    TeamPermission.EDIT,
    TeamPermission.MANAGE_MEMBERS,
    TeamPermission.MANAGE_RESOURCES,
    TeamPermission.DELETE,
    TeamPermission.FULL_CONTROL
  ],
  admin: [
    TeamPermission.VIEW,
    TeamPermission.EDIT,
    TeamPermission.MANAGE_MEMBERS,
    TeamPermission.MANAGE_RESOURCES
  ],
  member: [
    TeamPermission.VIEW
  ]
};
