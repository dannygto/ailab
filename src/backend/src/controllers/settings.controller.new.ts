import { Request, Response } from 'express';

/**
 * 学校信息接口
 */
interface SchoolInfo {
  // 基本信息
  schoolId: string;
  schoolName: string;
  schoolType: 'elementary' | 'middle_school' | 'high_school' | 'vocational' | 'college' | 'university' | 'comprehensive';
  schoolCode?: string;

  // 管理信息
  principalName: string;
  principalPhone?: string;
  principalEmail?: string;
  establishedYear?: number;
  studentCount?: number;
  teacherCount?: number;
  classCount?: number;

  // 联系信息
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite?: string;
  schoolFax?: string;

  // 品牌信息
  logoUrl: string;
  motto?: string;
  description?: string;

  // 校区管理
  currentCampus: string;
  campuses: Array<{
    id: string;
    name: string;
    address: string;
    phone?: string;
    contactPerson?: string;
    email?: string;
    isMain: boolean;
    isActive: boolean;
    studentCount?: number;
    teacherCount?: number;
  }>;

  // 系统配置
  systemName: string;
  timezone: string;
  language: string;
  academicYear: string;
  semester: string;
  allowCampusSwitching: boolean;
  dataIsolation: boolean;

  // 版本信息
  edition: 'general' | 'vocational' | 'higher';
  version: string;
}

/**
 * 系统设置接口
 */
interface SystemSettings {
  general: {
    siteName: string;
    logoUrl: string;
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
    fontSize: string;
    fontFamily: string;
    density: 'compact' | 'standard' | 'comfortable';
    borderRadius: string;
    customCss: string;
  };
  data: {
    defaultPageSize: number;
    maxUploadSize: number;
    backupFrequency: string;
    dataRetentionDays: number;
    autoRefresh: boolean;
    refreshInterval: number;
    showAnimations: boolean;
  };
  school: SchoolInfo;
}

// 默认学校信息
const defaultSchoolInfo: SchoolInfo = {
  schoolId: 'demo-school-001',
  schoolName: '示范学校',
  schoolType: 'middle_school',
  schoolCode: 'DEMO001',
  principalName: '张校长',
  principalPhone: '010-12345678',
  principalEmail: 'principal@demo-school.edu.cn',
  establishedYear: 1985,
  studentCount: 2000,
  teacherCount: 150,
  classCount: 60,
  schoolAddress: '北京市朝阳区示范路123号',
  schoolPhone: '010-12345678',
  schoolEmail: 'admin@demo-school.edu.cn',
  schoolWebsite: 'www.demo-school.edu.cn',
  schoolFax: '010-12345679',
  logoUrl: '/assets/school-logo.png',
  motto: '求实创新，全面发展',
  description: '一所历史悠久、特色鲜明的现代化学校',
  currentCampus: 'main',
  campuses: [
    {
      id: 'main',
      name: '主校区',
      address: '北京市朝阳区示范路123号',
      phone: '010-12345678',
      contactPerson: '李主任',
      email: 'main@demo-school.edu.cn',
      isMain: true,
      isActive: true,
      studentCount: 1500,
      teacherCount: 100
    }
  ],
  systemName: 'AILAB智能实验教学平台',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  academicYear: '2024-2025',
  semester: '第一学期',
  allowCampusSwitching: true,
  dataIsolation: true,
  edition: 'general',
  version: 'v1.0.0'
};

// 默认设置
const defaultSettings: SystemSettings = {
  general: {
    siteName: 'AILAB智能实验教学平台',
    logoUrl: '/assets/school-logo.png',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
  },
  theme: {
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    darkMode: false,
    fontSize: 'medium',
    fontFamily: 'Roboto, sans-serif',
    density: 'standard',
    borderRadius: '4px',
    customCss: '',
  },
  data: {
    defaultPageSize: 10,
    maxUploadSize: 100,
    backupFrequency: 'daily',
    dataRetentionDays: 365,
    autoRefresh: true,
    refreshInterval: 30,
    showAnimations: true,
  },
  school: defaultSchoolInfo
};

// 模拟数据存储
let currentSettings: SystemSettings = { ...defaultSettings };

/**
 * 获取所有设置
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: currentSettings
    });
  } catch (error) {
    console.error('获取设置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取设置失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 获取通用设置
 */
