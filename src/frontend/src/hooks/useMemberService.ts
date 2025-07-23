import { useState, useCallback } from 'react';
import axios from 'axios';

// 定义服务基础URL
const API_BASE_URL = '/api/team';

// 处理API错误
const handleApiError = (error: any, options = { context: '操作' }) => {
  console.error(`${options.context}失败:`, error);

  if (error.response) {
    // 服务器响应了非2xx状态码
    return new Error(error.response.data.message || `${options.context}失败: 服务器错误`);
  } else if (error.request) {
    // 请求已发送但没有收到响应
    return new Error(`${options.context}失败: 网络问题，请检查网络连接`);
  } else {
    // 请求设置时出错
    return new Error(`${options.context}失败: ${error.message}`);
  }
};

/**
 * 成员服务
 */
class MemberService {
  private baseUrl = API_BASE_URL;

  /**
   * 获取团队成员列表
   */
  async getTeamMembers(teamId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${teamId}/members`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '获取团队成员失败' });
    }
  }

  /**
   * 邀请用户加入团队
   */
  async inviteTeamMember(teamId: string, email: string, role: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/${teamId}/invite`, { email, role });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '邀请团队成员失败' });
    }
  }

  /**
   * 更新团队成员角色
   */
  async updateMemberRole(teamId: string, userId: string, role: string): Promise<any> {
    try {
      const response = await axios.put(`${this.baseUrl}/${teamId}/members/${userId}`, { role });
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '更新成员角色失败' });
    }
  }

  /**
   * 移除团队成员
   */
  async removeMember(teamId: string, userId: string): Promise<any> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${teamId}/members/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '移除团队成员失败' });
    }
  }

  /**
   * 获取邀请状态
   */
  async getInvitations(teamId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/${teamId}/invitations`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '获取邀请状态失败' });
    }
  }
}

// 创建服务实例
const memberService = new MemberService();

/**
 * 团队成员服务Hook
 * 提供团队成员相关功能的状态和方法
 */
export const useMemberService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取团队成员
   */
  const getTeamMembers = useCallback(async (teamId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const members = await memberService.getTeamMembers(teamId);
      setIsLoading(false);
      return members;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || '获取团队成员失败');
      throw err;
    }
  }, []);

  /**
   * 邀请团队成员
   */
  const inviteTeamMember = useCallback(async (teamId: string, email: string, role: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await memberService.inviteTeamMember(teamId, email, role);
      setIsLoading(false);
      return result;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || '邀请团队成员失败');
      throw err;
    }
  }, []);

  /**
   * 更新成员角色
   */
  const updateMemberRole = useCallback(async (teamId: string, userId: string, role: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await memberService.updateMemberRole(teamId, userId, role);
      setIsLoading(false);
      return result;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || '更新成员角色失败');
      throw err;
    }
  }, []);

  /**
   * 移除团队成员
   */
  const removeMember = useCallback(async (teamId: string, userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await memberService.removeMember(teamId, userId);
      setIsLoading(false);
      return result;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || '移除团队成员失败');
      throw err;
    }
  }, []);

  /**
   * 获取邀请状态
   */
  const getInvitations = useCallback(async (teamId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const invitations = await memberService.getInvitations(teamId);
      setIsLoading(false);
      return invitations;
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || '获取邀请状态失败');
      throw err;
    }
  }, []);

  return {
    isLoading,
    error,
    getTeamMembers,
    inviteTeamMember,
    updateMemberRole,
    removeMember,
    getInvitations
  };
};

export default useMemberService;
