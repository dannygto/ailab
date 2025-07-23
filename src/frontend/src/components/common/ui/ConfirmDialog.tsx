import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, CircularProgress, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface ConfirmDialogProps {
  /**
   * 对话框标题
   */
  title: string;

  /**
   * 对话框内容
   */
  content: string;

  /**
   * 对话框是否打开
   */
  open: boolean;

  /**
   * 确认按钮文本
   */
  confirmText?: string;

  /**
   * 取消按钮文本
   */
  cancelText?: string;

  /**
   * 确认按钮颜色
   */
  confirmButtonColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';

  /**
   * 取消按钮颜色
   */
  cancelButtonColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';

  /**
   * 是否显示取消按钮
   */
  showCancel?: boolean;

  /**
   * 是否处于加载状态
   */
  loading?: boolean;

  /**
   * 确认回调
   */
  onConfirm: () => void;

  /**
   * 取消回调
   */
  onCancel: () => void;

  /**
   * 是否使用国际化，如果为true，则使用title和content作为国际化键名
   */
  useTranslation?: boolean;
}

/**
 * 通用确认对话框组件
 *
 * 提供统一的确认/取消对话框，支持加载状态和国际化
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  content,
  open,
  confirmText = 'confirm',
  cancelText = 'cancel',
  confirmButtonColor = 'primary',
  cancelButtonColor = 'inherit',
  showCancel = true,
  loading = false,
  onConfirm,
  onCancel,
  useTranslation = true,
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  // 处理国际化文本
  const displayTitle = useTranslation ? t(title) : title;
  const displayContent = useTranslation ? t(content) : content;
  const displayConfirmText = useTranslation ? t(confirmText) : confirmText;
  const displayCancelText = useTranslation ? t(cancelText) : cancelText;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">
        {displayTitle}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {displayContent}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {showCancel && (
          <Button
            onClick={onCancel}
            color={cancelButtonColor}
            disabled={loading}
          >
            {displayCancelText}
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          color={confirmButtonColor}
          autoFocus
          disabled={loading}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              {displayConfirmText}
            </Box>
          ) : displayConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