export const getGeneralSettings = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        ...currentSettings.general,
        school: currentSettings.school
      }
    });
  } catch (error) {
    console.error('获取通用设置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取通用设置失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 更新通用设置
 */
export const updateGeneralSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    // 验证必填字段
    if (updates.school) {
      if (!updates.school.schoolName) {
        return res.status(400).json({
          success: false,
          message: '学校名称不能为空'
        });
      }

      if (!updates.school.principalName) {
        return res.status(400).json({
          success: false,
          message: '校长姓名不能为空'
        });
      }

      if (!updates.school.schoolAddress) {
        return res.status(400).json({
          success: false,
          message: '学校地址不能为空'
        });
      }

      if (!updates.school.schoolPhone) {
        return res.status(400).json({
          success: false,
          message: '学校电话不能为空'
        });
      }

      if (!updates.school.schoolEmail) {
        return res.status(400).json({
          success: false,
          message: '学校邮箱不能为空'
        });
      }

      // 确保主校区存在
      if (updates.school.campuses && updates.school.campuses.length > 0) {
        const hasMainCampus = updates.school.campuses.some((campus: any) => campus.isMain);
        if (!hasMainCampus) {
          // 如果没有主校区，将第一个校区设为主校区
          updates.school.campuses[0].isMain = true;
        }
      }
    }

    // 更新通用设置
    if (updates.general) {
      currentSettings.general = {
        ...currentSettings.general,
        ...updates.general
      };
    }

    // 更新学校信息
    if (updates.school) {
      currentSettings.school = {
        ...currentSettings.school,
        ...updates.school
      };
    }

    // TODO: 这里应该保存到数据库
    // await saveSettingsToDatabase(currentSettings);

    res.json({
      success: true,
      message: '设置已保存',
      data: {
        ...currentSettings.general,
        school: currentSettings.school
      }
    });
  } catch (error) {
    console.error('更新通用设置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新设置失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 获取主题设置
 */
export const getThemeSettings = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: currentSettings.theme
    });
  } catch (error) {
    console.error('获取主题设置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取主题设置失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 更新主题设置
 */
export const updateThemeSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    currentSettings.theme = {
      ...currentSettings.theme,
      ...updates
    };

    // TODO: 保存到数据库
    // await saveSettingsToDatabase(currentSettings);

    res.json({
      success: true,
      message: '主题设置已保存',
      data: currentSettings.theme
    });
  } catch (error) {
    console.error('更新主题设置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新主题设置失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 获取学校信息
 */
export const getSchoolInfo = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: currentSettings.school
    });
  } catch (error) {
    console.error('获取学校信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学校信息失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 更新学校信息
 */
export const updateSchoolInfo = async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    // 验证必填字段
    if (!updates.schoolName) {
      return res.status(400).json({
        success: false,
        message: '学校名称不能为空'
      });
    }

    currentSettings.school = {
      ...currentSettings.school,
      ...updates
    };

    // TODO: 保存到数据库
    // await saveSettingsToDatabase(currentSettings);

    res.json({
      success: true,
      message: '学校信息已保存',
      data: currentSettings.school
    });
  } catch (error) {
    console.error('更新学校信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新学校信息失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 重置设置为默认值
 */
export const resetSettings = async (req: Request, res: Response) => {
  try {
    currentSettings = { ...defaultSettings };

    // TODO: 保存到数据库
    // await saveSettingsToDatabase(currentSettings);

    res.json({
      success: true,
      message: '设置已重置为默认值',
      data: currentSettings
    });
  } catch (error) {
    console.error('重置设置失败:', error);
    res.status(500).json({
      success: false,
      message: '重置设置失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 获取系统版本信息
 */
export const getVersionInfo = async (req: Request, res: Response) => {
  try {
    const versionInfo = {
      edition: currentSettings.school.edition,
      version: currentSettings.school.version,
      schoolType: currentSettings.school.schoolType,
      features: getEditionFeatures(currentSettings.school.edition),
      buildTime: new Date().toISOString()
    };

    res.json({
      success: true,
      data: versionInfo
    });
  } catch (error) {
    console.error('获取版本信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取版本信息失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * 根据版本获取功能列表
 */
function getEditionFeatures(edition: string): string[] {
  const baseFeatures = [
    '实验管理',
    '学生管理',
    '教师管理',
    'AI助手',
    '设备管理',
    '数据分析',
    '校区管理',
    '课程模板'
  ];

  switch (edition) {
    case 'vocational':
      return [
        ...baseFeatures,
        '实训管理',
        '技能评估',
        '企业合作',
        '认证管理'
      ];
    case 'higher':
      return [
        ...baseFeatures,
        '研究管理',
        '学术分析',
        '论文管理',
        '实验室预约',
        '研究生管理',
        '协作平台'
      ];
    default:
      return baseFeatures;
  }
}
