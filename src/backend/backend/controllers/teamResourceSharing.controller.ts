import { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

// 访问级别定义
type AccessLevel = 'readonly' | 'edit' | 'full';
type AccessType = 'view' | 'edit' | 'delete' | 'share' | 'download';

// 共享结果定义
interface ShareResult {
  resourceId: string;
  resourceName: string;
  reason?: string;
  appliedSettings?: number;
}

interface ResourceSharingLog {
  resourceId: string;
  resourceType: string;
  resourceName: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  details?: Record<string, any>;
  successful: boolean;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  sessionId: string | null;
  requestId: string;
  teamId: string | null;
}

/**
 * 检查一个访问级别是否高于另一个
 * @param level1 第一个访问级别
 * @param level2 第二个访问级别
 * @returns 如果level1高于或等于level2，则返回true
 */
function isHigherAccessLevel(level1: AccessLevel, level2: AccessLevel): boolean {
  const levels: Record<AccessLevel, number> = {
    'readonly': 1,
    'edit': 2,
    'full': 3
  };

  return levels[level1] >= levels[level2];
}

/**
 * 检查指定的访问级别是否允许特定操作
 * @param accessLevel 访问级别
 * @param accessType 操作类型
 * @returns 是否允许
 */
function isAccessAllowed(accessLevel: AccessLevel, accessType: AccessType): boolean {
  switch (accessLevel) {
    case 'readonly':
      return ['view', 'download'].includes(accessType);
    case 'edit':
      return ['view', 'edit', 'download'].includes(accessType);
    case 'full':
      return true;
    default:
      return false;
  }
}

/**
 * 团队资源共享控制器
 * 处理团队资源共享相关的API请求
 */
class TeamResourceSharingController {
  /**
   * 创建资源共享
   */
  async createResourceSharing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const {
        resourceId,
        resourceType,
        targetType,
        targetId,
        targetRole,
        sharingType,
        expiresAt
      } = req.body;

      // 在实际实现中，这里会调用服务层保存共享配置
      const sharingId = `sharing-${Date.now()}`;

      res.status(201).json({
        success: true,
        message: '资源共享创建成功',
        data: {
          id: sharingId,
          resourceId,
          resourceType,
          targetType,
          targetId,
          targetRole,
          sharingType,
          expiresAt,
          createdBy: userId,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取资源的共享配置列表
   */
  async getResourceSharings(req: Request, res: Response, next: NextFunction) {
    try {
      const { resourceId } = req.params;
      const userId = req.user?.id;

      // 在实际实现中，这里会从数据库获取共享配置
      // 这里我们返回模拟数据
      const sharings = [
        {
          id: 'sharing-001',
          resourceId,
          resourceType: 'experiment',
          targetType: 'user',
          targetId: 'user-002',
          sharingType: 'readonly',
          createdBy: userId,
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1天前
        },
        {
          id: 'sharing-002',
          resourceId,
          resourceType: 'experiment',
          targetType: 'team',
          targetId: 'team-001',
          sharingType: 'edit',
          createdBy: userId,
          createdAt: new Date(Date.now() - 43200000).toISOString() // 12小时前
        }
      ];

      res.status(200).json({
        success: true,
        data: sharings
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新资源共享配置
   */
  async updateResourceSharing(req: Request, res: Response, next: NextFunction) {
    try {
      const { sharingId } = req.params;
      const { sharingType, expiresAt } = req.body;
      const userId = req.user?.id;

      // 在实际实现中，这里会更新数据库中的共享配置

      res.status(200).json({
        success: true,
        message: '资源共享配置已更新',
        data: {
          id: sharingId,
          sharingType,
          expiresAt,
          updatedAt: new Date().toISOString(),
          updatedBy: userId
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除资源共享
   */
  async deleteResourceSharing(req: Request, res: Response, next: NextFunction) {
    try {
      const { sharingId } = req.params;

      // 在实际实现中，这里会从数据库删除共享配置

      res.status(200).json({
        success: true,
        message: '资源共享已删除'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 处理资源共享请求
   * 当用户请求访问某个已共享资源时调用
   */
  async processShareRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const userId = req.user?.id;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const { action } = req.body; // accept, reject

      // 获取共享请求详情
      const shareRequest = await this.getShareRequestById(requestId);

      if (!shareRequest) {
        return res.status(404).json({
          success: false,
          message: '共享请求不存在'
        });
      }

      // 验证当前用户是否有权限处理此请求
      // 只有资源所有者或有管理权限的用户可以处理共享请求
      const hasPermission = await this.validateUserResourceAccess(userId, shareRequest.resourceId, 'share');

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '您没有权限处理此共享请求'
        });
      }

      // 更新共享请求状态
      await this.updateShareRequestStatus(requestId, action, userId);

      if (action === 'accept') {
        // 创建资源访问权限记录
        await this.createResourceAccess(shareRequest);

        // 记录审计日志
        await this.logResourceAccess(userId, shareRequest.resourceId, 'accept_share_request', {
          requestId,
          targetType: shareRequest.targetType,
          targetId: shareRequest.targetId
        });

        res.status(200).json({
          success: true,
          message: '已接受资源共享请求',
          data: {
            id: requestId,
            status: 'accepted',
            processedAt: new Date().toISOString(),
            processedBy: userId
          }
        });
      } else if (action === 'reject') {
        // 记录审计日志
        await this.logResourceAccess(userId, shareRequest.resourceId, 'reject_share_request', {
          requestId,
          targetType: shareRequest.targetType,
          targetId: shareRequest.targetId
        });

        res.status(200).json({
          success: true,
          message: '已拒绝资源共享请求',
          data: {
            id: requestId,
            status: 'rejected',
            processedAt: new Date().toISOString(),
            processedBy: userId
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: '无效的操作'
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取共享请求详情
   * @param requestId 请求ID
   * @private
   */
  private async getShareRequestById(requestId: string): Promise<any> {
    // TODO: 从数据库获取共享请求详情
    // 示例实现
    try {
      const db = global.db;
      return await db.collection('shareRequests').findOne({ _id: requestId });
    } catch (error) {
      console.error('获取共享请求详情时出错:', error);
      return null;
    }
  }

  /**
   * 更新共享请求状态
   * @param requestId 请求ID
   * @param action 操作类型（accept/reject）
   * @param userId 处理用户ID
   * @private
   */
  private async updateShareRequestStatus(requestId: string, action: string, userId: string): Promise<void> {
    // TODO: 更新数据库中的共享请求状态
    // 示例实现
    try {
      const db = global.db;
      await db.collection('shareRequests').updateOne(
        { _id: requestId },
        {
          $set: {
            status: action === 'accept' ? 'accepted' : 'rejected',
            processedAt: new Date(),
            processedBy: userId
          }
        }
      );
    } catch (error) {
      console.error('更新共享请求状态时出错:', error);
      throw error;
    }
  }

  /**
   * 创建资源访问权限记录
   * @param shareRequest 共享请求信息
   * @private
   */
  private async createResourceAccess(shareRequest: any): Promise<void> {
    // TODO: 在数据库中创建资源访问权限记录
    // 示例实现
    try {
      const db = global.db;
      await db.collection('resourceSharing').insertOne({
        resourceId: shareRequest.resourceId,
        resourceType: shareRequest.resourceType,
        sharedWith: shareRequest.targetId,
        sharedWithType: shareRequest.targetType,
        accessLevel: shareRequest.accessLevel,
        createdAt: new Date(),
        createdBy: shareRequest.createdBy,
        status: 'active',
        expiresAt: shareRequest.expiresAt
      });
    } catch (error) {
      console.error('创建资源访问权限记录时出错:', error);
      throw error;
    }
  }

  /**
   * 获取用户可访问的共享资源
   */
  async getSharedResources(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { resourceType } = req.query;

      // 在实际实现中，这里会查询数据库获取共享给用户的资源
      // 这里我们返回模拟数据
      const sharedResources = [
        {
          id: 'resource-001',
          name: '电磁感应实验',
          type: 'experiment',
          owner: 'user-003',
          sharedBy: 'user-003',
          sharingType: 'edit',
          sharedAt: new Date(Date.now() - 172800000).toISOString(), // 2天前
          lastModified: new Date(Date.now() - 86400000).toISOString(), // 1天前
          thumbnail: '/assets/thumbnails/experiment-001.jpg'
        },
        {
          id: 'resource-002',
          name: '光学衍射分析数据',
          type: 'dataset',
          owner: 'user-005',
          sharedBy: 'user-005',
          sharingType: 'readonly',
          sharedAt: new Date(Date.now() - 259200000).toISOString(), // 3天前
          lastModified: new Date(Date.now() - 172800000).toISOString(), // 2天前
          thumbnail: '/assets/thumbnails/dataset-001.jpg'
        },
        {
          id: 'resource-003',
          name: '光电效应演示实验',
          type: 'experiment',
          owner: 'user-002',
          sharedBy: 'user-002',
          sharingType: 'full',
          sharedAt: new Date(Date.now() - 345600000).toISOString(), // 4天前
          lastModified: new Date(Date.now() - 259200000).toISOString(), // 3天前
          thumbnail: '/assets/thumbnails/experiment-002.jpg'
        }
      ];

      // 如果指定了资源类型，则过滤结果
      const filteredResources = resourceType
        ? sharedResources.filter(r => r.type === resourceType)
        : sharedResources;

      res.status(200).json({
        success: true,
        data: filteredResources
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 验证资源访问权限
   * 检查用户是否有权限访问指定资源
   */
  async checkResourceAccess(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { resourceId, accessType } = req.body;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 在实际实现中，这里会查询数据库检查用户对资源的访问权限
      // 根据共享类型和请求的访问类型判断是否有权限

      // 模拟数据：资源访问权限映射
      const resourceAccessMap = {
        'resource-001': {
          'user-001': 'edit',
          'user-002': 'readonly',
          'team-001': 'readonly'
        },
        'resource-002': {
          'user-001': 'full',
          'user-003': 'edit',
          'team-002': 'readonly'
        },
        'resource-003': {
          'user-001': 'readonly',
          'user-004': 'edit',
          'team-001': 'edit'
        }
      };

      // 检查用户权限
      const userAccess = resourceAccessMap[resourceId]?.[userId];

      // 检查团队权限 (实际实现中需要查询用户所在团队)
      const userTeams = ['team-001']; // 模拟数据：用户所在的团队
      let teamAccess = null;
      for (const teamId of userTeams) {
        const access = resourceAccessMap[resourceId]?.[teamId];
        if (access && (!teamAccess || isHigherAccessLevel(access, teamAccess))) {
          teamAccess = access;
        }
      }

      // 确定最终权限 (用户直接权限优先于团队权限)
      const finalAccess = userAccess || teamAccess;

      if (!finalAccess) {
        // 记录访问被拒绝的审计日志
        await this.logResourceAccess(userId, resourceId, 'access_denied', {
          accessType,
          reason: 'no_permission'
        });

        return res.status(403).json({
          success: false,
          message: '您没有权限访问该资源'
        });
      }      // 检查访问类型是否允许
      const hasPermission = isAccessAllowed(finalAccess, accessType);

      if (!hasPermission) {
        // 记录访问被拒绝的审计日志
        await this.logResourceAccess(userId, resourceId, 'access_denied', {
          accessType,
          accessLevel: finalAccess,
          reason: 'insufficient_permission'
        });

        return res.status(403).json({
          success: false,
          message: `您的权限级别(${finalAccess})不允许${accessType}操作`
        });
      }

      // 记录访问成功的审计日志
      await this.logResourceAccess(userId, resourceId, 'access_granted', {
        accessType,
        accessLevel: finalAccess
      });

      res.status(200).json({
        success: true,
        data: {
          resourceId,
          accessType,
          allowed: true,
          accessLevel: finalAccess
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建资源共享邀请
   * 允许用户邀请其他用户或团队访问资源
   */
  async createShareInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const {
        resourceId,
        resourceType,
        targetType,  // 'user', 'team', 'email'
        targetId,    // 用户ID, 团队ID, 或电子邮件
        message,     // 邀请消息
        accessLevel, // 'readonly', 'edit', 'full'
        expiresAt    // 过期时间
      } = req.body;

      // 验证用户是否有权限共享此资源
      const hasPermission = await this.validateUserResourceAccess(userId, resourceId, 'share');

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '您没有权限共享此资源'
        });
      }

      // 创建邀请记录
      const invitationId = await this.createInvitationRecord({
        resourceId,
        resourceType,
        targetType,
        targetId,
        message,
        accessLevel,
        expiresAt,
        createdBy: userId
      });

      // 记录审计日志
      await this.logResourceAccess(userId, resourceId, 'create_share_invitation', {
        invitationId,
        targetType,
        targetId,
        accessLevel
      });

      // 在实际实现中，这里会发送邀请通知给目标用户或团队
      // await this.sendInvitationNotification(invitationId);

      res.status(201).json({
        success: true,
        message: '共享邀请已创建并发送',
        data: {
          id: invitationId,
          resourceId,
          targetType,
          targetId,
          accessLevel,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建邀请记录
   * @param invitationData 邀请数据
   * @private
   */
  private async createInvitationRecord(invitationData: any): Promise<string> {
    // TODO: 在数据库中创建邀请记录
    // 示例实现
    try {
      const db = global.db;
      const invitationId = `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      await db.collection('shareInvitations').insertOne({
        _id: invitationId,
        ...invitationData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return invitationId;
    } catch (error) {
      console.error('创建邀请记录时出错:', error);
      throw error;
    }
  }

  /**
   * 处理资源共享邀请
   * 当用户接受或拒绝邀请时调用
   */
  async processShareInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { invitationId } = req.params;
      const userId = req.user?.id;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const { action } = req.body; // accept, reject

      // 获取邀请详情
      const invitation = await this.getInvitationById(invitationId);

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: '邀请不存在或已过期'
        });
      }

      // 验证当前用户是否是邀请的目标对象
      const isTargetUser =
        invitation.targetType === 'user' && invitation.targetId === userId ||
        invitation.targetType === 'email' && invitation.targetId === req.user?.email;

      // 验证用户是否是目标团队的成员
      const isTeamMember = invitation.targetType === 'team' &&
        await this.isUserTeamMember(userId, invitation.targetId);

      if (!isTargetUser && !isTeamMember) {
        return res.status(403).json({
          success: false,
          message: '您不是此邀请的目标接收者'
        });
      }

      // 检查邀请是否已过期
      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        await this.updateInvitationStatus(invitationId, 'expired');

        return res.status(400).json({
          success: false,
          message: '此邀请已过期'
        });
      }

      // 更新邀请状态
      await this.updateInvitationStatus(invitationId, action === 'accept' ? 'accepted' : 'rejected', userId);

      if (action === 'accept') {
        // 创建资源访问权限记录
        await this.createResourceAccessFromInvitation(invitation, userId);

        // 记录审计日志
        await this.logResourceAccess(userId, invitation.resourceId, 'accept_invitation', {
          invitationId,
          accessLevel: invitation.accessLevel
        });

        res.status(200).json({
          success: true,
          message: '已接受资源共享邀请',
          data: {
            id: invitationId,
            status: 'accepted',
            processedAt: new Date().toISOString()
          }
        });
      } else if (action === 'reject') {
        // 记录审计日志
        await this.logResourceAccess(userId, invitation.resourceId, 'reject_invitation', {
          invitationId
        });

        res.status(200).json({
          success: true,
          message: '已拒绝资源共享邀请',
          data: {
            id: invitationId,
            status: 'rejected',
            processedAt: new Date().toISOString()
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: '无效的操作'
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取邀请详情
   * @param invitationId 邀请ID
   * @private
   */
  private async getInvitationById(invitationId: string): Promise<any> {
    // TODO: 从数据库获取邀请详情
    // 示例实现
    try {
      const db = global.db;
      return await db.collection('shareInvitations').findOne({ _id: invitationId });
    } catch (error) {
      console.error('获取邀请详情时出错:', error);
      return null;
    }
  }

  /**
   * 检查用户是否是团队成员
   * @param userId 用户ID
   * @param teamId 团队ID
   * @private
   */
  private async isUserTeamMember(userId: string, teamId: string): Promise<boolean> {
    // TODO: 从数据库检查用户是否是团队成员
    // 示例实现
    try {
      const db = global.db;
      const teamMember = await db.collection('teamMembers').findOne({
        userId,
        teamId,
        status: 'active'
      });

      return !!teamMember;
    } catch (error) {
      console.error('检查用户团队成员身份时出错:', error);
      return false;
    }
  }

  /**
   * 更新邀请状态
   * @param invitationId 邀请ID
   * @param status 新状态
   * @param processedBy 处理人ID
   * @private
   */
  private async updateInvitationStatus(
    invitationId: string,
    status: string,
    processedBy?: string
  ): Promise<void> {
    // TODO: 更新数据库中的邀请状态
    // 示例实现
    try {
      const db = global.db;
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (processedBy) {
        updateData.processedBy = processedBy;
        updateData.processedAt = new Date();
      }

      await db.collection('shareInvitations').updateOne(
        { _id: invitationId },
        { $set: updateData }
      );
    } catch (error) {
      console.error('更新邀请状态时出错:', error);
      throw error;
    }
  }

  /**
   * 从邀请创建资源访问权限记录
   * @param invitation 邀请详情
   * @param userId 接受邀请的用户ID
   * @private
   */
  private async createResourceAccessFromInvitation(invitation: any, userId: string): Promise<void> {
    // TODO: 在数据库中创建资源访问权限记录
    // 示例实现
    try {
      const db = global.db;

      // 处理不同类型的目标
      let sharedWith, sharedWithType;

      if (invitation.targetType === 'user' || invitation.targetType === 'email') {
        sharedWith = userId;
        sharedWithType = 'user';
      } else if (invitation.targetType === 'team') {
        sharedWith = invitation.targetId;
        sharedWithType = 'team';
      }

      await db.collection('resourceSharing').insertOne({
        resourceId: invitation.resourceId,
        resourceType: invitation.resourceType,
        sharedWith,
        sharedWithType,
        accessLevel: invitation.accessLevel,
        createdAt: new Date(),
        createdBy: invitation.createdBy,
        invitationId: invitation._id,
        status: 'active',
        expiresAt: invitation.expiresAt
      });
    } catch (error) {
      console.error('创建资源访问权限记录时出错:', error);
      throw error;
    }
  }

  /**
   * 获取用户的所有邀请
   */
  async getUserInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const { status } = req.query; // 可选的状态过滤

      // 构建查询条件
      const query: any = {
        $or: [
          { targetType: 'user', targetId: userId },
          { targetType: 'email', targetId: userEmail }
        ]
      };

      // 添加状态过滤
      if (status) {
        query.status = status;
      }

      // 获取用户团队
      const userTeams = await this.getUserTeams(userId);

      // 如果用户有团队，添加团队邀请
      if (userTeams.length > 0) {
        query.$or.push({
          targetType: 'team',
          targetId: { $in: userTeams.map(team => team.teamId) }
        });
      }

      // 从数据库获取邀请
      const invitations = await this.getInvitationsByQuery(query);

      res.status(200).json({
        success: true,
        data: invitations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户的团队
   * @param userId 用户ID
   * @private
   */
  private async getUserTeams(userId: string): Promise<any[]> {
    // TODO: 从数据库获取用户的团队
    // 示例实现
    try {
      const db = global.db;
      return await db.collection('teamMembers').find({
        userId,
        status: 'active'
      }).toArray();
    } catch (error) {
      console.error('获取用户团队时出错:', error);
      return [];
    }
  }

  /**
   * 根据查询条件获取邀请
   * @param query 查询条件
   * @private
   */
  private async getInvitationsByQuery(query: any): Promise<any[]> {
    // TODO: 从数据库获取邀请
    // 示例实现
    try {
      const db = global.db;
      return await db.collection('shareInvitations')
        .find(query)
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
    } catch (error) {
      console.error('查询邀请时出错:', error);
      return [];
    }
  }

  /**
   * 验证创建共享邀请请求
   */
  validateCreateShareInvitation() {
    return [
      body('resourceId').notEmpty().withMessage('资源ID不能为空'),
      body('resourceType').notEmpty().withMessage('资源类型不能为空'),
      body('targetType').notEmpty().withMessage('目标类型不能为空')
        .isIn(['user', 'team', 'email']).withMessage('无效的目标类型'),
      body('targetId').notEmpty().withMessage('目标ID不能为空'),
      body('accessLevel').notEmpty().withMessage('访问级别不能为空')
        .isIn(['readonly', 'edit', 'full']).withMessage('无效的访问级别'),
      validateRequest
    ];
  }

  /**
   * 验证处理共享邀请请求
   */
  validateProcessShareInvitation() {
    return [
      body('action').notEmpty().withMessage('操作类型不能为空')
        .isIn(['accept', 'reject']).withMessage('无效的操作类型'),
      validateRequest
    ];
  }

  /**
   * 获取资源的访问日志
   */
  async getResourceAccessLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { resourceId } = req.params;
      const userId = req.user?.id;
      const { startDate, endDate, actions, limit, page } = req.query;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 验证用户是否有权限查看此资源的日志
      // 只有资源所有者和管理员可以查看完整日志
      const hasPermission = await this.validateUserResourceAccess(userId, resourceId, 'view');
      const isOwnerOrAdmin = await this.isResourceOwnerOrAdmin(userId, resourceId);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '您没有权限查看此资源的访问日志'
        });
      }

      // 构建查询条件
      const query: any = { resourceId };

      // 非所有者或管理员只能查看自己的访问记录
      if (!isOwnerOrAdmin) {
        query.userId = userId;
      }

      // 应用日期过滤
      if (startDate) {
        query.timestamp = query.timestamp || {};
        query.timestamp.$gte = new Date(startDate as string);
      }

      if (endDate) {
        query.timestamp = query.timestamp || {};
        query.timestamp.$lte = new Date(endDate as string);
      }

      // 应用操作类型过滤
      if (actions) {
        const actionList = (actions as string).split(',');
        if (actionList.length > 0) {
          query.action = { $in: actionList };
        }
      }

      // 分页参数
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const pageSize = limit ? parseInt(limit as string, 10) : 20;
      const skip = (pageNum - 1) * pageSize;

      // 从数据库获取日志
      const db = global.db;
      const logs = await db.collection('resourceAccessLogs')
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray();

      // 获取总记录数用于分页
      const totalLogs = await db.collection('resourceAccessLogs')
        .countDocuments(query);

      // 记录查看日志的操作
      if (isOwnerOrAdmin) {
        await this.logResourceAccess(userId, resourceId, 'view_access_logs', {
          startDate,
          endDate,
          actions,
          page: pageNum,
          limit: pageSize
        });
      }

      res.status(200).json({
        success: true,
        data: {
          logs,
          pagination: {
            currentPage: pageNum,
            pageSize,
            totalPages: Math.ceil(totalLogs / pageSize),
            totalRecords: totalLogs
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 验证创建共享请求
   */
  validateCreateSharing() {
    return [
      body('resourceId').notEmpty().withMessage('资源ID不能为空'),
      body('resourceType').notEmpty().withMessage('资源类型不能为空'),
      body('targetType').notEmpty().withMessage('目标类型不能为空')
        .isIn(['user', 'team', 'team_role', 'public']).withMessage('无效的目标类型'),
      body('sharingType').notEmpty().withMessage('共享类型不能为空')
        .isIn(['readonly', 'edit', 'full']).withMessage('无效的共享类型'),
      validateRequest
    ];
  }

  /**
   * 验证更新共享请求
   */
  validateUpdateSharing() {
    return [
      body('sharingType').optional()
        .isIn(['readonly', 'edit', 'full']).withMessage('无效的共享类型'),
      validateRequest
    ];
  }

  /**
   * 检查用户是否是资源所有者或管理员
   * @param userId 用户ID
   * @param resourceId 资源ID
   * @private
   */
  private async isResourceOwnerOrAdmin(userId: string, resourceId: string): Promise<boolean> {
    try {
      // 获取资源信息
      const resource = await this.getResourceById(resourceId);
      if (!resource) {
        return false;
      }

      // 检查是否是资源所有者
      if (resource.ownerId === userId) {
        return true;
      }

      // 检查用户是否是管理员
      const user = await this.getUserById(userId);
      return user?.role === 'admin' || user?.role === 'superadmin';
    } catch (error) {
      console.error('检查资源所有权时出错:', error);
      return false;
    }
  }

  /**
   * 获取用户信息
   * @param userId 用户ID
   * @private
   */
  private async getUserById(userId: string): Promise<any> {
    try {
      const db = global.db;
      return await db.collection('users').findOne({ _id: userId });
    } catch (error) {
      console.error('获取用户信息时出错:', error);
      return null;
    }
  }

  /**
   * 验证用户资源访问权限
   * @param userId 用户ID
   * @param resourceId 资源ID
   * @param accessType 访问类型
   */
  async validateUserResourceAccess(userId: string, resourceId: string, accessType: AccessType): Promise<boolean> {
    try {
      // 1. 检查资源是否存在
      const resource = await this.getResourceById(resourceId);
      if (!resource) {
        return false;
      }

      // 2. 检查用户是否是资源所有者
      if (resource.ownerId === userId) {
        return true; // 资源所有者拥有所有权限
      }

      // 3. 检查用户是否通过团队共享获得了资源访问权限
      const userAccess = await this.getUserResourceAccess(userId, resourceId);
      if (!userAccess) {
        return false; // 用户没有任何访问权限
      }

      // 4. 根据用户的访问级别检查是否允许请求的操作
      return isAccessAllowed(userAccess.accessLevel as AccessLevel, accessType);
    } catch (error) {
      console.error('验证用户资源访问权限时出错:', error);
      return false;
    }
  }

  /**
   * 获取资源信息
   * @param resourceId 资源ID
   * @private
   */
  private async getResourceById(resourceId: string): Promise<any> {
    // TODO: 从数据库获取资源信息
    // 示例实现
    try {
      const db = global.db;
      return await db.collection('resources').findOne({ _id: resourceId });
    } catch (error) {
      console.error('获取资源信息时出错:', error);
      return null;
    }
  }

  /**
   * 获取用户对特定资源的访问权限
   * @param userId 用户ID
   * @param resourceId 资源ID
   * @private
   */
  private async getUserResourceAccess(userId: string, resourceId: string): Promise<any> {
    // TODO: 从数据库获取用户对资源的访问权限
    // 示例实现
    try {
      const db = global.db;

      // 直接共享给用户的权限
      const directAccess = await db.collection('resourceSharing').findOne({
        resourceId,
        sharedWith: userId,
        status: 'active'
      });

      if (directAccess) {
        return directAccess;
      }

      // 通过团队共享的权限
      const userTeams = await db.collection('teamMembers').find({
        userId,
        status: 'active'
      }).toArray();

      const teamIds = userTeams.map(team => team.teamId);

      if (teamIds.length === 0) {
        return null;
      }

      return await db.collection('resourceSharing').findOne({
        resourceId,
        sharedWithTeam: { $in: teamIds },
        status: 'active'
      });
    } catch (error) {
      console.error('获取用户资源访问权限时出错:', error);
      return null;
    }
  }

  /**
   * 记录资源访问审计日志
   * @param userId 用户ID
   * @param resourceId 资源ID
   * @param action 执行的操作
   * @param details 操作详情
   * @private
   */
  private async logResourceAccess(
    userId: string,
    resourceId: string,
    action: string,
    details?: Record<string, any>,
    skipSecurityLog: boolean = false
  ): Promise<void> {
    try {
      const db = global.db;
      const timestamp = new Date();
      const ipAddress = '127.0.0.1'; // 在真实环境中应从请求中获取

      // 获取资源基本信息（用于记录日志）
      const resource = await this.getResourceBasicInfo(resourceId);

      // 获取用户基本信息（用于记录日志）
      const user = await this.getUserBasicInfo(userId);

      const logEntry = {
        resourceId,
        resourceType: resource?.type || 'unknown',
        resourceName: resource?.name || 'unknown',
        userId,
        userName: user?.name || 'unknown',
        userEmail: user?.email || 'unknown',
        action,
        details,
        successful: true, // 默认为成功
        ipAddress,
        userAgent: 'API Server', // 在真实环境中应从请求中获取
        timestamp,
        sessionId: null,
        requestId: this.generateRequestId(),
        teamId: user?.currentTeamId || null
      };

      await db.collection('resourceAccessLogs').insertOne(logEntry);

      // 对敏感操作进行额外的安全日志记录
      const sensitiveActions = ['edit', 'delete', 'share', 'accept_share_request', 'reject_share_request'];
      if (!skipSecurityLog && sensitiveActions.includes(action)) {
        await db.collection('securityLogs').insertOne({
          ...logEntry,
          logType: 'resource_access',
          severity: 'info',
          loggedAt: new Date()
        });
      }

      console.log(`已记录资源访问日志: 用户 ${userId} ${action} 资源 ${resourceId}`);
    } catch (error) {
      console.error('记录资源访问日志时出错:', error);
      // 不抛出异常，确保主要业务逻辑继续执行
    }
  }

  /**
   * 获取资源基本信息（仅用于日志记录）
   * @param resourceId 资源ID
   * @private
   */
  private async getResourceBasicInfo(resourceId: string): Promise<any> {
    try {
      const db = global.db;
      const resource = await db.collection('resources').findOne(
        { _id: resourceId },
        { projection: { name: 1, type: 1 } }
      );
      return resource;
    } catch (error) {
      console.error('获取资源基本信息时出错:', error);
      return null;
    }
  }

  /**
   * 获取用户基本信息（仅用于日志记录）
   * @param userId 用户ID
   * @private
   */
  private async getUserBasicInfo(userId: string): Promise<any> {
    try {
      const db = global.db;
      const user = await db.collection('users').findOne(
        { _id: userId },
        { projection: { name: 1, email: 1, currentTeamId: 1 } }
      );
      return user;
    } catch (error) {
      console.error('获取用户基本信息时出错:', error);
      return null;
    }
  }

  /**
   * 生成唯一的请求ID
   * @private
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  /**
   * 获取团队访问日志
   * 管理员或团队所有者可以查看团队内所有成员的资源访问日志
   */
  async getTeamAccessLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const userId = req.user?.id;
      const { startDate, endDate, actions, resourceTypes, users, limit, page } = req.query;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 验证用户是否有权限查看团队日志
      const isTeamOwnerOrAdmin = await this.isTeamOwnerOrAdmin(userId, teamId);

      if (!isTeamOwnerOrAdmin) {
        return res.status(403).json({
          success: false,
          message: '您没有权限查看团队访问日志'
        });
      }

      // 构建查询条件
      const query: any = { teamId };

      // 应用日期过滤
      if (startDate) {
        query.timestamp = query.timestamp || {};
        query.timestamp.$gte = new Date(startDate as string);
      }

      if (endDate) {
        query.timestamp = query.timestamp || {};
        query.timestamp.$lte = new Date(endDate as string);
      }

      // 应用操作类型过滤
      if (actions) {
        const actionList = (actions as string).split(',');
        if (actionList.length > 0) {
          query.action = { $in: actionList };
        }
      }

      // 应用资源类型过滤
      if (resourceTypes) {
        const typeList = (resourceTypes as string).split(',');
        if (typeList.length > 0) {
          query.resourceType = { $in: typeList };
        }
      }

      // 应用用户过滤
      if (users) {
        const userList = (users as string).split(',');
        if (userList.length > 0) {
          query.userId = { $in: userList };
        }
      }

      // 分页参数
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const pageSize = limit ? parseInt(limit as string, 10) : 20;
      const skip = (pageNum - 1) * pageSize;

      // 从数据库获取日志
      const db = global.db;
      const logs = await db.collection('resourceAccessLogs')
        .find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(pageSize)
        .toArray();

      // 获取总记录数用于分页
      const totalLogs = await db.collection('resourceAccessLogs')
        .countDocuments(query);

      // 记录查看团队日志的操作
      await this.logTeamActivity(userId, teamId, 'view_team_access_logs', {
        startDate,
        endDate,
        actions,
        resourceTypes,
        users,
        page: pageNum,
        limit: pageSize
      });

      res.status(200).json({
        success: true,
        data: {
          logs,
          pagination: {
            currentPage: pageNum,
            pageSize,
            totalPages: Math.ceil(totalLogs / pageSize),
            totalRecords: totalLogs
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 记录团队活动日志
   * @param userId 用户ID
   * @param teamId 团队ID
   * @param action 执行的操作
   * @param details 操作详情
   * @private
   */
  private async logTeamActivity(
    userId: string,
    teamId: string,
    action: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const db = global.db;
      const timestamp = new Date();

      // 获取用户基本信息
      const user = await this.getUserBasicInfo(userId);

      // 获取团队基本信息
      const team = await this.getTeamBasicInfo(teamId);

      await db.collection('teamActivityLogs').insertOne({
        teamId,
        teamName: team?.name || 'unknown',
        userId,
        userName: user?.name || 'unknown',
        userEmail: user?.email || 'unknown',
        action,
        details,
        timestamp,
        ipAddress: '127.0.0.1', // 在真实环境中应从请求中获取
        userAgent: 'API Server', // 在真实环境中应从请求中获取
        requestId: this.generateRequestId()
      });

      console.log(`已记录团队活动日志: 用户 ${userId} ${action} 团队 ${teamId}`);
    } catch (error) {
      console.error('记录团队活动日志时出错:', error);
      // 不抛出异常，确保主要业务逻辑继续执行
    }
  }

  /**
   * 检查用户是否是团队所有者或管理员
   * @param userId 用户ID
   * @param teamId 团队ID
   * @private
   */
  private async isTeamOwnerOrAdmin(userId: string, teamId: string): Promise<boolean> {
    try {
      // 检查是否是团队所有者
      const db = global.db;
      const team = await db.collection('teams').findOne({ _id: teamId });

      if (team?.ownerId === userId) {
        return true;
      }

      // 检查是否是团队管理员
      const teamMember = await db.collection('teamMembers').findOne({
        teamId,
        userId,
        role: { $in: ['admin', 'owner'] },
        status: 'active'
      });

      if (teamMember) {
        return true;
      }

      // 检查是否是系统管理员
      const user = await this.getUserById(userId);
      return user?.role === 'admin' || user?.role === 'superadmin';
    } catch (error) {
      console.error('检查团队所有权时出错:', error);
      return false;
    }
  }

  /**
   * 获取团队基本信息
   * @param teamId 团队ID
   * @private
   */
  private async getTeamBasicInfo(teamId: string): Promise<any> {
    try {
      const db = global.db;
      const team = await db.collection('teams').findOne(
        { _id: teamId },
        { projection: { name: 1, ownerId: 1 } }
      );
      return team;
    } catch (error) {
      console.error('获取团队基本信息时出错:', error);
      return null;
    }
  }

  /**
   * 验证处理共享请求
   */
  validateProcessShareRequest() {
    return [
      body('action').notEmpty().withMessage('操作类型不能为空')
        .isIn(['accept', 'reject']).withMessage('无效的操作类型'),
      validateRequest
    ];
  }

  /**
   * 批量共享资源
   * 允许一次性将多个资源共享给指定目标
   */
  async batchShareResources(req: Request, res: Response, next: NextFunction) {
    try {
      const { resourceIds, targetType, targetId, sharingType } = req.body;
      const userId = req.user?.id;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 验证请求数据
      if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的资源ID列表'
        });
      }

      if (!['user', 'team', 'team_role', 'public'].includes(targetType)) {
        return res.status(400).json({
          success: false,
          message: '无效的目标类型'
        });
      }

      if (targetType !== 'public' && !targetId) {
        return res.status(400).json({
          success: false,
          message: '目标ID不能为空'
        });
      }

      if (!['readonly', 'edit', 'full'].includes(sharingType)) {
        return res.status(400).json({
          success: false,
          message: '无效的共享类型'
        });
      }

      // 验证用户是否有权限共享这些资源
      const db = global.db;
      const unauthorizedResources: string[] = [];
      const successfulShares: ShareResult[] = [];
      const failedShares: ShareResult[] = [];

      // 获取所有资源信息
      const resources = await Promise.all(
        resourceIds.map(async (resourceId) => {
          try {
            return await this.getResourceById(resourceId);
          } catch (error) {
            return null;
          }
        })
      );

      // 过滤掉不存在的资源
      const validResources = resources.filter(resource => resource !== null);

      // 检查用户对每个资源的权限
      for (const resource of validResources) {
        const hasPermission = await this.validateUserResourceAccess(userId, resource._id, 'share');

        if (!hasPermission) {
          unauthorizedResources.push(resource._id);
          failedShares.push({
            resourceId: resource._id,
            resourceName: resource.name,
            reason: '无权限'
          });
          continue;
        }

        // 创建共享记录
        try {
          const sharingRecord = {
            resourceId: resource._id,
            resourceType: resource.type,
            resourceName: resource.name,
            ownerId: resource.ownerId,
            sharedBy: userId,
            targetType,
            targetId: targetType === 'public' ? null : targetId,
            sharingType,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await db.collection('resourceSharings').insertOne(sharingRecord);

          // 记录成功共享的资源
          successfulShares.push({
            resourceId: resource._id,
            resourceName: resource.name
          });

          // 记录此操作
          await this.logResourceAccess(
            userId,
            resource._id,
            'share',
            {
              targetType,
              targetId: targetType === 'public' ? null : targetId,
              sharingType
            },
            true
          );
        } catch (error) {
          console.error(`共享资源 ${resource._id} 时出错:`, error);
          failedShares.push({
            resourceId: resource._id,
            resourceName: resource.name,
            reason: '数据库错误'
          });
        }
      }

      // 返回结果
      return res.status(200).json({
        success: true,
        data: {
          totalResources: resourceIds.length,
          successfulShares: successfulShares.length,
          failedShares: failedShares.length,
          unauthorizedResources: unauthorizedResources.length,
          successDetails: successfulShares,
          failureDetails: failedShares
        },
        message: `成功共享 ${successfulShares.length} 个资源，失败 ${failedShares.length} 个`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建共享模板
   * 定义一组资源的共享设置，便于快速应用
   */
  async createSharingTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateName, description, sharingSettings } = req.body;
      const userId = req.user?.id;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 验证模板名称
      if (!templateName || typeof templateName !== 'string') {
        return res.status(400).json({
          success: false,
          message: '请提供有效的模板名称'
        });
      }

      // 验证共享设置
      if (!Array.isArray(sharingSettings) || sharingSettings.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的共享设置'
        });
      }

      // 验证每个共享设置
      for (const setting of sharingSettings) {
        if (!['user', 'team', 'team_role', 'public'].includes(setting.targetType)) {
          return res.status(400).json({
            success: false,
            message: '无效的目标类型'
          });
        }

        if (setting.targetType !== 'public' && !setting.targetId) {
          return res.status(400).json({
            success: false,
            message: '目标ID不能为空'
          });
        }

        if (!['readonly', 'edit', 'full'].includes(setting.sharingType)) {
          return res.status(400).json({
            success: false,
            message: '无效的共享类型'
          });
        }
      }

      // 创建共享模板
      const db = global.db;
      const template = {
        templateName,
        description: description || '',
        ownerId: userId,
        sharingSettings,
        isDefault: false,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('sharingTemplates').insertOne(template);

      // 记录此操作
      await this.logUserActivity(userId, 'create_sharing_template', {
        templateId: result.insertedId,
        templateName,
        settingsCount: sharingSettings.length
      });

      return res.status(201).json({
        success: true,
        data: {
          templateId: result.insertedId,
          ...template
        },
        message: '共享模板创建成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户的共享模板列表
   */
  async getUserSharingTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const db = global.db;
      const templates = await db.collection('sharingTemplates')
        .find({ ownerId: userId, status: 'active' })
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json({
        success: true,
        data: templates,
        message: '获取共享模板成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 应用共享模板
   * 将模板中的共享设置应用到指定资源
   */
  async applySharingTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateId, resourceIds } = req.body;
      const userId = req.user?.id;

      // 确保userId存在
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 验证模板ID
      if (!templateId) {
        return res.status(400).json({
          success: false,
          message: '模板ID不能为空'
        });
      }

      // 验证资源ID列表
      if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的资源ID列表'
        });
      }

      // 获取模板信息
      const db = global.db;
      const template = await db.collection('sharingTemplates').findOne({
        _id: templateId,
        status: 'active'
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: '共享模板不存在'
        });
      }

      // 验证用户是否是模板所有者
      if (template.ownerId !== userId) {
        // 检查是否有权限使用此模板
        const isTeamMember = await db.collection('teamMembers').findOne({
          userId,
          teamId: template.teamId,
          status: 'active'
        });

        if (!isTeamMember) {
          return res.status(403).json({
            success: false,
            message: '您没有权限使用此共享模板'
          });
        }
      }

      // 应用模板设置到每个资源
      const unauthorizedResources: string[] = [];
      const successfulShares: ShareResult[] = [];
      const failedShares: ShareResult[] = [];

      // 获取所有资源信息
      const resources = await Promise.all(
        resourceIds.map(async (resourceId) => {
          try {
            return await this.getResourceById(resourceId);
          } catch (error) {
            return null;
          }
        })
      );

      // 过滤掉不存在的资源
      const validResources = resources.filter(resource => resource !== null);

      // 检查用户对每个资源的权限并应用模板
      for (const resource of validResources) {
        const hasPermission = await this.validateUserResourceAccess(userId, resource._id, 'share');

        if (!hasPermission) {
          unauthorizedResources.push(resource._id);
          failedShares.push({
            resourceId: resource._id,
            resourceName: resource.name,
            reason: '无权限'
          });
          continue;
        }

        // 应用模板中的每个共享设置
        let appliedSettingsCount = 0;
        for (const setting of template.sharingSettings) {
          try {
            // 创建共享记录
            const sharingRecord = {
              resourceId: resource._id,
              resourceType: resource.type,
              resourceName: resource.name,
              ownerId: resource.ownerId,
              sharedBy: userId,
              targetType: setting.targetType,
              targetId: setting.targetType === 'public' ? null : setting.targetId,
              sharingType: setting.sharingType,
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date()
            };

            await db.collection('resourceSharings').insertOne(sharingRecord);
            appliedSettingsCount++;
          } catch (error) {
            console.error(`应用共享设置到资源 ${resource._id} 时出错:`, error);
          }
        }

        if (appliedSettingsCount > 0) {
          successfulShares.push({
            resourceId: resource._id,
            resourceName: resource.name,
            appliedSettings: appliedSettingsCount
          });

          // 记录此操作
          await this.logResourceAccess(
            userId,
            resource._id,
            'apply_sharing_template',
            {
              templateId,
              templateName: template.templateName,
              appliedSettings: appliedSettingsCount
            },
            true
          );
        } else {
          failedShares.push({
            resourceId: resource._id,
            resourceName: resource.name,
            reason: '应用设置失败'
          });
        }
      }

      // 记录此操作
      await this.logUserActivity(userId, 'apply_sharing_template', {
        templateId,
        templateName: template.templateName,
        targetResourcesCount: resourceIds.length,
        successCount: successfulShares.length,
        failureCount: failedShares.length
      });

      // 返回结果
      return res.status(200).json({
        success: true,
        data: {
          templateId,
          templateName: template.templateName,
          totalResources: resourceIds.length,
          successfulShares: successfulShares.length,
          failedShares: failedShares.length,
          unauthorizedResources: unauthorizedResources.length,
          successDetails: successfulShares,
          failureDetails: failedShares
        },
        message: `成功应用模板到 ${successfulShares.length} 个资源，失败 ${failedShares.length} 个`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 记录用户活动
   * @param userId 用户ID
   * @param action 执行的操作
   * @param details 操作详情
   * @private
   */
  private async logUserActivity(
    userId: string,
    action: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const db = global.db;
      const timestamp = new Date();

      // 获取用户基本信息
      const user = await this.getUserBasicInfo(userId);

      await db.collection('userActivityLogs').insertOne({
        userId,
        userName: user?.name || 'unknown',
        userEmail: user?.email || 'unknown',
        action,
        details,
        timestamp,
        ipAddress: '127.0.0.1', // 在真实环境中应从请求中获取
        userAgent: 'API Server', // 在真实环境中应从请求中获取
        requestId: this.generateRequestId()
      });

      console.log(`已记录用户活动: 用户 ${userId} ${action}`);
    } catch (error) {
      console.error('记录用户活动时出错:', error);
      // 不抛出异常，确保主要业务逻辑继续执行
    }
  }
}

export default new TeamResourceSharingController();
