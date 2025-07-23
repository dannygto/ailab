/**
 * 组织模型
 * 管理组织结构和层级关系
 */
import mongoose, { Document, Schema } from 'mongoose';
import { UserDocument } from './user.model';

// 组织类型枚举
export enum OrganizationType {
  SCHOOL = 'school',         // 学校
  COLLEGE = 'college',       // 学院
  DEPARTMENT = 'department', // 系/部门
  LABORATORY = 'laboratory', // 实验室
  RESEARCH_GROUP = 'research_group', // 研究组
  CLASS = 'class',           // 班级
  OTHER = 'other'            // 其他
}

// 组织文档接口
export interface OrganizationDocument extends Document {
  name: string;
  code?: string;
  type: OrganizationType;
  description?: string;
  logo?: string;
  parent?: OrganizationDocument['_id'];
  children: OrganizationDocument['_id'][];
  managers: UserDocument['_id'][];
  members: UserDocument['_id'][];
  settings: {
    allowMemberJoin: boolean;
    visibilityLevel: 'private' | 'public';
    resourceSharing: 'none' | 'members' | 'all';
  };
  createdBy: UserDocument['_id'];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  meta?: object;
}

// 组织模式定义
const OrganizationSchema = new Schema<OrganizationDocument>(
  {
    name: {
      type: String,
      required: [true, '组织名称是必填的'],
      trim: true
    },
    code: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    type: {
      type: String,
      enum: Object.values(OrganizationType),
      required: [true, '组织类型是必填的']
    },
    description: {
      type: String
    },
    logo: {
      type: String
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Organization'
    },
    children: [{
      type: Schema.Types.ObjectId,
      ref: 'Organization'
    }],
    managers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    settings: {
      allowMemberJoin: {
        type: Boolean,
        default: true
      },
      visibilityLevel: {
        type: String,
        enum: ['private', 'public'],
        default: 'private'
      },
      resourceSharing: {
        type: String,
        enum: ['none', 'members', 'all'],
        default: 'members'
      }
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    meta: {
      type: Object
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 创建索引
OrganizationSchema.index({ name: 1 });
OrganizationSchema.index({ code: 1 }, { unique: true, sparse: true });
OrganizationSchema.index({ type: 1 });
OrganizationSchema.index({ parent: 1 });
OrganizationSchema.index({ managers: 1 });
OrganizationSchema.index({ members: 1 });
OrganizationSchema.index({ isActive: 1 });

// 实例方法 - 检查用户是否为成员
OrganizationSchema.methods.isMember = function(userId: string): boolean {
  return this.members.some(member => member.toString() === userId);
};

// 实例方法 - 检查用户是否为管理员
OrganizationSchema.methods.isManager = function(userId: string): boolean {
  return this.managers.some(manager => manager.toString() === userId);
};

// 静态方法
interface OrganizationModel extends mongoose.Model<OrganizationDocument> {
  getOrganizationsByUserId(userId: string): Promise<OrganizationDocument[]>;
  getOrganizationWithChildren(orgId: string): Promise<OrganizationDocument[]>;
}

// 静态方法 - 获取用户所属的所有组织
OrganizationSchema.statics.getOrganizationsByUserId = async function(userId: string) {
  return this.find({
    $or: [
      { members: userId },
      { managers: userId }
    ],
    isActive: true
  })
  .populate('parent', 'name type')
  .sort({ name: 1 });
};

// 静态方法 - 获取组织及其所有子组织
OrganizationSchema.statics.getOrganizationWithChildren = async function(orgId: string) {
  // 递归获取所有子组织ID
  const getChildrenIds = async (parentId: string): Promise<string[]> => {
    const children = await this.find({ parent: parentId }).select('_id');
    const childIds = children.map(child => child._id.toString());

    const nestedChildrenIds = await Promise.all(
      childIds.map(id => getChildrenIds(id))
    );

    return [...childIds, ...nestedChildrenIds.flat()];
  };

  const childrenIds = await getChildrenIds(orgId);
  return this.find({ _id: { $in: [orgId, ...childrenIds] } });
};

// 创建组织模型
const Organization = mongoose.model<OrganizationDocument, OrganizationModel>('Organization', OrganizationSchema);

export default Organization;
