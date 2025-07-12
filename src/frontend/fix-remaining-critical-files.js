const fs = require('fs');
const path = require('path');

// 彻底重写严重损坏的文件
const criticalFiles = [
  {
    file: 'src/components/media/RealTimeCollaboration.tsx',
    content: `import React, { useState, useEffect } from 'react';
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
import { PeopleIcon, ChatIcon, ShareIcon, RefreshIcon } from '../utils/icons';

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
`
  },
  {
    file: 'src/components/media/SpeechToTextComponent.tsx',
    content: `import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import { MicIcon, StopIcon, UploadIcon } from '../utils/icons';

interface TranscriptionResult {
  text: string;
  confidence: number;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

interface SpeechToTextComponentProps {
  onTranscriptionComplete?: (result: TranscriptionResult) => void;
}

const SpeechToTextComponent: React.FC<SpeechToTextComponentProps> = ({ 
  onTranscriptionComplete 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('zh-CN');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = () => {
    setIsRecording(true);
    setError(null);
    // 实现录音逻辑
  };

  const stopRecording = () => {
    setIsRecording(false);
    // 停止录音并处理音频
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setError(null);
    }
  };

  const processAudio = async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 模拟音频处理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: TranscriptionResult = {
        text: '这是一个示例转录结果。',
        confidence: 0.95,
        segments: [
          { start: 0, end: 2.5, text: '这是一个' },
          { start: 2.5, end: 5.0, text: '示例转录结果。' }
        ]
      };

      setResult(mockResult);
      onTranscriptionComplete?.(mockResult);
    } catch (err) {
      setError('音频处理失败，请重试。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        语音转文字
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>语言</InputLabel>
          <Select
            value={language}
            label="语言"
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="zh-CN">中文 (普通话)</MenuItem>
            <MenuItem value="en-US">English (US)</MenuItem>
            <MenuItem value="ja-JP">日本語</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant={isRecording ? "contained" : "outlined"}
            color={isRecording ? "error" : "primary"}
            startIcon={isRecording ? <StopIcon /> : <MicIcon />}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? '停止录音' : '开始录音'}
          </Button>

          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            上传音频文件
          </Button>
        </Box>
      </Box>

      {audioFile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            已选择文件: {audioFile.name}
          </Typography>
          <audio ref={audioRef} controls style={{ width: '100%' }} />
        </Box>
      )}

      {audioFile && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={processAudio}
            disabled={isProcessing}
            fullWidth
          >
            {isProcessing ? '处理中...' : '开始转录'}
          </Button>
        </Box>
      )}

      {result && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            转录结果
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="body1">{result.text}</Typography>
          </Paper>

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            置信度: {(result.confidence * 100).toFixed(1)}%
          </Typography>

          {result.segments && result.segments.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                时间分段
              </Typography>
              {result.segments.map((segment, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2">
                    {segment.start.toFixed(1)}s - {segment.end.toFixed(1)}s: {segment.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SpeechToTextComponent;
`
  },
  {
    file: 'src/components/mobile/MobileDeviceCard.tsx',
    content: `import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
  LinearProgress,
  Button,
  Grid
} from '@mui/material';
import { ExpandMoreIcon, ExpandLessIcon, PowerIcon, SettingsIcon } from '../utils/icons';

interface DeviceMetric {
  name: string;
  value: number;
  unit: string;
  color: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  location: string;
  description?: string;
  metrics: DeviceMetric[];
  lastUpdate: Date;
}

interface MobileDeviceCardProps {
  device: Device;
  onControl?: (deviceId: string, action: string) => void;
  onConfigure?: (deviceId: string) => void;
}

const MobileDeviceCard: React.FC<MobileDeviceCardProps> = ({
  device,
  onControl,
  onConfigure
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return '在线';
      case 'offline': return '离线';
      case 'maintenance': return '维护中';
      default: return '未知';
    }
  };

  return (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" noWrap>
              {device.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {device.type} · {device.location}
            </Typography>
          </Box>
          
          <Chip
            label={getStatusLabel(device.status)}
            color={getStatusColor(device.status) as any}
            size="small"
          />
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {device.metrics.map((metric, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    {metric.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {metric.value} {metric.unit}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={metric.value}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))}

            {device.description && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  设备描述
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {device.description}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            最后更新: {device.lastUpdate.toLocaleString()}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => setExpanded(!expanded)}
            aria-label="展开详情"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PowerIcon />}
              onClick={() => onControl?.(device.id, 'toggle')}
              disabled={device.status === 'maintenance'}
              fullWidth
            >
              {device.status === 'online' ? '关闭' : '开启'}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => onConfigure?.(device.id)}
              fullWidth
            >
              配置
            </Button>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
};

export default MobileDeviceCard;
`
  },
  {
    file: 'src/components/mobile/MobileNavigation.tsx',
    content: `import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box
} from '@mui/material';
import { 
  MenuIcon, 
  HomeIcon, 
  ExperimentIcon, 
  DeviceIcon, 
  SettingsIcon,
  LogoutIcon
} from '../utils/icons';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MobileNavigationProps {
  title?: string;
  onLogout?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  title = "AICAM System",
  onLogout 
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    { label: '首页', path: '/', icon: <HomeIcon /> },
    { label: '实验管理', path: '/experiments', icon: <ExperimentIcon /> },
    { label: '设备管理', path: '/devices', icon: <DeviceIcon /> },
    { label: '系统设置', path: '/settings', icon: <SettingsIcon /> },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    onLogout?.();
    setDrawerOpen(false);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h6" noWrap>
          {title}
        </Typography>
      </Box>

      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isCurrentPath(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon sx={{ color: isCurrentPath(item.path) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                sx={{ color: isCurrentPath(item.path) ? 'primary.main' : 'inherit' }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="退出登录" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="打开菜单"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{
          keepMounted: true, // 在移动端提高性能
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default MobileNavigation;
`
  }
];

// 执行文件重写
function rewriteFile(filePath, content) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const dir = path.dirname(fullPath);
    
    // 确保目录存在
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ 重写文件: ${filePath}`);
  } catch (error) {
    console.error(`❌ 重写文件失败 ${filePath}:`, error.message);
  }
}

// 批量重写文件
criticalFiles.forEach(({ file, content }) => {
  rewriteFile(file, content);
});

console.log('\\n🎉 批量修复完成！');
console.log('已重写以下严重损坏的文件:');
criticalFiles.forEach(({ file }) => {
  console.log(`  - ${file}`);
});
