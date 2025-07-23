import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Drawer,
  Tabs,
  Tab,
  Collapse,
  Tooltip,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Send as SendIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon,
  BugReport as BugReportIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as LightbulbIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Psychology as PsychologyIcon,
  SyncAlt as SyncAltIcon,
  Dataset as DatasetIcon,
  Science as ScienceIcon,
  ModelTraining as ModelTrainingIcon,
  PlayArrow as PlayArrowIcon,
  LibraryBooks as LibraryBooksIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// 消息类型定义
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'code' | 'visualization' | 'parameter' | 'data';
  metadata?: any;
}

// 实验参数类型定义
interface ExperimentParameter {
  id: string;
  name: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  description?: string;
  category: 'model' | 'data' | 'training' | 'evaluation';
}

// 实验数据集类型定义
interface ExperimentDataset {
  id: string;
  name: string;
  description: string;
  size: string;
  format: string;
  lastModified: Date;
  previewAvailable: boolean;
}

// 模型类型定义
interface ExperimentModel {
  id: string;
  name: string;
  type: string;
  description: string;
  parameters: number;
  lastModified: Date;
}

// 建议类型定义
interface AISuggestion {
  id: string;
  title: string;
  description: string;
  type: 'parameter' | 'model' | 'data' | 'code' | 'visualization';
  content: any;
  confidence: number;
}

interface ExperimentAIIntegrationProps {
  experimentId: string;
  experimentName: string;
  experimentType: string;
  parameters: ExperimentParameter[];
  datasets: ExperimentDataset[];
  models: ExperimentModel[];
  onParameterUpdate?: (parameterId: string, value: any) => void;
  onSaveExperiment?: () => void;
  onRunExperiment?: () => void;
}

/**
 * 实验AI助手集成组件
 * 将AI助手功能与实验环境深度集成，提供参数建议、数据分析、调试帮助等功能
 */
