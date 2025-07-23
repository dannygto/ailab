/**
 * 设备相关API接口
 * 扩展API服务以支持批量操作
 */

import { Device } from '../types/devices';
import axios from 'axios';
import { handleApiError, tryCatch } from '../utils/errorHandler';

// API基础URL配置
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

/**
 * 批量操作设备参数接口
 */
export interface BatchDeviceOperationParams {
  deviceIds: string[];
  operation: 'activate' | 'deactivate' | 'restart' | 'update' | 'delete';
  params?: any;
}

/**
 * 批量操作结果接口
 */
export interface BatchOperationResult {
  successful: string[];
  failed: {
    deviceId: string;
    reason: string;
  }[];
  totalCount: number;
  successCount: number;
  failureCount: number;
}

/**
 * 设备批量操作服务
 */
export const deviceBatchService = {
  /**
   * 批量操作设备
   * @param params 批量操作参数
   * @returns 批量操作结果
   */
  async batchOperation(params: BatchDeviceOperationParams): Promise<BatchOperationResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/devices/batch`, params);
      return response.data;
    } catch (error) {
      handleApiError(error, {
        context: '批量操作设备',
        showNotification: true
      });
      // 发生错误时返回一个默认结果
      return {
        successful: [],
        failed: [{
          deviceId: 'unknown',
          reason: error instanceof Error ? error.message : '未知错误'
        }],
        totalCount: params.deviceIds.length,
        successCount: 0,
        failureCount: params.deviceIds.length
      };
    }
  },

  /**
   * 批量激活设备
   * @param deviceIds 设备ID数组
   * @returns 批量操作结果
   */
  async batchActivate(deviceIds: string[]): Promise<BatchOperationResult> {
    return this.batchOperation({
      deviceIds,
      operation: 'activate'
    });
  },

  /**
   * 批量停用设备
   * @param deviceIds 设备ID数组
   * @returns 批量操作结果
   */
  async batchDeactivate(deviceIds: string[]): Promise<BatchOperationResult> {
    return this.batchOperation({
      deviceIds,
      operation: 'deactivate'
    });
  },

  /**
   * 批量重启设备
   * @param deviceIds 设备ID数组
   * @returns 批量操作结果
   */
  async batchRestart(deviceIds: string[]): Promise<BatchOperationResult> {
    return this.batchOperation({
      deviceIds,
      operation: 'restart'
    });
  },

  /**
   * 批量更新设备
   * @param deviceIds 设备ID数组
   * @param updateData 更新数据
   * @returns 批量操作结果
   */
  async batchUpdate(deviceIds: string[], updateData: Partial<Device>): Promise<BatchOperationResult> {
    return this.batchOperation({
      deviceIds,
      operation: 'update',
      params: updateData
    });
  },

  /**
   * 批量删除设备
   * @param deviceIds 设备ID数组
   * @returns 批量操作结果
   */
  async batchDelete(deviceIds: string[]): Promise<BatchOperationResult> {
    return this.batchOperation({
      deviceIds,
      operation: 'delete'
    });
  }
};

export default deviceBatchService;
