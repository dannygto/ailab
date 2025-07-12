import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SystemConfig {
  siteName: string;
  companyName: string;
  siteDescription: string;
  logoUrl: string;
  maintenanceMode: boolean;
  defaultLanguage: string;
  theme: string;
  primaryColor: string;
}

interface SystemConfigContextType {
  config: SystemConfig;
  updateSystemConfig: (newConfig: Partial<SystemConfig>) => void;
  loadSystemConfig: () => void;
}

const defaultConfig: SystemConfig = {
  siteName: 'AI实验平台',
  companyName: '未来教育科技有限公司',
  siteDescription: '专业的人工智能实验研究平台',
  logoUrl: '/logo.png',
  maintenanceMode: false,
  defaultLanguage: 'zh_CN',
  theme: 'light',
  primaryColor: '#1976d2'
};

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(undefined);

export const useSystemConfig = () => {
  const context = useContext(SystemConfigContext);
  if (!context) {
    throw new Error('useSystemConfig must be used within a SystemConfigProvider');
  }
  return context;
};

interface SystemConfigProviderProps {
  children: ReactNode;
}

export const SystemConfigProvider: React.FC<SystemConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);

  const loadSystemConfig = () => {
    try {
      const savedConfig = localStorage.getItem('systemConfig');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...defaultConfig, ...parsedConfig.general });
        // 立即应用配置
        applyConfig({ ...defaultConfig, ...parsedConfig.general });
      }
    } catch (error) {
      console.error('加载系统配置失败:', error);
    }
  };

  const updateSystemConfig = (newConfig: Partial<SystemConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // 保存到localStorage
    localStorage.setItem('systemConfig', JSON.stringify({
      general: updatedConfig
    }));
    
    // 立即应用配置
    applyConfig(updatedConfig);
  };

  const applyConfig = (configToApply: SystemConfig) => {
    // 更新页面标题
    document.title = configToApply.siteName;
    
    // 更新favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon && configToApply.logoUrl) {
      favicon.href = configToApply.logoUrl;
    }
    
    // 更新meta description
    const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDescription) {
      metaDescription.content = configToApply.siteDescription;
    }
    
    // 如果启用维护模式，可以显示维护页面
    if (configToApply.maintenanceMode) {
      console.log('维护模式已启用');
      // 这里可以添加维护模式的逻辑
    }
  };

  useEffect(() => {
    loadSystemConfig();
    
    // 监听系统配置更新事件
    const handleConfigUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.general) {
        updateSystemConfig(event.detail.general);
      }
    };
    
    window.addEventListener('systemConfigUpdated', handleConfigUpdate as EventListener);
    
    return () => {
      window.removeEventListener('systemConfigUpdated', handleConfigUpdate as EventListener);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SystemConfigContext.Provider value={{ config, updateSystemConfig, loadSystemConfig }}>
      {children}
    </SystemConfigContext.Provider>
  );
};

export default SystemConfigProvider;
