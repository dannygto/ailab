import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';
import { Organization, CreateOrganizationRequest } from '../types/organization';
import { ApiResponse } from '../types/api';

// API基础URL配置
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

/**
 * 组织管理服务
 * 提供组织的创建、查询、更新、删除等功能
 */
class OrganizationService {
  private baseUrl = `${API_BASE_URL}/organizations`;

  /**
   * 获取用户所属的所有组织
   */
  async getUserOrganizations(): Promise<Organization[]> {
    try {
      const response = await axios.get<ApiResponse<Organization[]>>(`${this.baseUrl}/my-organizations`);
      return response.data.data || [];
    } catch (error) {
      throw handleApiError(error, { context: '获取组织列表失败' });
    }
  }

  /**
   * 获取组织详情
   */
  async getOrganizationById(organizationId: string): Promise<Organization> {
    try {
      const response = await axios.get<ApiResponse<Organization>>(`${this.baseUrl}/${organizationId}`);
      return response.data.data as Organization;
    } catch (error) {
      throw handleApiError(error, { context: '获取组织详情失败' });
    }
  }

  /**
   * 创建新组织
   */
  async createOrganization(organizationData: CreateOrganizationRequest): Promise<Organization> {
    try {
      const response = await axios.post<ApiResponse<Organization>>(this.baseUrl, organizationData);
      return response.data.data as Organization;
    } catch (error) {
      throw handleApiError(error, { context: '创建组织失败' });
    }
  }

  /**
   * 更新组织信息
   */
  async updateOrganization(organizationId: string, updateData: Partial<Organization>): Promise<Organization> {
    try {
      const response = await axios.put<ApiResponse<Organization>>(`${this.baseUrl}/${organizationId}`, updateData);
      return response.data.data as Organization;
    } catch (error) {
      throw handleApiError(error, { context: '更新组织信息失败' });
    }
  }

  /**
   * 删除组织
   */
  async deleteOrganization(organizationId: string): Promise<boolean> {
    try {
      const response = await axios.delete<ApiResponse<{ success: boolean }>>(`${this.baseUrl}/${organizationId}`);
      return response.data.success;
    } catch (error) {
      throw handleApiError(error, { context: '删除组织失败' });
    }
  }

  /**
   * 添加组织成员
   */
  async addOrganizationMember(organizationId: string, userId: string, role: 'member' | 'manager' = 'member'): Promise<Organization> {
    try {
      const response = await axios.post<ApiResponse<Organization>>(
        `${this.baseUrl}/${organizationId}/members`,
        { userId, role }
      );
      return response.data.data as Organization;
    } catch (error) {
      throw handleApiError(error, { context: '添加组织成员失败' });
    }
  }

  /**
   * 移除组织成员
   */
  async removeOrganizationMember(organizationId: string, userId: string): Promise<Organization> {
    try {
      const response = await axios.delete<ApiResponse<Organization>>(
        `${this.baseUrl}/${organizationId}/members/${userId}`
      );
      return response.data.data as Organization;
    } catch (error) {
      throw handleApiError(error, { context: '移除组织成员失败' });
    }
  }

  /**
   * 获取组织层次结构
   */
  async getOrganizationHierarchy(rootOrganizationId?: string): Promise<Organization[]> {
    try {
      const url = rootOrganizationId
        ? `${this.baseUrl}/hierarchy/${rootOrganizationId}`
        : `${this.baseUrl}/hierarchy`;

      const response = await axios.get<ApiResponse<Organization[]>>(url);
      return response.data.data || [];
    } catch (error) {
      throw handleApiError(error, { context: '获取组织层次结构失败' });
    }
  }

  /**
   * 变更用户在组织中的角色
   */
  async updateMemberRole(organizationId: string, userId: string, role: 'member' | 'manager'): Promise<Organization> {
    try {
      const response = await axios.put<ApiResponse<Organization>>(
        `${this.baseUrl}/${organizationId}/members/${userId}/role`,
        { role }
      );
      return response.data.data as Organization;
    } catch (error) {
      throw handleApiError(error, { context: '更新组织成员角色失败' });
    }
  }
}

const organizationService = new OrganizationService();
export default organizationService;
