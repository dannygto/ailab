import React, { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

interface I18nProviderProps {
  children: ReactNode;
}

/**
 * 国际化Provider组件
 * 用于在应用根组件包裹I18nextProvider
 */
const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

export default I18nProvider;
