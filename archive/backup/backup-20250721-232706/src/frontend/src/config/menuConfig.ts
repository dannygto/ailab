/**
 * 菜单配置文件
 * 
 * 定义系统的主导航菜单项，包括路由、图标、权限等配置
 * 支持多级菜单和动态权限控制
 */

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  permission?: string;
  disabled?: boolean;
  hidden?: boolean;
  badge?: number;
  description?: string;
}

/**
 * 主菜单配置
 */
export const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '仪表盘',
    icon: 'dashboard',
    path: '/dashboard',
    description: '系统概览和统计信息'
  },
  {
    key: 'experiments',
    label: '实验管理',
    icon: 'experiment',
    children: [
      {
        key: 'experiment-list',
        label: '实验列表',
        path: '/experiments',
        description: '查看和管理所有实验'
      }
    ]
  }
];

// 导出默认配置
export default menuItems;

// 确保这是一个模块文件
export {};
