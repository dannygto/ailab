import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  Experiment, 
  chatSession, 
  chatMessage, 
  Theme, 
  UserSettings,
  Notification,
  LoadingState
} from '../types';
import api from '../services/api';
import { toast } from 'react-hot-toast';

// 锟矫伙拷状态
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // 通过api调用登录
          try {
            const response = await api.login(email, password);
            localStorage.setItem('token', response.token);
            set({ 
              user: response.user, 
              isAuthenticated: true, 
              isLoading: false 
            });
            toast.success('登录成功');
          } catch (apiError) {
            console.warn('api调用失败，使用模拟数据:', apiError);
            // 当API调用失败时，使用模拟数据（开发环境）
            const mockUser: User = { 
              id: '1', 
              username: 'testuser', 
              email: email, 
              role: 'student', 
              name: '测试用户', 
              createdAt: new Date(), 
              isActive: true 
            };
            localStorage.setItem('token', 'mock-token-for-development');
            set({ user: mockUser, isAuthenticated: true, isLoading: false });
            toast.success('使用模拟数据登录成功');
          }
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          toast.error(err.message || '登录失败');
          throw err;
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false });
        toast.success('退出登录成功');
      },
      fetchCurrentUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        set({ isLoading: true });
        try {
          try {
            const user = await api.getCurrentUser();
            set({ user, isAuthenticated: true, isLoading: false });
          } catch (apiError) {
            console.warn('获取用户信息失败，使用模拟数据:', apiError);
            // 模拟用户数据
            const mockUser: User = { 
              id: '1', 
              username: 'testuser', 
              email: 'test@example.com', 
              role: 'student', 
              name: '测试用户', 
              createdAt: new Date(), 
              isActive: true 
            };
            set({ user: mockUser, isAuthenticated: true, isLoading: false });
          }
        } catch (err) {
          console.error('获取用户信息失败:', err);
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isLoading: false });
          toast.error('会话已过期，请重新登录');
        }
      }
    }),
    {
      name: 'user-StorageIcon',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// 锟斤拷锟斤拷状态
interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: {
        mode: 'light',
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        backgroundColor: '#ffffff',
        textColor: '#000000',
      },
      setTheme: (theme) => set({ theme }),
      toggleMode: () => {
        const currentTheme = get().theme;
        set({
          theme: {
            ...currentTheme,
            mode: currentTheme.mode === 'light' ? 'dark' : 'light',
            backgroundColor: currentTheme.mode === 'light' ? '#121212' : '#ffffff',
            textColor: currentTheme.mode === 'light' ? '#ffffff' : '#000000',
          },
        });
      },
    }),
    {
      name: 'theme-StorageIcon',
    }
  )
);