const ExperimentAIIntegration: React.FC<ExperimentAIIntegrationProps> = ({
  experimentId,
  experimentName,
  experimentType,
  parameters,
  datasets,
  models,
  onParameterUpdate,
  onSaveExperiment,
  onRunExperiment
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 状态管理
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: `欢迎使用AI助手！我已经连接到您的实验"${experimentName}"，您可以询问关于参数设置、数据分析或任何实验相关问题。`,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    model: true,
    data: false,
    training: false,
    evaluation: false
  });
  const [activeSuggestion, setActiveSuggestion] = useState<AISuggestion | null>(null);
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);

  // 模拟AI建议
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([
    {
      id: 'sug1',
      title: '优化学习率',
      description: '当前学习率可能过高，建议降低以提高模型稳定性',
      type: 'parameter',
      content: {
        parameterId: 'learning_rate',
        suggestedValue: 0.001,
        currentValue: 0.01,
        reason: '降低学习率可以帮助模型更稳定地收敛，避免震荡'
      },
      confidence: 0.85
    },
    {
      id: 'sug2',
      title: '数据分布异常',
      description: '检测到数据集中存在异常值，可能影响训练效果',
      type: 'data',
      content: {
        datasetId: 'main_dataset',
        anomalies: [
          { feature: '温度', threshold: 100, actual: 350 },
          { feature: '压力', threshold: 10, actual: -5 }
        ],
        recommendation: '建议在预处理阶段过滤这些异常值或使用稳健的缩放方法'
      },
      confidence: 0.92
    },
    {
      id: 'sug3',
      title: '增加正则化',
      description: '模型可能存在过拟合风险，建议添加正则化',
      type: 'model',
      content: {
        parameterId: 'regularization',
        suggestedValue: 0.01,
        currentValue: 0,
        reason: '适当的正则化可以防止模型过拟合，提高泛化能力'
      },
      confidence: 0.78
    },
    {
      id: 'sug4',
      title: '添加混淆矩阵可视化',
      description: '为了更好地评估分类性能，建议添加混淆矩阵图表',
      type: 'visualization',
      content: {
        visualizationType: 'confusion_matrix',
        implementation: `// 混淆矩阵代码示例\nimport seaborn as sns\nimport matplotlib.pyplot as plt\nimport numpy as np\n\ndef plot_confusion_matrix(y_true, y_pred, classes):\n    cm = confusion_matrix(y_true, y_pred)\n    plt.figure(figsize=(10, 8))\n    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=classes, yticklabels=classes)\n    plt.xlabel('预测标签')\n    plt.ylabel('真实标签')\n    plt.title('混淆矩阵')\n    return plt`
      },
      confidence: 0.95
    }
  ]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 响应式调整抽屉状态
  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  // 处理发送消息
  const handleSendMessage = () => {
    if (!message.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    // 模拟AI响应
    setTimeout(() => {
      // 简单的消息模式匹配进行响应生成
      let responseContent = '';
      let responseType: Message['type'] = 'text';
      let responseMetadata = {};

      // 根据用户输入的关键词生成不同的响应
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('参数') || lowerMessage.includes('设置')) {
        responseContent = '您可以调整以下关键参数来优化实验效果：\n\n1. 学习率 - 当前值：0.01，建议范围：0.001-0.1\n2. 批量大小 - 当前值：32，建议范围：16-128\n3. 正则化系数 - 当前值：0.001，建议范围：0-0.1';
        responseType = 'parameter';
        responseMetadata = {
          highlightedParameters: ['learning_rate', 'batch_size', 'regularization']
        };
      } else if (lowerMessage.includes('数据') || lowerMessage.includes('数据集')) {
        responseContent = '实验当前使用的数据集包含1000个样本，20个特征。我发现其中有3个异常值可能会影响模型训练效果。建议在预处理阶段处理这些异常值。';
        responseType = 'data';
      } else if (lowerMessage.includes('代码') || lowerMessage.includes('如何实现')) {
        responseContent = `您可以使用以下代码来实现数据预处理：\n\n\`\`\`python\nimport pandas as pd\nimport numpy as np\nfrom sklearn.preprocessing import StandardScaler\n\ndef preprocess_data(df):\n    # 检测并处理缺失值\n    df = df.fillna(df.mean())\n    \n    # 标准化数值特征\n    scaler = StandardScaler()\n    numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns\n    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])\n    \n    # 检测并处理异常值（使用IQR方法）\n    for col in numeric_cols:\n        q1 = df[col].quantile(0.25)\n        q3 = df[col].quantile(0.75)\n        iqr = q3 - q1\n        lower_bound = q1 - 1.5 * iqr\n        upper_bound = q3 + 1.5 * iqr\n        df[col] = df[col].clip(lower_bound, upper_bound)\n    \n    return df\n\`\`\``;
        responseType = 'code';
      } else if (lowerMessage.includes('可视化') || lowerMessage.includes('图表')) {
        responseContent = '根据当前实验数据，我建议添加以下可视化：\n\n1. 特征重要性条形图\n2. 学习曲线（训练和验证损失）\n3. ROC曲线（用于分类任务）\n\n这些可视化将帮助您更好地理解模型性能和数据特征。';
        responseType = 'visualization';
      } else if (lowerMessage.includes('错误') || lowerMessage.includes('问题') || lowerMessage.includes('调试')) {
        responseContent = '我检测到您的实验可能存在以下问题：\n\n1. 学习率过高导致训练不稳定\n2. 数据中存在异常值影响模型性能\n3. 模型复杂度可能不足以捕捉数据中的模式\n\n建议您尝试降低学习率，处理异常值，并考虑使用更复杂的模型结构。';
        responseType = 'text';
      } else if (lowerMessage.includes('建议') || lowerMessage.includes('优化')) {
        responseContent = '基于当前实验配置，我有以下优化建议：\n\n1. 降低学习率至0.001以提高稳定性\n2. 增加批量大小至64以加速训练\n3. 添加dropout层（比率0.3）以防止过拟合\n4. 使用早停策略（patience=10）以自动确定最佳训练轮数';
        responseType = 'text';
      } else {
        responseContent = `关于"${message}"的问题，我建议您可以查看相关文档或者尝试调整实验参数来解决。如果您需要关于特定参数、数据处理或模型选择的建议，请告诉我更多详细信息。`;
      }

      // 添加AI回复
      const aiResponse: Message = {
        id: `msg_${Date.now() + 1}`,
        content: responseContent,
        sender: 'assistant',
        timestamp: new Date(),
        type: responseType,
        metadata: responseMetadata
      };

      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  // 处理回车键发送消息
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理展开/折叠参数部分
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: AISuggestion) => {
    setActiveSuggestion(suggestion);
    setShowSuggestionDialog(true);
  };

  // 应用建议
  const handleApplySuggestion = () => {
    if (!activeSuggestion) return;

    // 根据建议类型执行不同操作
    switch (activeSuggestion.type) {
      case 'parameter':
        // 更新参数
        if (onParameterUpdate && activeSuggestion.content.parameterId) {
          onParameterUpdate(
            activeSuggestion.content.parameterId,
            activeSuggestion.content.suggestedValue
          );
        }

        // 添加系统消息
        const paramMessage: Message = {
          id: `msg_${Date.now()}`,
          content: `已应用建议：将参数"${activeSuggestion.content.parameterId}"从${activeSuggestion.content.currentValue}更新为${activeSuggestion.content.suggestedValue}`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'parameter'
        };
        setMessages(prev => [...prev, paramMessage]);
        break;

      case 'code':
      case 'visualization':
        // 添加代码或可视化应用消息
        const codeMessage: Message = {
          id: `msg_${Date.now()}`,
          content: `已应用建议：${activeSuggestion.title}`,
          sender: 'assistant',
          timestamp: new Date(),
          type: activeSuggestion.type
        };
        setMessages(prev => [...prev, codeMessage]);
        break;

      case 'data':
        // 添加数据处理消息
        const dataMessage: Message = {
          id: `msg_${Date.now()}`,
          content: `已应用数据处理建议：${activeSuggestion.title}`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'data'
        };
        setMessages(prev => [...prev, dataMessage]);
        break;
    }

    // 从建议列表中移除该建议
    setSuggestions(prev => prev.filter(s => s.id !== activeSuggestion.id));
    setShowSuggestionDialog(false);
    setActiveSuggestion(null);
  };

  // 忽略建议
  const handleIgnoreSuggestion = () => {
    if (!activeSuggestion) return;

    // 从建议列表中移除该建议
    setSuggestions(prev => prev.filter(s => s.id !== activeSuggestion.id));
    setShowSuggestionDialog(false);
    setActiveSuggestion(null);
  };

  // 获取建议图标
  const getSuggestionIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'parameter':
        return <SettingsIcon color="primary" />;
      case 'model':
        return <ModelTrainingIcon color="secondary" />;
      case 'data':
        return <DatasetIcon color="error" />;
      case 'code':
        return <CodeIcon color="info" />;
      case 'visualization':
        return <BarChartIcon color="success" />;
      default:
        return <LightbulbIcon color="warning" />;
    }
  };

  // 获取参数类别图标（目前未使用，保留供未来扩展）
  /*
  const getParameterCategoryIcon = (category: ExperimentParameter['category']) => {
    switch (category) {
      case 'model':
        return <ModelTrainingIcon />;
      case 'data':
        return <DatasetIcon />;
      case 'training':
        return <PlayArrowIcon />;
      case 'evaluation':
        return <BarChartIcon />;
      default:
        return <SettingsIcon />;
    }
  };
  */

  // 渲染消息内容
  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'code':
        return (
          <Box sx={{
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
            fontSize: '0.875rem',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            {message.content}
          </Box>
        );

      case 'visualization':
      case 'parameter':
      case 'data':
      default:
        return (
          <Typography variant="body1" whiteSpace="pre-line">
            {message.content}
          </Typography>
        );
    }
  };

  // 生成对话内容
  const renderChatContent = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      {/* 消息列表 */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}
          >
            {/* 头像 */}
            <Avatar
              sx={{
                bgcolor: msg.sender === 'user' ? 'primary.main' : 'secondary.main',
                mr: msg.sender === 'user' ? 0 : 1,
                ml: msg.sender === 'user' ? 1 : 0
              }}
            >
              {msg.sender === 'user' ? '您' : 'AI'}
            </Avatar>

            {/* 消息气泡 */}
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '80%',
                bgcolor: msg.sender === 'user' ? 'primary.light' : 'background.paper',
                borderRadius: 2,
                ...(msg.sender === 'user' ? {
                  borderTopRightRadius: 0
                } : {
                  borderTopLeftRadius: 0
                })
              }}
            >
              {/* 消息内容 */}
              {renderMessageContent(msg)}

              {/* 消息时间戳 */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 1,
                  textAlign: msg.sender === 'user' ? 'right' : 'left'
                }}
              >
                {msg.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}

        {/* 加载指示器 */}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 6 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
              {t('ai.thinking')}
            </Typography>
          </Box>
        )}

        {/* 用于自动滚动的空元素 */}
        <div ref={messagesEndRef} />
      </Box>

      {/* 消息输入框 */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('ai.askAboutExperiment')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            multiline
            maxRows={4}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || loading}
            sx={{ ml: 1 }}
          >
            <SendIcon />
          </IconButton>
        </Box>

        {/* 快捷提问按钮 */}
        <Box sx={{ display: 'flex', mt: 1, gap: 1, flexWrap: 'wrap' }}>
          <Chip
            size="small"
            icon={<SettingsIcon fontSize="small" />}
            label={t('ai.suggestParameters')}
            onClick={() => setMessage('请推荐最佳参数设置')}
            clickable
          />
          <Chip
            size="small"
            icon={<BugReportIcon fontSize="small" />}
            label={t('ai.troubleshoot')}
            onClick={() => setMessage('帮我诊断实验中的问题')}
            clickable
          />
          <Chip
            size="small"
            icon={<BarChartIcon fontSize="small" />}
            label={t('ai.suggestVisualizations')}
            onClick={() => setMessage('有哪些可视化图表适合我的数据？')}
            clickable
          />
          <Chip
            size="small"
            icon={<DescriptionIcon fontSize="small" />}
            label={t('ai.explainResults')}
            onClick={() => setMessage('解释我的实验结果')}
            clickable
          />
        </Box>
      </Box>
    </Box>
  );

  // 渲染侧边栏内容
  const renderSidebar = () => (
    <Box
      sx={{
        width: drawerOpen ? (isMobile ? '100%' : 320) : 0,
        height: '100%',
        overflow: 'hidden',
        transition: 'width 0.3s',
        borderLeft: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 标签页头部 */}
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        variant="fullWidth"
      >
        <Tab
          icon={<LightbulbIcon />}
          label={t('ai.suggestions')}
          iconPosition="start"
          sx={{ minHeight: 48 }}
        />
        <Tab
          icon={<SyncAltIcon />}
          label={t('ai.parameters')}
          iconPosition="start"
          sx={{ minHeight: 48 }}
        />
        <Tab
          icon={<LibraryBooksIcon />}
          label={t('ai.resources')}
          iconPosition="start"
          sx={{ minHeight: 48 }}
        />
      </Tabs>

      {/* 标签页内容 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* AI建议标签页 */}
        {selectedTab === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('ai.aiSuggestions')}
            </Typography>

            {suggestions.length > 0 ? (
              <List disablePadding>
                {suggestions.map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    sx={{ mb: 2, cursor: 'pointer' }}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <CardHeader
                      avatar={getSuggestionIcon(suggestion.type)}
                      title={suggestion.title}
                      subheader={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Chip
                            label={`${Math.round(suggestion.confidence * 100)}% ${t('ai.confidence')}`}
                            size="small"
                            color={suggestion.confidence > 0.8 ? 'success' : 'warning'}
                          />
                        </Box>
                      }
                      sx={{ pb: 0 }}
                    />
                    <CardContent sx={{ pt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {suggestion.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <InfoIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                <Typography color="text.secondary">
                  {t('ai.noSuggestions')}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* 参数标签页 */}
        {selectedTab === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('experiment.parameters')}
            </Typography>

            {/* 模型参数 */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  mb: 1
                }}
                onClick={() => toggleSection('model')}
              >
                <ModelTrainingIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  {t('parameter.modelParameters')}
                </Typography>
                {expandedSections.model ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>

              <Collapse in={expandedSections.model}>
                <List disablePadding>
                  {parameters
                    .filter(p => p.category === 'model')
                    .map(param => (
                      <ListItem key={param.id} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={param.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="body2" component="span">
                                {param.value}
                              </Typography>
                              {param.description && (
                                <Tooltip title={param.description}>
                                  <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                                </Tooltip>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  }
                </List>
              </Collapse>
            </Box>

            {/* 数据参数 */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  mb: 1
                }}
                onClick={() => toggleSection('data')}
              >
                <DatasetIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  {t('parameter.dataParameters')}
                </Typography>
                {expandedSections.data ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>

              <Collapse in={expandedSections.data}>
                <List disablePadding>
                  {parameters
                    .filter(p => p.category === 'data')
                    .map(param => (
                      <ListItem key={param.id} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={param.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="body2" component="span">
                                {param.value}
                              </Typography>
                              {param.description && (
                                <Tooltip title={param.description}>
                                  <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                                </Tooltip>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  }
                </List>
              </Collapse>
            </Box>

            {/* 训练参数 */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  mb: 1
                }}
                onClick={() => toggleSection('training')}
              >
                <PlayArrowIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  {t('parameter.trainingParameters')}
                </Typography>
                {expandedSections.training ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>

              <Collapse in={expandedSections.training}>
                <List disablePadding>
                  {parameters
                    .filter(p => p.category === 'training')
                    .map(param => (
                      <ListItem key={param.id} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={param.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="body2" component="span">
                                {param.value}
                              </Typography>
                              {param.description && (
                                <Tooltip title={param.description}>
                                  <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                                </Tooltip>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  }
                </List>
              </Collapse>
            </Box>

            {/* 评估参数 */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  mb: 1
                }}
                onClick={() => toggleSection('evaluation')}
              >
                <BarChartIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  {t('parameter.evaluationParameters')}
                </Typography>
                {expandedSections.evaluation ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>

              <Collapse in={expandedSections.evaluation}>
                <List disablePadding>
                  {parameters
                    .filter(p => p.category === 'evaluation')
                    .map(param => (
                      <ListItem key={param.id} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={param.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Typography variant="body2" component="span">
                                {param.value}
                              </Typography>
                              {param.description && (
                                <Tooltip title={param.description}>
                                  <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                                </Tooltip>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))
                  }
                </List>
              </Collapse>
            </Box>
          </Box>
        )}

        {/* 资源标签页 */}
        {selectedTab === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('experiment.resources')}
            </Typography>

            {/* 模型列表 */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
              <ModelTrainingIcon sx={{ mr: 1, fontSize: 20 }} />
              {t('experiment.models')}
            </Typography>

            <List disablePadding>
              {models.map(model => (
                <ListItem
                  key={model.id}
                  secondaryAction={
                    <Tooltip title={t('common.view')}>
                      <IconButton edge="end" size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <ModelTrainingIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={model.name}
                    secondary={`${model.type} · ${model.parameters} 参数`}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>

            {/* 数据集列表 */}
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, display: 'flex', alignItems: 'center' }}>
              <DatasetIcon sx={{ mr: 1, fontSize: 20 }} />
              {t('experiment.datasets')}
            </Typography>

            <List disablePadding>
              {datasets.map(dataset => (
                <ListItem
                  key={dataset.id}
                  secondaryAction={
                    <Tooltip title={dataset.previewAvailable ? t('common.preview') : t('common.noPreview')}>
                      <span>
                        <IconButton
                          edge="end"
                          size="small"
                          disabled={!dataset.previewAvailable}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  }
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <DatasetIcon color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={dataset.name}
                    secondary={`${dataset.format} · ${dataset.size}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>

            {/* 实验类型信息 */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'primary.light',
                borderRadius: 2,
                color: 'primary.contrastText'
              }}
            >
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
                <ScienceIcon sx={{ mr: 1 }} />
                {t('experiment.experimentType')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {experimentType}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                {t('ai.moreInfoAboutExperiment')}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* 底部操作栏 */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 1
        }}
      >
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          size="small"
          onClick={onSaveExperiment}
          sx={{ flex: 1 }}
        >
          {t('common.save')}
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          size="small"
          onClick={onRunExperiment}
          sx={{ flex: 1 }}
        >
          {t('experiment.run')}
        </Button>
      </Box>
    </Box>
  );

  // 渲染建议对话框
  const renderSuggestionDialog = () => (
    <Dialog
      open={showSuggestionDialog}
      onClose={() => setShowSuggestionDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      {activeSuggestion && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getSuggestionIcon(activeSuggestion.type)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {activeSuggestion.title}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText paragraph>
              {activeSuggestion.description}
            </DialogContentText>

            {/* 不同类型建议的详细内容 */}
            {activeSuggestion.type === 'parameter' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  {t('ai.parameterDetails')}
                </Typography>
                <Box sx={{ display: 'flex', mt: 1, gap: 2 }}>
                  <Chip
                    label={t('ai.currentValue', { value: activeSuggestion.content.currentValue })}
                    color="default"
                  />
                  <Chip
                    label={t('ai.suggestedValue', { value: activeSuggestion.content.suggestedValue })}
                    color="primary"
                  />
                </Box>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {t('ai.reason')}: {activeSuggestion.content.reason}
                </Typography>
              </Box>
            )}

            {activeSuggestion.type === 'data' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">
                  {t('ai.dataAnomalies')}
                </Typography>
                <List>
                  {activeSuggestion.content.anomalies.map((anomaly: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${anomaly.feature}: ${anomaly.actual} (${t('ai.threshold')}: ${anomaly.threshold})`}
                        secondary={t('ai.anomalyDetected')}
                      />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {t('ai.recommendation')}: {activeSuggestion.content.recommendation}
                </Typography>
              </Box>
            )}

            {activeSuggestion.type === 'code' && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto'
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  {t('ai.codeImplementation')}
                </Typography>
                <code>{activeSuggestion.content.implementation}</code>
              </Box>
            )}

            {activeSuggestion.type === 'visualization' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {t('ai.visualizationImplementation')}
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    overflow: 'auto'
                  }}
                >
                  <code>{activeSuggestion.content.implementation}</code>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleIgnoreSuggestion} color="inherit">
              {t('common.ignore')}
            </Button>
            <Button onClick={handleApplySuggestion} variant="contained">
              {t('common.apply')}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 主内容区 */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {/* 头部 */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PsychologyIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              {t('ai.experimentAssistant')}
            </Typography>
            <Chip
              label={experimentName}
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* 建议徽章 */}
            <Badge
              badgeContent={suggestions.length}
              color="error"
              sx={{ mr: 1 }}
            >
              <Tooltip title={t('ai.suggestions')}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedTab(0);
                    setDrawerOpen(true);
                  }}
                >
                  <LightbulbIcon />
                </IconButton>
              </Tooltip>
            </Badge>

            {/* 侧边栏切换按钮 */}
            <Tooltip title={drawerOpen ? t('common.close') : t('common.open')}>
              <IconButton
                size="small"
                onClick={() => setDrawerOpen(!drawerOpen)}
              >
                {drawerOpen ? <CloseIcon /> : <InfoIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 聊天内容 */}
        {renderChatContent()}
      </Box>

      {/* 侧边栏 */}
      {renderSidebar()}

      {/* 移动端抽屉 */}
      {isMobile && (
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '85%',
              maxWidth: 360
            }
          }}
        >
          {renderSidebar()}
        </Drawer>
      )}

      {/* 建议对话框 */}
      {renderSuggestionDialog()}
    </Box>
  );
};

// 导出组件
export default ExperimentAIIntegration;

// 默认参数示例，供外部使用
export const DefaultExperimentParams = {
  experimentType: '机器学习分类实验',
  parameters: [
    {
      id: 'learning_rate',
      name: '学习率',
      value: 0.01,
      type: 'number',
      description: '模型训练时的学习率，控制每次迭代更新的步长',
      category: 'model'
    },
    {
      id: 'batch_size',
      name: '批量大小',
      value: 32,
      type: 'number',
      description: '每次迭代使用的样本数量',
      category: 'training'
    },
    {
      id: 'epochs',
      name: '训练轮数',
      value: 100,
      type: 'number',
      description: '完整训练数据集的次数',
      category: 'training'
    },
    {
      id: 'optimizer',
      name: '优化器',
      value: 'Adam',
      type: 'select',
      options: ['SGD', 'Adam', 'RMSprop', 'Adagrad'],
      description: '用于训练模型的优化算法',
      category: 'model'
    },
    {
      id: 'regularization',
      name: '正则化系数',
      value: 0.001,
      type: 'number',
      description: '用于防止过拟合的正则化强度',
      category: 'model'
    },
    {
      id: 'validation_split',
      name: '验证集比例',
      value: 0.2,
      type: 'number',
      description: '用于验证的数据比例',
      category: 'data'
    },
    {
      id: 'early_stopping',
      name: '早停',
      value: true,
      type: 'boolean',
      description: '当验证集性能不再提升时停止训练',
      category: 'training'
    },
    {
      id: 'patience',
      name: '早停耐心值',
      value: 10,
      type: 'number',
      description: '验证性能不提升多少轮后停止训练',
      category: 'training'
    },
    {
      id: 'metrics',
      name: '评估指标',
      value: 'accuracy',
      type: 'select',
      options: ['accuracy', 'precision', 'recall', 'f1'],
      description: '用于评估模型性能的指标',
      category: 'evaluation'
    },
    {
      id: 'test_size',
      name: '测试集大小',
      value: 0.1,
      type: 'number',
      description: '用于最终评估的数据比例',
      category: 'evaluation'
    }
  ],
  datasets: [
    {
      id: 'main_dataset',
      name: '主数据集',
      description: '用于训练和验证的主数据集',
      size: '2.3 MB',
      format: 'CSV',
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      previewAvailable: true
    },
    {
      id: 'test_dataset',
      name: '测试数据集',
      description: '用于最终评估的独立测试集',
      size: '512 KB',
      format: 'CSV',
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      previewAvailable: true
    },
    {
      id: 'external_dataset',
      name: '外部验证数据',
      description: '来自不同来源的额外验证数据',
      size: '1.1 MB',
      format: 'XLSX',
      lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      previewAvailable: false
    }
  ],
  models: [
    {
      id: 'model1',
      name: '基础分类器',
      type: '随机森林',
      description: '基于决策树的集成学习方法',
      parameters: 1250000,
      lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'model2',
      name: '深度神经网络',
      type: 'DNN',
      description: '多层感知机神经网络',
      parameters: 5420000,
      lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'model3',
      name: '梯度提升模型',
      type: 'XGBoost',
      description: '基于梯度提升的集成学习方法',
      parameters: 850000,
      lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ]
};

export default ExperimentAIIntegration;
