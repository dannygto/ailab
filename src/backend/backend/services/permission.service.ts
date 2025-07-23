/**
 * 权限服务
 * 提供权限验证和管理的业务逻辑
 */
import Permission, { PermissionAction, PermissionTargetType, ResourceType } from '../models/permission.model';
import User, { UserRole } from '../models/user.model';
import Team, { TeamMemberRole } from '../models/team.model';
import Organization from '../models/organization.model';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import mongoose from 'mongoose';

class PermissionService {
  /**
   * 检查用户是否有执行特定操作的权限
   * @param userId 用户ID
   * @param resourceType 资源类型
   * @param action 操作类型
   * @param resourceId 可选的特定资源ID
   */
  async checkPermission(
    userId: string,
    resourceType: ResourceType,
    action: PermissionAction,
    resourceId?: string
  ): Promise<boolean> {
    try {
      // 获取用户信息
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('用户不存在');
      }

      // 管理员拥有所有权限
      if (user.role === UserRole.ADMIN) {
        return true;
      }

      // 准备查询条件
      const baseQuery = {
        resourceType,
        action,
        isActive: true
      };

      // 如果指定了资源ID，则检查针对特定资源的权限
      // 否则检查针对资源类型的通用权限
      const resourceQuery = resourceId
        ? { $or: [{ resourceId: { $exists: false } }, { resourceId: resourceId }] }
        : {};

      // 获取用户所属的团队
      const userTeams = await Team.find({ 'members.user': userId, isArchived: false });
      const teamIds = userTeams.map(team => team._id);

      // 获取用户所属的组织
      const userOrgs = await Organization.getOrganizationsByUserId(userId);
      const orgIds = userOrgs.map(org => org._id);

    // 构建目标查询 - 检查针对用户、用户角色、用户所属团队、用户所属组织或公开的权限
    const targetQuery = {
      $or: [
        // 用户特定权限
        { targetType: PermissionTargetType.USER, targetId: userId },
        // 角色权限
        { targetType: PermissionTargetType.ROLE, targetId: user.role },
        // 团队权限
        { targetType: PermissionTargetType.TEAM, targetId: { $in: teamIds } },
        // 组织权限
        { targetType: PermissionTargetType.ORGANIZATION, targetId: { $in: orgIds } },
        // 公开权限
        { targetType: PermissionTargetType.PUBLIC }
      ]
    };

    // 检查权限是否存在
    const permission = await Permission.findOne({
      ...baseQuery,
      ...resourceQuery,
      ...targetQuery,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });      return !!permission;
    } catch (error) {
      console.error('权限检查失败:', error);
      return false;
    }
  }

  /**
   * 授予权限
   * @param permissionData 权限数据
   * @param granterId 授权者ID
   */
  async grantPermission(permissionData: any, granterId: string): Promise<any> {
    // 验证授权者权限
    const canGrant = await this.checkPermission(
      granterId,
      permissionData.resourceType,
      PermissionAction.MANAGE,
      permissionData.resourceId
    );

    if (!canGrant) {
      throw new ForbiddenError('您没有授予此权限的权限');
    }

    // 创建新权限
    const permission = new Permission({
      ...permissionData,
      createdBy: granterId
    });

    return await permission.save();
  }

  /**
   * 撤销权限
   * @param permissionId 权限ID
   * @param revokerId 撤销者ID
   */
  async revokePermission(permissionId: string, revokerId: string): Promise<void> {
    // 获取权限信息
    const permission = await Permission.findById(permissionId);
    if (!permission) {
      throw new NotFoundError('权限不存在');
    }

    // 验证撤销者权限
    const canRevoke = await this.checkPermission(
      revokerId,
      permission.resourceType,
      PermissionAction.MANAGE,
      permission.resourceId?.toString()
    );

    if (!canRevoke) {
      throw new ForbiddenError('您没有撤销此权限的权限');
    }

    // 撤销权限（设为非活动状态）
    permission.isActive = false;
    await permission.save();
  }

  /**
   * 获取资源的所有权限
   * @param resourceType 资源类型
   * @param resourceId 资源ID
   * @param requesterId 请求者ID
   */
  async getResourcePermissions(
    resourceType: ResourceType,
    resourceId: string,
    requesterId: string
  ): Promise<any[]> {
    // 验证请求者权限
    const canView = await this.checkPermission(
      requesterId,
      resourceType,
      PermissionAction.MANAGE,
      resourceId
    );

    if (!canView) {
      throw new ForbiddenError('您没有查看此资源权限的权限');
    }

    // 获取资源的所有权限
    return Permission.find({
      resourceType,
      resourceId,
      isActive: true
    }).populate('targetId', 'name email');
  }

  /**
   * 获取用户在特定资源上的权限
   * @param userId 用户ID
   * @param resourceType 资源类型
   * @param resourceId 资源ID
   */
  async getUserPermissionsForResource(
    userId: string,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<PermissionAction[]> {
    // 获取用户信息
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    // 管理员拥有所有权限
    if (user.role === UserRole.ADMIN) {
      return Object.values(PermissionAction);
    }

    // 获取用户所属的团队
    const userTeams = await Team.find({ 'members.user': userId, isArchived: false });
    const teamIds = userTeams.map(team => team._id);

    // 获取用户所属的组织
    const userOrgs = await Organization.getOrganizationsByUserId(userId);
    const orgIds = userOrgs.map(org => org._id);

    // 查询用户对资源的所有权限
    const permissions = await Permission.find({
      resourceType,
      $or: [
        { resourceId: { $exists: false } },
        { resourceId: resourceId }
      ],
      isActive: true,
      $and: [
        {
          $or: [
            { targetType: PermissionTargetType.USER, targetId: userId },
            { targetType: PermissionTargetType.ROLE, targetId: user.role },
            { targetType: PermissionTargetType.TEAM, targetId: { $in: teamIds } },
            { targetType: PermissionTargetType.ORGANIZATION, targetId: { $in: orgIds } },
            { targetType: PermissionTargetType.PUBLIC }
          ]
        },
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } }
          ]
        }
      ]
    });

    // 提取所有允许的操作
    return [...new Set(permissions.map(p => p.action))];
  }

  /**
   * 批量更新资源权限
   * @param resourceType 资源类型
   * @param resourceId 资源ID
   * @param permissions 权限数据数组
   * @param updaterId 更新者ID
   */
  async updateResourcePermissions(
    resourceType: ResourceType,
    resourceId: string,
    permissions: any[],
    updaterId: string
  ): Promise<void> {
    // 验证更新者权限
    const canUpdate = await this.checkPermission(
      updaterId,
      resourceType,
      PermissionAction.MANAGE,
      resourceId
    );

    if (!canUpdate) {
      throw new ForbiddenError('您没有更新此资源权限的权限');
    }

    // 开启事务
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 将现有权限设为非活动状态
      await Permission.updateMany(
        {
          resourceType,
          resourceId,
          isActive: true
        },
        { isActive: false },
        { session }
      );

      // 创建新权限
      if (permissions.length > 0) {
        const newPermissions = permissions.map(p => ({
          ...p,
          resourceType,
          resourceId,
          createdBy: updaterId,
          isActive: true
        }));

        await Permission.insertMany(newPermissions, { session });
      }

      // 提交事务
      await session.commitTransaction();
    } catch (error) {
      // 回滚事务
      await session.abortTransaction();
      throw error;
    } finally {
      // 结束会话
      session.endSession();
    }
  }
}

export default new PermissionService();
