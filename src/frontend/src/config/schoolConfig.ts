/**
 * 学校配置管理
 * 支持多校区、数据隔离
 */

import { useState, useEffect } from 'react';
import { SchoolType } from './version';

export interface Campus {
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
  createdAt: Date;
  updatedAt?: Date;
}

export interface SchoolConfig {
  // 基本信息
  schoolId: string;           // 学校唯一标识
  schoolName: string;         // 学校名称
  schoolType: SchoolType;     // 学校类型
  schoolCode?: string;        // 学校代码（教育部门编码）

  // 管理信息
  principalName: string;      // 校长姓名
  principalPhone?: string;    // 校长电话
  principalEmail?: string;    // 校长邮箱
  establishedYear?: number;   // 建校年份
  studentCount?: number;      // 学生人数
  teacherCount?: number;      // 教师人数
  classCount?: number;        // 班级数量

  // 联系信息
  schoolAddress: string;      // 学校地址
  schoolPhone: string;        // 学校电话
  schoolEmail: string;        // 学校邮箱
  schoolWebsite?: string;     // 学校网站
  schoolFax?: string;         // 学校传真

  // 品牌信息
  logoUrl: string;           // 学校Logo
  motto?: string;            // 校训
  description?: string;      // 学校简介
  history?: string;          // 学校历史

  // 校区管理
  currentCampus: string;     // 当前校区ID
  campuses: Campus[];        // 校区列表

  // 系统配置
  systemName: string;        // 系统名称
  timezone: string;          // 时区
  language: string;          // 语言
  academicYear: string;      // 学年
  semester: string;          // 学期

  // 权限配置
  allowCampusSwitching: boolean;  // 是否允许切换校区
  dataIsolation: boolean;         // 数据隔离开关

  // 版本信息
  edition: 'general' | 'vocational' | 'higher';  // 版本类型
  version: string;                                // 版本号

  // 时间戳
  createdAt: Date;
  updatedAt?: Date;
}

