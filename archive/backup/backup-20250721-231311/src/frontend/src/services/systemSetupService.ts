import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// 系统设置服务
const systemSetupService = {
  /**
   * 保存初始化系统设置
   * @param setupData - FormData对象，包含所有初始化配置
   * @returns 成功信息
   */
  saveInitialSetup: async (setupData: FormData) => {
    const response = await axios.post(`${API_BASE_URL}/api/system/setup`, setupData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 检查系统是否已初始化
   * @returns 系统初始化状态
   */
  checkInitializationStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/system/initialization-status`);
      return response.data;
    } catch (error) {
      // 如果API还未部署，默认返回未初始化状态
      console.error('检查初始化状态失败', error);
      return { initialized: false };
    }
  },

  /**
   * 生成模拟数据
   * @param options - 模拟数据生成选项
   * @returns 生成状态和统计信息
   */
  generateDemoData: async (options: any) => {
    const response = await axios.post(`${API_BASE_URL}/api/system/generate-demo-data`, options);
    return response.data;
  },

  /**
   * 删除所有模拟数据
   * @param confirmation - 确认信息，包含管理员密码
   * @returns 删除操作状态
   */
  deleteDemoData: async (confirmation: { adminPassword: string }) => {
    const response = await axios.post(`${API_BASE_URL}/api/system/delete-demo-data`, confirmation);
    return response.data;
  },

  /**
   * 导出系统配置
   * @returns 系统配置数据
   */
  exportSystemConfig: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/system/export-config`);
    return response.data;
  },

  /**
   * 导入系统配置
   * @param configData - 系统配置数据
   * @returns 导入状态
   */
  importSystemConfig: async (configData: any) => {
    const response = await axios.post(`${API_BASE_URL}/api/system/import-config`, configData);
    return response.data;
  },

  /**
   * 获取模拟数据统计信息
   * @returns 模拟数据统计
   */
  getDemoDataStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/system/demo-data-stats`);
    return response.data;
  },
  
  /**
   * 导出模拟数据配置
   * @returns 模拟数据配置
   */
  exportDemoDataConfig: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/system/export-demo-config`);
    return response.data;
  },

  /**
   * 生成Docker部署文件
   * @param options - 部署配置选项
   * @returns 部署文件内容和下载链接
   */
  generateDockerDeployment: async (options: any) => {
    const response = await axios.post(`${API_BASE_URL}/api/system/generate-deployment`, options);
    return response.data;
  }
};

export default systemSetupService;
