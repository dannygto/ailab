/**
 * 统一提示消息服务
 *
 * 提供全局消息提示功能，通过Context提供给整个应用
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast from '../ui/Toast';

type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastState {
  open: boolean;
  message: string;
  type: ToastType;
  duration: number;
  position: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

interface ToastContextType {
  /**
   * 显示成功提示
   */
  showSuccess: (message: string, duration?: number) => void;

  /**
   * 显示信息提示
   */
  showInfo: (message: string, duration?: number) => void;

  /**
   * 显示警告提示
   */
  showWarning: (message: string, duration?: number) => void;

  /**
   * 显示错误提示
   */
  showError: (message: string, duration?: number) => void;

  /**
   * 关闭提示
   */
  hideToast: () => void;
}

const defaultPosition = {
  vertical: 'bottom' as const,
  horizontal: 'center' as const
};

const initialState: ToastState = {
  open: false,
  message: '',
  type: 'info',
  duration: 3000,
  position: defaultPosition
};

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * 使用Toast钩子
 *
 * 在组件中使用此钩子获取Toast功能
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast提供者组件
 *
 * 将Toast功能提供给子组件
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>(initialState);

  const showToast = (message: string, type: ToastType, duration = 3000) => {
    setToast({
      open: true,
      message,
      type,
      duration,
      position: defaultPosition
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const showSuccess = (message: string, duration?: number) => {
    showToast(message, 'success', duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showToast(message, 'info', duration);
  };

  const showWarning = (message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  };

  const showError = (message: string, duration?: number) => {
    showToast(message, 'error', duration);
  };

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showInfo,
        showWarning,
        showError,
        hideToast
      }}
    >
      {children}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.type}
        duration={toast.duration}
        position={toast.position}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
