// 添加InternationalizationPage到设置路由
import React from 'react';
import { Route } from 'react-router-dom';
import InternationalizationPage from '../pages/settings/InternationalizationPage';

/**
 * 国际化路由配置
 * 提供作为单独路由使用
 */
const InternationalizationRoutes: React.FC = () => {
  return (
    <Route path="/settings/internationalization" element={<InternationalizationPage />} />
  );
};

export default InternationalizationRoutes;
