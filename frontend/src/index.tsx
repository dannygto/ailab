import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
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
        <App />
      </FeatureFlagsProvider>
    </LicensingProvider>
  </React.StrictMode>
);