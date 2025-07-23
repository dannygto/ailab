import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  MenuIcon,
  DarkModeIcon,
  LightModeIcon,
  AccountCircleIcon,
  ExitToAppIcon,
  DashboardIcon,
  ScienceIcon,
  DevicesIcon,
  SettingsIcon,
} from '../../utils/icons';

interface MainLayoutProps {
  children: React.ReactNode;
  user?: any;
  onLogout?: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
}

const drawerWidth = 240;

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  user,
  onLogout,
  onToggleTheme,
  isDarkMode = false,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: '仪表板', icon: <DashboardIcon />, path: '/dashboard' },
    { text: '实验管理', icon: <ScienceIcon />, path: '/experiments' },
    { text: '设备管理', icon: <DevicesIcon />, path: '/devices' },
    { text: '设置', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          AICAM 系统
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
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
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              AICAM 实验管理系统
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="切换主题">
              <IconButton color="inherit" onClick={onToggleTheme}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="用户菜单">
              <IconButton
                size="large"
                aria-label="user menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleCloseMenu}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                个人设置
              </MenuItem>
              <MenuItem onClick={onLogout}>
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                退出登录
              </MenuItem>
            </Menu>
          </Box>
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
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
