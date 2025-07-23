import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Build as BuildIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';

import { deviceStatusService } from '../../../services/deviceStatus.service';
import { Device } from '../../../types';

// 组件接口
interface DeviceMonitoringActionsProps {
  selectedDevices: Device[];
  onRefresh: () => void;
  onClearSelection: () => void;
}

/**
 * 设备监控操作组件
 * 提供对所选设备的批量操作功能
 */
const DeviceMonitoringActions: React.FC<DeviceMonitoringActionsProps> = ({
  selectedDevices,
  onRefresh,
  onClearSelection
}) => {
  // 菜单状态
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // 对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<string>('');
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');

  // 打开菜单
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 关闭菜单
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 处理操作点击
  const handleActionClick = (action: string) => {
    handleMenuClose();

    switch (action) {
      case 'refresh':
        // 刷新设备状态
        onRefresh();
        break;

      case 'sync':
        // 同步设备配置
        showConfirmDialog(
          '同步设备配置',
          `确认要同步所选的 ${selectedDevices.length} 个设备的配置吗？`,
          'sync'
        );
        break;

      case 'maintenance':
        // 设置维护状态
        showConfirmDialog(
          '设置维护状态',
          `确认要将所选的 ${selectedDevices.length} 个设备设置为维护状态吗？`,
          'maintenance'
        );
        break;

      case 'deactivate':
        // 停用设备
        showConfirmDialog(
          '停用设备',
          `确认要停用所选的 ${selectedDevices.length} 个设备吗？这将使它们在实验中不可用。`,
          'deactivate'
        );
        break;

      case 'delete':
        // 删除设备
        showConfirmDialog(
          '删除设备',
          `确认要删除所选的 ${selectedDevices.length} 个设备吗？此操作无法撤销。`,
          'delete'
        );
        break;

      case 'exportData':
        // 导出设备数据
        handleExportData();
        break;

      default:
        break;
    }
  };

  // 显示确认对话框
  const showConfirmDialog = (title: string, content: string, action: string) => {
    setDialogTitle(title);
    setDialogContent(content);
    setDialogAction(action);
    setDialogOpen(true);
  };

  // 处理对话框确认
  const handleDialogConfirm = () => {
    setDialogOpen(false);

    switch (dialogAction) {
      case 'sync':
        handleSyncDevices();
        break;

      case 'maintenance':
        handleSetMaintenance();
        break;

      case 'deactivate':
        handleDeactivateDevices();
        break;

      case 'delete':
        handleDeleteDevices();
        break;

      default:
        break;
    }

    // 清除选择
    onClearSelection();
  };

  // 同步设备配置
  const handleSyncDevices = () => {
    // 这里实现同步设备配置的逻辑
    console.log('同步设备配置', selectedDevices.map(d => d.id));

    // 刷新设备状态
    setTimeout(() => {
      deviceStatusService.clearCache();
      onRefresh();
    }, 1000);
  };

  // 设置维护状态
  const handleSetMaintenance = () => {
    // 这里实现设置维护状态的逻辑
    console.log('设置维护状态', selectedDevices.map(d => d.id));

    // 刷新设备状态
    setTimeout(() => {
      deviceStatusService.clearCache();
      onRefresh();
    }, 1000);
  };

  // 停用设备
  const handleDeactivateDevices = () => {
    // 这里实现停用设备的逻辑
    console.log('停用设备', selectedDevices.map(d => d.id));

    // 刷新设备状态
    setTimeout(() => {
      deviceStatusService.clearCache();
      onRefresh();
    }, 1000);
  };

  // 删除设备
  const handleDeleteDevices = () => {
    // 这里实现删除设备的逻辑
    console.log('删除设备', selectedDevices.map(d => d.id));

    // 刷新设备状态
    setTimeout(() => {
      deviceStatusService.clearCache();
      onRefresh();
    }, 1000);
  };

  // 导出设备数据
  const handleExportData = () => {
    // 这里实现导出设备数据的逻辑
    console.log('导出设备数据', selectedDevices.map(d => d.id));

    // 生成假数据用于演示
    const data = selectedDevices.map(device => ({
      id: device.id,
      name: device.name,
      type: device.type,
      status: device.status,
      lastSeen: device.lastSeen,
      location: device.location
    }));

    // 将数据转换为JSON字符串
    const jsonData = JSON.stringify(data, null, 2);

    // 创建Blob对象
    const blob = new Blob([jsonData], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device-data-${new Date().toISOString().slice(0, 10)}.json`;

    // 触发下载
    document.body.appendChild(a);
    a.click();

    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {selectedDevices.length > 0 && (
        <Typography variant="body2" sx={{ mr: 2 }}>
          已选择 {selectedDevices.length} 个设备
        </Typography>
      )}

      <Tooltip title="刷新">
        <IconButton onClick={() => handleActionClick('refresh')}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>

      {selectedDevices.length > 0 && (
        <>
          <Tooltip title="操作菜单">
            <IconButton
              aria-label="更多操作"
              aria-controls="device-actions-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>

          <Menu
            id="device-actions-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleActionClick('sync')}>
              <SyncIcon fontSize="small" sx={{ mr: 1 }} />
              同步设备配置
            </MenuItem>
            <MenuItem onClick={() => handleActionClick('maintenance')}>
              <BuildIcon fontSize="small" sx={{ mr: 1 }} />
              设置维护状态
            </MenuItem>
            <MenuItem onClick={() => handleActionClick('deactivate')}>
              <BlockIcon fontSize="small" sx={{ mr: 1 }} />
              停用设备
            </MenuItem>
            <MenuItem onClick={() => handleActionClick('exportData')}>
              <CloudDownloadIcon fontSize="small" sx={{ mr: 1 }} />
              导出设备数据
            </MenuItem>
            <MenuItem onClick={() => handleActionClick('delete')}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
              <Typography color="error">删除设备</Typography>
            </MenuItem>
          </Menu>

          {/* 确认对话框 */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
          >
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {dialogContent}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)} color="primary">
                取消
              </Button>
              <Button onClick={handleDialogConfirm} color="primary" autoFocus>
                确认
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default DeviceMonitoringActions;
