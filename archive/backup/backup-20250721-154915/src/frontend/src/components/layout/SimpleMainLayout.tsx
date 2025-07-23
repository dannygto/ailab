import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider
} from '@mui/material';
import {
  MenuIcon,
  DarkModeIcon,
  LightModeIcon,
  AccountCircleIcon,
  DashboardIcon,
  ScienceIcon,
  DevicesIcon,
  SettingsIcon,
  LogoutIcon,
  CategoryIcon,
  BarChartIcon,
  PsychologyIcon,
  AdminPanelSettingsIcon,
  StorageIcon,
  HelpIcon
} from '../../utils/icons';
import SchoolSelector from '../SchoolSelector';

interface SimpleMainLayoutProps {
  children: React.ReactNode;
  toggleMode: () => void;
  isDarkMode: boolean;
}

const drawerWidth = 240;

const menuItems = [
  { text: '仪表板', icon: <DashboardIcon />, path: '/dashboard' },
  { text: '实验管理', icon: <ScienceIcon />, path: '/experiments' },
  { text: '模板库', icon: <CategoryIcon />, path: '/templates' },
  { text: '设备管理', icon: <DevicesIcon />, path: '/devices' },
  { text: '数据分析', icon: <BarChartIcon />, path: '/data/analysis' },
  { text: 'AI助手', icon: <PsychologyIcon />, path: '/ai-assistant' },
  { text: '资源管理', icon: <StorageIcon />, path: '/resources' },
  { text: '系统管理', icon: <AdminPanelSettingsIcon />, path: '/admin/users' },
  { text: '系统设置', icon: <SettingsIcon />, path: '/settings' },
  { text: '校区管理', icon: <CategoryIcon />, path: '/admin/schools' },
  { text: '帮助中心', icon: <HelpIcon />, path: '/help' },
];

const SimpleMainLayout: React.FC<SimpleMainLayoutProps> = ({
  children,
  toggleMode,
  isDarkMode
}) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false); // Close mobile drawer after navigation
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          AILAB
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            AI实验管理平台
          </Typography>

          <SchoolSelector />

          <Tooltip title="切换主题">
            <IconButton color="inherit" onClick={toggleMode}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="用户菜单">
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar sx={{ width: 32, height: 32 }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              退出登录
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SimpleMainLayout;
