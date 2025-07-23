import { useState, useCallback } from 'react';
import teamService from '../services/team.service';
import { Team, CreateTeamRequest, UpdateTeamRequest, AddTeamMemberRequest, UpdateTeamMemberRoleRequest } from '../types/teams';

/**
 * 团队资源接口
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
 * 团队服务Hook
 * 提供团队相关功能的状态和方法
 */
export const useTeamService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取用户所属的所有团队
   */
  const getUserTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const teams = await teamService.getUserTeams();
      setIsLoading(false);
      return teams;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '获取团队列表失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 获取团队详情
   */
  const getTeamById = useCallback(async (teamId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const team = await teamService.getTeamById(teamId);
      setIsLoading(false);
      return team;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '获取团队详情失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 创建新团队
   */
  const createTeam = useCallback(async (teamData: CreateTeamRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const team = await teamService.createTeam(teamData);
      setIsLoading(false);
      return team;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '创建团队失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 更新团队信息
   */
  const updateTeam = useCallback(async (teamId: string, teamData: UpdateTeamRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const team = await teamService.updateTeam(teamId, teamData);
      setIsLoading(false);
      return team;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '更新团队信息失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 添加团队成员
   */
  const addTeamMember = useCallback(async (teamId: string, memberData: AddTeamMemberRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const team = await teamService.addTeamMember(teamId, memberData);
      setIsLoading(false);
      return team;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '添加团队成员失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 更新成员角色
   */
  const updateMemberRole = useCallback(async (
    teamId: string,
    memberId: string,
    roleData: UpdateTeamMemberRoleRequest
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const team = await teamService.updateMemberRole(teamId, memberId, roleData);
      setIsLoading(false);
      return team;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '更新成员角色失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 移除团队成员
   */
  const removeMember = useCallback(async (teamId: string, memberId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const team = await teamService.removeMember(teamId, memberId);
      setIsLoading(false);
      return team;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '移除团队成员失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 归档团队
   */
  const archiveTeam = useCallback(async (teamId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await teamService.archiveTeam(teamId);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '归档团队失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 获取团队详情（包括资源）
   */
  const getTeamDetails = useCallback(async (teamId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 在实际应用中，这个API应该返回团队详情包括资源列表
      const teamDetails = await teamService.getTeamById(teamId);
      // 如果需要，可以额外调用获取团队资源的API
      // const teamResources = await teamService.getTeamResources(teamId);
      // teamDetails.resources = teamResources;

      setIsLoading(false);
      return teamDetails;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '获取团队详情失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 添加团队资源
   */
  const addTeamResource = useCallback(async (teamId: string, resource: TeamResource) => {
    setIsLoading(true);
    setError(null);

    try {
      // 这里应该调用添加资源的API
      // 由于目前没有实际的API，我们模拟一个成功的响应
      // const result = await teamService.addTeamResource(teamId, resource);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsLoading(false);
      return resource;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '添加资源失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 更新团队资源
   */
  const updateTeamResource = useCallback(async (teamId: string, resource: TeamResource) => {
    setIsLoading(true);
    setError(null);

    try {
      // 这里应该调用更新资源的API
      // const result = await teamService.updateTeamResource(teamId, resource.id, resource);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsLoading(false);
      return resource;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '更新资源失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 删除团队资源
   */
  const removeTeamResource = useCallback(async (teamId: string, resourceId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // 这里应该调用删除资源的API
      // await teamService.removeTeamResource(teamId, resourceId);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsLoading(false);
      return true;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '删除资源失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 分享团队资源
   */
  const shareTeamResource = useCallback(async (
    teamId: string,
    resourceId: string,
    shareWithIds: string[],
    accessLevel: 'read' | 'write' | 'admin'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // 这里应该调用分享资源的API
      // await teamService.shareTeamResource(teamId, resourceId, shareWithIds, accessLevel);
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsLoading(false);
      return true;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '分享资源失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 获取资源访问日志
   */
  const getResourceAccessLogs = useCallback(async (resourceId: string, params: any = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teamService.getResourceAccessLogs(resourceId, params);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '获取资源访问日志失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 获取团队访问日志
   */
  const getTeamAccessLogs = useCallback(async (teamId: string, params: any = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teamService.getTeamAccessLogs(teamId, params);
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '获取团队访问日志失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * 获取团队成员列表
   */
  const getTeamMembers = useCallback(async (teamId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const members = await teamService.getTeamMembers(teamId);
      setIsLoading(false);
      return members;
    } catch (err: any) {
      setIsLoading(false);
      const errorMessage = err.message || '获取团队成员失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    isLoading,
    error,
    getUserTeams,
    getTeamById,
    getTeamDetails,
    createTeam,
    updateTeam,
    addTeamMember,
    updateMemberRole,
    removeMember,
    archiveTeam,
    addTeamResource,
    updateTeamResource,
    removeTeamResource,
    shareTeamResource,
    getResourceAccessLogs,
    getTeamAccessLogs,
    getTeamMembers,

    // 批量资源共享和模板
    batchShareResources: async (shareData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await teamService.batchShareResources(shareData);
        setIsLoading(false);
        return result;
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || '批量共享资源时出错');
        throw err;
      }
    },

    createSharingTemplate: async (templateData: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await teamService.createSharingTemplate(templateData);
        setIsLoading(false);
        return result;
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || '创建共享模板时出错');
        throw err;
      }
    },

    getUserSharingTemplates: async () => {
      setIsLoading(true);
      setError(null);

      try {
        const templates = await teamService.getUserSharingTemplates();
        setIsLoading(false);
        return templates;
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || '获取共享模板时出错');
        throw err;
      }
    },

    applySharingTemplate: async (data: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await teamService.applySharingTemplate(data);
        setIsLoading(false);
        return result;
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || '应用共享模板时出错');
        throw err;
      }
    }
  };
};

export default useTeamService;