// 默认学校配置
export const defaultSchoolConfig: SchoolConfig = {
  schoolId: 'demo-school-001',
  schoolName: '示范中学',
  schoolType: 'middle_school',

  principalName: '张校长',
  principalPhone: '010-87654321',
  principalEmail: 'principal@demo-school.edu.cn',
  establishedYear: 1998,
  studentCount: 1200,
  teacherCount: 80,
  classCount: 30,

  schoolAddress: '北京市朝阳区示范路123号',
  schoolPhone: '010-12345678',
  schoolEmail: 'admin@demo-school.edu.cn',
  schoolWebsite: 'www.demo-school.edu.cn',
  schoolFax: '010-87654322',

  logoUrl: '/assets/school-logo.png',
  motto: '勤奋、创新、和谐、发展',
  description: '致力于培养德智体美劳全面发展的社会主义建设者和接班人',
  history: '本校成立于1998年，前身为示范小学，2005年更名为示范中学。',

  currentCampus: 'main',
  campuses: [
    {
      id: 'main',
      name: '主校区',
      address: '北京市朝阳区示范路123号',
      phone: '010-12345678',
      contactPerson: '李老师',
      email: 'li@demo-school.edu.cn',
      isMain: true,
      isActive: true,
      studentCount: 800,
      teacherCount: 50,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'east',
      name: '东校区',
      address: '北京市朝阳区示范路456号',
      phone: '010-12345679',
      contactPerson: '王老师',
      email: 'wang@demo-school.edu.cn',
      isMain: false,
      isActive: true,
      studentCount: 400,
      teacherCount: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  systemName: 'AILAB智能实验教学平台',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  academicYear: '2023-2024',
  semester: '第一学期',

  allowCampusSwitching: true,
  dataIsolation: true,

  edition: 'general',
  version: 'v1.0.0',

  createdAt: new Date(),
  updatedAt: new Date()
};

// 学校配置服务类
export class SchoolConfigService {
  private static instance: SchoolConfigService;
  private config: SchoolConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): SchoolConfigService {
    if (!SchoolConfigService.instance) {
      SchoolConfigService.instance = new SchoolConfigService();
    }
    return SchoolConfigService.instance;
  }

  // 加载配置
  private loadConfig(): SchoolConfig {
    try {
      const stored = localStorage.getItem('school-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultSchoolConfig,
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
          campuses: parsed.campuses?.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          })) || defaultSchoolConfig.campuses
        };
      }
    } catch (error) {
      console.error('Failed to load school config:', error);
    }
    return defaultSchoolConfig;
  }

  // 保存配置
  public saveConfig(config: Partial<SchoolConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      updatedAt: new Date()
    };

    try {
      localStorage.setItem('school-config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save school config:', error);
    }
  }

  // 获取配置
  public getConfig(): SchoolConfig {
    return { ...this.config };
  }

  // 获取当前校区
  public getCurrentCampus(): Campus | undefined {
    return this.config.campuses.find(c => c.id === this.config.currentCampus);
  }

  // 获取主校区
  public getMainCampus(): Campus | undefined {
    return this.config.campuses.find(c => c.isMain);
  }

  // 添加校区
  public addCampus(campus: Omit<Campus, 'id' | 'createdAt'>): void {
    const newCampus: Campus = {
      ...campus,
      id: `campus-${Date.now()}`,
      createdAt: new Date()
    };

    this.config.campuses.push(newCampus);
    this.saveConfig(this.config);
  }

  // 更新校区
  public updateCampus(campusId: string, updates: Partial<Campus>): void {
    const index = this.config.campuses.findIndex(c => c.id === campusId);
    if (index !== -1) {
      this.config.campuses[index] = {
        ...this.config.campuses[index],
        ...updates
      };
      this.saveConfig(this.config);
    }
  }

  // 删除校区
  public deleteCampus(campusId: string): void {
    // 不能删除主校区
    const campus = this.config.campuses.find(c => c.id === campusId);
    if (campus && !campus.isMain) {
      this.config.campuses = this.config.campuses.filter(c => c.id !== campusId);
      // 如果删除的是当前校区，切换到主校区
      if (this.config.currentCampus === campusId) {
        const mainCampus = this.getMainCampus();
        if (mainCampus) {
          this.config.currentCampus = mainCampus.id;
        }
      }
      this.saveConfig(this.config);
    }
  }

  // 切换校区
  public switchCampus(campusId: string): void {
    const campus = this.config.campuses.find(c => c.id === campusId && c.isActive);
    if (campus) {
      this.config.currentCampus = campusId;
      this.saveConfig(this.config);
    }
  }

  // 生成学校唯一标识
  public generateSchoolId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `school-${timestamp}-${random}`;
  }
}

// 导出单例实例
export const schoolConfigService = SchoolConfigService.getInstance();

// Hook for React components
export const useSchoolConfig = () => {
  const [config, setConfig] = useState<SchoolConfig>(schoolConfigService.getConfig());

  useEffect(() => {
    const updateConfig = () => {
      setConfig(schoolConfigService.getConfig());
    };

    // 监听存储变化
    window.addEventListener('storage', updateConfig);

    return () => {
      window.removeEventListener('storage', updateConfig);
    };
  }, []);

  const updateConfig = (updates: Partial<SchoolConfig>) => {
    schoolConfigService.saveConfig(updates);
    setConfig(schoolConfigService.getConfig());
  };

  return {
    config,
    updateConfig,
    getCurrentCampus: () => schoolConfigService.getCurrentCampus(),
    getMainCampus: () => schoolConfigService.getMainCampus(),
    addCampus: (campus: Omit<Campus, 'id' | 'createdAt'>) => {
      schoolConfigService.addCampus(campus);
      setConfig(schoolConfigService.getConfig());
    },
    updateCampus: (campusId: string, updates: Partial<Campus>) => {
      schoolConfigService.updateCampus(campusId, updates);
      setConfig(schoolConfigService.getConfig());
    },
    deleteCampus: (campusId: string) => {
      schoolConfigService.deleteCampus(campusId);
      setConfig(schoolConfigService.getConfig());
    },
    switchCampus: (campusId: string) => {
      schoolConfigService.switchCampus(campusId);
      setConfig(schoolConfigService.getConfig());
    }
  };
};
