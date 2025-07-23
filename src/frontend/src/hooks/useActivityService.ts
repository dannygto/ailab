import { useState, useCallback } from 'react';
import activityService from '../services/activity.service';
import { ActivityType, ResourceType, TeamActivityFilter, ActivityResponse } from '../types/activity';

/**
 * 活动记录Hook
 * 提供活动记录相关功能的状态和方法
 */
export const useActivityService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取团队活动记录
   */
  const getTeamActivities = useCallback(async (
    teamId: string,
    page: number = 1,
    limit: number = 20,
    filter?: TeamActivityFilter
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await activityService.getTeamActivities(teamId, page, limit, filter);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '获取团队活动记录失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 获取资源相关活动记录
   */
  const getResourceActivities = useCallback(async (
    teamId: string,
    resourceType: ResourceType,
    resourceId: string,
    page: number = 1,
    limit: number = 20
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await activityService.getResourceActivities(
        teamId,
        resourceType,
        resourceId,
        page,
        limit
      );
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '获取资源活动记录失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 获取用户在团队中的活动记录
   */
  const getUserActivitiesInTeam = useCallback(async (
    teamId: string,
    userId: string,
    page: number = 1,
    limit: number = 20
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await activityService.getUserActivitiesInTeam(
        teamId,
        userId,
        page,
        limit
      );
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '获取用户活动记录失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 获取活动类型名称
   */
  const getActivityTypeName = useCallback((activityType: ActivityType): string => {
    return activityService.getActivityTypeName(activityType);
  }, []);

  /**
   * 获取资源类型名称
   */
  const getResourceTypeName = useCallback((resourceType: ResourceType): string => {
    return activityService.getResourceTypeName(resourceType);
  }, []);

  return {
    isLoading,
    error,
    getTeamActivities,
    getResourceActivities,
    getUserActivitiesInTeam,
    getActivityTypeName,
    getResourceTypeName
  };
};
