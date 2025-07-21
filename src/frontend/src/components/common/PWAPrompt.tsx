import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Fab
} from '@mui/material';
import {
  WifiIcon,
  CloudOffIcon,
  RefreshIcon,
  PhoneAndroidIcon,
  InstallDesktopIcon,
  CacheIcon,
  SpeedIcon,
  NotificationsIcon
} from '../../utils/icons';
import { usePWA } from '../../hooks/usePWA';

interface PWAPromptProps {
  autoShow?: boolean;
  showNetworkStatus?: boolean;
}

const PWAPrompt: React.FC<PWAPromptProps> = ({
  autoShow = true,
  showNetworkStatus = true
}) => {
  const { pwaStatus, updateAvailable, promptInstall, applyUpdate } = usePWA();
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [installPromptDismissed, setInstallPromptDismissed] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning'>('info');

  // 显示安装提示
  const showInstallPrompt = () => {
    if (pwaStatus.isInstallable && !installPromptDismissed) {
      setShowInstallDialog(true);
    }
  };

  // 执行安装
  const handleInstall = async () => {
    const success = await promptInstall();
    setShowInstallDialog(false);

    if (success) {
      setSnackbarMessage('应用已成功安装到您的设备！');
      setSnackbarSeverity('success');
    } else {
      setSnackbarMessage('安装被取消');
      setSnackbarSeverity('info');
    }
    setSnackbarOpen(true);
  };

  // 关闭安装提示
  const handleDismissInstall = () => {
    setShowInstallDialog(false);
    setInstallPromptDismissed(true);
  };

  // 应用更新
  const handleUpdate = async () => {
    await applyUpdate();
    setSnackbarMessage('应用正在更新，即将重新加载...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  // 自动显示安装提示
  React.useEffect(() => {
    if (autoShow && pwaStatus.isInstallable && !pwaStatus.isInstalled && !installPromptDismissed) {
      const timer = setTimeout(() => {
        setShowInstallDialog(true);
      }, 5000); // 5秒后显示

      return () => clearTimeout(timer);
    }
  }, [autoShow, pwaStatus.isInstallable, pwaStatus.isInstalled, installPromptDismissed]);

  return (
    <>
      {/* 网络状态指示器 */}
      {showNetworkStatus && (
        <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1100 }}>
          <Chip
            icon={pwaStatus.isOnline ? <WifiIcon /> : <CloudOffIcon />}
            label={pwaStatus.isOnline ? '在线' : '离线'}
            color={pwaStatus.isOnline ? 'success' : 'warning'}
            variant="filled"
            size="small"
          />
        </Box>
      )}

      {/* 安装浮动按钮 */}
      {pwaStatus.isInstallable && !pwaStatus.isInstalled && (
        <Fab
          color="primary"
          aria-label="安装应用"
          onClick={showInstallPrompt}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1000
          }}
        >
          <InstallDesktopIcon />
        </Fab>
      )}

      {/* 更新浮动按钮 */}
      {updateAvailable && (
        <Fab
          color="secondary"
          aria-label="更新应用"
          onClick={handleUpdate}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: pwaStatus.isInstallable ? 96 : 24,
            zIndex: 1000
          }}
        >
          <RefreshIcon />
        </Fab>
      )}

      {/* 安装对话框 */}
      <Dialog
        open={showInstallDialog}
        onClose={handleDismissInstall}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InstallDesktopIcon color="primary" />
            <Typography variant="h6">安装人工智能辅助实验平台</Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" gutterBottom>
            将人工智能辅助实验平台安装到您的设备主屏幕，获得原生应用般体验！
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              安装后您将享受：
            </Typography>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PhoneAndroidIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="原生应用体验"
                  secondary="独立窗口运行，专注学习"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <CacheIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="离线访问"
                  secondary="网络中断时仍可查看已缓存的内容"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <SpeedIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="更快的加载速度"
                  secondary="智能缓存技术，提升使用体验"
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="实时通知"
                  secondary="接收实验状态更新和重要提醒"
                />
              </ListItem>
            </List>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleDismissInstall}
            color="inherit"
          >
            稍后安装
          </Button>
          <Button
            onClick={handleInstall}
            variant="contained"
            color="primary"
            startIcon={<InstallDesktopIcon />}
          >
            立即安装
          </Button>
        </DialogActions>
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAPrompt;


