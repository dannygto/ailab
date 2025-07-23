/**
 * 模拟SystemSettingsService服务
 */
import { Box } from '@mui/material';
import { mockSystemSettings } from '../../__tests__/mockData';

export class SystemSettingsService {
  async saveThemeSettings(settings: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  async saveDataSettings(settings: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  async saveGeneralSettings(settings: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  async saveBrandingSettings(settings: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  async saveSecuritySettings(settings: any): Promise<boolean> {
    return Promise.resolve(true);
  }

  async getSystemSettings(): Promise<any> {
    return Promise.resolve(mockSystemSettings);
  }
}

export const systemSettingsService = new SystemSettingsService();


export default systemSettingsService;
