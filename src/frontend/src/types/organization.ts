import { User } from './index';

export enum OrganizationType {
  SCHOOL = 'school',         // 学校
  COLLEGE = 'college',       // 学院
  DEPARTMENT = 'department', // 系/部门
  LABORATORY = 'laboratory', // 实验室
  RESEARCH_GROUP = 'research_group', // 研究组
  CLASS = 'class',           // 班级
  OTHER = 'other'            // 其他
}

export interface Organization {
  _id?: string;
  name: string;
  code?: string;
  type: OrganizationType;
  description?: string;
  logo?: string;
  parent?: {
    _id: string;
    name: string;
    type: OrganizationType;
  };
  children?: Organization[];
  managers: User[];
  members: User[];
  settings: {
    allowMemberJoin: boolean;
    visibilityLevel: 'private' | 'public';
    resourceSharing: 'none' | 'members' | 'all';
  };
  createdBy: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationRequest {
  name: string;
  code?: string;
  type: OrganizationType;
  description?: string;
  logo?: string;
  parent?: string;
  settings?: {
    allowMemberJoin: boolean;
    visibilityLevel: 'private' | 'public';
    resourceSharing: 'none' | 'members' | 'all';
  };
}

export interface UpdateOrganizationRequest {
  name?: string;
  code?: string;
  description?: string;
  logo?: string;
  settings?: {
    allowMemberJoin: boolean;
    visibilityLevel: 'private' | 'public';
    resourceSharing: 'none' | 'members' | 'all';
  };
}

export interface OrganizationHierarchyNode extends Organization {
  children: OrganizationHierarchyNode[];
}
