import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

// ���벼�����
import MainLayout from './layouts/MainLayout';

// ���볣�����
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// ʹ�������ص���ҳ�����
const ExperimentList = lazy(() => import('./pages/experiments/ExperimentList'));
const ExperimentListV2 = lazy(() => import('./pages/experiments/ExperimentListV2'));
const ExperimentDetail = lazy(() => import('./pages/experiments/ExperimentDetail'));
const ExperimentDetailV2 = lazy(() => import('./pages/experiments/ExperimentDetailV2'));
const ExperimentCreate = lazy(() => import('./pages/experiments/ExperimentCreate'));
const ExperimentCreateV2 = lazy(() => import('./pages/experiments/ExperimentCreateV2'));
const ExperimentResults = lazy(() => import('./pages/experiments/ExperimentResults'));

const DeviceManagement = lazy(() => import('./pages/devices/DeviceManagement'));
const DeviceMonitoring = lazy(() => import('./pages/devices/DeviceMonitoring'));
const DeviceMonitoringV2 = lazy(() => import('./pages/devices/DeviceMonitoringV2'));

const DataCollectionAnalysis = lazy(() => import('./pages/data/DataCollectionAnalysis'));
const AdvancedDataAnalysis = lazy(() => import('./pages/data/AdvancedDataAnalysis'));

const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));

// ����״̬���
const LoadingComponent = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback={<LoadingComponent />}>
          <Routes>
            <Route path="/" element={<Navigate replace to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* ʵ�����·�� */}
            <Route path="/experiments" element={<ExperimentList />} />
            <Route path="/experiments/v2" element={<ExperimentListV2 />} />
            <Route path="/experiments/create" element={<ExperimentCreate />} />
            <Route path="/experiments/create/v2" element={<ExperimentCreateV2 />} />
            <Route path="/experiments/:id" element={<ExperimentDetail />} />
            <Route path="/experiments/:id/v2" element={<ExperimentDetailV2 />} />
            <Route path="/experiments/:id/results" element={<ExperimentResults />} />
            
            {/* �豸����·�� */}
            <Route path="/devices/management" element={<DeviceManagement />} />
            <Route path="/devices/monitoring" element={<DeviceMonitoring />} />
            <Route path="/devices/monitoring/v2" element={<DeviceMonitoringV2 />} />
            
            {/* ���ݷ���·�� */}
            <Route path="/data/collection" element={<DataCollectionAnalysis />} />
            <Route path="/data/analysis" element={<AdvancedDataAnalysis />} />
            
            {/* ϵͳ����·�� */}
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
            
            {/* 404ҳ�� */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
