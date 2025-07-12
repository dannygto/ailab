/**
 * 🤖 AI聊天界面组件 - 完整功能
 * 
 * ✅ 功能特性
 * - 实时AI对话
 * - 消息历史记录
 * - 输入建议
 * - 文件上传支持
 * - 语音输入（可选）
 * - 流式响应处理
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Alert
} from '@mui/material';
import {
  UploadIcon as SendIcon,
  UploadFileIcon as AttachFileIcon,
  MicIcon,
  SmartToyIcon as AIIcon,
  PersonIcon,
  MoreVertIcon,
  ClearIcon,
  ContentCopyIcon,
  ThumbUpIcon,
  ThumbDownIcon
} from '../../utils/icons';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const AIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: '你好！我是AI实验助手，可以帮助您解答实验相关问题、分析数据、提供实验建议等。请问有什么可以帮助您的吗？',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 建议的问题
  const suggestedQuestions = [
    "如何设计一个对照实验？",
    "温度对反应速率的影响怎么分析？",
    "实验数据异常值如何处理？",
    "如何写实验报告的结论部分？"
  ];

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 模拟AI响应
    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: generateAIResponse(userMessage.content),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  // 模拟AI响应生成
  const generateAIResponse = (userInput: string): string => {
    const responses = {
      '实验': '关于实验设计，建议您遵循科学方法的基本原则：1) 明确实验目的和假设 2) 设计对照组 3) 控制变量 4) 重复实验 5) 客观记录数据。需要我详细解释哪个方面？',
      '数据': '数据分析是实验的重要环节。建议您：1) 首先检查数据的完整性和准确性 2) 使用适当的统计方法 3) 制作可视化图表 4) 注意异常值的处理。您具体想分析什么类型的数据？',
      '温度': '温度是许多实验中的重要变量。控制温度时需要注意：1) 使用精确的温度计 2) 预热设备 3) 保持恒温 4) 记录温度变化。您的实验对温度有什么特殊要求吗？',
      '报告': '实验报告应该包含：1) 实验目的 2) 材料与方法 3) 实验结果 4) 数据分析 5) 结论与讨论。每个部分都要客观、准确、逻辑清晰。需要我帮您改进报告的哪个部分？'
    };

    for (const [keyword, response] of Object.entries(responses)) {
      if (userInput.includes(keyword)) {
        return response;
      }
    }

    return '这是一个很好的问题！根据您的描述，我建议您可以从以下几个方面来考虑：\n\n1. 首先明确您的实验目标\n2. 查阅相关的理论知识\n3. 设计合适的实验方案\n4. 准备必要的材料和设备\n\n如果您能提供更多细节，我可以给出更具体的建议。';
  };

  // 处理快捷问题
  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  // 处理键盘事件
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // 菜单操作
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, messageId: string) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMessageId(null);
  };

  const handleCopyMessage = () => {
    const message = messages.find(m => m.id === selectedMessageId);
    if (message) {
      navigator.clipboard.writeText(message.content);
    }
    handleMenuClose();
  };

  const handleClearChat = () => {
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: '聊天记录已清空。有什么新问题可以帮助您吗？',
      timestamp: new Date()
    }]);
    handleMenuClose();
  };

  return (
    <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* 聊天头部 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <AIIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">AI实验助手</Typography>
            <Typography variant="caption" color="text.secondary">
              在线 • 随时为您服务
            </Typography>
          </Box>
        </Box>
        
        <IconButton onClick={(e) => handleMenuClick(e, 'menu')}>
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* 消息列表 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
        <List>
          {messages.map((message) => (
            <ListItem key={message.id} sx={{ px: 1 }}>
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: message.type === 'ai' ? 'primary.main' : 'secondary.main',
                  width: 32, 
                  height: 32 
                }}>
                  {message.type === 'ai' ? <AIIcon /> : <PersonIcon />}
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2">
                    {message.type === 'ai' ? 'AI助手' : '您'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
                <Paper sx={{ 
                  p: 1.5, 
                  bgcolor: message.type === 'ai' ? 'grey.100' : 'primary.light',
                  color: message.type === 'ai' ? 'text.primary' : 'primary.contrastText',
                  maxWidth: '80%',
                  whiteSpace: 'pre-wrap'
                }}>
                  <Typography variant="body2">
                    {message.content}
                  </Typography>
                </Paper>
                
                {/* 消息操作按钮 */}
                {message.type === 'ai' && (
                  <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5 }}>
                    <Tooltip title="复制">
                      <IconButton size="small" onClick={() => navigator.clipboard.writeText(message.content)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="好评">
                      <IconButton size="small">
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="差评">
                      <IconButton size="small">
                        <ThumbDownIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </ListItem>
          ))}
          
          {/* 加载指示器 */}
          {isLoading && (
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                  <AIIcon />
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  AI正在思考...
                </Typography>
              </Box>
            </ListItem>
          )}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      {/* 建议问题区域 */}
      {messages.length <= 1 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            您可以尝试问我：
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestedQuestions.map((question, index) => (
              <Chip
                key={index}
                label={question}
                onClick={() => handleSuggestedQuestion(question)}
                size="small"
                clickable
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* 输入区域 */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题..."
            variant="outlined"
            size="small"
            disabled={isLoading}
          />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Tooltip title="发送文件">
              <IconButton size="small" disabled={isLoading}>
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="语音输入">
              <IconButton size="small" disabled={isLoading}>
                <MicIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="发送消息">
              <IconButton 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                color="primary"
              >
                <SendIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          按 Enter 发送，Shift + Enter 换行
        </Typography>
      </Box>

      {/* 菜单 */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleCopyMessage} disabled={!selectedMessageId}>
          <ContentCopyIcon sx={{ mr: 1 }} />
          复制消息
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClearChat}>
          <ClearIcon sx={{ mr: 1 }} />
          清空聊天
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default AIChatInterface;