// 团队模型数据结构定义
import mongoose, { Document, Schema } from 'mongoose';
import { UserDocument } from './user.model';

// 团队成员角色枚举
export enum TeamMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

// 团队成员接口
export interface TeamMember {
  user: UserDocument['_id'];
  role: TeamMemberRole;
  joinedAt: Date;
  invitedBy: UserDocument['_id'];
}

// 团队接口
export interface ITeam {
  name: string;
  description: string;
  avatar?: string;
  createdBy: UserDocument['_id'];
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  settings: {
    isPrivate: boolean;
    allowMemberInvite: boolean;
    resourcePermissions: {
      experiments: boolean;
      devices: boolean;
      templates: boolean;
    }
  };
}

// 团队文档接口（MongoDB文档）
export interface TeamDocument extends ITeam, Document {}

// 团队成员Schema
const TeamMemberSchema = new Schema<TeamMember>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: Object.values(TeamMemberRole),
    default: TeamMemberRole.MEMBER,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// 团队Schema
const TeamSchema = new Schema<TeamDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500
    },
    avatar: {
      type: String,
      default: null
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: {
      type: [TeamMemberSchema],
      default: []
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    settings: {
      isPrivate: {
        type: Boolean,
        default: true
      },
      allowMemberInvite: {
        type: Boolean,
        default: false
      },
      resourcePermissions: {
        experiments: {
          type: Boolean,
          default: true
        },
        devices: {
          type: Boolean,
          default: true
        },
        templates: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  {
    timestamps: true
  }
);

// 索引设置
TeamSchema.index({ name: 1, createdBy: 1 }, { unique: true });
TeamSchema.index({ 'members.user': 1 });
TeamSchema.index({ isArchived: 1 });

// 静态方法
TeamSchema.statics = {
  /**
   * 根据ID获取团队详情（包含成员信息）
   */
  async getTeamById(id: string) {
    return this.findById(id)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('members.invitedBy', 'name email')
      .exec();
  },

  /**
   * 获取用户所属的所有团队
   */
  async getTeamsByUserId(userId: string) {
    return this.find({ 'members.user': userId, isArchived: false })
      .populate('createdBy', 'name email avatar')
      .sort({ updatedAt: -1 })
      .exec();
  }
};

// 实例方法
TeamSchema.methods = {
  /**
   * 检查用户是否是团队成员
   */
  isMember(userId: string): boolean {
    return this.members.some(member => member.user.toString() === userId);
  },

  /**
   * 检查用户在团队中的角色
   */
  getMemberRole(userId: string): TeamMemberRole | null {
    const member = this.members.find(m => m.user.toString() === userId);
    return member ? member.role : null;
  },

  /**
   * 检查用户是否有指定权限
   */
  hasPermission(userId: string, requiredRoles: TeamMemberRole[]): boolean {
    const role = this.getMemberRole(userId);
    return role !== null && requiredRoles.includes(role);
  }
};

// 中间件 - 保存前
TeamSchema.pre('save', function(next) {
  // 确保创建者也是团队的成员且为拥有者角色
  if (this.isNew) {
    const creatorExists = this.members.some(
      member => member.user.toString() === this.createdBy.toString()
    );

    if (!creatorExists) {
      this.members.push({
        user: this.createdBy,
        role: TeamMemberRole.OWNER,
        joinedAt: new Date(),
        invitedBy: this.createdBy
      });
    }
  }
  next();
});

const Team = mongoose.model<TeamDocument>('Team', TeamSchema);

export default Team;
