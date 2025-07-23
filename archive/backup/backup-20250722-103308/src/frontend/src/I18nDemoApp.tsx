import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import I18nProvider from './providers/I18nProvider';
import I18nRoutes from './routes/I18nRoutes';
import './i18n'; // 导入i18n配置

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <I18nProvider>
        <I18nRoutes />
      </I18nProvider>
    </BrowserRouter>
  );
};

export default App;