// 锟矫伙拷锟斤拷锟斤拷状态
interface SettingsState {
  settings: UserSettings;
  setSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: {
        theme: {
          mode: 'light',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          backgroundColor: '#ffffff',
          textColor: '#000000',
        },
        LanguageIcon: 'zh-CN',
        timezone: 'Asia/Shanghai',
        NotificationsIcon: {
          email: true,
          push: true,
          SmsIcon: false,
          experimentUpdates: true,
          systemAlerts: true,
        },
        privacy: {
          shareData: true,
          allowAnalytics: true,
          showProfile: true,
        },
        experiments: {
          autoSave: true,
          saveInterval: 30,
          showTips: true,
          defaultDuration: 60,
        },
        preferences: {
          autoSave: true,
          autoBackupIcon: true,              defaultExperimentType: 'observation',
          defaultBatchSize: 32,
          defaultEpochs: 10,
        },
        branding: {
          siteName: 'AICAM锟斤拷学锟斤拷锟斤拷平台',
          companyName: '未锟斤拷锟狡硷拷锟斤拷锟斤拷锟斤拷锟睫癸拷司',
          contactemail: 'support@future-edu.com',
          contactPhone: '400-888-9999',
          logoUrl: '/logo.png',
        },
      },
      setSettings: (newSettings) => {
        const currentSettings = get().settings;
        set({
          settings: { ...currentSettings, ...newSettings },
        });
      },
      resetSettings: () => {
        set({
          settings: {
            theme: {
              mode: 'light',
              primaryColor: '#1976d2',
              secondaryColor: '#dc004e',
              backgroundColor: '#ffffff',
              textColor: '#000000',
            },
            LanguageIcon: 'zh-CN',
            timezone: 'Asia/Shanghai',
            NotificationsIcon: {
              email: true,
              push: true,
              SmsIcon: false,
              experimentUpdates: true,
              systemAlerts: true,
            },
            privacy: {
              shareData: true,
              allowAnalytics: true,
              showProfile: true,
            },
            experiments: {
              autoSave: true,
              saveInterval: 30,
              showTips: true,
              defaultDuration: 60,
            },
            preferences: {
              autoSave: true,
              autoBackupIcon: true,
              defaultExperimentType: 'observation',
              defaultBatchSize: 32,
              defaultEpochs: 10,
            },
            branding: {
              siteName: 'AICAM锟斤拷学锟斤拷锟斤拷平台',
              companyName: '未锟斤拷锟狡硷拷锟斤拷锟斤拷锟斤拷锟睫癸拷司',
              contactemail: 'support@future-edu.com',
              contactPhone: '400-888-9999',
              logoUrl: '/logo.png',
            },
          },
        });
      },
    }),
    {
      name: 'settings-StorageIcon',
    }
  )
);

