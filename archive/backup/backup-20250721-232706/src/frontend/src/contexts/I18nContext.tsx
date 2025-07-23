import { createContext, useContext, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';

// 定义国际化上下文类型
interface I18nContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  availableLanguages: typeof LANGUAGES;
}

// 创建上下文
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 国际化Provider属性
interface I18nContextProviderProps {
  children: ReactNode;
}

// 国际化上下文Provider
export const I18nContextProvider = ({ children }: I18nContextProviderProps) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || LANGUAGES.ZH_CN);

  // 设置语言方法
  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
    localStorage.setItem('ailab_language', lang);
  };

  // 上下文值
  const contextValue: I18nContextType = {
    currentLanguage,
    setLanguage,
    availableLanguages: LANGUAGES,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

// 自定义Hook用于访问国际化上下文
export const useI18nContext = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18nContext must be used within an I18nContextProvider');
  }
  return context;
};

export default I18nContext;
