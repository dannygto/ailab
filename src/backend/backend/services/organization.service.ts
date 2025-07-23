/**
 * 组织服务
 * 提供组织管理的业务逻辑
 */
import Organization, { OrganizationType } from '../models/organization.model';
import User from '../models/user.model';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import permissionService from './permission.service';
import { ResourceType, PermissionAction } from '../models/permission.model';

class OrganizationService {
  /**
   * 创建新组织
   */
  async createOrganization(organizationData: any, creatorId: string) {
    // 验证创建者是否存在
    const creator = await User.findById(creatorId);
    if (!creator) {
      throw new NotFoundError('创建者不存在');
    }

    // 检查组织代码是否已被使用
    if (organizationData.code) {
      const existingOrg = await Organization.findOne({
        code: organizationData.code,
        isActive: true
      });

      if (existingOrg) {
        throw new BadRequestError('组织代码已被使用');
      }
    }

    // 验证父组织（如果有）
    if (organizationData.parent) {
      const parentOrg = await Organization.findById(organizationData.parent);
      if (!parentOrg) {
        throw new NotFoundError('父组织不存在');
      }

      // 验证用户是否有权限在父组织下创建子组织
      const canCreateInParent = await permissionService.checkPermission(
        creatorId,
        ResourceType.ORGANIZATION,
        PermissionAction.MANAGE,
        parentOrg._id.toString()
      );

      if (!canCreateInParent) {
        throw new ForbiddenError('您没有在此父组织下创建子组织的权限');
      }
    }

    // 创建新组织
    const organization = new Organization({
      ...organizationData,
      managers: [creatorId],
      members: [creatorId],
      createdBy: creatorId
    });

    // 保存组织
    const savedOrg = await organization.save();

    // 如果有父组织，添加到父组织的子组织列表
    if (organizationData.parent) {
      await Organization.findByIdAndUpdate(
        organizationData.parent,
        { $addToSet: { children: savedOrg._id } }
      );
    }

    // 创建默认权限
    await this.createDefaultPermissions(savedOrg._id.toString(), creatorId);

    return savedOrg;
  }

  /**
   * 创建组织的默认权限
   */
  private async createDefaultPermissions(orgId: string, creatorId: string) {
    // 创建组织创建者的管理权限
    await permissionService.grantPermission({
      resourceType: ResourceType.ORGANIZATION,
      resourceId: orgId,
      action: PermissionAction.MANAGE,
      targetType: 'user',
      targetId: creatorId
    }, creatorId);

    // 创建组织成员的读取权限
    await permissionService.grantPermission({
      resourceType: ResourceType.ORGANIZATION,
      resourceId: orgId,
      action: PermissionAction.READ,
      targetType: 'organization',
      targetId: orgId
    }, creatorId);
  }

  /**
   * 获取组织详情
   */
  async getOrganizationById(orgId: string, userId: string) {
    // 查找组织
    const organization = await Organization.findOne({
      _id: orgId,
      isActive: true
    })
    .populate('parent', 'name type')
    .populate('children', 'name type')
    .populate('managers', 'name email avatar')
    .populate('members', 'name email avatar');

    if (!organization) {
      throw new NotFoundError('组织不存在');
    }

    // 验证用户是否有权限查看此组织
    const canView = await permissionService.checkPermission(
      userId,
      ResourceType.ORGANIZATION,
      PermissionAction.READ,
      orgId
    );

    if (!canView) {
      throw new ForbiddenError('您没有查看此组织的权限');
    }

    return organization;
  }

  /**
   * 更新组织信息
   */
  async updateOrganization(orgId: string, organizationData: any, userId: string) {
    // 查找组织
    const organization = await Organization.findOne({
      _id: orgId,
      isActive: true
    });

    if (!organization) {
      throw new NotFoundError('组织不存在');
    }

    // 验证用户是否有权限更新此组织
    const canUpdate = await permissionService.checkPermission(
      userId,
      ResourceType.ORGANIZATION,
      PermissionAction.UPDATE,
      orgId
    );

    if (!canUpdate) {
      throw new ForbiddenError('您没有更新此组织的权限');
    }

    // 检查组织代码是否已被使用（如果要更新）
    if (organizationData.code && organizationData.code !== organization.code) {
      const existingOrg = await Organization.findOne({
        code: organizationData.code,
        _id: { $ne: orgId },
        isActive: true
      });

      if (existingOrg) {
        throw new BadRequestError('组织代码已被使用');
      }
    }

    // 更新组织
    Object.assign(organization, organizationData);
    return await organization.save();
  }

