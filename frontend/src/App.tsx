import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from 'react-error-boundary';

// �������
import MainLayout from './components/layout/SimpleMainLayout';
import PWAPrompt from './components/common/PWAPrompt';

// ����ҳ��
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import TeacherDashboard from './pages/TeacherDashboard';

// ʵ�����ҳ��
import ExperimentList from './pages/experiments/ExperimentList';
import ExperimentListV2 from './pages/experiments/ExperimentListV2';
import ExperimentDetail from './pages/experiments/ExperimentDetail';
import ExperimentDetailV2 from './pages/experiments/ExperimentDetailV2';
import ExperimentCreate from './pages/experiments/ExperimentCreate';
import ExperimentCreateV2 from './pages/experiments/ExperimentCreateV2';
import ExperimentCreateNew from './pages/experiments/ExperimentCreateNew';
import ExperimentCreateFinal from './pages/experiments/ExperimentCreateFinal';
import ExperimentResults from './pages/experiments/ExperimentResults';

// ģ�����ҳ��
import TemplateLibrary from './pages/templates/TemplateLibrary';
import TemplateDetail from './pages/templates/TemplateDetail';
import TemplateDetailFixed from './pages/templates/TemplateDetailFixed';
import TemplateCreate from './pages/templates/TemplateCreate';

// �豸���ҳ��
import DeviceManagement from './pages/devices/DeviceManagement';
import DeviceMonitoring from './pages/devices/DeviceMonitoring';
import DeviceMonitoringV2 from './pages/devices/DeviceMonitoringV2';
import DeviceMonitorDashboard from './pages/devices/DeviceMonitorDashboard';

// �������ҳ��
import DataCollectionAnalysis from './pages/data/DataCollectionAnalysis';
import AdvancedDataAnalysis from './pages/data/AdvancedDataAnalysis';

// �������ҳ��
import UserManagement from './pages/admin/UserManagement';
import SystemSettings from './pages/admin/SystemSettings';

// �������ҳ��
import Settings from './pages/SimpleSettings';
import AIModelSettings from './pages/settings/AIModelSettings';
import SecuritySettings from './pages/settings/securitySettings';
import NotificationSettings from './pages/settings/NotificationSettings';
import ThemeSettings from './pages/settings/themeSettings';
import DataSettings from './pages/settings/dataSettings';

// ����ҳ��
import AIAssistant from './pages/AIAssistant';
import ApiIntegrationCheck from './pages/./ApiIntegrationCheck';
import ResourceManagement from './pages/resources/ResourceManagement';
import GuidanceSystem from './pages/guidance/GuidanceSystem';
import MediaAnalysisPage from './pages/media/MediaAnalysisPage';
import ExperimentResourceManager from './pages/ExperimentResourceManager';
import Help from './pages/Help';

// ����store��hooks
import { useUserStore, useThemeStore } from './store';

// ����React Query�ͻ���
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ����߽����
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
      <h2>������һЩ����</h2>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>����</button>
    </Box>
  );
};

