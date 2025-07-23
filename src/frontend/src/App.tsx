import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster            </ThemeProvider>
          </PermissionProvider>
        </QueryClientProvider> from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';
import { SystemConfigProvider } from './contexts/SystemConfigContext';
import { SchoolProvider } from './contexts/SchoolContext';
import { PermissionProvider } from './contexts/PermissionContext';
import demoNotifications from './utils/demoNotifications';

// 导入组件
import MainLayout from './components/layout/SimpleMainLayout';
import PWAPrompt from './components/common/PWAPrompt';

// 基础页面
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PasswordReset from './pages/PasswordReset';
import NotFound from './pages/NotFound';
import TeacherDashboard from './pages/TeacherDashboard';
import SystemSetup from './pages/SystemSetup';
import TeamMemberManagementDemo from './pages/TeamMemberManagementDemo';

// 实验相关页面
import ExperimentList from './pages/experiments/ExperimentList';
import ExperimentListV2 from './pages/experiments/ExperimentListV2';
import ExperimentDetailV2 from './pages/experiments/ExperimentDetailV2';
import ExperimentDetailV3 from './pages/experiments/ExperimentDetailV3';
import ExperimentCreateV2 from './pages/experiments/ExperimentCreateV2';
import ExperimentCreateNew from './pages/experiments/ExperimentCreateNew';
import ExperimentCreateFinal from './pages/experiments/ExperimentCreateFinal';
import ExperimentResults from './pages/experiments/ExperimentResults';

// 模板相关页面
import TemplateLibrary from './pages/templates/TemplateLibrary';
import TemplateDetailFixed from './pages/templates/TemplateDetailFixed';
import TemplateCreate from './pages/templates/TemplateCreate';

// 设备相关页面
import DeviceManagement from './pages/devices/DeviceManagement';
import DeviceMonitoringV2 from './pages/devices/DeviceMonitoringV2';
import DeviceMonitorDashboard from './pages/devices/DeviceMonitorDashboard';
import AdvancedDeviceControlPage from './pages/devices/AdvancedDeviceControl';

// 数据分析页面
import DataCollectionAnalysis from './pages/data/DataCollectionAnalysis';
import DataAnalysisPage from './pages/data/DataAnalysisPage';

// 用户管理页面
import UserManagement from './pages/admin/UserManagement_fixed';
import SystemSettings from './pages/admin/SystemSettings';
import SystemIntegrationPage from './pages/admin/SystemIntegration';
import SchoolManagement from './pages/SchoolManagement';

// 系统设置页面
import EnhancedSettings from './pages/EnhancedSettings';
import AIModelSettings from './pages/settings/AIModelSettings';
import SecuritySettings from './pages/settings/SecuritySettings';
import NotificationSettings from './pages/settings/NotificationSettings';
import ThemeSettings from './pages/settings/ThemeSettings';
import DataSettings from './pages/settings/DataSettings';
import InternationalizationPage from './pages/settings/InternationalizationPage';
import UserSettings from './pages/UserSettings';
import UserSettingsSimplified from './pages/UserSettingsSimplified';

// 其他页面
import AIAssistant from './pages/AIAssistant';
import ApiIntegrationCheck from './pages/ApiIntegrationCheck';
import ResourceManagement from './pages/resources/ResourceManagement';
import GuidanceSystem from './pages/guidance/GuidanceSystem';
import MediaAnalysisPage from './pages/media/MediaAnalysisPage';
import ExperimentResourceManager from './pages/ExperimentResourceManager';
import MessageCenter from './pages/MessageCenter';
import Help from './pages/Help_fixed';
import HelpCenterPage from './pages/HelpCenterPage';
import DeviceDataFlowDemo from './pages/demo/DeviceDataFlowDemo';
import OrganizationManagement from './pages/OrganizationManagement';
import TeamOrganizationGuide from './pages/TeamOrganizationGuide';
import ResourcePermissionManagement from './pages/admin/ResourcePermissionManagement';