  /**
   * 获取组织层级结构
   */
  async getOrganizationHierarchy(rootId: string | undefined, userId: string) {
    // 如果提供了根组织ID，验证用户是否有权限查看
    if (rootId) {
      const canView = await permissionService.checkPermission(
        userId,
        ResourceType.ORGANIZATION,
        PermissionAction.READ,
        rootId
      );

      if (!canView) {
        throw new ForbiddenError('您没有查看此组织的权限');
      }
    }

    // 递归构建组织层级
    const buildHierarchy = async (parentId: string | null): Promise<any[]> => {
      const query = parentId
        ? { parent: parentId, isActive: true }
        : { parent: { $exists: false }, isActive: true };

      const organizations = await Organization.find(query)
        .select('_id name type logo children');

      const result = [];

      for (const org of organizations) {
        // 验证用户是否有权限查看此组织
        const canView = await permissionService.checkPermission(
          userId,
          ResourceType.ORGANIZATION,
          PermissionAction.READ,
          org._id.toString()
        );

        if (canView) {
          const children = await buildHierarchy(org._id.toString());
          result.push({
            ...org.toObject(),
            children
          });
        }
      }

      return result;
    };

    // 如果提供了根组织ID，从该组织开始构建
    if (rootId) {
      const rootOrg = await Organization.findOne({
        _id: rootId,
        isActive: true
      }).select('_id name type logo children');

      if (!rootOrg) {
        throw new NotFoundError('根组织不存在');
      }

      const children = await buildHierarchy(rootId);
      return {
        ...rootOrg.toObject(),
        children
      };
    }

    // 否则从顶级组织开始构建
    return await buildHierarchy(null);
  }

  /**
   * 获取用户所属的组织
   */
  async getUserOrganizations(userId: string) {
    return await Organization.getOrganizationsByUserId(userId);
  }

  /**
   * 添加组织成员
   */
  async addOrganizationMember(orgId: string, newMemberId: string, requesterId: string) {
    // 查找组织
    const organization = await Organization.findOne({
      _id: orgId,
      isActive: true
    });

    if (!organization) {
      throw new NotFoundError('组织不存在');
    }

    // 验证用户是否有权限管理此组织成员
    const canManage = await permissionService.checkPermission(
      requesterId,
      ResourceType.ORGANIZATION,
      PermissionAction.MANAGE,
      orgId
    );

    if (!canManage) {
      throw new ForbiddenError('您没有管理此组织成员的权限');
    }

    // 验证新成员是否存在
    const newMember = await User.findById(newMemberId);
    if (!newMember) {
      throw new NotFoundError('用户不存在');
    }

    // 检查用户是否已经是成员
    if (organization.members.some(m => m.toString() === newMemberId)) {
      throw new BadRequestError('用户已经是组织成员');
    }

    // 添加成员
    organization.members.push(newMemberId);
    return await organization.save();
  }

  /**
   * 移除组织成员
   */
  async removeOrganizationMember(orgId: string, memberId: string, requesterId: string) {
    // 查找组织
    const organization = await Organization.findOne({
      _id: orgId,
      isActive: true
    });

    if (!organization) {
      throw new NotFoundError('组织不存在');
    }

    // 验证用户是否有权限管理此组织成员
    const canManage = await permissionService.checkPermission(
      requesterId,
      ResourceType.ORGANIZATION,
      PermissionAction.MANAGE,
      orgId
    );

    if (!canManage) {
      throw new ForbiddenError('您没有管理此组织成员的权限');
    }

    // 检查要移除的是否是唯一的管理员
    if (
      organization.managers.length === 1 &&
      organization.managers[0].toString() === memberId
    ) {
      throw new BadRequestError('无法移除唯一的组织管理员');
    }

    // 移除成员
    organization.members = organization.members.filter(
      m => m.toString() !== memberId
    );

    // 如果也是管理员，同时移除管理员身份
    organization.managers = organization.managers.filter(
      m => m.toString() !== memberId
    );

    return await organization.save();
  }

