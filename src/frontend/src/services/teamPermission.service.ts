import axios from 'axios';
import { Team, TeamMember } from '../types/teams';
import { ResourceType, PermissionAction } from '../types/permission';
import { permissionService } from './permission.service';

/**
 * 团队权限验证服务
 */
class TeamPermissionService {
  /**
   * 检查用户是否有团队访问权限
   * @param teamId 团队ID
   * @returns 是否有访问权限
   */
  async canAccessTeam(teamId: string): Promise<boolean> {
    try {
      // 首先检查用户是否是团队成员
      const response = await axios.get(`/api/teams/${teamId}/access-check`);
      return response.data.success;
    } catch (error) {
      console.error('检查团队访问权限失败:', error);
      return false;
    }
  }

  /**
   * 检查用户是否是团队所有者
   * @param team 团队对象
   * @param userId 用户ID（如果未提供，则使用当前登录用户）
   * @returns 是否是团队所有者
   */
  isTeamOwner(team: Team, userId?: string): boolean {
    if (!team || !team.members) return false;

    // 如果未提供userId，假设需要验证当前用户
    // 在实际应用中，可以从用户上下文或存储中获取
    const currentUserId = userId || localStorage.getItem('userId') || '';

    // 检查用户是否是创建者
    if (team.createdBy._id === currentUserId) return true;

    // 检查用户是否是团队所有者
    return team.members.some(member =>
      member.user._id === currentUserId && member.role === 'owner'
    );
  }

  /**
   * 检查用户是否是团队管理员
   * @param team 团队对象
   * @param userId 用户ID（如果未提供，则使用当前登录用户）
   * @returns 是否是团队管理员
   */
  isTeamAdmin(team: Team, userId?: string): boolean {
    if (!team || !team.members) return false;

    const currentUserId = userId || localStorage.getItem('userId') || '';

    // 检查用户是否是管理员或所有者
    return team.members.some(member =>
      member.user._id === currentUserId &&
      (member.role === 'admin' || member.role === 'owner')
    );
  }

  /**
   * 获取用户在团队中的角色
   * @param team 团队对象
   * @param userId 用户ID（如果未提供，则使用当前登录用户）
   * @returns 用户角色或null（如果不是成员）
   */
  getUserTeamRole(team: Team, userId?: string): string | null {
    if (!team || !team.members) return null;

    const currentUserId = userId || localStorage.getItem('userId') || '';

    // 查找用户成员信息
    const memberInfo = team.members.find(member => member.user._id === currentUserId);

    return memberInfo ? memberInfo.role : null;
  }

  /**
   * 检查用户是否可以管理团队成员
   * @param team 团队对象
   * @param userId 用户ID（如果未提供，则使用当前登录用户）
   * @returns 是否可以管理成员
   */
  canManageMembers(team: Team, userId?: string): boolean {
    // 管理员和所有者可以管理成员
    return this.isTeamAdmin(team, userId);
  }

  /**
   * 检查用户是否可以编辑团队设置
   * @param team 团队对象
   * @param userId 用户ID（如果未提供，则使用当前登录用户）
   * @returns 是否可以编辑设置
   */
  canEditTeamSettings(team: Team, userId?: string): boolean {
    // 只有所有者可以编辑团队设置
    return this.isTeamOwner(team, userId);
  }

  /**
   * 检查用户是否可以邀请新成员
   * @param team 团队对象
   * @param userId 用户ID（如果未提供，则使用当前登录用户）
   * @returns 是否可以邀请成员
   */
  canInviteMembers(team: Team, userId?: string): boolean {
    if (!team) return false;

    // 如果团队设置允许成员邀请，则成员也可以邀请
    if (team.settings?.allowMemberInvite) {
      const currentUserId = userId || localStorage.getItem('userId') || '';
      return team.members.some(member => member.user._id === currentUserId);
    }

    // 否则只有管理员和所有者可以邀请
    return this.isTeamAdmin(team, userId);
  }

  /**
   * 检查用户是否可以编辑特定团队资源
   * @param teamId 团队ID
   * @param resourceType 资源类型
   * @param resourceId 资源ID
   * @returns 是否有权限编辑
   */
  async canEditTeamResource(
    teamId: string,
    resourceType: ResourceType,
    resourceId: string
  ): Promise<boolean> {
    try {
      // 首先检查是否有直接资源权限
      const hasDirectPermission = await permissionService.checkPermission(
        resourceType,
        resourceId,
        PermissionAction.UPDATE
      );

      if (hasDirectPermission) return true;

      // 然后检查是否有团队角色权限
      const response = await axios.get(
        `/api/teams/${teamId}/resources/${resourceId}/permission-check`,
        { params: { resourceType, action: PermissionAction.UPDATE } }
      );

      return response.data.hasPermission;
    } catch (error) {
      console.error('检查团队资源权限失败:', error);
      return false;
    }
  }

  /**
   * 获取用户可以执行的团队操作
   * @param team 团队对象
   * @param userId 用户ID（如果未提供，则使用当前登录用户）
   * @returns 可执行操作列表
   */
  getUserTeamActions(team: Team, userId?: string): string[] {
    const actions = [];

    if (this.isTeamOwner(team, userId)) {
      actions.push(
        'view_team',
        'edit_team',
        'delete_team',
        'invite_members',
        'remove_members',
        'change_roles',
        'edit_settings',
        'create_resources',
        'edit_resources',
        'delete_resources'
      );
    } else if (this.isTeamAdmin(team, userId)) {
      actions.push(
        'view_team',
        'edit_team',
        'invite_members',
        'remove_members',
        'change_roles',
        'create_resources',
        'edit_resources'
      );
    } else {
      const role = this.getUserTeamRole(team, userId);

      if (role === 'editor') {
        actions.push(
          'view_team',
          'create_resources',
          'edit_resources'
        );

        if (team.settings?.allowMemberInvite) {
          actions.push('invite_members');
        }
      } else if (role === 'member') {
        actions.push(
          'view_team',
          'create_resources'
        );

        if (team.settings?.allowMemberInvite) {
          actions.push('invite_members');
        }
      } else if (role === 'guest') {
        actions.push('view_team');
      }
    }

    return actions;
  }
}

export const teamPermissionService = new TeamPermissionService();
