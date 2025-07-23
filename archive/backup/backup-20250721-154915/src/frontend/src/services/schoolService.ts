import apiService from './api';
import { toast } from 'react-hot-toast';

/**
 * 校区管理服务
 * 提供校区相关的API调用方法
 */
export class SchoolService {
  /**
   * 获取所有校区
   * @returns 校区列表
   */
  async getAllSchools() {
    try {
      const response = await apiService.get('/schools');
      return response.data.data;
    } catch (error) {
      console.error('获取校区列表失败:', error);
      toast.error('获取校区列表失败');
      return [];
    }
  }

  /**
   * 获取特定校区信息
   * @param code 校区代码
   * @returns 校区信息
   */
  async getSchoolByCode(code: string) {
    try {
      const response = await apiService.get(`/schools/${code}`);
      return response.data.data;
    } catch (error) {
      console.error(`获取校区(${code})信息失败:`, error);
      toast.error('获取校区信息失败');
      return null;
    }
  }

  /**
   * 创建新校区
   * @param schoolData 校区数据
   * @returns 创建的校区信息
   */
  async createSchool(schoolData: any) {
    try {
      const response = await apiService.post('/schools', schoolData);
      toast.success('校区创建成功');
      return response.data.data;
    } catch (error) {
      console.error('创建校区失败:', error);
      toast.error('创建校区失败');
      throw error;
    }
  }

  /**
   * 更新校区信息
   * @param id 校区ID
   * @param schoolData 校区更新数据
   * @returns 更新后的校区信息
   */
  async updateSchool(id: number, schoolData: any) {
    try {
      const response = await apiService.put(`/schools/${id}`, schoolData);
      toast.success('校区信息更新成功');
      return response.data.data;
    } catch (error) {
      console.error('更新校区信息失败:', error);
      toast.error('更新校区信息失败');
      throw error;
    }
  }

  /**
   * 删除校区
   * @param id 校区ID
   * @returns 操作结果
   */
  async deleteSchool(id: number) {
    try {
      const response = await apiService.delete(`/schools/${id}`);
      toast.success('校区已成功删除');
      return response.data;
    } catch (error) {
      console.error('删除校区失败:', error);
      toast.error('删除校区失败');
      throw error;
    }
  }

  /**
   * 获取当前校区信息
   * @returns 当前校区信息
   */
  async getCurrentSchool() {
    try {
      // 从本地存储获取当前校区代码
      const currentSchoolCode = localStorage.getItem('currentSchoolCode') || this.getSchoolCodeFromUrl();
      
      if (!currentSchoolCode) {
        return null;
      }
      
      return await this.getSchoolByCode(currentSchoolCode);
    } catch (error) {
      console.error('获取当前校区信息失败:', error);
      return null;
    }
  }

  /**
   * 从URL中提取校区代码
   * @returns 校区代码
   */
  private getSchoolCodeFromUrl() {
    // 尝试从子域名获取校区代码
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length > 2) {
      return parts[0];
    }
    
    // 尝试从URL参数获取校区代码
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('schoolCode') || null;
  }

  /**
   * 设置当前校区
   * @param schoolCode 校区代码
   */
  setCurrentSchool(schoolCode: string) {
    localStorage.setItem('currentSchoolCode', schoolCode);
    // 重新加载页面以应用新校区设置
    window.location.reload();
  }
}

const schoolService = new SchoolService();
export default schoolService;