  /**
   * 设置组织管理员
   */
  async setOrganizationManager(orgId: string, userId: string, requesterId: string) {
    // 查找组织
    const organization = await Organization.findOne({
      _id: orgId,
      isActive: true
    });

    if (!organization) {
      throw new NotFoundError('组织不存在');
    }

    // 验证用户是否有权限管理此组织
    const canManage = await permissionService.checkPermission(
      requesterId,
      ResourceType.ORGANIZATION,
      PermissionAction.MANAGE,
      orgId
    );

    if (!canManage) {
      throw new ForbiddenError('您没有管理此组织的权限');
    }

    // 验证用户是否存在
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    // 检查用户是否已经是管理员
    if (organization.managers.some(m => m.toString() === userId)) {
      throw new BadRequestError('用户已经是组织管理员');
    }

    // 确保用户是组织成员
    if (!organization.members.some(m => m.toString() === userId)) {
      organization.members.push(userId);
    }

    // 添加为管理员
    organization.managers.push(userId);

    // 保存更改
    const updatedOrg = await organization.save();

    // 授予用户管理权限
    await permissionService.grantPermission({
      resourceType: ResourceType.ORGANIZATION,
      resourceId: orgId,
      action: PermissionAction.MANAGE,
      targetType: 'user',
      targetId: userId
    }, requesterId);

    return updatedOrg;
  }

  /**
   * 移除组织管理员
   */
  async removeOrganizationManager(orgId: string, userId: string, requesterId: string) {
    // 查找组织
    const organization = await Organization.findOne({
      _id: orgId,
      isActive: true
    });

    if (!organization) {
      throw new NotFoundError('组织不存在');
    }

    // 验证用户是否有权限管理此组织
    const canManage = await permissionService.checkPermission(
      requesterId,
      ResourceType.ORGANIZATION,
      PermissionAction.MANAGE,
      orgId
    );

    if (!canManage) {
      throw new ForbiddenError('您没有管理此组织的权限');
    }

    // 检查是否是唯一的管理员
    if (organization.managers.length === 1 && organization.managers[0].toString() === userId) {
      throw new BadRequestError('无法移除唯一的组织管理员');
    }

    // 移除管理员身份
    organization.managers = organization.managers.filter(
      m => m.toString() !== userId
    );

    // 保存更改
    const updatedOrg = await organization.save();

    // 撤销用户管理权限
    const permissions = await permissionService.getResourcePermissions(
      ResourceType.ORGANIZATION,
      orgId,
      requesterId
    );

    for (const permission of permissions) {
      if (
        permission.action === PermissionAction.MANAGE &&
        permission.targetType === 'user' &&
        permission.targetId.toString() === userId
      ) {
        await permissionService.revokePermission(permission._id, requesterId);
      }
    }

    return updatedOrg;
  }

  /**
   * 归档组织
   */
  async archiveOrganization(orgId: string, userId: string) {
    // 查找组织
    const organization = await Organization.findOne({
      _id: orgId,
      isActive: true
    });

    if (!organization) {
      throw new NotFoundError('组织不存在');
    }

    // 验证用户是否有权限归档此组织
    const canDelete = await permissionService.checkPermission(
      userId,
      ResourceType.ORGANIZATION,
      PermissionAction.DELETE,
      orgId
    );

    if (!canDelete) {
      throw new ForbiddenError('您没有归档此组织的权限');
    }

    // 检查组织是否有子组织
    if (organization.children && organization.children.length > 0) {
      throw new BadRequestError('请先归档所有子组织');
    }

    // 归档组织（设为非活动状态）
    organization.isActive = false;
    await organization.save();

    // 如果有父组织，从父组织的子组织列表中移除
    if (organization.parent) {
      await Organization.findByIdAndUpdate(
        organization.parent,
        { $pull: { children: orgId } }
      );
    }
  }

  /**
   * 获取指定类型的所有组织
   */
  async getOrganizationsByType(type: OrganizationType, userId: string) {
    const organizations = await Organization.find({
      type,
      isActive: true
    }).select('_id name code logo');

    // 过滤用户有权查看的组织
    const result = [];

    for (const org of organizations) {
      const canView = await permissionService.checkPermission(
        userId,
        ResourceType.ORGANIZATION,
        PermissionAction.READ,
        org._id.toString()
      );

      if (canView) {
        result.push(org);
      }
    }

    return result;
  }
}

export default new OrganizationService();
