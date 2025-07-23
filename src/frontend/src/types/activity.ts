export enum ActivityType {
  TEAM_CREATE = 'team_create',
  TEAM_UPDATE = 'team_update',
  TEAM_DELETE = 'team_delete',
  MEMBER_ADD = 'member_add',
  MEMBER_REMOVE = 'member_remove',
  MEMBER_ROLE_CHANGE = 'member_role_change',
  RESOURCE_ADD = 'resource_add',
  RESOURCE_REMOVE = 'resource_remove',
  RESOURCE_SHARE = 'resource_share',
  RESOURCE_UPDATE = 'resource_update',
  COMMENT = 'comment',
  OTHER = 'other'
}

export enum ResourceType {
  EXPERIMENT = 'experiment',
  DEVICE = 'device',
  TEMPLATE = 'template',
  DATASET = 'dataset',
  FILE = 'file',
  TEAM = 'team',
  OTHER = 'other'
}

export interface Activity {
  _id: string;
  team: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  activityType: ActivityType;
  resourceType?: ResourceType;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface TeamActivityFilter {
  activityType?: ActivityType[];
  resourceType?: ResourceType[];
  userId?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ActivityResponse {
  data: Activity[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
