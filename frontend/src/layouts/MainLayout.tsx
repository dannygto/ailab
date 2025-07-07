import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import { MenuIcon as MenuIcon, DashboardIcon as DashboardIcon, ScienceIcon as ScienceIcon, devices as devices, StorageIcon as DataIcon, PeopleIcon as PeopleIcon, NotificationsIcon as NotificationsIcon, AccountCircleIcon as AccountIcon, ChevronLeftIcon as ChevronLeftIcon, Brightness4Icon as DarkModeIcon, Brightness7Icon as LightModeIcon } from '../utils/icons';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleProfileMenuOpen = (Event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(Event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const menuItems = [
    { text: '�Ǳ���', icon: <DashboardIcon />, path: '/' },
    { text: 'ʵ�����', icon: <ScienceIcon />, path: '/experiments' },
    { text: '�豸���', icon: <DevicesIcon />, path: '/devices/monitoring' },
    { text: '���ݷ���', icon: <DataIcon />, path: '/data/analysis' },
    { text: '�û�����', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'ϵͳ����', icon: <SettingsIcon />, path: '/admin/settings' },
  ];
  
  const drawer = (
    <>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          AICAMƽ̨
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            selected={location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <div sx={{ flexGrow: 1 }} />
      <Divider />
      <div sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          AICAMƽ̨ v1.0.0
        </Typography>
      </div>
    </>
  );
  
  return (
    <div sx={{ display: 'flex', height: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { md: `${drawerOpen ? drawerWidth : 0}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => 
              location.pathname === item.path || 
              location.pathname.startsWith(`${item.path}/`))?.text || 'ҳ��δ�ҵ�'}
          </Typography>
          
          <Tooltip title="�л���ɫ/ǳɫģʽ">
            <IconButton color="inherit">
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="֪ͨ">
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="��������">
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                <AccountIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleProfileMenuClose}>��������</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>�ҵ�ʵ��</MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>�˳���¼</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      <div
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { md: `${drawerOpen ? 0 : -drawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflow: 'auto',
          height: '100vh',
          pt: 8, // Toolbar�ĸ߶�
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MainLayout;


