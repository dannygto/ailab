/**
 * Feature Flags System - Controls functionality availability for different versions
 * Complies with K12 education requirements, ensuring age-appropriate content for students
 */

import { createContext, useContext, useState, ReactNode } from 'react';

// Edition type definition
export type EditionType = 'basic' | 'ai-enhanced' | 'professional';

// Feature flags definition
export interface FeatureFlags {
  // === Basic Edition Features ===
  basicExperiments: boolean;            // Basic experiment functionality (K12 subject experiments)
  basicAIAssistant: boolean;            // Basic AI assistant (suitable for K12)
  basicDataVisualization: boolean;      // Basic data visualization
  resourceManagement: boolean;          // Teaching resource management
  gradeBasedAccess: boolean;            // Grade-based access control
  curriculumAlignment: boolean;         // Curriculum standard alignment
  
  // === AI Enhanced Edition Features (for higher grades) ===
  aiExperimentGuidance: boolean;        // AI experiment guidance
  intelligentanalytics: boolean;       // Intelligent analytics
  simpleImageRecognition: boolean;      // Simple image recognition experience
  basicMLExperience: boolean;           // Basic machine learning experience
  adaptiveLearning: boolean;            // Adaptive learning
  enhancedVisualization: boolean;       // Enhanced data visualization
  
  // === Professional Edition Features (for higher education and research) ===
  advancedExperimentDesign: boolean;    // Advanced experiment design
  remoteEquipmentAccess: boolean;       // Remote equipment access
  researchProjectManagement: boolean;   // Research project management
  collaborativeEnvironment: boolean;    // Collaborative environment
  openapiAccess: boolean;               // Open api access
  extensionSystem: boolean;             // Extension system
  multiDimensionalAnalysis: boolean;    // Multi-dimensional analysis
  professionalAIModels: boolean;        // Professional AI model training
}

// Default feature flags configuration
const defaultFeatureFlags: FeatureFlags = {
  // === Basic Edition Features - All enabled by default ===
  basicExperiments: true,
  basicAIAssistant: true,
  basicDataVisualization: true,
  resourceManagement: true,
  gradeBasedAccess: true,
  curriculumAlignment: true,
  
  // === AI Enhanced Edition Features - Disabled by default ===
  aiExperimentGuidance: false,
  intelligentanalytics: false,
  simpleImageRecognition: false,
  basicMLExperience: false,
  adaptiveLearning: false,
  enhancedVisualization: false,
  
  // === Professional Edition Features - Disabled by default ===
  advancedExperimentDesign: false,
  remoteEquipmentAccess: false,
  researchProjectManagement: false,
  collaborativeEnvironment: false,
  openapiAccess: false,
  extensionSystem: false,
  multiDimensionalAnalysis: false,
  professionalAIModels: false,
};

// Configure feature flags based on edition
export const getFeatureFlagsByEdition = (edition: EditionType): FeatureFlags => {
  switch (edition) {
    case 'basic':
      return {
        ...defaultFeatureFlags,
        // 基础版只启用基础功能
        basicExperiments: true,
        basicAIAssistant: true,
        basicDataVisualization: true,
        resourceManagement: true,
        gradeBasedAccess: true,
        curriculumAlignment: true,
      };
    case 'ai-enhanced':
      return {
        ...defaultFeatureFlags,
        // 基础版功能
        basicExperiments: true,
        basicAIAssistant: true,
        basicDataVisualization: true,
        resourceManagement: true,
        gradeBasedAccess: true,
        curriculumAlignment: true,
        // AI增强版额外功能
        aiExperimentGuidance: true,
        intelligentanalytics: true,
        simpleImageRecognition: true,
        basicMLExperience: true,
        adaptiveLearning: true,
        enhancedVisualization: true,
      };
    case 'professional':
      return {
        ...defaultFeatureFlags,
        // 启用所有功能
        basicExperiments: true,
        basicAIAssistant: true,
        basicDataVisualization: true,
        resourceManagement: true,
        gradeBasedAccess: true,
        curriculumAlignment: true,
        // AI增强版功能
        aiExperimentGuidance: true,
        intelligentanalytics: true,
        simpleImageRecognition: true,
        basicMLExperience: true,
        adaptiveLearning: true,
        enhancedVisualization: true,
        // 专业版额外功能
        advancedExperimentDesign: true,
        remoteEquipmentAccess: true,
        researchProjectManagement: true,
        collaborativeEnvironment: true,
        openapiAccess: true,
        extensionSystem: true,
        multiDimensionalAnalysis: true,
        professionalAIModels: true,
      };
    default:
      return defaultFeatureFlags;
  }
};

// Create feature flags context
interface FeatureFlagsContextType {
  featureFlags: FeatureFlags;
  currentEdition: EditionType;
  setEdition: (edition: EditionType) => void;
  isFeatureEnabled: (featureName: keyof FeatureFlags) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export const FeatureFlagsProvider = ({ 
  initialEdition = 'basic', 
  children 
}: { initialEdition?: EditionType; children: ReactNode }) => {
  const [currentEdition, setCurrentEdition] = useState<EditionType>(initialEdition);
  const [featureFlags] = useState<FeatureFlags>(
    getFeatureFlagsByEdition(initialEdition)
  );
  
  const setEdition = (edition: EditionType) => {
    setCurrentEdition(edition);
  };
  
  const isFeatureEnabled = (featureName: keyof FeatureFlags): boolean => {
    return featureFlags[featureName];
  };
  
  return (
    <FeatureFlagsContext.Provider 
      value={{ 
        featureFlags, 
        currentEdition, 
        setEdition, 
        isFeatureEnabled 
      }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};

export {};