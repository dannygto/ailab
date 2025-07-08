export interface MenuItem {
  text: string;
  icon: string;
  path: string;
  subItems?: SubMenuItem[];
  permission?: string;
  category?: string;
}

export interface SubMenuItem {
  text: string;
  path: string;
  permission?: string;
}

export const menuItems: MenuItem[] = [
  {
    text: '�Ǳ���',
    icon: 'dashboard',
    path: '/dashboard',
    category: 'main'
  },
  {
    text: '��ʦ�Ǳ���',
    icon: 'teacher',
    path: '/teacher-dashboard',
    category: 'main',
    permission: 'teacher'
  },
  {
    text: 'ʵ�����',
    icon: 'ScienceIcon',
    path: '/experiments',
    category: 'experiment',
    subItems: [
      { text: 'ʵ���б�', path: '/experiments' },
      { text: 'ʵ���б�V2', path: '/experiments/v2' },
      { text: '����ʵ��', path: '/experiments/create' },
      { text: '����ʵ��V2', path: '/experiments/create/v2' },
      { text: '����ʵ��(��)', path: '/experiments/create/new' },
      { text: '����ʵ��(����)', path: '/experiments/create/final' }
    ]
  },
  {
    text: 'ģ�����',
    icon: 'template',
    path: '/templates',
    category: 'experiment',
    subItems: [
      { text: 'ģ���', path: '/templates' },
      { text: '����ģ��', path: '/templates/create' }
    ]
  },
  {
    text: '�豸����',
    icon: 'device',
    path: '/devices',
    category: 'device',
    subItems: [
      { text: '�豸����', path: '/devices' },
      { text: '�豸���', path: '/devices/monitoring' },
      { text: '�豸���V2', path: '/devices/monitoring/v2' },
      { text: '����Ǳ���', path: '/devices/dashboard' }
    ]
  },
  {
    text: '��Դ����',
    icon: 'resource',
    path: '/resources',
    category: 'resource',
    subItems: [
      { text: '��Դ����', path: '/resources' },
      { text: 'ʵ����Դ������', path: '/resources/manager' }
    ]
  },
  {
    text: '���ݷ���',
    icon: 'analysis',
    path: '/data-collection',
    category: 'data',
    subItems: [
      { text: '���ݲɼ������', path: '/data-collection' },
      { text: '�߼����ݷ���', path: '/data-analysis' }
    ]
  },
  {
    text: 'AI����',
    icon: 'ai',
    path: '/ai-assistant',
    category: 'ai'
  },
  {
    text: 'ý������ʶ��',
    icon: 'media',
    path: '/media-analysis',
    category: 'ai'
  },
  {
    text: 'ָ��ϵͳ',
    icon: 'guidance',
    path: '/guidance',
    category: 'guidance'
  },
  {
    text: 'ϵͳ����',
    icon: 'admin',
    path: '/admin',
    category: 'admin',
    permission: 'admin',
    subItems: [
      { text: '�û�����', path: '/admin/users', permission: 'admin' },
      { text: 'ϵͳ����', path: '/admin/system', permission: 'admin' }
    ]
  },
  {
    text: '����',
    icon: 'settings',
    path: '/settings',
    category: 'settings',
    subItems: [
      { text: 'ͨ������', path: '/settings' },
      { text: 'AIģ������', path: '/settings/ai-models' },
      { text: '��ȫ����', path: '/settings/security' },
      { text: '֪ͨ����', path: '/settings/NotificationsIcon' }
    ]
  },
  {
    text: 'api���',
    icon: 'api',
    path: '/api-CheckIcon',
    category: 'tool'
  },
  {
    text: '����',
    icon: 'HelpIcon',
    path: '/HelpIcon',
    category: 'HelpIcon'
  }
];

// �����û�Ȩ�޹��˲˵���
export const filterMenuItems = (items: MenuItem[], userPermissions: string[] = []): MenuItem[] => {
  return items.filter(item => {
    // ���û��Ȩ��Ҫ����ʾ����
    if (!item.permission) return true;
    
    // ����û��Ƿ�������Ȩ��
    return userPermissions.includes(item.permission);
  }).map(item => ({
    ...item,
    subItems: item.subItems?.filter(subItem => {
      if (!subItem.permission) return true;
      return userPermissions.includes(subItem.permission);
    })
  }));
};

// ����������˵���
export const groupMenuItems = (items: MenuItem[]): Record<string, MenuItem[]> => {
  const groups: Record<string, MenuItem[]> = {};
  
  items.forEach(item => {
    const category = item.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
  });
  
  return groups;
};

// �����ʾ����
export const categoryNames: Record<string, string> = {
  main: '��Ҫ����',
  experiment: 'ʵ�����',
  device: '�豸����',
  resource: '��Դ����',
  data: '���ݷ���',
  ai: 'AI����',
  guidance: 'ָ��ϵͳ',
  admin: 'ϵͳ����',
  settings: '����',
  tool: '����',
  HelpIcon: '����֧��',
  other: '����'
};


export default menuItems;
