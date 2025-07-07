import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton
} from '@mui/material';
import { 
  WifiIcon, 
  CloudOffIcon, 
  RefreshIcon, 
  PhoneAndroidIcon,
  CloseIcon,
  DownloadIcon,
  InstallDesktopIcon,
  CacheIcon,
  SpeedIcon,
  NotificationsIcon
} from '../../utils/icons';
import { usePWA } from '../../hooks/usePWAHook';

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

  // ��ʾ��װ��ʾ
  const showInstallPrompt = () => {
    if (pwaStatus.isInstallable && !installPromptDismissed) {
      setShowInstallDialog(true);
    }
  };

  // ִ�а�װ
  const handleInstall = async () => {
    const success = await promptInstall();
    setShowInstallDialog(false);
    
    if (success) {
      setSnackbarMessage('Ӧ���ѳɹ���װ������Ļ��');
      setSnackbarSeverity('success');
    } else {
      setSnackbarMessage('��װ��ȡ��');
      setSnackbarSeverity('info');
    }
    setSnackbarOpen(true);
  };

  // �رհ�װ��ʾ
  const handleDismissInstall = () => {
    setShowInstallDialog(false);
    setInstallPromptDismissed(true);
  };

  // Ӧ�ø���
  const handleUpdate = async () => {
    await applyUpdate();
    setSnackbarMessage('Ӧ�����ڸ��£��������¼���...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  // �Զ���ʾ��װ��ʾ
  React.useEffect(() => {
    if (autoShow && pwaStatus.isInstallable && !pwaStatus.isInstalled && !installPromptDismissed) {
      const timer = setTimeout(() => {
        setShowInstallDialog(true);
      }, 5000); // 5�����ʾ

      return () => clearTimeout(timer);
    }
  }, [autoShow, pwaStatus.isInstallable, pwaStatus.isInstalled, installPromptDismissed]);

  return (
    <>
      {/* ����״ָ̬ʾ�� */}
      {showNetworkStatus && (
        <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1100 }}>
          <Chip
            icon={pwaStatus.isOnline ? <WifiIcon /> : <CloudOffIcon />}
            label={pwaStatus.isOnline ? '����' : '����'}
            color={pwaStatus.isOnline ? 'success' : 'warning'}
            variant="filled"
            size="small"
          />
        </Box>
      )}

      {/* ��װ������ť */}
      {pwaStatus.isInstallable && !pwaStatus.isInstalled && (
        <Fab
          color="primary"
          aria-label="��װӦ��"
          onClick={showInstallPrompt}
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1000
          }}
        >
          <InstallIcon />
        </Fab>
      )}

      {/* ���¸�����ť */}
      {updateAvailable && (
        <Fab
          color="secondary"
          aria-label="����Ӧ��"
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

      {/* ��װ�Ի��� */}
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
          <Box display="flex" alignItems="center" gap={1}>
            <InstallIcon color="primary" />
            <Typography variant="h6">��װ�˹����ܸ���ʵ��ƽ̨</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            ���˹����ܸ���ʵ��ƽ̨��װ�������豸����Ļ������ԭ��Ӧ�����飡
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              ��װ��������ã�
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <PhoneAndroidIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="ԭ��Ӧ������" 
                  secondary="�������������ţ�רעѧϰ" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CacheIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="���߷���" 
                  secondary="�����ж�ʱ�Կɲ鿴�ѻ��������" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <SpeedIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="����ļ����ٶ�" 
                  secondary="���ܻ��漼��������ʹ��������" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="ʵʱ֪ͨ" 
                  secondary="����ʵ��״̬���º���Ҫ����" 
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
            �Ժ�װ
          </Button>
          <Button 
            onClick={handleInstall}
            variant="contained"
            color="primary"
            startIcon={<InstallIcon />}
          >
            ������װ
          </Button>
        </DialogActions>
      </Dialog>

      {/* ��ʾ��Ϣ */}
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