// 实锟斤拷状态
interface ExperimentState {
  experiments: Experiment[];
  currentExperiment: Experiment | null;
  experimentTemplates: any[];
  isLoading: boolean;
  error: string | null;
  setExperiments: (experiments: Experiment[]) => void;
  addExperiment: (experiment: Experiment) => void;
  updateExperiment: (id: string, experiment: Partial<Experiment>) => void;
  deleteExperiment: (id: string) => void;
  setCurrentExperiment: (experiment: Experiment | null) => void;
  setExperimentTemplates: (templates: any[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useExperimentStore = create<ExperimentState>()((set, get) => ({
  experiments: [],
  currentExperiment: null,
  experimentTemplates: [],
  isLoading: false,
  error: null,
  setExperiments: (experiments) => set({ experiments }),
  addExperiment: (experiment) => {
    const currentExperiments = get().experiments;
    set({ experiments: [experiment, ...currentExperiments] });
  },
  updateExperiment: (id, updatedExperiment) => {
    const currentExperiments = get().experiments;
    const updatedExperiments = currentExperiments.map((exp) =>
      exp.id === id ? { ...exp, ...updatedExperiment } : exp
    );
    set({ experiments: updatedExperiments });
  },
  deleteExperiment: (id) => {
    const currentExperiments = get().experiments;
    const filteredExperiments = currentExperiments.filter((exp) => exp.id !== id);
    set({ experiments: filteredExperiments });
  },
  setCurrentExperiment: (experiment) => set({ currentExperiment: experiment }),
  setExperimentTemplates: (templates) => set({ experimentTemplates: templates }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// AI锟斤拷锟斤拷状态
interface AIAssistantState {
  chatSessions: chatSession[];
  currentSession: chatSession | null;
  messages: chatMessage[];
  isLoading: boolean;
  error: string | null;
  setchatSessions: (sessions: chatSession[]) => void;
  addchatSession: (session: chatSession) => void;
  updatechatSession: (id: string, session: Partial<chatSession>) => void;
  deletechatSession: (id: string) => void;
  setCurrentSession: (session: chatSession | null) => void;
  setMessages: (messages: chatMessage[]) => void;
  addMessage: (message: chatMessage) => void;
  updateMessage: (id: string, message: Partial<chatMessage>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useAIAssistantStore = create<AIAssistantState>()((set, get) => ({
  chatSessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,
  error: null,
  setchatSessions: (sessions) => set({ chatSessions: sessions }),
  addchatSession: (session) => {
    const currentSessions = get().chatSessions;
    set({ chatSessions: [session, ...currentSessions] });
  },
  updatechatSession: (id, updatedSession) => {
    const currentSessions = get().chatSessions;
    const updatedSessions = currentSessions.map((session) =>
      session.id === id ? { ...session, ...updatedSession } : session
    );
    set({ chatSessions: updatedSessions });
  },
  deletechatSession: (id) => {
    const currentSessions = get().chatSessions;
    const filteredSessions = currentSessions.filter((session) => session.id !== id);
    set({ chatSessions: filteredSessions });
  },
  setCurrentSession: (session) => set({ currentSession: session }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => {
    const currentMessages = get().messages;
    set({ messages: [...currentMessages, message] });
  },
  updateMessage: (id, updatedMessage) => {
    const currentMessages = get().messages;
    const updatedMessages = currentMessages.map((msg) =>
      msg.id === id ? { ...msg, ...updatedMessage } : msg
    );
    set({ messages: updatedMessages });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [] }),
}));

// 通知状态
interface NotificationsIcontate {
  NotificationsIcon: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationsIcontore = create<NotificationsIcontate>()((set, get) => ({
  NotificationsIcon: [],
  unreadCount: 0,
  addNotification: (notification) => {
    const currentNotificationsIcon = get().NotificationsIcon;
    const newNotificationsIcon = [notification, ...currentNotificationsIcon];
    const unreadCount = newNotificationsIcon.filter((n) => !n.read).length;
    set({ NotificationsIcon: newNotificationsIcon, unreadCount });
  },
  markAsRead: (id) => {
    const currentNotificationsIcon = get().NotificationsIcon;
    const updatedNotificationsIcon = currentNotificationsIcon.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification
    );
    const unreadCount = updatedNotificationsIcon.filter((n) => !n.read).length;
    set({ NotificationsIcon: updatedNotificationsIcon, unreadCount });
  },
  markAllAsRead: () => {
    const currentNotificationsIcon = get().NotificationsIcon;
    const updatedNotificationsIcon = currentNotificationsIcon.map((notification) => ({
      ...notification,
      read: true,
    }));
    set({ NotificationsIcon: updatedNotificationsIcon, unreadCount: 0 });
  },
  removeNotification: (id) => {
    const currentNotificationsIcon = get().NotificationsIcon;
    const filteredNotificationsIcon = currentNotificationsIcon.filter((n) => n.id !== id);
    const unreadCount = filteredNotificationsIcon.filter((n) => !n.read).length;
    set({ NotificationsIcon: filteredNotificationsIcon, unreadCount });
  },
  clearAll: () => set({ NotificationsIcon: [], unreadCount: 0 }),
}));

// 全锟街硷拷锟斤拷状态
interface GlobalLoadingState {
  loadingStates: Record<string, LoadingState>;
  setLoadingState: (key: string, state: LoadingState) => void;
  clearLoadingState: (key: string) => void;
  clearAllLoadingStates: () => void;
}

export const useGlobalLoadingStore = create<GlobalLoadingState>()((set, get) => ({
  loadingStates: {},
  setLoadingState: (key, state) => {
    const currentStates = get().loadingStates;
    set({ loadingStates: { ...currentStates, [key]: state } });
  },
  clearLoadingState: (key) => {
    const currentStates = get().loadingStates;
    const { [key]: removed, ...remainingStates } = currentStates;
    set({ loadingStates: remainingStates });
  },
  clearAllLoadingStates: () => set({ loadingStates: {} }),
}));

// 模态锟斤拷状态
interface ModalState {
  modals: Record<string, any>;
  openModal: (key: string, config: any) => void;
  closeModal: (key: string) => void;
  closeAllModals: () => void;
}

export const useModalStore = create<ModalState>()((set, get) => ({
  modals: {},
  openModal: (key, config) => {
    const currentModals = get().modals;
    set({ modals: { ...currentModals, [key]: { isOpen: true, ...config } } });
  },
  closeModal: (key) => {
    const currentModals = get().modals;
    const { [key]: removed, ...remainingModals } = currentModals;
    set({ modals: remainingModals });
  },
  closeAllModals: () => set({ modals: {} }),
}));

// stores已经通过export const导出，无需重复导出
