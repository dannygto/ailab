// 活动记录模型
import mongoose, { Document, Schema } from 'mongoose';
import { UserDocument } from './user.model';
import { TeamDocument } from './team.model';

// 活动类型枚举
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

// 资源类型枚举
export enum ResourceType {
  EXPERIMENT = 'experiment',
  DEVICE = 'device',
  TEMPLATE = 'template',
  DATASET = 'dataset',
  FILE = 'file',
  TEAM = 'team',
  OTHER = 'other'
}

// 活动记录接口
export interface IActivity {
  team: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  activityType: ActivityType;
  resourceType?: ResourceType;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// 活动记录文档接口
export interface ActivityDocument extends IActivity, Document {}

// 活动记录Schema
const ActivitySchema = new Schema<ActivityDocument>({
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: Object.values(ActivityType),
    required: true,
    index: true
  },
  resourceType: {
    type: String,
    enum: Object.values(ResourceType),
    index: true
  },
  resourceId: {
    type: String,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// 创建复合索引以加速查询
ActivitySchema.index({ team: 1, createdAt: -1 });
ActivitySchema.index({ team: 1, user: 1, createdAt: -1 });
ActivitySchema.index({ team: 1, resourceType: 1, resourceId: 1 });

// 创建模型
const Activity = mongoose.model<ActivityDocument>('Activity', ActivitySchema);

export default Activity;
