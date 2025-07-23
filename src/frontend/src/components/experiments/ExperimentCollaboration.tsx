import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Chip,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Send as SendIcon,
  ChatBubble as ChatBubbleIcon,
  Share as ShareIcon,
  PersonAdd as PersonAddIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// 随机颜色生成函数
const getRandomColor = () => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffc107', '#ff9800', '#ff5722'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 用户类型定义
interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  status: 'online' | 'offline' | 'idle';
  role: 'owner' | 'editor' | 'viewer';
  lastActive?: Date;
}

// 消息类型定义
interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'system' | 'action';
}

// 协作操作类型定义
interface CollaborationAction {
  id: string;
  userId: string;
  type: 'parameter_change' | 'data_upload' | 'result_analysis' | 'report_edit';
  description: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface ExperimentCollaborationProps {
  experimentId: string;
  experimentName: string;
  currentUserId: string;
  currentUserName: string;
  onApplyChanges?: (changes: any) => void;
}

/**
 * 实验协作组件
 * 支持多用户实时协作实验，包括聊天、共享操作、权限管理等功能
 */
const ExperimentCollaboration: React.FC<ExperimentCollaborationProps> = ({
  experimentId,
  experimentName,
  currentUserId,
  currentUserName,
  onApplyChanges
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'chat' | 'users' | 'actions'>('chat');
  const [message, setMessage] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // 模拟用户数据
  const [users] = useState<User[]>([
    {
      id: currentUserId,
      name: currentUserName,
      color: '#1976d2',
      status: 'online',
      role: 'owner',
      lastActive: new Date()
    },
    {
      id: 'user2',
      name: '张三',
      color: getRandomColor(),
      status: 'online',
      role: 'editor',
      lastActive: new Date(Date.now() - 5 * 60000)
    },
    {
      id: 'user3',
      name: '李四',
      color: getRandomColor(),
      status: 'offline',
      role: 'viewer',
      lastActive: new Date(Date.now() - 60 * 60000)
    }
  ]);

  // 模拟聊天消息
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: 'system',
      content: `欢迎来到实验"${experimentName}"的协作空间`,
      timestamp: new Date(Date.now() - 30 * 60000),
      type: 'system'
    },
    {
      id: '2',
      userId: 'user2',
      content: '我已经上传了最新的数据集，请大家查看',
      timestamp: new Date(Date.now() - 25 * 60000),
      type: 'text'
    },
    {
      id: '3',
      userId: currentUserId,
      content: '收到，我会检查数据并调整模型参数',
      timestamp: new Date(Date.now() - 20 * 60000),
      type: 'text'
    },
    {
      id: '4',
      userId: 'user2',
      content: '数据中有一些异常值，我们需要讨论如何处理',
      timestamp: new Date(Date.now() - 15 * 60000),
      type: 'text'
    },
    {
      id: '5',
      userId: 'system',
      content: '张三修改了实验参数：学习率从0.01调整为0.005',
      timestamp: new Date(Date.now() - 10 * 60000),
      type: 'action'
    }
  ]);

  // 模拟协作操作
  const [actions, setActions] = useState<CollaborationAction[]>([
    {
      id: 'action1',
      userId: 'user2',
      type: 'parameter_change',
      description: '修改学习率：0.01 → 0.005',
      timestamp: new Date(Date.now() - 10 * 60000),
      status: 'approved'
    },
    {
      id: 'action2',
      userId: 'user2',
      type: 'data_upload',
      description: '上传新数据集：dataset_v2.csv (2.3MB)',
      timestamp: new Date(Date.now() - 25 * 60000),
      status: 'approved'
    },
    {
      id: 'action3',
      userId: currentUserId,
      type: 'result_analysis',
      description: '添加准确率分析图表',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'pending'
    }
  ]);

  // 发送消息
  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      userId: currentUserId,
      content: message,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  // 处理回车键发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 发送邀请
  const handleSendInvite = () => {
    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setNotification({
        message: '请输入有效的邮箱地址',
        type: 'error'
      });
      return;
    }

    // 模拟发送邀请
    setTimeout(() => {
      setNotification({
        message: `已成功邀请 ${inviteEmail} 以 ${inviteRole === 'editor' ? '编辑者' : '查看者'} 身份加入实验`,
        type: 'success'
      });
      setInviteDialogOpen(false);
      setInviteEmail('');

      // 添加系统消息
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        userId: 'system',
        content: `${currentUserName} 邀请了 ${inviteEmail} 加入实验`,
        timestamp: new Date(),
        type: 'system'
      };
      setMessages(prev => [...prev, newMessage]);
    }, 1000);
  };

  // 关闭通知
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // 处理操作审批
  const handleActionApproval = (actionId: string, approved: boolean) => {
    setActions(prev => prev.map(action =>
      action.id === actionId
        ? { ...action, status: approved ? 'approved' : 'rejected' }
        : action
    ));

    // 添加系统消息
    const action = actions.find(a => a.id === actionId);
    if (action) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        userId: 'system',
        content: `${currentUserName} ${approved ? '批准' : '拒绝'}了 ${users.find(u => u.id === action.userId)?.name || '用户'} 的操作：${action.description}`,
        timestamp: new Date(),
        type: 'system'
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  // 获取用户信息
  const getUserInfo = (userId: string) => {
    if (userId === 'system') {
      return { name: '系统', color: '#757575' };
    }
    return users.find(u => u.id === userId) || { name: '未知用户', color: '#757575' };
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = now.getDate() - date.getDate();

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  // 创建模拟协作操作
  const createMockAction = (type: CollaborationAction['type']) => {
    let description = '';
    switch (type) {
      case 'parameter_change':
        description = '修改批量大小：32 → 64';
        break;
      case 'data_upload':
        description = '上传结果数据：results.csv (1.5MB)';
        break;
      case 'result_analysis':
        description = '添加混淆矩阵分析';
        break;
      case 'report_edit':
        description = '更新实验结论部分';
        break;
    }

    const newAction: CollaborationAction = {
      id: `action_${Date.now()}`,
      userId: currentUserId,
      type,
      description,
      timestamp: new Date(),
      status: 'pending'
    };

    setActions(prev => [...prev, newAction]);

    // 添加系统消息
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      userId: 'system',
      content: `${currentUserName} 请求 ${description}`,
      timestamp: new Date(),
      type: 'action'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
      {/* 头部 */}
      <Box sx={{
        p: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge
            badgeContent={users.filter(u => u.status === 'online').length}
            color="secondary"
            sx={{ mr: 1 }}
          >
            <PersonIcon />
          </Badge>
          <Typography variant="h6">
            {t('experiment.collaboration')}
          </Typography>
          <Chip
            label={experimentName}
            size="small"
            sx={{ ml: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }}
          />
        </Box>
        <Box>
          <Tooltip title={t('experiment.invite')}>
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setInviteDialogOpen(true)}
            >
              <PersonAddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 标签导航 */}
      <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
        <Box
          onClick={() => setActiveTab('chat')}
          sx={{
            px: 3,
            py: 1.5,
            cursor: 'pointer',
            borderBottom: activeTab === 'chat' ? 2 : 0,
            borderColor: 'primary.main',
            color: activeTab === 'chat' ? 'primary.main' : 'text.secondary',
            fontWeight: activeTab === 'chat' ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChatBubbleIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography>{t('experiment.chat')}</Typography>
        </Box>
        <Box
          onClick={() => setActiveTab('users')}
          sx={{
            px: 3,
            py: 1.5,
            cursor: 'pointer',
            borderBottom: activeTab === 'users' ? 2 : 0,
            borderColor: 'primary.main',
            color: activeTab === 'users' ? 'primary.main' : 'text.secondary',
            fontWeight: activeTab === 'users' ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography>{t('experiment.collaborators')}</Typography>
        </Box>
        <Box
          onClick={() => setActiveTab('actions')}
          sx={{
            px: 3,
            py: 1.5,
            cursor: 'pointer',
            borderBottom: activeTab === 'actions' ? 2 : 0,
            borderColor: 'primary.main',
            color: activeTab === 'actions' ? 'primary.main' : 'text.secondary',
            fontWeight: activeTab === 'actions' ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <HistoryIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography>{t('experiment.actions')}</Typography>
          {actions.some(a => a.status === 'pending' && a.userId !== currentUserId) && (
            <Badge
              badgeContent={actions.filter(a => a.status === 'pending' && a.userId !== currentUserId).length}
              color="error"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      </Box>

      {/* 内容区域 */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {/* 聊天内容 */}
        {activeTab === 'chat' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messages.map((msg, index) => (
                <Box key={msg.id} sx={{ mb: 2 }}>
                  {/* 日期分割线 */}
                  {index === 0 || formatDate(msg.timestamp) !== formatDate(messages[index - 1].timestamp) ? (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      my: 2
                    }}>
                      <Divider sx={{ flex: 1, mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(msg.timestamp)}
                      </Typography>
                      <Divider sx={{ flex: 1, ml: 1 }} />
                    </Box>
                  ) : null}

                  {/* 系统消息 */}
                  {msg.type === 'system' || msg.type === 'action' ? (
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      my: 1
                    }}>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ mr: 1 }}>
                              {msg.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(msg.timestamp)}
                            </Typography>
                          </Box>
                        }
                        variant="outlined"
                        size="small"
                        color={msg.type === 'action' ? 'primary' : 'default'}
                      />
                    </Box>
                  ) : (
                    // 用户消息
                    <Box sx={{
                      display: 'flex',
                      flexDirection: msg.userId === currentUserId ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      mb: 1
                    }}>
                      {/* 头像 */}
                      <Avatar
                        sx={{
                          bgcolor: getUserInfo(msg.userId).color,
                          width: 36,
                          height: 36,
                          fontSize: 16,
                          mr: msg.userId === currentUserId ? 0 : 1,
                          ml: msg.userId === currentUserId ? 1 : 0
                        }}
                      >
                        {getUserInfo(msg.userId).name.charAt(0)}
                      </Avatar>

                      {/* 消息内容 */}
                      <Box sx={{ maxWidth: '70%' }}>
                        {msg.userId !== currentUserId && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {getUserInfo(msg.userId).name}
                          </Typography>
                        )}
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            bgcolor: msg.userId === currentUserId ? 'primary.light' : 'background.default',
                            borderRadius: 2,
                            position: 'relative',
                            maxWidth: '100%',
                            wordBreak: 'break-word'
                          }}
                        >
                          <Typography variant="body2">
                            {msg.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              textAlign: msg.userId === currentUserId ? 'right' : 'left',
                              mt: 0.5
                            }}
                          >
                            {formatTime(msg.timestamp)}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>

            {/* 聊天输入框 */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder={t('experiment.typeMessage')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  multiline
                  maxRows={3}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  sx={{ ml: 1 }}
                >
                  <SendIcon />
                </IconButton>
              </Box>

              {/* 快捷操作按钮 */}
              <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                <Chip
                  size="small"
                  icon={<ShareIcon fontSize="small" />}
                  label={t('experiment.shareData')}
                  clickable
                  onClick={() => createMockAction('data_upload')}
                />
                <Chip
                  size="small"
                  icon={<EditIcon fontSize="small" />}
                  label={t('experiment.editParameters')}
                  clickable
                  onClick={() => createMockAction('parameter_change')}
                />
                <Chip
                  size="small"
                  icon={<HistoryIcon fontSize="small" />}
                  label={t('experiment.analyzeResults')}
                  clickable
                  onClick={() => createMockAction('result_analysis')}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* 用户列表 */}
        {activeTab === 'users' && (
          <List sx={{ overflow: 'auto', height: '100%' }}>
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <ListItem
                  secondaryAction={
                    user.id !== currentUserId && (
                      <Chip
                        label={
                          user.role === 'owner' ? t('permission.owner') :
                          user.role === 'editor' ? t('permission.editor') :
                          t('permission.viewer')
                        }
                        size="small"
                        color={
                          user.role === 'owner' ? 'primary' :
                          user.role === 'editor' ? 'info' :
                          'default'
                        }
                      />
                    )
                  }
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      color={
                        user.status === 'online' ? 'success' :
                        user.status === 'idle' ? 'warning' :
                        'error'
                      }
                    >
                      <Avatar sx={{ bgcolor: user.color }}>
                        {user.name.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user.name}
                        {user.id === currentUserId && (
                          <Chip label={t('common.you')} size="small" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      user.status === 'online'
                        ? t('user.online')
                        : t('user.lastActive', { time: formatTime(user.lastActive || new Date()) })
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}

        {/* 操作历史 */}
        {activeTab === 'actions' && (
          <List sx={{ overflow: 'auto', height: '100%' }}>
            {actions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((action) => (
              <React.Fragment key={action.id}>
                <ListItem
                  secondaryAction={
                    action.userId !== currentUserId && action.status === 'pending' ? (
                      <Box>
                        <Tooltip title={t('common.approve')}>
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleActionApproval(action.id, true)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.reject')}>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleActionApproval(action.id, false)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Chip
                        label={
                          action.status === 'approved' ? t('experiment.approved') :
                          action.status === 'rejected' ? t('experiment.rejected') :
                          t('experiment.pending')
                        }
                        size="small"
                        color={
                          action.status === 'approved' ? 'success' :
                          action.status === 'rejected' ? 'error' :
                          'warning'
                        }
                      />
                    )
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getUserInfo(action.userId).color }}>
                      {getUserInfo(action.userId).name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={action.description}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ mr: 1 }}>
                          {getUserInfo(action.userId).name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(action.timestamp)} {formatTime(action.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* 邀请对话框 */}
      <Dialog
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
      >
        <DialogTitle>{t('experiment.inviteCollaborator')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('auth.email')}
            type="email"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth>
            <InputLabel>{t('permission.role')}</InputLabel>
            <Select
              value={inviteRole}
              label={t('permission.role')}
              onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
            >
              <MenuItem value="editor">{t('permission.editor')} - 可编辑实验</MenuItem>
              <MenuItem value="viewer">{t('permission.viewer')} - 只能查看实验</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSendInvite} variant="contained">{t('common.send')}</Button>
        </DialogActions>
      </Dialog>

      {/* 通知提示 */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExperimentCollaboration;
