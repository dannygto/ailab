// 消息相关类型定义

// 消息类型
export interface Message {
  id: string;
  title: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  type: 'system' | 'experiment' | 'personal' | 'announcement';
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  starred: boolean;
  createdAt: string;
  relatedExperiment?: {
    id: string;
    name: string;
  };
}

// 消息过滤条件
export interface MessageFilter {
  type?: 'system' | 'experiment' | 'personal' | 'announcement' | 'all';
  priority?: 'high' | 'medium' | 'low' | 'all';
  read?: boolean;
  starred?: boolean;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

// 消息统计
export interface MessageStats {
  total: number;
  unread: number;
  system: number;
  experiment: number;
  personal: number;
  starred: number;
}
