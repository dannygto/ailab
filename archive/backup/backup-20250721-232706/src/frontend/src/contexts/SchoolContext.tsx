import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import schoolService from '../services/schoolService';

// 校区接口
interface School {
  id: number;
  name: string;
  code: string;
  logoUrl?: string;
  themeSettings?: any;
  active: boolean;
}

// 校区上下文接口
interface SchoolContextType {
  currentSchool: School | null;
  schools: School[];
  loading: boolean;
  setCurrentSchool: (schoolCode: string) => void;
  refreshSchools: () => Promise<void>;
}

// 创建校区上下文
const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

// 校区提供者组件
export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSchool, setCurrentSchoolState] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 加载校区数据
  const loadSchoolData = async () => {
    try {
      setLoading(true);
      
      // 获取所有校区
      const allSchools = await schoolService.getAllSchools();
      setSchools(allSchools);
      
      // 获取当前校区
      const current = await schoolService.getCurrentSchool();
      setCurrentSchoolState(current || (allSchools.length > 0 ? allSchools[0] : null));
      
      setLoading(false);
    } catch (error) {
      console.error('加载校区数据失败:', error);
      setLoading(false);
    }
  };

  // 设置当前校区
  const setCurrentSchool = (schoolCode: string) => {
    schoolService.setCurrentSchool(schoolCode);
  };

  // 刷新校区列表
  const refreshSchools = async () => {
    const allSchools = await schoolService.getAllSchools();
    setSchools(allSchools);
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadSchoolData();
  }, []);

  return (
    <SchoolContext.Provider
      value={{
        currentSchool,
        schools,
        loading,
        setCurrentSchool,
        refreshSchools
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

// 自定义Hook，用于访问校区上下文
export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
