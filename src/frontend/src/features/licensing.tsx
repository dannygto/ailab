import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LicenseInfo {
  type: 'free' | 'standard' | 'premium' | 'enterprise';
  features: string[];
  expiresAt?: Date;
  isActive: boolean;
}

interface LicensingContextType {
  licenseInfo: LicenseInfo;
  checkFeature: (feature: string) => boolean;
  upgradeLicense: (type: LicenseInfo['type']) => void;
}

const defaultLicense: LicenseInfo = {
  type: 'standard',
  features: [
    'basic_experiments',
    'device_monitoring',
    'data_visualization',
    'template_management',
    'ai_assistant'
  ],
  isActive: true
};

const LicensingContext = createContext<LicensingContextType | undefined>(undefined);

export const useLicensing = () => {
  const context = useContext(LicensingContext);
  if (!context) {
    throw new Error('useLicensing must be used within a LicensingProvider');
  }
  return context;
};

interface LicensingProviderProps {
  children: ReactNode;
}

export const LicensingProvider: React.FC<LicensingProviderProps> = ({ children }) => {
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo>(defaultLicense);

  const checkFeature = (feature: string): boolean => {
    return licenseInfo.features.includes(feature) && licenseInfo.isActive;
  };

  const upgradeLicense = (type: LicenseInfo['type']) => {
    const newFeatures = getFeaturesForType(type);
    setLicenseInfo(prev => ({
      ...prev,
      type,
      features: newFeatures
    }));
  };

  const getFeaturesForType = (type: LicenseInfo['type']): string[] => {
    const featureMap = {
      free: ['basic_experiments'],
      standard: [
        'basic_experiments',
        'device_monitoring',
        'data_visualization',
        'template_management',
        'ai_assistant'
      ],
      premium: [
        'basic_experiments',
        'device_monitoring',
        'data_visualization',
        'template_management',
        'ai_assistant',
        'advanced_analytics',
        'real_time_collaboration',
        'custom_templates'
      ],
      enterprise: [
        'basic_experiments',
        'device_monitoring',
        'data_visualization',
        'template_management',
        'ai_assistant',
        'advanced_analytics',
        'real_time_collaboration',
        'custom_templates',
        'multi_tenant',
        'api_access',
        'custom_integrations',
        'priority_support'
      ]
    };
    return featureMap[type] || featureMap.standard;
  };

  const value: LicensingContextType = {
    licenseInfo,
    checkFeature,
    upgradeLicense
  };

  return (
    <LicensingContext.Provider value={value}>
      {children}
    </LicensingContext.Provider>
  );
}; 