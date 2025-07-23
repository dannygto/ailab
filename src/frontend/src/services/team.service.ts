import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';
import {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  UpdateTeamMemberRoleRequest
} from '../types/teams';

// API基础URL配置
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

class TeamService {
  private baseUrl = `${API_BASE_URL}/teams`;

  /**
   * 获取用户所属的所有团队
   */
  async getUserTeams(): Promise<Team[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/my-teams`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error, { context: '获取团队列表失败' });
    }
  }

  /**
   * 获取团队详情
   */
  async getTeamById(teamId: string): Promise<Team> {
    try {
      const response = await axios.get(`${this.baseUrl}/${teamId}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error, { context: '获取团队详情失败' });
    }
  }

  /**
   * 创建新团队
   */
  async createTeam(teamData: CreateTeamRequest): Promise<Team> {
    try {
      const response = await axios.post(this.baseUrl, teamData);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error, { context: '创建团队失败' });
    }
  }

  /**
   * 更新团队信息
   */
  async updateTeam(teamId: string, teamData: UpdateTeamRequest): Promise<Team> {
    try {
      const response = await axios.put(`${this.baseUrl}/${teamId}`, teamData);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error, { context: '更新团队信息失败' });
    }
  }

  /**
   * 添加团队成员
   */
  async addTeamMember(teamId: string, memberData: AddTeamMemberRequest): Promise<Team> {
    try {
      const response = await axios.post(`${this.baseUrl}/${teamId}/members`, memberData);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error, { context: '添加团队成员失败' });
    }
  }

  /**
   * 更新成员角色
   */
  async updateMemberRole(
    teamId: string,
    memberId: string,
    roleData: UpdateTeamMemberRoleRequest
  ): Promise<Team> {
    try {
      const response = await axios.put(
        `${this.baseUrl}/${teamId}/members/${memberId}/role`,
        roleData
      );
      return response.data.data;
    } catch (error) {
      throw handleApiError(error, { context: '更新成员角色失败' });
    }
  }

  /**
   * 移除团队成员
   */
  async removeMember(teamId: string, memberId: string): Promise<Team> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${teamId}/members/${memberId}`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error, { context: '移除团队成员失败' });
    }
  }

  /**
   * 归档团队
   */
  async archiveTeam(teamId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${teamId}`);
    } catch (error) {
      throw handleApiError(error, { context: '归档团队失败' });
    }
  }

  /**
   * 获取资源访问日志
   */
  async getResourceAccessLogs(resourceId: string, params: any = {}): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/team-resources/access-logs/${resourceId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '获取资源访问日志失败' });
    }
  }

  /**
   * 获取团队访问日志
   */
  async getTeamAccessLogs(teamId: string, params: any = {}): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/team-resources/team-access-logs/${teamId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '获取团队访问日志失败' });
    }
  }

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
   * 批量共享资源
   */
  async batchShareResources(shareData: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/batch-share`, shareData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '批量共享资源失败' });
    }
  }

  /**
   * 创建共享模板
   */
  async createSharingTemplate(templateData: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/sharing-templates`, templateData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '创建共享模板失败' });
    }
  }

  /**
   * 获取用户的共享模板
   */
  async getUserSharingTemplates(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/sharing-templates`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '获取共享模板失败' });
    }
  }

  /**
   * 应用共享模板到资源
   */
  async applySharingTemplate(data: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/apply-sharing-template`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error, { context: '应用共享模板失败' });
    }
  }
}

// 创建单例实例
const teamService = new TeamService();

export default teamService;
