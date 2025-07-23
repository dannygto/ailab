import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 支持的语言
export type Language = 'zh-CN' | 'en-US';

// 语言上下文类型
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Record<string, string>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译数据
const translationData: Record<Language, Record<string, string>> = {
  'zh-CN': {
    // 通用
    'app.name': 'AILAB 平台',
    'app.loading': '加载中...',
    'app.error': '发生错误',
    'app.retry': '重试',
    'app.save': '保存',
    'app.cancel': '取消',
    'app.delete': '删除',
    'app.edit': '编辑',
    'app.success': '操作成功',
    'app.failed': '操作失败',
    'app.confirm': '确认',

    // 认证相关
    'auth.login': '登录',
    'auth.logout': '退出登录',
    'auth.register': '注册',
    'auth.username': '用户名',
    'auth.password': '密码',
    'auth.email': '邮箱',
    'auth.phone': '手机号',
    'auth.remember': '记住我',
    'auth.forgot': '忘记密码？',
    'auth.noAccount': '还没有账号？',
    'auth.createAccount': '立即注册',
    'auth.hasAccount': '已有账号？',
    'auth.verifyCode': '验证码',
    'auth.sendCode': '发送验证码',
    'auth.resendCode': '重新发送({seconds}秒)',
    'auth.passwordRequirements': '密码至少8位，包含字母和数字',
    'auth.passwordStrength.weak': '弱',
    'auth.passwordStrength.medium': '中',
    'auth.passwordStrength.strong': '强',
    'auth.confirmPassword': '确认密码',
    'auth.passwordMismatch': '两次输入的密码不一致',
    'auth.agreeTerms': '我已阅读并同意服务条款和隐私政策',
    'auth.mustAgree': '您必须同意服务条款和隐私政策',
    'auth.loginSuccess': '登录成功',
    'auth.registerSuccess': '注册成功',
    'auth.captcha': '向右滑动滑块完成验证',
    'auth.captchaSuccess': '验证成功',
    'auth.securityQuestion': '安全验证问题（用于找回密码）',
    'auth.selectQuestion': '选择安全问题',
    'auth.customQuestion': '自定义安全问题',
    'auth.questionAnswer': '答案',
    'auth.rememberAnswer': '请记住您的答案，这将用于账号找回',
    'auth.resetPassword': '重置密码',
    'auth.newPassword': '新密码',
    'auth.resetSuccess': '密码重置成功',
    'auth.student': '学生',
    'auth.teacher': '教师',
    'auth.admin': '管理员',
    'auth.humanVerification': '人机验证',
    'auth.dragToVerify': '请向右滑动滑块完成验证',

    // 用户角色
    'user.role.student': '学生',
    'user.role.teacher': '教师',
    'user.role.admin': '管理员',

    // 第三方登录
    'auth.thirdParty': '或使用第三方账号登录',
    'auth.loginWith': '使用{provider}登录',
    'auth.wechat': '微信',
    'auth.qq': 'QQ',
    'auth.github': 'GitHub'
  },
  'en-US': {
    // Common
    'app.name': 'AILAB Platform',
    'app.loading': 'Loading...',
    'app.error': 'Error occurred',
    'app.retry': 'Retry',
    'app.save': 'Save',
    'app.cancel': 'Cancel',
    'app.delete': 'Delete',
    'app.edit': 'Edit',
    'app.success': 'Operation Successful',
    'app.failed': 'Operation Failed',
    'app.confirm': 'Confirm',

    // Authentication
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.username': 'Username',
    'auth.password': 'Password',
    'auth.email': 'Email',
    'auth.phone': 'Phone',
    'auth.remember': 'Remember me',
    'auth.forgot': 'Forgot password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.createAccount': 'Create one now',
    'auth.hasAccount': 'Already have an account?',
    'auth.verifyCode': 'Verification Code',
    'auth.sendCode': 'Send Code',
    'auth.resendCode': 'Resend ({seconds}s)',
    'auth.passwordRequirements': 'Password must be at least 8 characters with letters and numbers',
    'auth.passwordStrength.weak': 'Weak',
    'auth.passwordStrength.medium': 'Medium',
    'auth.passwordStrength.strong': 'Strong',
    'auth.confirmPassword': 'Confirm Password',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.agreeTerms': 'I have read and agree to the Terms of Service and Privacy Policy',
    'auth.mustAgree': 'You must agree to the Terms of Service and Privacy Policy',
    'auth.loginSuccess': 'Login Successful',
    'auth.registerSuccess': 'Registration Successful',
    'auth.captcha': 'Slide to verify',
    'auth.captchaSuccess': 'Verification successful',
    'auth.securityQuestion': 'Security Question (for password recovery)',
    'auth.selectQuestion': 'Select a security question',
    'auth.customQuestion': 'Custom security question',
    'auth.questionAnswer': 'Answer',
    'auth.rememberAnswer': 'Remember your answer, it will be used for account recovery',
    'auth.resetPassword': 'Reset Password',
    'auth.newPassword': 'New Password',
    'auth.resetSuccess': 'Password reset successful',
    'auth.student': 'Student',
    'auth.teacher': 'Teacher',
    'auth.admin': 'Administrator',
    'auth.humanVerification': 'Human Verification',
    'auth.dragToVerify': 'Please drag the slider to verify',

    // User roles
    'user.role.student': 'Student',
    'user.role.teacher': 'Teacher',
    'user.role.admin': 'Administrator',

    // Third-party login
    'auth.thirdParty': 'Or login with third-party accounts',
    'auth.loginWith': 'Login with {provider}',
    'auth.wechat': 'WeChat',
    'auth.qq': 'QQ',
    'auth.github': 'GitHub'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

// 提供者组件
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguage = 'zh-CN'
}) => {
  // 读取本地存储的语言设置，如果没有则使用默认值
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language') as Language;
    return storedLang || initialLanguage;
  });

  // 获取当前语言的翻译数据
  const translations = translationData[language] || translationData['zh-CN'];

  // 翻译函数
  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key] || key;

    // 处理参数替换
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return translation;
  };

  // 语言变更时保存到本地存储
  useEffect(() => {
    localStorage.setItem('language', language);

    // 更新HTML lang属性
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义钩子，方便使用语言上下文
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// 语言切换组件
export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'zh-CN' ? 'en-US' : 'zh-CN');
  };

  return (
    <button
      onClick={toggleLanguage}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: compact ? '4px' : '8px',
        borderRadius: '4px',
        color: '#666',
        fontSize: compact ? '12px' : '14px'
      }}
    >
      {language === 'zh-CN' ? 'English' : '中文'}
    </button>
  );
};

export default LanguageProvider;
