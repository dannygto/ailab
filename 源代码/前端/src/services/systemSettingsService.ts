import { Box } from '@mui/material';
import apiService from './api';
import { toast } from 'react-hot-toast';

export class SystemSettingsService {
  async saveGeneralSettings(settings: any): Promise<boolean> {
    try {
      // 调用api保存通用设置
      await apiService.post('/api/settings/general', settings);
      toast.success('通用设置保存成功');
      return true;
    } catch (error) {
      console.error('保存通用设置失败:', error);
      toast.error('保存通用设置失败');
      return false;
    }
  }

  async saveBrandingSettings(settings: any): Promise<boolean> {
    try {
      // 使用FormData处理文件上传
      const formData = new FormData();
      
      // 添加文本字段
      Object.keys(settings).forEach(key => {
        if (key !== 'logo' || !settings[key]) {
          formData.append(key, settings[key]);
        }
      });
      
      // 添加Logo文件(如果�?
      if (settings.logo && settings.logo instanceof File) {
        formData.append('logo', settings.logo);
      }
      
      // 调用api保存品牌设置
      await apiService.post('/api/settings/branding', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('品牌设置保存成功');
      return true;
    } catch (error) {
      console.error('保存品牌设置失败:', error);
      toast.error('保存品牌设置失败');
      return false;
    }
  }

  async getSystemSettings(): Promise<any> {
    try {
      // 获取系统设置
      const response = await apiService.get('/api/settings');
      return response.data;
    } catch (error) {
      console.error('获取系统设置失败:', error);
      toast.error('获取系统设置失败');
      return null;
    }
  }

  async saveThemeSettings(settings: any): Promise<boolean> {
    try {
      // 调用api保存主题设置
      await apiService.post('/api/settings/theme', settings);
      toast.success('主题设置保存成功');
      return true;
    } catch (error) {
      console.error('保存主题设置失败:', error);
      toast.error('保存主题设置失败');
      return false;
    }
  }

  async saveDataSettings(settings: any): Promise<boolean> {
    try {
      // 调用api保存数据设置
      await apiService.post('/api/settings/data', settings);
      toast.success('数据设置保存成功');
      return true;
    } catch (error) {
      console.error('保存数据设置失败:', error);
      toast.error('保存数据设置失败');
      return false;
    }
  }

  async uploadLogo(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await apiService.post('/api/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Logo上传成功');
      return response.data.logoUrl;
    } catch (error) {
      console.error('Logo上传失败:', error);
      toast.error('Logo上传失败');
      return null;
    }
  }
}

const systemSettingsService = new SystemSettingsService();
export default systemSettingsService;
