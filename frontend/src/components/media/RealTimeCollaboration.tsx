import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  Alert
} from '@mui/material';
import { Screenshare as Screenshare, chat as chat, PeopleIcon as PeopleIcon, share as share, share as share, FiberManualRecordIcon as RecordIcon, StopIcon as StopIcon } from '../../utils/icons';

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  isTyping?: boolean;
}

interface chatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'file' | 'analysis_result';
  metadata?: any;
}

interface CollaborationSession {
  id: string;
  name: string;
  users: User[];
  isActive: boolean;
  createdAt: Date;
}

interface RealTimeCollaborationProps {
  experimentId?: string;
  onSessionChange?: (session: CollaborationSession | null) => void;
}

const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
  experimentId,
  onSessionChange
}) => {
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chatMessages, setchatMessages] = useState<chatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showchat, setShowchat] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ģ���û�����
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: '�Ų�ʿ',
        status: 'online',
        avatar: '/avatars/zhang.jpg'
      },
      {
        id: '2',
        name: '���о�Ա',
        status: 'online',
        avatar: '/avatars/li.jpg'
      },
      {
        id: '3',
        name: '������',
        status: 'away',
        avatar: '/avatars/wang.jpg'
      }
    ];
    setUsers(mockUsers);

    // ģ��Э���Ự
    const mockSession: CollaborationSession = {
      id: 'session-' + Date.now(),
      name: `ʵ�����Э�� - ${experimentId || '�»Ự'}`,
      users: mockUsers.filter(u => u.status === 'online'),
      isActive: true,
      createdAt: new Date()
    };
    setCurrentSession(mockSession);
    onSessionChange?.(mockSession);

    // ģ���ʼ������Ϣ
    const initialMessages: chatMessage[] = [
      {
        id: '1',
        userId: '1',
        userName: '�Ų�ʿ',
        message: '��Һã����ǿ�ʼ�������ʵ������ݰ�',
        timestamp: new Date(Date.now() - 300000),
        type: 'text'
      },
      {
        id: '2',
        userId: '2',
        userName: '���о�Ա',
        message: '�Ҹո��ϴ������µ�OCRʶ���������Ҳ鿴',
        timestamp: new Date(Date.now() - 180000),
        type: 'file',
        metadata: { fileName: 'ocr_results_v2.json' }
      }
    ];
    setchatMessages(initialMessages);
  }, [experimentId, onSessionChange]);

  // �Զ�����������ײ�
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: chatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: '��ǰ�û�',
      message: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setchatMessages(prev => [...prev, message]);
    setNewMessage('');

    // ģ��AI���ֻظ�
    setTimeout(() => {
      const aiResponse: chatMessage = {
        id: (Date.now() + 1).toString(),
        userId: 'ai-assistant',
        userName: 'AI����',
        message: '���Ѿ��յ�������Ϣ�����ڷ����������...',
        timestamp: new Date(),
        type: 'text'
      };
      setchatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping) {
      setIsTyping(true);
    }

    // ���֮ǰ�Ķ�ʱ��
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // �����µĶ�ʱ��
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const startScreenshare = async () => {
    try {
      setIsScreenSharing(true);
      // ����ʵ��Ӧ�õ�����Ļ����api
      console.log('��ʼ��Ļ����');
    } catch (error) {
      console.error('��Ļ����ʧ��:', error);
      setIsScreenSharing(false);
    }
  };

  const StopIconScreenshare = () => {
    setIsScreenSharing(false);
    console.log('ֹͣ��Ļ����');
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      // ����ʵ��Ӧ�õ���¼��api
      console.log('��ʼ¼��');
    } catch (error) {
      console.error('¼��ʧ��:', error);
      setIsRecording(false);
    }
  };

  const StopIconRecording = () => {
    setIsRecording(false);
    console.log('ֹͣ¼��');
  };

  const shareAnalysisResult = async () => {
    // ģ������������
    const analysisMessage: chatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: '��ǰ�û�',
      message: '������AI�������',
      timestamp: new Date(),
      type: 'analysis_result',
      metadata: {
        analysisType: '����ʶ��',
        confidence: 0.95,
        results: '��⵽�ؼ��ʣ�ʵ�顢���ݡ��������¶ȡ�ѹ��'
      }
    };

    setchatMessages(prev => [...prev, analysisMessage]);
  };

  const renderchatMessage = (message: chatMessage) => {
    const isCurrentUser = message.userId === 'current-user';
    const isAI = message.userId === 'ai-assistant';

    return (
      <div
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
          mb: 1
        }}
      >
        <div
          sx={{
            maxWidth: '70%',
            p: 1,
            borderRadius: 2,
            bgcolor: isCurrentUser 
              ? 'primary.main' 
              : isAI 
                ? 'secondary.light' 
                : 'grey.100',
            color: isCurrentUser ? 'white' : 'text.primary'
          }}
        >
          <Typography variant="caption" display="block">
            {message.userName}
          </Typography>
          <Typography variant="body2">
            {message.message}
          </Typography>
          {message.type === 'analysis_result' && (
            <div sx={{ mt: 1, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
              <Typography variant="caption">
                ��������: {message.metadata?.analysisType}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {message.metadata?.results}
              </Typography>
            </div>
          )}
          <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
            {message.timestamp.toLocaleTimeString()}
          </Typography>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Э�������� */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">ʵʱЭ��</Typography>
            {currentSession && (
              <Chip 
                label={`${currentSession.users.length} ������`}
                color="primary"
                size="small"
              />
            )}
          </div>
          
          <div sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="�û��б�">
              <IconButton onClick={() => setShowUsers(true)}>
                <Badge badgeContent={users.filter(u => u.status === 'online').length} color="primary">
                  <PeopleIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="����">
              <IconButton onClick={() => setShowchat(true)}>
                <Badge badgeContent={chatMessages.length > 5 ? '5+' : chatMessages.length} color="secondary">
                  <ChatIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isScreenSharing ? "ֹͣ����" : "��Ļ����"}>
              <IconButton 
                onClick={isScreenSharing ? StopIconScreenshare : startScreenshare}
                color={isScreenSharing ? "secondary" : "default"}
              >
                <Screenshare />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isRecording ? "ֹͣ¼��" : "��ʼ¼��"}>
              <IconButton 
                onClick={isRecording ? StopIconRecording : startRecording}
                color={isRecording ? "error" : "default"}
              >
                {isRecording ? <StopIcon /> : <RecordIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="�����������">
              <IconButton onClick={shareAnalysisResult}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* ״ָ̬ʾ�� */}
        {(isScreenSharing || isRecording) && (
          <div sx={{ mt: 2 }}>
            {isScreenSharing && (
              <Alert severity="info" sx={{ mb: 1 }}>
                ���ڹ�����Ļ...
              </Alert>
            )}
            {isRecording && (
              <Alert severity="warning">
                ����¼�ƻỰ...
              </Alert>
            )}
          </div>
        )}
      </Paper>

      {/* �����û��б��Ի��� */}
      <Dialog open={showUsers} onClose={() => setShowUsers(false)} maxWidth="sm" fullWidth>
        <DialogTitle>�����û�</DialogTitle>
        <DialogContent>
          <List>
            {users.map((user) => (
              <ListItem key={user.id}>
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color={
                      user.status === 'online' ? 'success' : 
                      user.status === 'away' ? 'warning' : 'default'
                    }
                  >
                    <Avatar src={user.avatar}>{user.name[0]}</Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.name}
                  secondary={
                    <div sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={user.status} 
                        size="small" 
                        color={
                          user.status === 'online' ? 'success' : 
                          user.status === 'away' ? 'warning' : 'default'
                        }
                      />
                      {user.isTyping && (
                        <Typography variant="caption" color="primary">
                          ��������...
                        </Typography>
                      )}
                    </div>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUsers(false)}>�ر�</Button>
        </DialogActions>
      </Dialog>

      {/* ����Ի��� */}
      <Dialog open={showchat} onClose={() => setShowchat(false)} maxWidth="md" fullWidth>
        <DialogTitle>�Ŷ�����</DialogTitle>
        <DialogContent>
          <div
            ref={chatRef}
            sx={{
              height: 400,
              overflowY: 'auto',
              mb: 2,
              p: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            {chatMessages.map(renderchatMessage)}
            
            {/* ��������ָʾ�� */}
            {users.some(u => u.isTyping) && (
              <div sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <div
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'grey.100',
                    fontStyle: 'italic'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {users.filter(u => u.isTyping).map(u => u.name).join(', ')} ��������...
                  </Typography>
                </div>
              </div>
            )}
          </div>
          
          <div sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="������Ϣ..."
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              multiline
              maxRows={3}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <ShareIcon />
            </Button>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowchat(false)}>�ر�</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RealTimeCollaboration;


