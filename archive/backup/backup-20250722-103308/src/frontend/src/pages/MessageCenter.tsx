import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Badge,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  Select,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  TablePagination
} from '@mui/material';
import {
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import NoDataPlaceholder from '../components/common/NoDataPlaceholder';
import messageService from '../services/messageService';
import { Message } from '../types';

// 消息中心页面组件
const MessageCenter: React.FC = () => {
  const queryClient = useQueryClient();

  // 状态
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [messageDetailOpen, setMessageDetailOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 使用React Query获取消息
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch
  } = useQuery<Message[]>('messages', () => messageService.getMessages());

  // 标记消息为已读
  const markAsReadMutation = useMutation(
    async (messageIds: string[]) => {
      return await messageService.markAsRead(messageIds);
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData<Message[] | undefined>(
          'messages',
          (oldMessages) => {
            if (!oldMessages) return undefined;
            return oldMessages.map(msg =>
              data.messageIds.includes(msg.id) ? { ...msg, read: true } : msg
            );
          }
        );
        toast.success(`已将${data.messageIds.length}条消息标记为已读`);
      },
      onError: () => {
        toast.error('操作失败，请重试');
      }
    }
  );

  // 星标/取消星标消息
  const toggleStarMutation = useMutation(
    async ({ messageId, starred }: { messageId: string; starred: boolean }) => {
      return await messageService.toggleStar(messageId, starred);
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData<Message[] | undefined>(
          'messages',
          (oldMessages) => {
            if (!oldMessages) return undefined;
            return oldMessages.map(msg =>
              msg.id === data.messageId ? { ...msg, starred: data.starred } : msg
            );
          }
        );
      },
      onError: () => {
        toast.error('操作失败，请重试');
      }
    }
  );

  // 删除消息
  const deleteMessageMutation = useMutation(
    async (messageIds: string[]) => {
      return await messageService.deleteMessages(messageIds);
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData<Message[] | undefined>(
          'messages',
          (oldMessages) => {
            if (!oldMessages) return undefined;
            return oldMessages.filter(msg => !data.messageIds.includes(msg.id));
          }
        );
        toast.success(`已删除${data.messageIds.length}条消息`);
        setSelectedMessages([]);
      },
      onError: () => {
        toast.error('删除失败，请重试');
      }
    }
  );

  // 处理标签切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 处理菜单打开
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 处理菜单关闭
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // 处理标记为已读
  const handleMarkAsRead = () => {
    if (selectedMessages.length > 0) {
      markAsReadMutation.mutate(selectedMessages);
    } else {
      // 获取当前筛选后且未读的消息
      const unreadMessages = filteredMessages.filter(msg => !msg.read).map(msg => msg.id);
      if (unreadMessages.length > 0) {
        markAsReadMutation.mutate(unreadMessages);
      }
    }
  };

  // 处理消息星标
  const handleToggleStar = (messageId: string, currentStarred: boolean) => {
    toggleStarMutation.mutate({ messageId, starred: !currentStarred });
  };

  // 处理消息删除
  const handleDelete = () => {
    if (selectedMessages.length > 0) {
      deleteMessageMutation.mutate(selectedMessages);
    }
  };

  // 处理消息选择
  const handleSelectMessage = (messageId: string) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  // 处理全选/取消全选
  const handleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(msg => msg.id));
    }
  };

  // 处理消息点击，查看详情
  const handleMessageClick = (messageId: string) => {
    // 如果消息未读，标记为已读
    const message = messages.find(msg => msg.id === messageId);
    if (message && !message.read) {
      markAsReadMutation.mutate([messageId]);
    }
    setSelectedMessageId(messageId);
    setMessageDetailOpen(true);
  };

  // 关闭消息详情对话框
  const handleCloseMessageDetail = () => {
    setMessageDetailOpen(false);
  };

  // 根据标签过滤消息
  const getMessagesByTab = (messages: Message[]) => {
    switch (tabValue) {
      case 0: // 全部
        return messages;
      case 1: // 系统通知
        return messages.filter(msg => msg.type === 'system' || msg.type === 'announcement');
      case 2: // 实验消息
        return messages.filter(msg => msg.type === 'experiment');
      case 3: // 个人消息
        return messages.filter(msg => msg.type === 'personal');
      case 4: // 星标消息
        return messages.filter(msg => msg.starred);
      case 5: // 未读消息
        return messages.filter(msg => !msg.read);
      default:
        return messages;
    }
  };

  // 处理页码变化
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // 处理每页行数变化
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 应用所有过滤器
  const applyFilters = (messages: Message[]) => {
    return messages.filter(msg => {
      // 搜索词过滤
      const matchesSearch =
        searchTerm === '' ||
        msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender.name.toLowerCase().includes(searchTerm.toLowerCase());

      // 消息类型过滤
      const matchesType =
        filterType === 'all' ||
        msg.type === filterType;

      // 优先级过滤
      const matchesPriority =
        filterPriority === 'all' ||
        msg.priority === filterPriority;

      // 已读/未读状态过滤
      const matchesReadStatus =
        filterRead === 'all' ||
        (filterRead === 'read' && msg.read) ||
        (filterRead === 'unread' && !msg.read);

      return matchesSearch && matchesType && matchesPriority && matchesReadStatus;
    });
  };

  // 获取过滤后的消息
  const filteredMessages = applyFilters(getMessagesByTab(messages || []));

  // 获取分页后的消息
  const paginatedMessages = filteredMessages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // 获取未读消息数量
  const unreadCount = messages?.filter(msg => !msg.read).length || 0;

  // 获取每个标签页的消息数量
  const allCount = messages?.length || 0;
  const systemCount = messages?.filter(msg => msg.type === 'system' || msg.type === 'announcement').length || 0;
  const experimentCount = messages?.filter(msg => msg.type === 'experiment').length || 0;
  const personalCount = messages?.filter(msg => msg.type === 'personal').length || 0;
  const starredCount = messages?.filter(msg => msg.starred).length || 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        消息中心
      </Typography>

      <Grid container spacing={3}>
        {/* 消息统计卡片 */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-around' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{allCount}</Typography>
              <Typography variant="body2" color="textSecondary">全部消息</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="error">{unreadCount}</Typography>
              <Typography variant="body2" color="textSecondary">未读消息</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{systemCount}</Typography>
              <Typography variant="body2" color="textSecondary">系统通知</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{experimentCount}</Typography>
              <Typography variant="body2" color="textSecondary">实验消息</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{personalCount}</Typography>
              <Typography variant="body2" color="textSecondary">个人消息</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 消息列表与工具栏 */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            {/* 消息分类标签 */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab
                label={
                  <Badge badgeContent={allCount} color="primary">
                    全部消息
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={systemCount} color="primary">
                    系统通知
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={experimentCount} color="primary">
                    实验消息
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={personalCount} color="primary">
                    个人消息
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={starredCount} color="primary">
                    星标消息
                  </Badge>
                }
              />
              <Tab
                label={
                  <Badge badgeContent={unreadCount} color="error">
                    未读消息
                  </Badge>
                }
              />
            </Tabs>

            {/* 工具栏 */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* 左侧操作按钮 */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<MarkEmailReadIcon />}
                  onClick={handleMarkAsRead}
                  disabled={unreadCount === 0}
                >
                  标记已读
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  disabled={selectedMessages.length === 0}
                  color="error"
                >
                  删除
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  刷新
                </Button>
                <IconButton onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>

                {/* 更多操作菜单 */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleSelectAll}>
                    {selectedMessages.length === filteredMessages.length ? '取消全选' : '全选'}
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>归档选中消息</MenuItem>
                  <MenuItem onClick={() => {
                    // 导出消息为JSON
                    const dataStr = JSON.stringify(filteredMessages);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

                    const exportFileDefaultName = `messages-export-${new Date().toISOString().slice(0,10)}.json`;

                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', exportFileDefaultName);
                    linkElement.click();

                    handleMenuClose();
                    toast.success('消息已导出');
                  }}>导出消息</MenuItem>
                  <Divider />
                  <MenuItem onClick={() => {
                    handleMenuClose();
                    // 打开消息设置对话框或导航到消息设置页面
                    window.location.href = '/settings/user-simplified';
                  }}>
                    消息设置
                  </MenuItem>
                </Menu>
              </Box>

              {/* 右侧搜索和过滤 */}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  placeholder="搜索消息..."
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm('')}
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{ width: 200 }}
                />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="all">全部类型</MenuItem>
                    <MenuItem value="system">系统通知</MenuItem>
                    <MenuItem value="experiment">实验消息</MenuItem>
                    <MenuItem value="personal">个人消息</MenuItem>
                    <MenuItem value="announcement">平台公告</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="all">全部优先级</MenuItem>
                    <MenuItem value="low">低</MenuItem>
                    <MenuItem value="medium">中</MenuItem>
                    <MenuItem value="high">高</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={filterRead}
                    onChange={(e) => setFilterRead(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="all">全部状态</MenuItem>
                    <MenuItem value="read">已读</MenuItem>
                    <MenuItem value="unread">未读</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Divider />

            {/* 消息列表 */}
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="error">加载消息失败，请重试</Typography>
                <Button
                  variant="outlined"
                  onClick={() => refetch()}
                  sx={{ mt: 2 }}
                >
                  重新加载
                </Button>
              </Box>
            ) : filteredMessages.length === 0 ? (
              <NoDataPlaceholder
                message="没有符合条件的消息"
                suggestion="尝试调整过滤条件或清除搜索词"
              />
            ) : (
              <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                {paginatedMessages.map((message) => (
                  <React.Fragment key={message.id}>
                    <ListItem
                      alignItems="flex-start"
                      selected={selectedMessages.includes(message.id)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: message.read ? 'inherit' : 'action.hover',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      }}
                    >
                      <Checkbox
                        checked={selectedMessages.includes(message.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMessage(message.id);
                        }}
                        sx={{ mr: 1 }}
                      />
                      <Box
                        sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1 }}
                        onClick={() => handleMessageClick(message.id)}
                      >
                      <ListItemAvatar>
                        <Avatar src={message.sender.avatar} alt={message.sender.name}>
                          {message.sender.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              component="span"
                              variant="body1"
                              fontWeight={message.read ? 'normal' : 'bold'}
                            >
                              {message.title}
                            </Typography>
                            {!message.read && (
                              <Chip
                                label="未读"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 20 }}
                              />
                            )}
                            {message.priority === 'high' && (
                              <Chip
                                label="重要"
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ height: 20 }}
                              />
                            )}
                            {message.priority === 'high' && (
                              <Chip
                                label="紧急"
                                size="small"
                                color="error"
                                sx={{ height: 20 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {message.sender.name}
                            </Typography>
                            {" — "}{message.content}
                            {message.relatedExperiment && (
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={`实验: ${message.relatedExperiment.name}`}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // 跳转到相关实验
                                  }}
                                />
                              </Box>
                            )}
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', mt: 1 }}
                            >
                              {format(new Date(message.createdAt), 'yyyy-MM-dd HH:mm')}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                      </Box>
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(message.id, message.starred);
                          }}
                        >
                          {message.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}

            {/* 分页控件 */}
            <TablePagination
              component="div"
              count={filteredMessages.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelRowsPerPage="每页行数:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* 消息详情对话框 */}
      <Dialog
        open={messageDetailOpen}
        onClose={handleCloseMessageDetail}
        maxWidth="md"
        fullWidth
      >
        {selectedMessageId && (
          <>
            {(() => {
              const message = messages.find(msg => msg.id === selectedMessageId);
              if (!message) return null;

              return (
                <>
                  <DialogTitle>
                    <Typography variant="h6">{message.title}</Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {format(new Date(message.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </Typography>
                  </DialogTitle>
                  <DialogContent dividers>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        发送人：{message.sender.name}
                      </Typography>
                      {message.relatedExperiment && (
                        <Chip
                          label={`相关实验: ${message.relatedExperiment.name}`}
                          size="small"
                          color="info"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
                      {message.content}
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => handleToggleStar(message.id, message.starred)}
                      startIcon={message.starred ? <StarIcon color="warning" /> : <StarBorderIcon />}
                    >
                      {message.starred ? '取消星标' : '标为星标'}
                    </Button>
                    <Button
                      onClick={() => {
                        deleteMessageMutation.mutate([message.id]);
                        handleCloseMessageDetail();
                      }}
                      color="error"
                      startIcon={<DeleteIcon />}
                    >
                      删除
                    </Button>
                    {message.relatedExperiment && (
                      <Button
                        color="primary"
                        onClick={() => {
                          // 导航到实验详情页
                          window.location.href = `/experiments/${message.relatedExperiment?.id}`;
                        }}
                      >
                        查看实验
                      </Button>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Button onClick={handleCloseMessageDetail}>关闭</Button>
                  </DialogActions>
                </>
              );
            })()}
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MessageCenter;
