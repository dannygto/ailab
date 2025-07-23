import { UserSettings, UserPreferences, UserProfile, NotificationSettings } from '../types';

/**
 * 用户设置服务
 * 提供与用户设置相关的API调用
 */
class UserSettingsService {
  /**
   * 获取用户设置
   * @returns 用户设置
   */
  async getUserSettings(): Promise<UserSettings> {
    try {
      // 实际实现中应该调用API
      // const response = await api.get('/api/user/settings');
      // return response.data;

      // 现在使用模拟数据
      return this.getMockUserSettings();
    } catch (error) {
      console.error('获取用户设置失败', error);
      throw error;
    }
  }

  /**
   * 更新用户设置
   * @param settings 更新的用户设置
   * @returns 更新后的用户设置
   */
  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      // 实际实现中应该调用API
      // const response = await api.put('/api/user/settings', settings);
      // return response.data;

      // 现在使用模拟数据
      const currentSettings = this.getMockUserSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      return updatedSettings;
    } catch (error) {
      console.error('更新用户设置失败', error);
      throw error;
    }
  }

  /**
   * 更新用户通知设置
   * @param notificationSettings 更新的通知设置
   * @returns 更新后的用户设置
   */
  async updateNotificationSettings(notificationSettings: Partial<NotificationSettings>): Promise<UserSettings> {
    try {
      // 实际实现中应该调用API
      // const response = await api.put('/api/user/settings/notifications', notificationSettings);
      // return response.data;

      // 现在使用模拟数据
      const currentSettings = this.getMockUserSettings();
      const updatedSettings = {
        ...currentSettings,
        notifications: {
          ...currentSettings.notifications,
          ...notificationSettings
        }
      };
      return updatedSettings;
    } catch (error) {
      console.error('更新通知设置失败', error);
      throw error;
    }
  }

  /**
   * 更新用户界面偏好
   * @param preferences 更新的界面偏好
   * @returns 更新后的用户设置
   */
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserSettings> {
    try {
      // 实际实现中应该调用API
      // const response = await api.put('/api/user/settings/preferences', preferences);
      // return response.data;

      // 现在使用模拟数据
      const currentSettings = this.getMockUserSettings();
      const updatedSettings = {
        ...currentSettings,
        preferences: {
          ...currentSettings.preferences,
          ...preferences
        }
      };
      return updatedSettings;
    } catch (error) {
      console.error('更新用户偏好失败', error);
      throw error;
    }
  }

  /**
   * 更新用户个人资料
   * @param profile 更新的个人资料
   * @returns 更新后的用户设置
   */
  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserSettings> {
    try {
      // 实际实现中应该调用API
      // const response = await api.put('/api/user/profile', profile);
      // return response.data;

      // 现在使用模拟数据
      const currentSettings = this.getMockUserSettings();
      const updatedSettings = {
        ...currentSettings,
        profile: {
          ...currentSettings.profile,
          ...profile
        }
      };
      return updatedSettings;
    } catch (error) {
      console.error('更新用户资料失败', error);
      throw error;
    }
  }

  /**
   * 上传用户头像
   * @param file 头像文件
   * @returns 更新后的用户设置
   */
  async uploadAvatar(file: File): Promise<UserSettings> {
    try {
      // 实际实现中应该调用API
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const response = await api.post('/api/user/avatar', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      // return response.data;

      // 现在使用模拟数据
      const currentSettings = this.getMockUserSettings();

      // 模拟文件URL生成
      const fileUrl = URL.createObjectURL(file);

      const updatedSettings = {
        ...currentSettings,
        profile: {
          ...currentSettings.profile,
          avatar: fileUrl
        }
      };
      return updatedSettings;
    } catch (error) {
      console.error('上传头像失败', error);
      throw error;
    }
  }

  /**
   * 修改密码
   * @param currentPassword 当前密码
   * @param newPassword 新密码
   * @returns 操作结果
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // 实际实现中应该调用API
      // const response = await api.post('/api/user/change-password', { currentPassword, newPassword });
      // return response.data;

      // 模拟验证当前密码
      // 这里仅作为演示，实际环境中应该在后端验证
      const isCorrectPassword = currentPassword === 'password123';

      if (!isCorrectPassword) {
        return {
          success: false,
          message: '当前密码不正确'
        };
      }

      // 模拟成功响应
      return {
        success: true,
        message: '密码已成功修改'
      };
    } catch (error) {
      console.error('修改密码失败', error);
      throw error;
    }
  }

  /**
   * 重置用户设置到默认状态
   * @returns 重置后的用户设置
   */
  async resetUserSettings(): Promise<UserSettings> {
    try {
      // 实际实现中应该调用API
      // const response = await api.post('/api/user/settings/reset');
      // return response.data;

      // 现在使用模拟默认设置
      return {
        profile: {
          id: '1',
          name: '测试用户',
          email: 'test@ailab.com',
          avatar: '/assets/avatars/default.png',
          role: 'user',
          department: '计算机科学学院',
          bio: ''
        },
        preferences: {
          theme: 'light',
          language: 'zh-CN',
          fontSize: 'medium',
          compactMode: false,
          highContrastMode: false,
          animationsEnabled: true
        },
        notifications: {
          email: {
            enabled: true,
            digest: 'daily',
            experiments: true,
            system: true,
            marketing: false
          },
          push: {
            enabled: true,
            experiments: true,
            system: true,
            marketing: false
          },
          desktop: {
            enabled: true,
            experiments: true,
            system: true
          }
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: '2023-01-01T00:00:00Z',
          sessionTimeout: 30,
          activeSessions: []
        }
      };
    } catch (error) {
      console.error('重置用户设置失败', error);
      throw error;
    }
  }

  /**
   * 模拟用户设置数据
   * @returns 模拟用户设置
   */
  private getMockUserSettings(): UserSettings {
    return {
      profile: {
        id: '1',
        name: '张教授',
        email: 'professor.zhang@university.edu.cn',
        avatar: '/assets/avatars/professor.png',
        role: 'professor',
        department: '计算机科学学院',
        bio: '人工智能与机器学习专家，研究兴趣包括深度学习、计算机视觉和自然语言处理。'
      },
      preferences: {
        theme: 'system',
        language: 'zh-CN',
        fontSize: 'medium',
        compactMode: false,
        highContrastMode: false,
        animationsEnabled: true
      },
      notifications: {
        email: {
          enabled: true,
          digest: 'daily',
          experiments: true,
          system: true,
          marketing: false
        },
        push: {
          enabled: true,
          experiments: true,
          system: true,
          marketing: false
        },
        desktop: {
          enabled: true,
          experiments: true,
          system: true
        }
      },
      security: {
        twoFactorEnabled: true,
        lastPasswordChange: '2023-05-15T10:30:00Z',
        sessionTimeout: 60,
        activeSessions: [
          {
            id: 'sess123',
            device: '华为 MateBook X Pro',
            location: '北京',
            ip: '192.168.1.1',
            lastActive: '2023-06-10T08:45:00Z',
            browser: 'Chrome 114.0'
          },
          {
            id: 'sess124',
            device: 'iPhone 13 Pro',
            location: '上海',
            ip: '192.168.2.2',
            lastActive: '2023-06-09T17:20:00Z',
            browser: 'Safari 16.0'
          }
        ]
      }
    };
  }
}

export const userSettingsService = new UserSettingsService();
export default userSettingsService;
