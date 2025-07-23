import apiService from './api';
import { toast } from 'react-hot-toast';

export class SystemSettingsService {
  /**
   * 获取模拟数据统计
   * @returns 模拟数据统计信息
   */
  async getDemoDataStats() {
    try {
      const response = await apiService.get('/settings/demo-data-stats');
      return response.data;
    } catch (error) {
      // 如果API不存在，返回模拟数据
      console.error('获取模拟数据统计失败，使用模拟数据', error);
      return {
        users: 15,
        experiments: 48,
        devices: 12,
        results: 96,
        lastGenerated: '2025-07-08T10:30:00Z'
      };
    }
  }

  /**
   * 生成模拟数据
   * @param options 模拟数据选项
   * @returns 生成结果
   */
  async generateDemoData(options: any) {
    try {
      const response = await apiService.post('/settings/generate-demo-data', options);
      toast.success('模拟数据生成成功');
      return response.data;
    } catch (error) {
      console.error('生成模拟数据失败:', error);
      toast.error('生成模拟数据失败');
      throw error;
    }
  }

  /**
   * 删除模拟数据
   * @param confirmation 管理员确认信息
   * @returns 删除结果
   */
  async deleteDemoData(confirmation: any) {
    try {
      const response = await apiService.post('/settings/delete-demo-data', confirmation);
      toast.success('模拟数据已成功删除');
      return response.data;
    } catch (error) {
      console.error('删除模拟数据失败:', error);
      toast.error('删除模拟数据失败');
      throw error;
    }
  }

  /**
   * 导出模拟数据配置
   * @returns 模拟数据配置
   */
  async exportDemoDataConfig() {
    try {
      const response = await apiService.get('/settings/export-demo-config');
      return response.data;
    } catch (error) {
      console.error('导出模拟数据配置失败，使用模拟数据', error);
      return {
        version: "2.1.0",
        generated: new Date().toISOString(),
        config: {
          users: {
            count: 15,
            roles: ["admin", "teacher", "student"],
            template: "standard"
          },
          experiments: {
            count: 48,
            types: ["basic", "advanced"],
            template: "standard"
          },
          devices: {
            count: 12,
            types: ["camera", "sensor", "controller"],
            template: "standard"
          },
          results: {
            count: 96,
            template: "standard"
          }
        }
      };
    }
  }
  
  /**
   * 生成Docker部署文件
   * @param options 部署配置选项
   * @returns 部署文件内容
   */
  async generateDockerDeployment(options: any) {
    try {
      const response = await apiService.post('/settings/generate-deployment', options);
      toast.success('部署文件生成成功');
      return response.data;
    } catch (error) {
      console.error('生成部署文件失败:', error);
      toast.error('生成部署文件失败');
      // 返回模拟数据以便前端开发测试
      return {
        dockerCompose: `version: '3.8'\n\nservices:\n  app:\n    build:\n      context: .\n      dockerfile: Dockerfile.app\n    # 其他配置...\n`,
        dockerfiles: {
          app: `FROM node:18-alpine\n\nWORKDIR /app\n\nCOPY . .\n\nRUN npm install\n\nCMD ["npm", "start"]`,
          ai: `FROM python:3.9-slim\n\nWORKDIR /app\n\nCOPY requirements.txt .\n\nRUN pip install -r requirements.txt\n\nCMD ["python", "app.py"]`
        },
        nginxConf: `server {\n  listen 80;\n  server_name ${options.domain || 'example.com'};\n\n  location / {\n    proxy_pass http://app:3000;\n  }\n}`
      };
    }
  }
  async saveGeneralSettings(settings: any): Promise<boolean> {
    try {
      // 调用api保存通用设置
      await apiService.post('/settings/general', settings);
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
      
      // 添加Logo文件(如果有)
      if (settings.logo && settings.logo instanceof File) {
        formData.append('logo', settings.logo);
      }
      
      // 调用api保存品牌设置
      await apiService.post('/settings/theme', formData, {
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
      const response = await apiService.get('/settings');
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
      await apiService.post('/settings/theme', settings);
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
      await apiService.post('/settings/data', settings);
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
      
      const response = await apiService.post('/settings/logo', formData, {
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