// �ܱ�����·�����
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useUserStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { theme: appTheme } = useThemeStore();

  // ��������
  const theme = createTheme({
    palette: {
      mode: appTheme.mode,
      primary: {
        main: appTheme.primaryColor,
      },
      secondary: {
        main: appTheme.secondaryColor,
      },
      background: {
        default: appTheme.backgroundColor,
        paper: appTheme.mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: appTheme.textColor,
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow:
              appTheme.mode === 'dark'
                ? '0 4px 20px rgba(0,0,0,0.3)'
                : '0 4px 20px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });
  // ����û���֤״̬
  useEffect(() => {
    const { isAuthenticated, fetchCurrentUser } = useUserStore.getState();
    const token = localStorage.getItem('token');

    if (token && !isAuthenticated) {
      // ��֤token����ȡ�û���Ϣ
      fetchCurrentUser();
    }
  }, []);
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.divider}`,
                    },
                  }}
                />
                
                {/* PWA��ʾ��� */}
                <PWAPrompt autoShow={true} showNetworkStatus={true} />
                
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <Routes>
                    {/* ����·�� */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* �ܱ�����·�� */}
                    <Route
                      path="/*"
                      element={
                        <ProtectedRoute>
                          <MainLayout>
                            {/* ������Ƕ������·�� */}
                            <Routes>
                              {/* ���Ǳ��� */}
                              <Route path="dashboard" element={<Dashboard />} />
                              <Route path="teacher-dashboard" element={<TeacherDashboard />} />
                              
                              {/* ʵ�����·�� */}
                              <Route path="experiments" element={<ExperimentList />} />
                              <Route path="experiments/v2" element={<ExperimentListV2 />} />
                              <Route path="experiments/create" element={<ExperimentCreate />} />
                              <Route path="experiments/create/v2" element={<ExperimentCreateV2 />} />
                              <Route path="experiments/create/new" element={<ExperimentCreateNew />} />
                              <Route path="experiments/create/final" element={<ExperimentCreateFinal />} />
                              <Route path="experiments/:id" element={<ExperimentDetail />} />
                              <Route path="experiments/v2/:id" element={<ExperimentDetailV2 />} />
                              <Route path="experiments/:id/results" element={<ExperimentResults />} />
                              
                              {/* ģ�����·�� */}
                              <Route path="templates" element={<TemplateLibrary />} />
                              <Route path="templates/create" element={<TemplateCreate />} />
                              <Route path="templates/:id" element={<TemplateDetail />} />
                              <Route path="templates/:id/fixed" element={<TemplateDetailFixed />} />
                              
                              {/* �豸���·�� */}
                              <Route path="devices" element={<DeviceManagement />} />
                              <Route path="devices/monitoring" element={<DeviceMonitoring />} />
                              <Route path="devices/monitoring/v2" element={<DeviceMonitoringV2 />} />
                              <Route path="devices/dashboard" element={<DeviceMonitorDashboard />} />
                              
                              {/* ��Դ���·�� */}
                              <Route path="resources" element={<ResourceManagement />} />
                              <Route path="resources/manager" element={<ExperimentResourceManager />} />
                              
                              {/* �������·�� */}
                              <Route path="data-collection" element={<DataCollectionAnalysis />} />
                              <Route path="data-analysis" element={<AdvancedDataAnalysis />} />
                              
                              {/* AI��ý�����·�� */}
                              <Route path="ai-assistant" element={<AIAssistant />} />
                              <Route path="media-analysis" element={<MediaAnalysisPage />} />
                              
                              {/* ָ��ϵͳ */}
                              <Route path="guidance" element={<GuidanceSystem />} />
                              
                              {/* �������·�� */}
                              <Route path="settings" element={<Settings />} />
                              <Route path="settings/ai-models" element={<AIModelSettings />} />
                              <Route path="settings/security" element={<SecuritySettings />} />
                              <Route path="settings/notifications" element={<NotificationSettings />} />
                              <Route path="settings/theme" element={<ThemeSettings />} />
                              <Route path="settings/data" element={<DataSettings />} />
                              
                              {/* �������·�� */}
                              <Route path="admin/users" element={<UserManagement />} />
                              <Route path="admin/system" element={<SystemSettings />} />
                              
                              {/* ���ߺͼ�� */}
                              <Route path="api-CheckIcon" element={<ApiIntegrationCheck />} />
                              
                              {/* ������֧�� */}
                              <Route path="HelpIcon" element={<Help />} />
                              
                              {/* 404ҳ�� */}
                              <Route path="*" element={<NotFound />} />
                              
                              {/* Ĭ���ض���dashboard */}
                              <Route index element={<Navigate to="/dashboard" />} />
                            </Routes>
                          </MainLayout>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Router>
              </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;