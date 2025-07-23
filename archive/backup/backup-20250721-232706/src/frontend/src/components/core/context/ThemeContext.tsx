import('@mui/material');
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

/**
 * 主题模式类型
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 主题上下文状态接�?
 */
export interface ThemeContextState {
  /** 当前主题模式 */
  mode: ThemeMode;
  /** 是否自动适应系统主题 */
  systemPreference: boolean;
  /** 是否使用暗色主题 */
  isDarkMode: boolean;
  /** 设置主题模式 */
  setMode: (mode: ThemeMode | ((prevMode: ThemeMode) => ThemeMode)) => void;
  /** 切换主题 */
  toggleTheme: () => void;
}

/**
 * 主题上下文属性接�?
 */
export interface ThemeProviderProps {
  /** 默认主题模式 */
  defaultMode?: ThemeMode;
  /** 子组�?*/
  children: React.ReactNode;
}

// 创建主题上下�?
const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

/**
 * 主题提供者组�?
 * 
 * 提供主题相关的状态和操作
 * 
 * @param props - 主题提供者属�?
 * @returns 主题上下文提供�?
 * 
 * @example
 * ```tsx
 * <ThemeProvider defaultMode="system">
 *   <App />
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  defaultMode = 'system',
  children
}) => {
  // 主题模式状�?
  const [mode, setModeState] = useState<ThemeMode>(
    // 尝试从localStorage恢复主题设置
    () => {
      try {
        const savedMode = localStorage.getItem('theme-mode');
        return (savedMode as ThemeMode) || defaultMode;
      } catch (error) {
        return defaultMode;
      }
    }
  );

  // 检查系统偏�?
  const prefersDarkMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      // 确保window.matchMedia是有效的函数
      if (window.matchMedia && typeof window.matchMedia === 'function') {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        // 确保matches属性存�?
        return mql && typeof mql.matches === 'boolean' ? mql.matches : false;
      }
      return false;
    } catch (error) {
      console.error('Error CheckIconing dark mode preference:', error);
      return false;
    }
  }, []);

  // 设置主题模式并保存到localStorage
  const setMode = useCallback((newMode: ThemeMode | ((prevMode: ThemeMode) => ThemeMode)) => {
    setModeState(prev => {
      const resolvedMode = typeof newMode === 'function' ? newMode(prev) : newMode;
      try {
        localStorage.setItem('theme-mode', resolvedMode);
      } catch (error) {
        console.error('Failed to save theme mode to localStorage:', error);
      }
      return resolvedMode;
    });
  }, []);

  // 切换主题
  const toggleTheme = useCallback(() => {
    setMode((prevMode: ThemeMode) => {
      if (prevMode === 'light') return 'dark';
      if (prevMode === 'dark') return 'light';
      // 如果是system，则根据当前显示的主题切�?
      return prefersDarkMode ? 'light' : 'dark';
    });
  }, [prefersDarkMode, setMode]);

  // 计算是否使用暗色主题
  const isDarkMode = useMemo(() => {
    if (mode === 'system') {
      return prefersDarkMode;
    }
    return mode === 'dark';
  }, [mode, prefersDarkMode]);

  // 系统偏好使用
  const systemPreference = mode === 'system';

  // 主题上下文�?
  const contextValue = useMemo(
    () => ({
      mode,
      systemPreference,
      isDarkMode,
      setMode,
      toggleTheme
    }),
    [mode, systemPreference, isDarkMode, setMode, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 使用主题Hook
 * 
 * 获取主题上下文状态和操作
 * 
 * @returns 主题上下�?
 * 
 * @example
 * ```tsx
 * const { isDarkMode, toggleTheme } = useTheme();
 * 
 * return (
 *   <Button onClick={toggleTheme}>
 *     {isDarkMode ? '切换到亮色主�? : '切换到暗色主�?}
 *   </Button>
 * );
 * ```
 */
export const useTheme = (): ThemeContextState => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
