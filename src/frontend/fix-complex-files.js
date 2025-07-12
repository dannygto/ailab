const fs = require('fs');
const path = require('path');

console.log('开始彻底修复复杂的文件...');

// 修复 SessionHistory.tsx
const fixSessionHistory = () => {
  const filePath = path.join(__dirname, 'src', 'components', 'guidance', 'SessionHistory.tsx');
  
  const fixedContent = `import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Grid,
  Divider,
  Button,
} from '@mui/material';
import {
  PersonIcon,
  SchoolIcon,
  QuizIcon,
  ScienceIcon,
} from '../../utils/icons';

interface SessionHistoryProps {
  sessions: any[];
  loading?: boolean;
  error?: string | null;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({
  sessions = [],
  loading = false,
  error = null,
}) => {
  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'student':
        return <PersonIcon />;
      case 'teacher':
        return <SchoolIcon />;
      case 'system':
        return <ScienceIcon />;
      default:
        return <QuizIcon />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'student':
        return 'primary';
      case 'teacher':
        return 'secondary';
      case 'system':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'question':
        return '问题咨询';
      case 'guidance':
        return '指导建议';
      case 'resource':
        return '资源推荐';
      case 'feedback':
        return '反馈评价';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6">会话历史</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              总会话数: {sessions.length}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              最后活动: {sessions.length > 0 ? formatDate(sessions[0]?.updatedAt || '') : '无数据'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          学习目标
        </Typography>
        {sessions.length > 0 ? (
          <Grid container spacing={2}>
            {sessions.slice(0, 5).map((session, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getSourceIcon(session.source)}
                    <Chip
                      label={getTypeLabel(session.type)}
                      color={getSourceColor(session.source)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Typography variant="body1">
                    {session.title || '会话记录'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(session.createdAt)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">暂无学习目标</Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          交流历史
        </Typography>
        <List>
          {sessions.map((session, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>{getSourceIcon(session.source)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {session.title || '会话记录'}
                      </Typography>
                      <Chip
                        label={getTypeLabel(session.type)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {formatDate(session.createdAt)}
                      </Typography>
                      {session.relatedStage && (
                        <Chip
                          label={session.relatedStage}
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < sessions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => {
            // 处理查看更多逻辑
          }}
        >
          查看更多历史记录
        </Button>
      </Box>
    </Box>
  );
};

export default SessionHistory;
`;

  fs.writeFileSync(filePath, fixedContent, 'utf-8');
  console.log('✓ SessionHistory.tsx 修复完成');
};

// 修复 MainLayout.tsx
const fixMainLayout = () => {
  const filePath = path.join(__dirname, 'src', 'components', 'layout', 'MainLayout.tsx');
  
  const fixedContent = `import React, { useState } from 'react';
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
          width: { sm: \`calc(100% - \${drawerWidth}px)\` },
          ml: { sm: \`\${drawerWidth}px\` },
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
`;

  fs.writeFileSync(filePath, fixedContent, 'utf-8');
  console.log('✓ MainLayout.tsx 修复完成');
};

// 执行修复
fixSessionHistory();
fixMainLayout();

console.log('复杂文件修复完成！');
