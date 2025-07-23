import { EventEmitter } from 'events';
import { Team, TeamMember } from '../types/teams';
import axios from 'axios';

/**
 * 团队资源类型
 */
export interface TeamResource {
  id: string;
  name: string;
  type: 'dataset' | 'model' | 'experiment' | 'document' | 'other';
  size: number;
  created: string;
  lastModified: string;
  owner: string;
  accessLevel: 'private' | 'team' | 'public';
  description?: string;
}

/**
 * 资源共享类型
 */
export enum ResourceSharingType {
  READONLY = 'readonly',  // 只读权限
  EDIT = 'edit',          // 编辑权限
  FULL = 'full'           // 完全控制权限
}

/**
 * 共享目标类型
 */
export enum SharingTargetType {
  USER = 'user',           // 与特定用户共享
  TEAM = 'team',           // 与整个团队共享
  TEAM_ROLE = 'team_role', // 与特定团队角色共享
  PUBLIC = 'public'        // 公开共享
}

/**
 * 资源共享配置
 */
export interface ResourceSharingConfig {
  resourceId: string;
  resourceType: string;
  targetType: SharingTargetType;
  targetId?: string;       // 用户ID或团队ID，对于PUBLIC为空
  targetRole?: string;     // 仅在targetType为TEAM_ROLE时有效
  sharingType: ResourceSharingType;
  expiresAt?: Date;        // 共享过期时间，为空表示永久
  createdBy: string;       // 共享创建者ID
  createdAt: Date;         // 共享创建时间
}

/**
 * 团队资源共享服务
 * 用于管理团队资源的共享、权限控制和隔离
 */
class TeamResourceSharingService extends EventEmitter {
  private static instance: TeamResourceSharingService;

  private constructor() {
    super();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): TeamResourceSharingService {
    if (!TeamResourceSharingService.instance) {
      TeamResourceSharingService.instance = new TeamResourceSharingService();
    }
    return TeamResourceSharingService.instance;
  }

  /**
   * 创建资源共享
   * @param config 共享配置
   * @returns 共享ID
   */
  public async createResourceSharing(config: Omit<ResourceSharingConfig, 'createdAt'>): Promise<string> {
    try {
      const response = await axios.post('/api/resource-sharing', {
        ...config,
        createdAt: new Date()
      });

      // 触发共享创建事件
      this.emit('sharing:created', response.data);

      return response.data.id;
    } catch (error) {
      console.error('创建资源共享失败:', error);
      throw new Error('创建资源共享失败');
    }
  }

  /**
   * 更新资源共享配置
   * @param sharingId 共享ID
   * @param updates 更新的配置项
   * @returns 是否更新成功
   */
  public async updateResourceSharing(
    sharingId: string,
    updates: Partial<Omit<ResourceSharingConfig, 'resourceId' | 'resourceType' | 'createdBy' | 'createdAt'>>
  ): Promise<boolean> {
    try {
      const response = await axios.patch(`/api/resource-sharing/${sharingId}`, updates);

      // 触发共享更新事件
      this.emit('sharing:updated', { id: sharingId, updates });

      return response.data.success;
    } catch (error) {
      console.error('更新资源共享失败:', error);
      return false;
    }
  }

  /**
   * 删除资源共享
   * @param sharingId 共享ID
   * @returns 是否删除成功
   */
  public async deleteResourceSharing(sharingId: string): Promise<boolean> {
    try {
      const response = await axios.delete(`/api/resource-sharing/${sharingId}`);

      // 触发共享删除事件
      this.emit('sharing:deleted', sharingId);

      return response.data.success;
    } catch (error) {
      console.error('删除资源共享失败:', error);
      return false;
    }
  }

  /**
   * 获取资源的所有共享配置
   * @param resourceId 资源ID
   * @param resourceType 资源类型
   * @returns 共享配置列表
   */
  public async getResourceSharings(resourceId: string, resourceType: string): Promise<ResourceSharingConfig[]> {
    try {
      const response = await axios.get('/api/resource-sharing', {
        params: { resourceId, resourceType }
      });

      return response.data;
    } catch (error) {
      console.error('获取资源共享配置失败:', error);
      return [];
    }
  }

