import React from 'react';
import { Alert, Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface ToastProps {
  /**
   * 是否显示提示
   */
  open: boolean;

  /**
   * 提示信息
   */
  message: string;

  /**
   * 提示类型
   */
  severity?: 'success' | 'info' | 'warning' | 'error';

  /**
   * 显示时长（毫秒），默认3000ms
   */
  duration?: number;

  /**
   * 关闭回调
   */
  onClose: () => void;

  /**
   * 提示位置
   */
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

/**
 * 统一的消息提示组件
 *
 * 提供一致的消息提示，支持不同类型和位置
 */
const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity = 'info',
  duration = 3000,
  onClose,
  position = { vertical: 'bottom', horizontal: 'center' }
}) => {
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: position.vertical,
        horizontal: position.horizontal
      }}
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
    >
      <Alert
        elevation={6}
        variant="filled"
        severity={severity}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
