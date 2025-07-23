// 用户设置相关类型

// 用户角色
export type UserRole = 'admin' | 'professor' | 'student' | 'user' | 'guest';

// 主题类型
export type ThemeType = 'light' | 'dark' | 'system';

// 语言类型
export type LanguageType = 'zh-CN' | 'en-US';

// 字体大小
export type FontSize = 'small' | 'medium' | 'large';

// 邮件摘要类型
export type EmailDigestType = 'daily' | 'weekly' | 'never';

// 用户个人资料
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  bio?: string;
}

// 用户界面偏好设置
export interface UserPreferences {
  theme: ThemeType;
  language: LanguageType;
  fontSize: FontSize;
  compactMode: boolean;
  highContrastMode: boolean;
  animationsEnabled: boolean;
}

// 邮件通知设置
export interface EmailNotificationSettings {
  enabled: boolean;
  digest: EmailDigestType;
  experiments: boolean;
  system: boolean;
  marketing: boolean;
}

// 推送通知设置
export interface PushNotificationSettings {
  enabled: boolean;
  experiments: boolean;
  system: boolean;
  marketing: boolean;
}

// 桌面通知设置
export interface DesktopNotificationSettings {
  enabled: boolean;
  experiments: boolean;
  system: boolean;
}

// 综合通知设置
export interface NotificationSettings {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  desktop: DesktopNotificationSettings;
}

// 会话信息
export interface SessionInfo {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  browser: string;
}

// 安全设置
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  sessionTimeout: number;
  activeSessions: SessionInfo[];
}

// 完整用户设置
export interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
  notifications: NotificationSettings;
  security: SecuritySettings;
}
