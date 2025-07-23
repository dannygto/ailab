import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
import { FeatureFlagsProvider, EditionType } from './features/featureFlags';
import { LicensingProvider } from './features/licensing';

// 从环境变量获取版本，默认为basic
const editionFromEnv = (process.env.REACT_APP_EDITION as EditionType) || 'basic';

// 创建根元素
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// 渲染应用
root.render(
  <React.StrictMode>
    <LicensingProvider>
      <FeatureFlagsProvider initialEdition={editionFromEnv}>
        <AppRouter />
      </FeatureFlagsProvider>
    </LicensingProvider>
  </React.StrictMode>
);

// PWA支持 - Service Worker注册
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // console.log removed

        // 检查更新
        registration.addEventListener('updatefound', () => {
          // console.log removed
        });
      })
      .catch((registrationError) => {
        // console.log removed
      });
  });
}

export default editionFromEnv;

