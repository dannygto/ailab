import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';
import { Activity, ActivityType, ResourceType, TeamActivityFilter, ActivityResponse } from '../types/activity';

// API基础URL配置
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

class ActivityService {
  /**
   * 获取团队活动记录
   */
  async getTeamActivities(
    teamId: string,
    page: number = 1,
    limit: number = 20,
    filter?: TeamActivityFilter
  ): Promise<ActivityResponse> {
    try {
      let url = `${API_BASE_URL}/teams/${teamId}/activities?page=${page}&limit=${limit}`;

      // 添加过滤条件
      if (filter) {
        if (filter.activityType && filter.activityType.length > 0) {
          url += `&activityType=${filter.activityType.join(',')}`;
        }

        if (filter.resourceType && filter.resourceType.length > 0) {
          url += `&resourceType=${filter.resourceType.join(',')}`;
        }

        if (filter.userId) {
          url += `&userId=${filter.userId}`;
        }

        if (filter.resourceId) {
          url += `&resourceId=${filter.resourceId}`;
        }

        if (filter.startDate) {
          url += `&startDate=${filter.startDate.toISOString()}`;
        }

        if (filter.endDate) {
          url += `&endDate=${filter.endDate.toISOString()}`;
        }
      }

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '获取团队活动记录失败' });
    }
  }

  /**
   * 获取资源相关活动记录
   */
  async getResourceActivities(
    teamId: string,
    resourceType: ResourceType,
    resourceId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ActivityResponse> {
    try {
      const url = `${API_BASE_URL}/teams/${teamId}/resources/${resourceType}/${resourceId}/activities?page=${page}&limit=${limit}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '获取资源活动记录失败' });
    }
  }

  /**
   * 获取用户在团队中的活动记录
   */
  async getUserActivitiesInTeam(
    teamId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ActivityResponse> {
    try {
      const url = `${API_BASE_URL}/teams/${teamId}/users/${userId}/activities?page=${page}&limit=${limit}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '获取用户活动记录失败' });
    }
  }

  /**
   * 获取活动类型名称
   */
  getActivityTypeName(activityType: ActivityType): string {
    const nameMap: Record<ActivityType, string> = {
      [ActivityType.TEAM_CREATE]: '创建团队',
      [ActivityType.TEAM_UPDATE]: '更新团队',
      [ActivityType.TEAM_DELETE]: '删除团队',
      [ActivityType.MEMBER_ADD]: '添加成员',
      [ActivityType.MEMBER_REMOVE]: '移除成员',
      [ActivityType.MEMBER_ROLE_CHANGE]: '变更角色',
      [ActivityType.RESOURCE_ADD]: '添加资源',
      [ActivityType.RESOURCE_REMOVE]: '移除资源',
      [ActivityType.RESOURCE_SHARE]: '共享资源',
      [ActivityType.RESOURCE_UPDATE]: '更新资源',
      [ActivityType.COMMENT]: '发表评论',
      [ActivityType.OTHER]: '其他操作'
    };

    return nameMap[activityType] || '未知操作';
  }

  /**
   * 获取资源类型名称
   */
  getResourceTypeName(resourceType: ResourceType): string {
    const nameMap: Record<ResourceType, string> = {
      [ResourceType.EXPERIMENT]: '实验',
      [ResourceType.DEVICE]: '设备',
      [ResourceType.TEMPLATE]: '模板',
      [ResourceType.DATASET]: '数据集',
      [ResourceType.FILE]: '文件',
      [ResourceType.TEAM]: '团队',
      [ResourceType.OTHER]: '其他'
    };

    return nameMap[resourceType] || '未知资源';
  }
}

export default new ActivityService();
