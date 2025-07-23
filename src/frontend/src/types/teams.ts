export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: TeamMember[];
  ownerId: string;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isOwner?: boolean;
  isAdmin?: boolean;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  avatar?: string;
  settings?: {
    allowMemberInvite: boolean;
    visibilityLevel: 'private' | 'organization' | 'public';
    defaultRole: string;
  };
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  avatar?: string;
  settings?: {
    allowMemberInvite: boolean;
    visibilityLevel: 'private' | 'organization' | 'public';
    defaultRole: string;
  };
}

export interface AddTeamMemberRequest {
  userIds: string[];
  role?: string;
}

export interface UpdateTeamMemberRoleRequest {
  role: string;
}

export enum TeamMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest'
}
