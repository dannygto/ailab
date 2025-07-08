import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import { PeopleIcon, ChatIcon, ShareIcon, RefreshIcon } from '../../utils/icons';

interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
  metadata?: any;
}

interface RealTimeCollaborationProps {
  experimentId: string;
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({ experimentId }) => {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showchat, setShowchat] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const shareAnalysisResult = () => {
    console.log('分享分析结果');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: 'current-user',
        message: newMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">实时协作</Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="在线用户">
            <IconButton onClick={() => setShowUsers(true)}>
              <Badge badgeContent={users.length} color="primary">
                <PeopleIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="团队聊天">
            <IconButton onClick={() => setShowchat(true)}>
              <Badge badgeContent={messages.length} color="secondary">
                <ChatIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="分享结果">
            <IconButton onClick={shareAnalysisResult}>
              <ShareIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="刷新">
            <IconButton>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {messages.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            最新消息
          </Typography>
          {messages.slice(-3).map((message) => (
            <Box key={message.id} sx={{ mt: 1, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
              <Typography variant="caption">
                用户: {message.message}
                {message.metadata?.results && (
                  <Box sx={{ mt: 0.5 }}>
                    {message.metadata.results}
                  </Box>
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* 用户列表对话框 */}
      <Dialog open={showUsers} onClose={() => setShowUsers(false)} maxWidth="sm" fullWidth>
        <DialogTitle>在线用户</DialogTitle>
        <DialogContent>
          <List>
            {users.map((user) => (
              <ListItem key={user.id}>
                <Avatar src={user.avatar}>{user.name[0]}</Avatar>
                <ListItemText
                  primary={user.name}
                  secondary={
                    <Chip
                      size="small"
                      label={user.isOnline ? '在线' : '离线'}
                      color={user.isOnline ? 'success' : 'default'}
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUsers(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 聊天对话框 */}
      <Dialog open={showchat} onClose={() => setShowchat(false)} maxWidth="md" fullWidth>
        <DialogTitle>团队聊天</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 300, overflowY: 'auto', mb: 2 }}>
            {messages.map((message) => (
              <Box key={message.id} sx={{ mb: 1, p: 1, borderRadius: 1, bgcolor: 'background.default' }}>
                <Typography variant="body2">
                  <strong>用户:</strong> {message.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="输入消息..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              发送
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowchat(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RealTimeCollaboration;
