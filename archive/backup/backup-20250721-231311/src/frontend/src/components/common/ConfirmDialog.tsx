import React from 'react';
import { Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button, Box } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancelIcon: () => void;
  confirmText?: string;
  CancelIconText?: string;
  confirmColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancelIcon,
  confirmText = 'ȷ��',
  CancelIconText = 'ȡ��',
  confirmColor = 'primary'
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancelIcon}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelIcon} color="inherit">
          {CancelIconText}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