// 导入团队路由
import { renderTeamRoutes } from './routes/teamRoutes';

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 错误边界组件
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <h2>出现了一些错误</h2>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>重试</button>
    </Box>
  );
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 验证token并获取用户信息
      // 这里应该调用API来验证token
    }

    // 初始化演示通知
    demoNotifications();
  }, []);

  // 动态创建主题
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  });

  // 主题切换函数
  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <SystemConfigProvider>
          <SchoolProvider>
            <QueryClientProvider client={queryClient}>
              <PermissionProvider>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  {/* 配置BrowserRouter的future flags以解决警告 */}
                  <BrowserRouter future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                  }}>
                <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<PasswordReset />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/setup" element={<SystemSetup />} />

                {/* PWA提示组件 */}
                <Route path="/*" element={
                  <MainLayout toggleMode={toggleMode} isDarkMode={isDarkMode}>
                    <PWAPrompt />
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                      <Route path="/ai-assistant" element={<AIAssistant />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/help-center" element={<HelpCenterPage />} />
                      <Route path="/integration-check" element={<ApiIntegrationCheck />} />

                      {/* 受保护的路由 */}
                      <Route path="/experiments" element={<ExperimentList />} />
                      <Route path="/experiments-v2" element={<ExperimentListV2 />} />
                      <Route path="/experiments/create" element={<ExperimentCreateFinal />} />

                      {/* 这些是标准 */}
                      <Route path="/experiments/:id" element={<ExperimentDetailV3 />} />
                      <Route path="/experiments/:id/results" element={<ExperimentResults />} />

                      {/* 实验相关路由 */}
                      <Route path="/experiments/create-v2" element={<ExperimentCreateV2 />} />
                      <Route path="/experiments/create-new" element={<ExperimentCreateNew />} />

                      {/* 模板管理 */}
                      <Route path="/templates" element={<TemplateLibrary />} />
                      <Route path="/templates/create" element={<TemplateCreate />} />
                      <Route path="/templates/:id" element={<TemplateDetailFixed />} />

                      {/* 设备管理 */}
                      <Route path="/devices" element={<DeviceManagement />} />
                      <Route path="/devices/monitoring" element={<DeviceMonitorDashboard />} />
                      <Route path="/devices/monitoring-v2" element={<DeviceMonitoringV2 />} />
                      <Route path="/devices/advanced-control" element={<AdvancedDeviceControlPage />} />

                      {/* 数据分析 */}
                      <Route path="/data/collection" element={<DataCollectionAnalysis />} />
                      <Route path="/data/analysis" element={<DataAnalysisPage />} />

                      {/* 系统设置 */}
                      <Route path="/settings" element={<EnhancedSettings />} />
                      <Route path="/settings/ai-models" element={<AIModelSettings />} />
                      <Route path="/settings/security" element={<SecuritySettings />} />
                      <Route path="/settings/notifications" element={<NotificationSettings />} />
                      <Route path="/settings/theme" element={<ThemeSettings />} />
                      <Route path="/settings/data" element={<DataSettings />} />
                      <Route path="/settings/internationalization" element={<InternationalizationPage />} />
                      <Route path="/settings/user" element={<UserSettings />} />
                      <Route path="/settings/user-simplified" element={<UserSettingsSimplified />} />

                      {/* 管理员功能 */}
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/admin/system-settings" element={<SystemSettings />} />
                      <Route path="/admin/system-integration" element={<SystemIntegrationPage />} />
                      <Route path="/admin/schools" element={<SchoolManagement />} />
                      <Route path="/admin/organizations" element={<OrganizationManagement />} />
                      <Route path="/admin/permissions" element={<ResourcePermissionManagement />} />
                      <Route path="/admin/team-member-demo" element={<TeamMemberManagementDemo />} />

                      {/* 其他功能 */}
                      <Route path="/resources" element={<ResourceManagement />} />
                      <Route path="/guidance" element={<GuidanceSystem />} />
                      <Route path="/media-analysis" element={<MediaAnalysisPage />} />
                      <Route path="/experiment-resources" element={<ExperimentResourceManager />} />
                      <Route path="/messages" element={<MessageCenter />} />
                      <Route path="/teams-organizations" element={<TeamOrganizationGuide />} />

                      {/* 团队管理路由 */}
                      {renderTeamRoutes()}

                      {/* 演示功能 */}
                      <Route path="/demo/device-flow" element={<DeviceDataFlowDemo />} />

                      {/* 404页面 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </MainLayout>
                } />

                {/* 404页面 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster position="top-right" />
          </ThemeProvider>
          <Toaster position="top-right" />
        </PermissionProvider>
        </QueryClientProvider>
        </SchoolProvider>
        </SystemConfigProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
