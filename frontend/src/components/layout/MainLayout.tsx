import React, { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  IconButton, 
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon
} from '@mui/material';
import { MenuIcon, Brightness4Icon as DarkModeIcon, Brightness7Icon as LightModeIcon, PersonIcon as ProfileIcon, logout } from '../../utils/icons';
import { Link } from 'react-router-dom';
import { useUserStore, useThemeStore, useSettingsStore } from '../../store';
import EditionBadge from '../common/EditionBadge';
import CopyrightInfo from '../common/CopyrightInfo';
import NavigationMenu from './NavigationMenu';
import { menuItems, filterMenuItems } from '../../config/menuConfig';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const { user, logout } = useUserStore();
  const { toggleMode } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { settings } = useSettingsStore();
  
  // Ʒ�ƺ�վ������
  const siteName = settings?.branding?.siteName || '�˹����ܸ���ʵ��ƽ̨';
  const logoUrl = settings?.branding?.logoUrl || '/logo.png?v=20250624';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (EventIcon: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(EventIcon.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlelogout = () => {
    logout();
    handleClose();
  };
  const drawerWidth = 240;
  
  // ��ȡ�û�Ȩ�ޣ�ʾ����
  const userPermissions = user?.role === 'admin' ? ['admin', 'teacher'] : ['teacher'];
  
  // ���˲˵���
  const filteredMenuItems = filterMenuItems(menuItems, userPermissions);

  const drawer = (
    <>      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>          <img 
            src={logoUrl} 
            alt={siteName} 
            style={{ height: '32px', marginRight: '10px' }}
          /><Typography variant="h6" noWrap sx={{ fontWeight: 'bold' }}>
            {siteName}
          </Typography>
        </Box>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <NavigationMenu menuItems={filteredMenuItems} />
      </Box>
    </>
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
          </IconButton>          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>            <Box sx={{
              display: { xs: 'none', sm: 'block' },
              mr: 1
            }}>              <img 
                src={logoUrl} 
                alt={siteName} 
                style={{ height: '32px' }}
              />
            </Box>
            <Typography variant="h6" noWrap component="div">
              {siteName}
            </Typography>
          </Box>
          
          <Tooltip title={theme.palette.mode === 'dark' ? '�л�����ɫģʽ' : '�л�����ɫģʽ'}>
            <IconButton color="inherit" onClick={toggleMode}>
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          <div>
            <IconButton
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                alt={user?.name || 'User'} 
                src={user?.avatarUrl}
                sx={{ width: 32, height: 32 }}
              >
                {(user?.name || 'U')[0]}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={Link} to="/profile" onClick={handleClose}>
                <ListItemIcon>
                  <ProfileIcon fontSize="small" />
                </ListItemIcon>
                ��������
              </MenuItem>
              <MenuItem onClick={handlelogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                �˳���¼
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* �ƶ��˳��� */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // ����ƶ�������
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* ����˳��� */}
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
      
      {/* ���������� */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: '64px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
        
        {/* ��Ȩ��Ϣ */}
        <CopyrightInfo />
        
        {/* �汾��� */}
        <EditionBadge position="bottomRight" />
      </Box>
    </Box>
  );
};

export default MainLayout;
