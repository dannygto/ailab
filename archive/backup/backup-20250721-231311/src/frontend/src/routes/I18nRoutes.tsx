import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { I18nContextProvider } from '../contexts/I18nContext';

// 主页面和演示页面
import Dashboard from '../pages/Dashboard';
import I18nDemo from '../pages/demo/I18nDemo';
import InternationalizationPage from '../pages/settings/InternationalizationPage';

// 国际化相关路由
const I18nRoutes: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <I18nContextProvider>
      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          {/* 仪表盘路由 */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 国际化设置路由 */}
          <Route path="/settings/internationalization" element={<InternationalizationPage />} />

          {/* 国际化演示路由 */}
          <Route path="/demo/i18n" element={<I18nDemo />} />

          {/* 默认重定向 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 未找到路由 */}
          <Route path="*" element={
            <Box sx={{ p: 3 }}>
              <h2>{t('errors.notFound')}</h2>
              <p>{t('errors.notFound')}: {location.pathname}</p>
            </Box>
          } />
        </Routes>
      </Box>
    </I18nContextProvider>
  );
};

export default I18nRoutes;