  /**
   * 检查用户对资源的访问权限
   * @param userId 用户ID
   * @param resourceId 资源ID
   * @param resourceType 资源类型
   * @param requiredType 需要的权限类型
   * @returns 是否有权限
   */
  public async checkResourceAccess(
    userId: string,
    resourceId: string,
    resourceType: string,
    requiredType: ResourceSharingType = ResourceSharingType.READONLY
  ): Promise<boolean> {
    try {
      const response = await axios.get('/api/resource-sharing/check-access', {
        params: { userId, resourceId, resourceType, requiredType }
      });

      return response.data.hasAccess;
    } catch (error) {
      console.error('检查资源访问权限失败:', error);
      return false;
    }
  }

  /**
   * 获取用户可访问的资源列表
   * @param userId 用户ID
   * @param resourceType 资源类型
   * @param teamId 可选的团队ID筛选
   * @returns 资源ID列表
   */
  public async getUserAccessibleResources(
    userId: string,
    resourceType: string,
    teamId?: string
  ): Promise<string[]> {
    try {
      const response = await axios.get('/api/resource-sharing/user-resources', {
        params: { userId, resourceType, teamId }
      });

      return response.data.resources;
    } catch (error) {
      console.error('获取用户可访问资源失败:', error);
      return [];
    }
  }

  /**
   * 获取可访问资源的用户列表
   * @param resourceId 资源ID
   * @param resourceType 资源类型
   * @returns 用户ID和权限类型的映射
   */
  public async getResourceAccessUsers(
    resourceId: string,
    resourceType: string
  ): Promise<Map<string, ResourceSharingType>> {
    try {
      const response = await axios.get('/api/resource-sharing/resource-users', {
        params: { resourceId, resourceType }
      });

      return new Map(Object.entries(response.data.users));
    } catch (error) {
      console.error('获取资源访问用户失败:', error);
      return new Map();
    }
  }

  /**
   * 为团队内所有成员创建资源访问权限
   * @param teamId 团队ID
   * @param resourceId 资源ID
   * @param resourceType 资源类型
   * @param sharingType 共享类型
   * @returns 是否成功
   */
  public async shareWithTeam(
    teamId: string,
    resourceId: string,
    resourceType: string,
    sharingType: ResourceSharingType
  ): Promise<boolean> {
    try {
      const response = await axios.post('/api/resource-sharing/share-with-team', {
        teamId,
        resourceId,
        resourceType,
        sharingType,
        createdBy: localStorage.getItem('userId') || '',
        createdAt: new Date()
      });

      // 触发团队共享事件
      this.emit('sharing:team', {
        teamId,
        resourceId,
        resourceType,
        sharingType
      });

      return response.data.success;
    } catch (error) {
      console.error('与团队共享资源失败:', error);
      return false;
    }
  }

  /**
   * 为特定团队角色创建资源访问权限
   * @param teamId 团队ID
   * @param role 角色名称
   * @param resourceId 资源ID
   * @param resourceType 资源类型
   * @param sharingType 共享类型
   * @returns 是否成功
   */
  public async shareWithTeamRole(
    teamId: string,
    role: string,
    resourceId: string,
    resourceType: string,
    sharingType: ResourceSharingType
  ): Promise<boolean> {
    try {
      const response = await axios.post('/api/resource-sharing/share-with-role', {
        teamId,
        role,
        resourceId,
        resourceType,
        sharingType,
        createdBy: localStorage.getItem('userId') || '',
        createdAt: new Date()
      });

      // 触发角色共享事件
      this.emit('sharing:role', {
        teamId,
        role,
        resourceId,
        resourceType,
        sharingType
      });

      return response.data.success;
    } catch (error) {
      console.error('与团队角色共享资源失败:', error);
      return false;
    }
  }

  /**
   * 解决团队资源间冲突
   * 当同一用户通过不同途径获得对同一资源的不同权限时，采用最高权限
   * @param userId 用户ID
   * @param resourceId 资源ID
   * @param resourceType 资源类型
   * @returns 最终有效的权限类型
   */
  public async resolveAccessConflicts(
    userId: string,
    resourceId: string,
    resourceType: string
  ): Promise<ResourceSharingType | null> {
    try {
      const response = await axios.get('/api/resource-sharing/resolve-conflicts', {
        params: { userId, resourceId, resourceType }
      });

      return response.data.effectiveAccess;
    } catch (error) {
      console.error('解决资源访问冲突失败:', error);
      return null;
    }
  }
}

// 导出单例实例
export const teamResourceSharingService = TeamResourceSharingService.getInstance();
