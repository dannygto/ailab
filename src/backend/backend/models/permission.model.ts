/**
 * 权限模型
 * 提供细粒度的权限控制系统
 */
import mongoose, { Document, Schema } from 'mongoose';

// 资源类型枚举
export enum ResourceType {
  EXPERIMENT = 'experiment',
  TEMPLATE = 'template',
  DEVICE = 'device',
  RESOURCE = 'resource',
  TEAM = 'team',
  REPORT = 'report',
  SETTING = 'setting',
  USER = 'user',
  ORGANIZATION = 'organization'
}

// 权限操作枚举
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  SHARE = 'share',
  APPROVE = 'approve',
  ASSIGN = 'assign',
  MANAGE = 'manage'
}

// 权限目标类型枚举
export enum PermissionTargetType {
  USER = 'user',
  ROLE = 'role',
  TEAM = 'team',
  ORGANIZATION = 'organization',
  PUBLIC = 'public'
}

// 权限定义接口
export interface PermissionDocument extends Document {
  resourceType: ResourceType;
  resourceId?: mongoose.Types.ObjectId;
  action: PermissionAction;
  targetType: PermissionTargetType;
  targetId?: mongoose.Types.ObjectId;
  conditions?: object;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// 权限模式定义
const PermissionSchema = new Schema<PermissionDocument>(
  {
    resourceType: {
      type: String,
      enum: Object.values(ResourceType),
      required: [true, '资源类型是必填的']
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      description: '特定资源ID，如果为空则适用于该类型的所有资源'
    },
    action: {
      type: String,
      enum: Object.values(PermissionAction),
      required: [true, '权限操作是必填的']
    },
    targetType: {
      type: String,
      enum: Object.values(PermissionTargetType),
      required: [true, '目标类型是必填的']
    },
    targetId: {
      type: Schema.Types.ObjectId,
      description: '权限目标ID，如用户ID、角色ID、团队ID等，如果为空则适用于所有相应类型目标'
    },
    conditions: {
      type: Object,
      description: '权限授予的条件，如时间范围、IP限制等'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '创建者是必填的']
    },
    expiresAt: {
      type: Date,
      description: '权限过期时间，如果为空则永不过期'
    },
    isActive: {
      type: Boolean,
      default: true,
      description: '权限是否激活'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 创建索引以提高查询性能
PermissionSchema.index({ resourceType: 1, action: 1 });
PermissionSchema.index({ targetType: 1, targetId: 1 });
PermissionSchema.index({ resourceId: 1 });
PermissionSchema.index({ isActive: 1 });
PermissionSchema.index({ expiresAt: 1 });

// 复合索引，用于快速查找特定资源的权限
PermissionSchema.index({
  resourceType: 1,
  resourceId: 1,
  action: 1,
  targetType: 1,
  targetId: 1,
  isActive: 1
});

// 创建权限模型
const Permission = mongoose.model<PermissionDocument>('Permission', PermissionSchema);

export default Permission;
