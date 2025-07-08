// ���Թ��ߺ�����ͨ��ģ��
import { Box } from '@mui/material';
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// ���������õ�QueryClient
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Ĭ������
const testTheme = createTheme({
  PaletteIcon: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// �Զ�����Ⱦ�������������б�Ҫ��Provider
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    initialEntries = ['/'],
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={testTheme}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// renderWithTheme ������Ϊ��������
export const renderWithTheme = renderWithProviders;

// ͨ��ģ������
export const mockExperiments = [
  {
    id: '1',
    name: '����ʵ��1',
    type: 'physics',
    status: 'active',
    createdAt: '2025-07-01T00:00:00Z',
    description: '��������ʵ������',
  },
  {
    id: '2',
    name: '��ѧʵ��1',
    type: 'chemistry',
    status: 'completed',
    createdAt: '2025-07-02T00:00:00Z',
    description: '���Ի�ѧʵ������',
  },
];

export const mockdevices = [
  {
    id: '1',
    name: '�¶ȴ�����-001',
    type: 'sensor',
    status: 'online',
    location: 'ʵ����A',
    lastUpdate: '2025-07-03T00:00:00Z',
    data: { temperature: 25.5 },
  },
  {
    id: '2',
    name: '����ͷ-002',
    type: 'camera',
    status: 'offline',
    location: 'ʵ����B',
    lastUpdate: '2025-07-02T00:00:00Z',
    data: {},
  },
];

export const mockTemplates = [
  {
    id: '1',
    name: '��������ʵ��ģ��',
    subject: '����',
    grade: 'middle',
    difficulty: 'beginner',
    duration: 60,
    description: '��������ʵ��ģ������',
    tags: ['����', '����'],
  },
  {
    id: '2',
    name: '�߼���ѧʵ��ģ��',
    subject: '��ѧ',
    grade: 'high',
    difficulty: 'advanced',
    duration: 120,
    description: '�߼���ѧʵ��ģ������',
    tags: ['��ѧ', '�߼�'],
  },
];

// apiģ�⹤������
export const createMockapi = () => ({
  // ʵ�����
  getExperiments: jest.fn(() => Promise.resolve({ data: mockExperiments, total: mockExperiments.length })),
  getExperiment: jest.fn((id: string) => Promise.resolve(mockExperiments.find(exp => exp.id === id))),
  createExperiment: jest.fn((data: any) => Promise.resolve({ id: '3', ...data })),
  updateExperiment: jest.fn((id: string, data: any) => Promise.resolve({ id, ...data })),
  deleteExperiment: jest.fn(() => Promise.resolve({ success: true })),

  // �豸���
  getdevices: jest.fn(() => Promise.resolve({ data: mockdevices, total: mockdevices.length })),
  getDevice: jest.fn((id: string) => Promise.resolve(mockdevices.find(dev => dev.id === id))),
  updateDevice: jest.fn((id: string, data: any) => Promise.resolve({ id, ...data })),

  // ģ�����
  getTemplates: jest.fn(() => Promise.resolve({ data: mockTemplates, total: mockTemplates.length })),
  getTemplate: jest.fn((id: string) => Promise.resolve(mockTemplates.find(tpl => tpl.id === id))),
  createTemplate: jest.fn((data: any) => Promise.resolve({ id: '3', ...data })),

  // �������
  health: jest.fn(() => Promise.resolve({ status: 'healthy' })),
});

// ���Լоߣ��������ݣ�
export * from './fixtures/experiments';
export * from './fixtures/devices';
export * from './fixtures/templates';


export default createTestQueryClient;
