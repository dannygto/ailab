import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
  Box,
} from '@mui/material';
import {
  Business as BusinessIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Science as ScienceIcon,
  Class as ClassIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Organization, OrganizationType } from '../../types/organization';

interface OrganizationTreeProps {
  organizations: Organization[];
  onSelect: (organization: Organization) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, organization: Organization) => void;
}

interface OrganizationNodeProps {
  organization: Organization;
  level: number;
  onSelect: (organization: Organization) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, organization: Organization) => void;
}

/**
 * 递归渲染的组织节点组件
 */
const OrganizationNode: React.FC<OrganizationNodeProps> = ({
  organization,
  level,
  onSelect,
  onMenuOpen
}) => {
  const [open, setOpen] = React.useState(level === 0);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const handleClick = () => {
    onSelect(organization);
  };

  // 渲染组织类型图标
  const getOrganizationIcon = (type: OrganizationType) => {
    switch (type) {
      case OrganizationType.SCHOOL:
        return <SchoolIcon />;
      case OrganizationType.COLLEGE:
        return <BusinessIcon />;
      case OrganizationType.DEPARTMENT:
        return <BusinessIcon fontSize="small" />;
      case OrganizationType.LABORATORY:
        return <ScienceIcon />;
      case OrganizationType.RESEARCH_GROUP:
        return <GroupIcon />;
      case OrganizationType.CLASS:
        return <ClassIcon />;
      default:
        return <BusinessIcon />;
    }
  };

  const hasChildren = organization.children && organization.children.length > 0;

  return (
    <>
      <ListItem
        button
        onClick={handleClick}
        sx={{
          pl: 2 + level * 2,
          borderLeft: level > 0 ? '1px dashed rgba(0, 0, 0, 0.12)' : 'none',
          ml: level > 0 ? 1 : 0,
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          {getOrganizationIcon(organization.type)}
        </ListItemIcon>
        <ListItemText
          primary={organization.name}
          primaryTypographyProps={{
            variant: 'body2',
            noWrap: true,
            style: { fontWeight: level === 0 ? 600 : 400 }
          }}
        />

        <Box sx={{ display: 'flex' }}>
          {hasChildren && (
            <IconButton size="small" onClick={handleToggle}>
              {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMenuOpen(e, organization);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </ListItem>

      {hasChildren && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {organization.children!.map((child) => (
              <OrganizationNode
                key={child._id}
                organization={child}
                level={level + 1}
                onSelect={onSelect}
                onMenuOpen={onMenuOpen}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

/**
 * 组织树组件
 * 用于显示组织层次结构
 */
const OrganizationTree: React.FC<OrganizationTreeProps> = ({
  organizations,
  onSelect,
  onMenuOpen
}) => {
  return (
    <List
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        overflow: 'auto',
        flexGrow: 1,
      }}
      component="nav"
    >
      {organizations.map((org) => (
        <OrganizationNode
          key={org._id}
          organization={org}
          level={0}
          onSelect={onSelect}
          onMenuOpen={onMenuOpen}
        />
      ))}
      {organizations.length === 0 && (
        <ListItem>
          <ListItemText primary="暂无组织" secondary={'点击右上角"新建组织"按钮创建'} />
        </ListItem>
      )}
    </List>
  );
};

export default OrganizationTree;
