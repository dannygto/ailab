import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';
import {
  Permission,
  PermissionRule,
  ResourcePermissionConfig,
  CreatePermissionRequest,
  CreatePermissionRuleRequest,
  UpdateResourcePermissionConfigRequest,
  ResourceType,
  PermissionAction,
  PermissionCheckResult
} from '../types/permission';
import { ApiResponse } from '../types/api';

// API基础URL配置
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

/**
 * 权限服务
 * 提供权限管理和验证的接口
 */
class PermissionService {
  private baseUrl = `${API_BASE_URL}/permissions`;

  /**
   * 检查用户是否有特定权限
   * @param resourceType 资源类型
   * @param action 操作类型
   * @param resourceId 可选的资源ID
   */
  async checkPermission(
    resourceType: ResourceType,
    action: PermissionAction,
    resourceId?: string
  ): Promise<PermissionCheckResult> {
    try {
      const params = { resourceType, action, resourceId };
      const response = await axios.get<ApiResponse<PermissionCheckResult>>(
        `${this.baseUrl}/check`,
        { params }
      );
      return response.data.data as PermissionCheckResult;
    } catch (error) {
      throw handleApiError(error, { context: '权限检查失败' });
    }
  }

  /**
   * 获取用户的所有权限
   */
  async getUserPermissions(): Promise<Permission[]> {
    try {
      const response = await axios.get<ApiResponse<Permission[]>>(
        `${this.baseUrl}/user`
      );
      return response.data.data || [];
    } catch (error) {
      throw handleApiError(error, { context: '获取用户权限失败' });
    }
  }

  /**
   * 获取特定资源的权限配置
   */
  async getResourcePermissions(
    resourceType: ResourceType,
    resourceId: string
  ): Promise<ResourcePermissionConfig> {
    try {
      const response = await axios.get<ApiResponse<ResourcePermissionConfig>>(
        `${this.baseUrl}/resources/${resourceType}/${resourceId}`
      );
      return response.data.data as ResourcePermissionConfig;
    } catch (error) {
      throw handleApiError(error, { context: '获取资源权限配置失败' });
    }
  }

  /**
   * 更新资源权限配置
   */
  async updateResourcePermissions(
    resourceType: ResourceType,
    resourceId: string,
    config: UpdateResourcePermissionConfigRequest
  ): Promise<ResourcePermissionConfig> {
    try {
      const response = await axios.put<ApiResponse<ResourcePermissionConfig>>(
        `${this.baseUrl}/resources/${resourceType}/${resourceId}`,
        config
      );
      return response.data.data as ResourcePermissionConfig;
    } catch (error) {
      throw handleApiError(error, { context: '更新资源权限配置失败' });
    }
  }

  /**
   * 创建权限
   */
  async createPermission(
    permission: CreatePermissionRequest
  ): Promise<Permission> {
    try {
      const response = await axios.post<ApiResponse<Permission>>(
        this.baseUrl,
        permission
      );
      return response.data.data as Permission;
    } catch (error) {
      throw handleApiError(error, { context: '创建权限失败' });
    }
  }

  /**
   * 创建权限规则
   */
  async createPermissionRule(
    rule: CreatePermissionRuleRequest
  ): Promise<PermissionRule> {
    try {
      const response = await axios.post<ApiResponse<PermissionRule>>(
        `${this.baseUrl}/rules`,
        rule
      );
      return response.data.data as PermissionRule;
    } catch (error) {
      throw handleApiError(error, { context: '创建权限规则失败' });
    }
  }

  /**
   * 获取所有权限规则
   */
  async getPermissionRules(): Promise<PermissionRule[]> {
    try {
      const response = await axios.get<ApiResponse<PermissionRule[]>>(
        `${this.baseUrl}/rules`
      );
      return response.data.data || [];
    } catch (error) {
      throw handleApiError(error, { context: '获取权限规则失败' });
    }
  }

  /**
   * 获取特定权限规则
   */
  async getPermissionRule(ruleId: string): Promise<PermissionRule> {
    try {
      const response = await axios.get<ApiResponse<PermissionRule>>(
        `${this.baseUrl}/rules/${ruleId}`
      );
      return response.data.data as PermissionRule;
    } catch (error) {
      throw handleApiError(error, { context: '获取权限规则失败' });
    }
  }

  /**
   * 删除权限规则
   */
  async deletePermissionRule(ruleId: string): Promise<boolean> {
    try {
      const response = await axios.delete<ApiResponse<{ success: boolean }>>(
        `${this.baseUrl}/rules/${ruleId}`
      );
      return response.data.success;
    } catch (error) {
      throw handleApiError(error, { context: '删除权限规则失败' });
    }
  }

  /**
   * 应用权限规则到资源
   */
  async applyRuleToResource(
    ruleId: string,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<boolean> {
    try {
      const response = await axios.post<ApiResponse<{ success: boolean }>>(
        `${this.baseUrl}/rules/${ruleId}/apply`,
        { resourceType, resourceId }
      );
      return response.data.success;
    } catch (error) {
      throw handleApiError(error, { context: '应用权限规则失败' });
    }
  }
}

const permissionService = new PermissionService();
export default permissionService;
