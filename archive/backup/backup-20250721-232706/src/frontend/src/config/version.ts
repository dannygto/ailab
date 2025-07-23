/**
 * AILAB 版本配置管理
 *
 * 版本区分方案：
 * 1. 普教版 (General Education) - 面向普通中小学
 * 2. 职教版 (Vocational Education) - 面向职业学校
 * 3. 高校版 (Higher Education) - 面向大学院校
 */

export type EducationLevel = 'general' | 'vocational' | 'higher';

export type SchoolType =
  | 'elementary'      // 小学
  | 'middle_school'   // 初中
  | 'high_school'     // 高中
  | 'vocational'      // 职业学校
  | 'college'         // 大专
  | 'university'      // 大学
  | 'comprehensive';  // 综合学校

export interface VersionConfig {
  edition: EducationLevel;
  version: string;
  buildTime: string;
  features: string[];
  supportedSchoolTypes: SchoolType[];
  maxStudents: number;
  maxTeachers: number;
  maxCampuses: number;
  aiServiceEnabled: boolean;
  advancedAnalytics: boolean;
}

// 当前版本配置 - 普教版
export const currentVersion: VersionConfig = {
  edition: 'general',
  version: '1.0.0-general',
  buildTime: '2025-07-13',
  features: [
    '实验管理',
    '学生管理',
    '教师管理',
    'AI助手',
    '设备管理',
    '数据分析',
    '校区管理',
    '课程模板'
  ],
  supportedSchoolTypes: ['elementary', 'middle_school', 'high_school', 'comprehensive'],
  maxStudents: 5000,
  maxTeachers: 500,
  maxCampuses: 10,
  aiServiceEnabled: true,
  advancedAnalytics: true
};

// 不同版本的配置
export const versionConfigs: Record<EducationLevel, VersionConfig> = {
  general: {
    edition: 'general',
    version: '1.0.0-general',
    buildTime: '2025-07-13',
    features: [
      '实验管理',
      '学生管理',
      '教师管理',
      'AI助手',
      '设备管理',
      '数据分析',
      '校区管理',
      '课程模板'
    ],
    supportedSchoolTypes: ['elementary', 'middle_school', 'high_school', 'comprehensive'],
    maxStudents: 5000,
    maxTeachers: 500,
    maxCampuses: 10,
    aiServiceEnabled: true,
    advancedAnalytics: true
  },

  vocational: {
    edition: 'vocational',
    version: '1.0.0-vocational',
    buildTime: '2025-07-13',
    features: [
      '实验管理',
      '学生管理',
      '教师管理',
      'AI助手',
      '设备管理',
      '数据分析',
      '校区管理',
      '课程模板',
      '实训管理',
      '技能评估',
      '企业合作'
    ],
    supportedSchoolTypes: ['vocational'],
    maxStudents: 8000,
    maxTeachers: 800,
    maxCampuses: 15,
    aiServiceEnabled: true,
    advancedAnalytics: true
  },

  higher: {
    edition: 'higher',
    version: '1.0.0-higher',
    buildTime: '2025-07-13',
    features: [
      '实验管理',
      '学生管理',
      '教师管理',
      'AI助手',
      '设备管理',
      '数据分析',
      '校区管理',
      '课程模板',
      '科研管理',
      '论文管理',
      '学科建设',
      '国际合作'
    ],
    supportedSchoolTypes: ['college', 'university'],
    maxStudents: 20000,
    maxTeachers: 2000,
    maxCampuses: 50,
    aiServiceEnabled: true,
    advancedAnalytics: true
  }
};

// 获取当前版本信息
export const getVersionInfo = (): VersionConfig => {
  // 可以从环境变量或配置文件读取
  const edition = (process.env.REACT_APP_EDITION as EducationLevel) || 'general';
  return versionConfigs[edition] || versionConfigs.general;
};

// 检查功能是否启用
export const isFeatureEnabled = (feature: string): boolean => {
  return getVersionInfo().features.includes(feature);
};

// 检查学校类型是否支持
export const isSchoolTypeSupported = (schoolType: SchoolType): boolean => {
  return getVersionInfo().supportedSchoolTypes.includes(schoolType);
};

// 获取版本显示名称
export const getVersionDisplayName = (edition: EducationLevel): string => {
  const names = {
    general: 'AILAB 普教版',
    vocational: 'AILAB 职教版',
    higher: 'AILAB 高校版'
  };
  return names[edition];
};

// 获取学校类型显示名称
export const getSchoolTypeDisplayName = (schoolType: SchoolType): string => {
  const names = {
    elementary: '小学',
    middle_school: '初中',
    high_school: '高中',
    vocational: '职业学校',
    college: '大专院校',
    university: '大学',
    comprehensive: '综合学校'
  };
  return names[schoolType];
};
