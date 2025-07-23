// 路由配置
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import DashboardPage from '../pages/Dashboard';
import ExperimentsPage from '../pages/experiments/ExperimentsPage';
import ExperimentDetailPage from '../pages/experiments/ExperimentDetailPage';
import ExperimentDetailV2Page from '../pages/experiments/ExperimentDetailV2Page';
import ExperimentDetailV3Page from '../pages/experiments/ExperimentDetailV3Page';
import TemplatesPage from '../pages/templates/TemplatesPage';
import DevicesPage from '../pages/devices/DevicesPage';
import SettingsPage from '../pages/settings/SettingsPage';
import ProfilePage from '../pages/settings/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';
import AIAssistantPage from '../pages/ai/AIAssistantPage';
import DataVisualizationPage from '../pages/data/DataVisualizationPage';
import InternationalizationPage from '../pages/settings/InternationalizationPage';
import EthnicLanguageSupportPage from '../pages/settings/EthnicLanguageSupportPage';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

/**
 * 应用路由配置
 * 包含所有页面路由定义和权限控制
 */
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <Routes>
      {/* 认证页面 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 主应用路由 - 需要认证 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* 实验相关路由 */}
        <Route path="experiments" element={<ExperimentsPage />} />
        <Route path="experiments/:id" element={<ExperimentDetailPage />} />
        <Route path="experiments/:id/v2" element={<ExperimentDetailV2Page />} />
        <Route path="experiments/:id/v3" element={<ExperimentDetailV3Page />} />

        {/* 模板相关路由 */}
        <Route path="templates" element={<TemplatesPage />} />

        {/* 设备相关路由 */}
        <Route path="devices" element={<DevicesPage />} />

        {/* AI助手相关路由 */}
        <Route path="ai-assistant" element={<AIAssistantPage />} />

        {/* 数据可视化相关路由 */}
        <Route path="data-visualization" element={<DataVisualizationPage />} />

        {/* 设置相关路由 */}
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/profile" element={<ProfilePage />} />
        <Route path="settings/internationalization" element={<InternationalizationPage />} />
        <Route path="settings/ethnic-language" element={<EthnicLanguageSupportPage />} />

        {/* 未找到的路由 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 默认重定向 */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes;
