import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box
} from '@mui/material';
import { 
  MenuIcon, 
  HomeIcon, 
  ExperimentIcon, 
  DeviceIcon, 
  SettingsIcon,
  LogoutIcon
} from '../../utils/icons';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MobileNavigationProps {
  title?: string;
  onLogout?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  title = "AICAM System",
  onLogout 
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    { label: '首页', path: '/', icon: <HomeIcon /> },
    { label: '实验管理', path: '/experiments', icon: <ExperimentIcon /> },
    { label: '设备管理', path: '/devices', icon: <DeviceIcon /> },
    { label: '系统设置', path: '/settings', icon: <SettingsIcon /> },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    onLogout?.();
    setDrawerOpen(false);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" noWrap>
          {title}
        </Typography>
      </Box>

      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isCurrentPath(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon sx={{ color: isCurrentPath(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                sx={{ color: isCurrentPath(item.path) ? 'primary.main' : 'inherit' }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="退出登录" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="打开菜单"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          keepMounted: true, // 在移动端提高性能
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default MobileNavigation;
