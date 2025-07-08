const fs = require('fs');
const path = require('path');

console.log('开始批量修复简单的 JSX 结构问题...');

// 修复 SimpleMainLayout.tsx
const simpleMainLayoutPath = path.join(__dirname, 'src/components/layout/SimpleMainLayout.tsx');
const simpleMainLayoutContent = `import React, { useState } from 'react';
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
  Tooltip
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
  LogoutIcon
} from '../utils/icons';

interface SimpleMainLayoutProps {
  children: React.ReactNode;
  toggleMode: () => void;
  isDarkMode: boolean;
}

const drawerWidth = 240;

const menuItems = [
  { text: '仪表板', icon: <DashboardIcon />, path: '/dashboard' },
  { text: '实验', icon: <ScienceIcon />, path: '/experiments' },
  { text: '设备', icon: <DevicesIcon />, path: '/devices' },
  { text: '设置', icon: <SettingsIcon />, path: '/settings' },
];

const SimpleMainLayout: React.FC<SimpleMainLayoutProps> = ({
  children,
  toggleMode,
  isDarkMode
}) => {
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

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          AICAM
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton>
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
          width: { sm: \`calc(100% - \${drawerWidth}px)\` },
          ml: { sm: \`\${drawerWidth}px\` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SimpleMainLayout;
`;

// 修复 Login.tsx
const loginPath = path.join(__dirname, 'src/pages/Login.tsx');
const loginContent = `import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Tabs,
  Tab,
  Divider,
  Alert
} from '@mui/material';

interface LoginFormData {
  username: string;
  password: string;
  userType: 'student' | 'teacher' | 'admin';
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    userType: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleUserTypeChange = (event: React.SyntheticEvent, newValue: string) => {
    setFormData(prev => ({
      ...prev,
      userType: newValue as 'student' | 'teacher' | 'admin'
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('登录成功', formData);
    } catch (err) {
      setError('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          用户登录
        </Typography>

        <Tabs
          value={formData.userType}
          onChange={handleUserTypeChange}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="学生" value="student" />
          <Tab label="教师" value="teacher" />
          <Tab label="管理员" value="admin" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            value={formData.username}
            onChange={handleInputChange('username')}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="密码"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            margin="normal"
            required
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
`;

// 修复 Register.tsx
const registerPath = path.join(__dirname, 'src/pages/Register.tsx');
const registerContent = `import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link
} from '@mui/material';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof RegisterFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('密码不匹配');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 模拟注册API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('注册成功', formData);
    } catch (err) {
      setError('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          用户注册
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            value={formData.username}
            onChange={handleInputChange('username')}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="邮箱"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="密码"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="确认密码"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            margin="normal"
            required
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? '注册中...' : '注册'}
          </Button>
        </form>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          已有账号？
          <Link href="/login" underline="hover">
            立即登录
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
`;

// 修复 NotFound.tsx
const notFoundPath = path.join(__dirname, 'src/pages/NotFound.tsx');
const notFoundContent = `import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <React.Fragment>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="h1" component="h1" gutterBottom color="primary">
            404
          </Typography>
          
          <Typography variant="h5" component="h2" gutterBottom>
            页面未找到
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            抱歉，您访问的页面不存在。
          </Typography>
          
          <Button variant="contained" onClick={handleGoHome}>
            返回首页
          </Button>
        </Paper>
      </Box>
    </React.Fragment>
  );
};

export default NotFound;
`;

const files = [
  { path: simpleMainLayoutPath, content: simpleMainLayoutContent, name: 'SimpleMainLayout.tsx' },
  { path: loginPath, content: loginContent, name: 'Login.tsx' },
  { path: registerPath, content: registerContent, name: 'Register.tsx' },
  { path: notFoundPath, content: notFoundContent, name: 'NotFound.tsx' }
];

let successCount = 0;
let errorCount = 0;

files.forEach(file => {
  try {
    fs.writeFileSync(file.path, file.content, 'utf8');
    console.log(`✓ ${file.name} 修复完成`);
    successCount++;
  } catch (error) {
    console.error(`✗ ${file.name} 修复失败:`, error);
    errorCount++;
  }
});

console.log(`\n批量修复完成: ${successCount} 个文件成功, ${errorCount} 个文件失败`);
