import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import { MenuIcon as MenuIcon, DashboardIcon as DashboardIcon, ScienceIcon as ScienceIcon, devices as devices, PsychologyIcon as PsychologyIcon, analytics as analytics, PersonIcon as PersonIcon, logout as logout } from '../../utils/icons';

interface MobileNavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onlogout?: () => void;
  userName?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPage,
  onPageChange,
  onlogout,
  userName = '�û�'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: '����̨',
      icon: <DashboardIcon />,
      path: '/dashboard'
    },
    {
      id: 'experiments',
      label: 'ʵ�����',
      icon: <ScienceIcon />,
      path: '/experiments'
    },
    {
      id: 'devices',
      label: '�豸���',
      icon: <DevicesIcon />,
      path: '/devices'
    },
    {
      id: 'ai-assistant',
      label: 'AI����',
      icon: <PsychologyIcon />,
      path: '/ai-assistant'
    },
    {
      id: 'analytics',
      label: '���ݷ���',
      icon: <AnalyticsIcon />,
      path: '/analytics'
    }
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (item: NavigationItem) => {
    onPageChange(item.id);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const drawerContent = (
    <div sx={{ width: 280 }}>
      {/* �û���Ϣ���� */}
      <div
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <PersonIcon />
        <div>
          <Typography variant="subtitle1" fontWeight="bold">
            {userName}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            �˹����ܸ���ʵ��ƽ̨
          </Typography>
        </div>
      </div>

      <Divider />

      {/* �����˵� */}
      <List sx={{ pt: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={currentPage === item.id}
              onClick={() => handleNavigation(item)}
              sx={{
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.main',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText'
                  }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: currentPage === item.id ? 'inherit' : 'action.active',
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: currentPage === item.id ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* �ײ��˵� */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigation({ id: 'settings', label: '����', icon: <SettingsIcon />, path: '/settings' })}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="����" />
          </ListItemButton>
        </ListItem>
        
        {onlogout && (
          <ListItem disablePadding>
            <ListItemButton onClick={onlogout}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="�˳���¼" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </div>
  );

  if (!isMobile) {
    // ����棺�����ʼ����ʾ
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // �ƶ��棺������ĵ�����
  return (
    <>
      <AppBar position="fixed">
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
          <Typography variant="h6" noWrap component="div">
            �˹����ܸ���ʵ��ƽ̨
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // ���õ��ƶ�������
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default MobileNavigation;


