import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Box,
  Typography
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

// 导入团队服务
import { useTeamService } from '../../hooks/useTeamService';

/**
 * 团队管理导航组件
 *
 * 提供团队相关功能的导航菜单项，集成到主应用导航中
 */
const TeamNavigation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserTeams, isLoading } = useTeamService();

  const [open, setOpen] = React.useState(false);
  const [teams, setTeams] = React.useState<any[]>([]);

  // 处理团队菜单展开/折叠
  const handleClick = () => {
    setOpen(!open);
  };

  // 导航到指定路径
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // 加载用户的团队
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const userTeams = await getUserTeams();
        setTeams(userTeams.slice(0, 5)); // 只显示前5个团队
      } catch (error) {
        console.error('加载团队失败:', error);
      }
    };

    loadTeams();
  }, [getUserTeams]);

  // 根据当前路径判断是否应该展开团队菜单
  useEffect(() => {
    if (location.pathname.includes('/teams')) {
      setOpen(true);
    }
  }, [location.pathname]);

  return (
    <>
      <ListItem
        button
        onClick={handleClick}
        selected={location.pathname.includes('/teams')}
      >
        <ListItemIcon>
          <GroupWorkIcon />
        </ListItemIcon>
        <ListItemText primary={t('navigation.teams')} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {/* 团队管理主页 */}
          <ListItem
            button
            sx={{ pl: 4 }}
            onClick={() => handleNavigate('/teams')}
            selected={location.pathname === '/teams'}
          >
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary={t('navigation.allTeams')} />
          </ListItem>

          {/* 用户的团队列表 */}
          {teams.length > 0 && (
            <>
              <Box sx={{ pl: 4, py: 1 }}>
                <Typography
                  variant="caption"
                  color="textSecondary"
                >
                  {t('navigation.myTeams')}
                </Typography>
              </Box>

              {teams.map(team => (
                <ListItem
                  button
                  key={team.id}
                  sx={{ pl: 4 }}
                  onClick={() => handleNavigate(`/teams/${team.id}`)}
                  selected={location.pathname === `/teams/${team.id}`}
                >
                  <ListItemIcon>
                    <PeopleOutlineIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={team.name}
                    primaryTypographyProps={{
                      noWrap: true,
                      style: { maxWidth: '150px' }
                    }}
                  />
                </ListItem>
              ))}
            </>
          )}

          {/* 创建新团队 */}
          <ListItem
            button
            sx={{ pl: 4 }}
            onClick={() => handleNavigate('/teams/create')}
            selected={location.pathname === '/teams/create'}
          >
            <ListItemIcon>
              <PersonAddIcon />
            </ListItemIcon>
            <ListItemText primary={t('navigation.createTeam')} />
          </ListItem>

          {/* 团队设置 */}
          <ListItem
            button
            sx={{ pl: 4 }}
            onClick={() => handleNavigate('/admin/team-settings')}
            selected={location.pathname === '/admin/team-settings'}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={t('navigation.teamSettings')} />
          </ListItem>
        </List>
      </Collapse>

      <Divider sx={{ my: 1 }} />
    </>
  );
};

export default TeamNavigation;
