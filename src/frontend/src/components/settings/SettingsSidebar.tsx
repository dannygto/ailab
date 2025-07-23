import React from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Box } from '@mui/material';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Translate as TranslateIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * 设置页面侧边菜单组件
 * 提供设置页面的各种选项导航
 */
const SettingsSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 设置菜单项定义
  const menuItems = [
    {
      label: '个人资料',
      icon: <PersonIcon />,
      path: '/settings/profile'
    },
    {
      label: '语言设置',
      icon: <TranslateIcon />,
      path: '/settings/internationalization'
    },
    {
      label: '少数民族语言支持',
      icon: <LanguageIcon />,
      path: '/settings/ethnic-language',
      highlight: true
    },
    {
      label: '安全设置',
      icon: <SecurityIcon />,
      path: '/settings/security'
    },
    {
      label: '通知设置',
      icon: <NotificationsIcon />,
      path: '/settings/notifications'
    },
    {
      label: '主题设置',
      icon: <PaletteIcon />,
      path: '/settings/theme'
    }
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: 280, bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 1 }} />
          系统设置
        </Typography>
      </Box>
      <Divider />
      <List component="nav" sx={{ py: 1 }}>
        {menuItems.map((item, index) => (
          <ListItemButton
            key={index}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                '&:hover': {
                  bgcolor: 'primary.light',
                },
              },
              ...(item.highlight ? {
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                }
              } : {})
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                ...(item.highlight && location.pathname !== item.path ? { color: 'primary.main' } : {})
              }}
            />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          版本: 1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default SettingsSidebar;
