import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入翻译文件
import translationZH from './locales/zh-CN.json';
import translationEN from './locales/en-US.json';

// 支持的语言
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US',
};

// 翻译资源
const resources = {
  [LANGUAGES.ZH_CN]: {
    translation: translationZH,
  },
  [LANGUAGES.EN_US]: {
    translation: translationEN,
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
