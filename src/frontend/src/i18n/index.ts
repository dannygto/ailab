import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import translationZH from './locales/zh-CN.json';
import translationEN from './locales/en-US.json';
import translationUG from './locales/ug-CN.json';
import translationMN_CN from './locales/mn-CN.json';
import translationMN_MN from './locales/mn-MN.json';
import translationII from './locales/ii-CN.json';
import translationYI from './locales/yi-CN.json';
import translationBO from './locales/bo-CN.json';

// 支持的语言
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US',
  UG_CN: 'ug-CN',    // 维吾尔语
  MN_CN: 'mn-CN',    // 蒙古语（中国）
  MN_MN: 'mn-MN',    // 蒙古语（蒙古国）
  II_CN: 'ii-CN',    // 彝语
  YI_CN: 'yi-CN',    // 彝语（替代）
  BO_CN: 'bo-CN',    // 藏语
};

// 翻译资源
const resources = {
  [LANGUAGES.ZH_CN]: {
    translation: translationZH,
  },
  [LANGUAGES.EN_US]: {
    translation: translationEN,
  },
  [LANGUAGES.UG_CN]: {
    translation: translationUG,
  },
  [LANGUAGES.MN_CN]: {
    translation: translationMN_CN,
  },
  [LANGUAGES.MN_MN]: {
    translation: translationMN_MN,
  },
  [LANGUAGES.II_CN]: {
    translation: translationII,
  },
  [LANGUAGES.YI_CN]: {
    translation: translationYI,
  },
  [LANGUAGES.BO_CN]: {
    translation: translationBO,
  },
};

i18n
  // 加载后端翻译资源
  .use(Backend)
  // 检测用户语言
  .use(LanguageDetector)
  // 集成到React
  .use(initReactI18next)
  // 初始化i18next
  .init({
    resources,
    fallbackLng: LANGUAGES.ZH_CN,
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // 不转义React中的值
    },
    detection: {
      // 检测顺序
      order: ['localStorage', 'navigator'],
      // 本地存储配置
      lookupLocalStorage: 'ailab_language',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
