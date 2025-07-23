// 用户模型
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  position?: string;
  bio?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, '用户名是必填的'],
      trim: true
    },
    email: {
      type: String,
      required: [true, '邮箱是必填的'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请提供有效的邮箱地址']
    },
    password: {
      type: String,
      required: [true, '密码是必填的'],
      minlength: [6, '密码长度至少为6个字符'],
      select: false
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT
    },
    avatar: {
      type: String
    },
    department: {
      type: String
    },
    position: {
      type: String
    },
    bio: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 创建索引
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// 保存前加密密码
UserSchema.pre<UserDocument>('save', async function(next) {
  // 仅当密码被修改时才重新加密
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 比较密码的方法
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<UserDocument>('User', UserSchema);

export default User;
