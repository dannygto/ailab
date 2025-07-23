/**
 * 权限规则模型
 * 提供权限规则管理，方便权限的批量设置和应用
 */
import mongoose, { Document, Schema } from 'mongoose';
import { Permission } from './permission.model';

export interface PermissionRuleDocument extends Document {
  name: string;
  description?: string;
  permissions: any[];
  isBuiltIn?: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionRuleSchema = new Schema<PermissionRuleDocument>(
  {
    name: {
      type: String,
      required: [true, '规则名称是必填的'],
      trim: true,
      maxlength: [100, '规则名称不能超过100个字符']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, '规则描述不能超过500个字符']
    },
    permissions: {
      type: [{
        resourceType: {
          type: String,
          required: [true, '资源类型是必填的']
        },
        resourceId: {
          type: Schema.Types.ObjectId,
          description: '特定资源ID，如果为空则适用于该类型的所有资源'
        },
        action: {
          type: String,
          required: [true, '权限操作是必填的']
        },
        targetType: {
          type: String,
          required: [true, '目标类型是必填的']
        },
        targetId: {
          type: Schema.Types.ObjectId,
          description: '权限目标ID，如用户ID、角色ID、团队ID等'
        },
        conditions: {
          type: Object,
          description: '权限授予的条件，如时间范围、IP限制等'
        }
      }],
      required: [true, '权限列表不能为空'],
      validate: {
        validator: function(permissions: any[]) {
          return permissions.length > 0;
        },
        message: '权限规则必须包含至少一个权限'
      }
    },
    isBuiltIn: {
      type: Boolean,
      default: false,
      description: '是否为内置规则，内置规则不能被删除'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '创建者是必填的']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 索引
PermissionRuleSchema.index({ name: 1 });
PermissionRuleSchema.index({ createdBy: 1 });
PermissionRuleSchema.index({ isBuiltIn: 1 });

// 应用规则到资源的静态方法
PermissionRuleSchema.statics.applyToResource = async function(
  ruleId: string,
  resourceType: string,
  resourceId: string,
  userId: string
) {
  const rule = await this.findById(ruleId);
  if (!rule) {
    throw new Error('权限规则不存在');
  }

  const permissions = rule.permissions.map(p => ({
    ...p,
    resourceType,
    resourceId,
    createdBy: userId,
    isActive: true
  }));

  return await Permission.insertMany(permissions);
};

const PermissionRule = mongoose.model<PermissionRuleDocument>('PermissionRule', PermissionRuleSchema);

export default PermissionRule;
