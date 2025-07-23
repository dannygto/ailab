// 团队服务实现
import Team, { TeamMemberRole, TeamDocument } from '../models/team.model';
import User from '../models/user.model';
import mongoose from 'mongoose';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

/**
 * 团队服务类，提供团队相关的业务逻辑
 */
class TeamService {
  /**
   * 创建新团队
   */
  async createTeam(teamData: any, creatorId: string) {
    // 验证创建者是否存在
    const creator = await User.findById(creatorId);
    if (!creator) {
      throw new NotFoundError('创建者不存在');
    }

    // 检查团队名称是否已被用户使用
    const existingTeam = await Team.findOne({
      name: teamData.name,
      createdBy: creatorId,
      isArchived: false
    });

    if (existingTeam) {
      throw new BadRequestError('您已创建过同名团队');
    }

    // 创建新团队
    const team = new Team({
      ...teamData,
      createdBy: creatorId,
      members: [{
        user: creatorId,
        role: TeamMemberRole.OWNER,
        joinedAt: new Date(),
        invitedBy: creatorId
      }]
    });

    return await team.save();
  }

  /**
   * 获取团队详情
   */
  async getTeamById(teamId: string, userId: string) {
    const team = await Team.getTeamById(teamId);

    if (!team) {
      throw new NotFoundError('团队不存在');
    }

    // 检查是否是私有团队且用户不是成员
    if (team.settings.isPrivate && !team.isMember(userId)) {
      throw new ForbiddenError('无权访问该团队');
    }

    return team;
  }

  /**
   * 获取用户所属的所有团队
   */
  async getUserTeams(userId: string) {
    return await Team.getTeamsByUserId(userId);
  }

  /**
   * 更新团队信息
   */
  async updateTeam(teamId: string, updateData: Partial<TeamDocument>, userId: string) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('团队不存在');
    }

    // 检查权限 - 只有团队拥有者和管理员可以更新团队
    if (!team.hasPermission(userId, [TeamMemberRole.OWNER, TeamMemberRole.ADMIN])) {
      throw new ForbiddenError('无权更新团队信息');
    }

    // 设置可更新的字段
    const allowedUpdates = ['name', 'description', 'avatar', 'settings'];
    Object.keys(updateData).forEach(key => {
      if (!allowedUpdates.includes(key)) {
        delete updateData[key as keyof Partial<TeamDocument>];
      }
    });

    // 如果是管理员，则不能修改关键设置
    if (team.getMemberRole(userId) === TeamMemberRole.ADMIN) {
      delete updateData.settings;
    }

    // 应用更新
    Object.assign(team, updateData);
    return await team.save();
  }

  /**
   * 添加团队成员
   */
  async addTeamMember(teamId: string, newMemberEmail: string, role: TeamMemberRole, inviterId: string) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('团队不存在');
    }

    // 检查邀请者权限
    const inviterRole = team.getMemberRole(inviterId);
    if (!inviterRole) {
      throw new ForbiddenError('您不是团队成员');
    }

    // 检查是否有权限邀请成员
    const canInvite =
      inviterRole === TeamMemberRole.OWNER ||
      inviterRole === TeamMemberRole.ADMIN ||
      (inviterRole === TeamMemberRole.MEMBER && team.settings.allowMemberInvite);

    if (!canInvite) {
      throw new ForbiddenError('无权邀请成员');
    }

    // 检查邀请者是否有权限设置特定角色
    if (
      (inviterRole === TeamMemberRole.ADMIN && role === TeamMemberRole.OWNER) ||
      (inviterRole === TeamMemberRole.MEMBER &&
        (role === TeamMemberRole.OWNER || role === TeamMemberRole.ADMIN))
    ) {
      throw new ForbiddenError('无权设置该角色');
    }

    // 查找要添加的用户
    const newMember = await User.findOne({ email: newMemberEmail });
    if (!newMember) {
      throw new NotFoundError('用户不存在');
    }

    // 检查用户是否已经是团队成员
    if (team.isMember(newMember._id.toString())) {
      throw new BadRequestError('该用户已是团队成员');
    }

    // 添加新成员
    team.members.push({
      user: newMember._id,
      role,
      joinedAt: new Date(),
      invitedBy: new mongoose.Types.ObjectId(inviterId)
    });

    return await team.save();
  }

  /**
   * 更新团队成员角色
   */
  async updateMemberRole(teamId: string, memberId: string, newRole: TeamMemberRole, updaterId: string) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('团队不存在');
    }

    // 检查更新者权限
    const updaterRole = team.getMemberRole(updaterId);
    if (updaterRole !== TeamMemberRole.OWNER &&
        !(updaterRole === TeamMemberRole.ADMIN && newRole !== TeamMemberRole.OWNER)) {
      throw new ForbiddenError('无权更新成员角色');
    }

    // 不能更改拥有者的角色
    const memberIndex = team.members.findIndex(m => m.user.toString() === memberId);
    if (memberIndex === -1) {
      throw new NotFoundError('成员不存在');
    }

    const currentRole = team.members[memberIndex].role;
    if (currentRole === TeamMemberRole.OWNER) {
      throw new ForbiddenError('无法更改团队拥有者的角色');
    }

    // 更新角色
    team.members[memberIndex].role = newRole;
    return await team.save();
  }

  /**
   * 移除团队成员
   */
  async removeMember(teamId: string, memberId: string, removerId: string) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('团队不存在');
    }

    // 不能移除拥有者
    const memberRole = team.getMemberRole(memberId);
    if (!memberRole) {
      throw new NotFoundError('成员不存在');
    }

    if (memberRole === TeamMemberRole.OWNER) {
      throw new ForbiddenError('不能移除团队拥有者');
    }

    // 检查移除者权限
    const removerRole = team.getMemberRole(removerId);

    // 自己可以退出团队
    const isSelfRemoval = memberId === removerId;

    // 检查权限
    if (!isSelfRemoval) {
      if (removerRole !== TeamMemberRole.OWNER &&
          !(removerRole === TeamMemberRole.ADMIN && memberRole !== TeamMemberRole.ADMIN)) {
        throw new ForbiddenError('无权移除该成员');
      }
    }

    // 移除成员
    team.members = team.members.filter(m => m.user.toString() !== memberId);
    return await team.save();
  }

  /**
   * 归档团队（软删除）
   */
  async archiveTeam(teamId: string, userId: string) {
    const team = await Team.findById(teamId);

    if (!team) {
      throw new NotFoundError('团队不存在');
    }

    // 只有拥有者可以归档团队
    if (team.getMemberRole(userId) !== TeamMemberRole.OWNER) {
      throw new ForbiddenError('只有团队拥有者可以归档团队');
    }

    team.isArchived = true;
    return await team.save();
  }
}

export default new TeamService();
