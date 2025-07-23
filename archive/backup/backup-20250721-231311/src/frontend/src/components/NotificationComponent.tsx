import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Badge, Tooltip, IconButton, Menu, MenuItem, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Box, Divider } from '@mui/material';
import { NotificationsIcon } from '../utils/icons';
import { notificationService } from '../services/notificationService';
import { Message } from '../types';
import { useNavigate } from 'react-router-dom';

/**
 * 通知组件
 * 监听实时通知并在UI上显示
 */
const NotificationComponent: React.FC = () => {
  const [notifications, setNotifications] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Message | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  // 初始化通知权限和监听
  useEffect(() => {
    // 请求通知权限
    notificationService.requestNotificationPermission();

    // 订阅通知
    const subscription = notificationService.getNotifications().subscribe(message => {
      // 添加新通知到列表
      setNotifications(prev => [message, ...prev].slice(0, 10)); // 只保留最近10条
      setUnreadCount(prev => prev + 1);

      // 显示Snackbar提示
      setCurrentNotification(message);
      setSnackbarOpen(true);
    });

    // 清理订阅
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 处理通知点击
  const handleNotificationClick = (notification: Message) => {
    // 标记为已读
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
    );

    // 更新未读计数
    setUnreadCount(prev => Math.max(0, prev - 1));

    // 关闭菜单
    setMenuAnchorEl(null);

    // 根据通知类型导航
    if (notification.type === 'experiment' && notification.relatedExperiment) {
      navigate(`/experiments/${notification.relatedExperiment.id}`);
    } else if (notification.type === 'system') {
      navigate('/dashboard');
    } else if (notification.type === 'personal') {
      navigate('/messages');
    } else if (notification.type === 'announcement') {
      navigate('/announcements');
    }
  };

  // 处理通知图标点击
  const handleNotificationIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // 处理菜单关闭
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // 处理Snackbar关闭
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // 查看所有消息
  const handleViewAllMessages = () => {
    navigate('/messages');
    setMenuAnchorEl(null);
  };

  return (
    <>
      {/* 通知图标 */}
      <Tooltip title="通知">
        <IconButton color="inherit" onClick={handleNotificationIconClick}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* 通知下拉菜单 */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 360
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">通知</Typography>
          {unreadCount > 0 && (
            <Typography variant="subtitle2" color="primary">
              {unreadCount}条未读
            </Typography>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              暂无通知
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={notification.sender.avatar} alt={notification.sender.name}>
                      {notification.sender.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {notification.content.length > 60
                            ? `${notification.content.substring(0, 60)}...`
                            : notification.content}
                        </Typography>
                        <Typography component="span" variant="caption" display="block" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
            <MenuItem onClick={handleViewAllMessages} sx={{ justifyContent: 'center' }}>
              <Typography color="primary">查看所有消息</Typography>
            </MenuItem>
          </List>
        )}
      </Menu>

      {/* 新通知Snackbar提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{ width: '100%', cursor: 'pointer' }}
          onClick={() => {
            if (currentNotification) {
              handleNotificationClick(currentNotification);
            }
            handleSnackbarClose();
          }}
        >
          <Typography variant="subtitle2">{currentNotification?.title}</Typography>
          <Typography variant="body2">
            {currentNotification?.content.length && currentNotification.content.length > 60
              ? `${currentNotification.content.substring(0, 60)}...`
              : currentNotification?.content}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationComponent;
