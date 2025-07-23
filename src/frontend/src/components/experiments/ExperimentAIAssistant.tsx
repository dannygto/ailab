import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  AutoFixHigh as AutoFixHighIcon,
  BugReport as BugReportIcon,
  Code as CodeIcon,
  PictureAsPdf as PictureAsPdfIcon,
  LiveHelp as LiveHelpIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ExperimentAIAssistantProps {
  experimentId?: string;
  experimentType?: string;
  onSuggestionApply?: (suggestion: any) => void;
}

/**
 * 实验AI助手组件
 * 提供实验过程中的AI辅助功能，包括实验设计、数据分析、问题排查等
 */
const ExperimentAIAssistant: React.FC<ExperimentAIAssistantProps> = ({
  experimentId,
  experimentType,
  onSuggestionApply
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string, suggestions?: any[]}>>(
    experimentId ? [
      {
        role: 'assistant',
        content: `欢迎使用实验AI助手。我已连接到您的${experimentType || ''}实验(ID: ${experimentId})，有什么可以帮助您的？`,
        suggestions: [
          { text: '如何优化我的实验参数？', type: 'parameter' },
          { text: '帮我分析实验数据', type: 'analysis' },
          { text: '我的实验遇到了问题，请帮我排查', type: 'debug' },
          { text: '生成实验报告', type: 'report' }
        ]
      }
    ] : [
      {
        role: 'assistant',
        content: '欢迎使用实验AI助手。请问有什么可以帮助您的？',
        suggestions: [
          { text: '如何设计一个好的实验？', type: 'design' },
          { text: '如何分析实验数据？', type: 'analysis' },
          { text: '常见实验问题的解决方法', type: 'faq' }
        ]
      }
    ]
  );

  // 发送消息
  const handleSendMessage = () => {
    if (!query.trim()) return;

    // 添加用户消息到聊天历史
    setChatHistory(prev => [...prev, { role: 'user', content: query }]);

    // 清空输入框
    setQuery('');

    // 模拟AI处理
    setIsLoading(true);
    setTimeout(() => {
      // 根据不同的查询内容返回不同的回复
      let response;
      let suggestions = [];

      if (query.includes('参数') || query.includes('优化')) {
        response = '根据您的实验类型和历史数据分析，我建议您调整以下参数：\n\n1. 学习率：0.001 → 0.0005\n2. 批量大小：32 → 64\n3. 训练轮次：增加到100轮';
        suggestions = [
          { text: '应用这些参数', type: 'apply-parameters', data: { learningRate: 0.0005, batchSize: 64, epochs: 100 } },
          { text: '查看参数优化的原因', type: 'explain-parameters' }
        ];
      } else if (query.includes('分析') || query.includes('数据')) {
        response = '我已分析了您的实验数据，发现以下几点：\n\n1. 准确率在第50轮后趋于平稳，可能出现了过拟合\n2. 损失函数波动较大，建议尝试不同的优化器\n3. 验证集和测试集性能有较大差距，数据分布可能不均衡';
        suggestions = [
          { text: '生成详细分析报告', type: 'generate-report' },
          { text: '可视化实验数据', type: 'visualize-data' }
        ];
      } else if (query.includes('问题') || query.includes('排查') || query.includes('错误')) {
        response = '根据您的实验日志，我发现以下可能的问题：\n\n1. 内存溢出：您的批量大小可能过大\n2. 数据预处理步骤中可能存在未处理的空值\n3. GPU利用率低，计算效率不高';
        suggestions = [
          { text: '自动修复这些问题', type: 'auto-fix' },
          { text: '查看详细的排查步骤', type: 'debug-steps' }
        ];
      } else if (query.includes('报告') || query.includes('文档')) {
        response = '我可以根据您的实验结果生成一份实验报告，包括：\n\n1. 实验目标和设计\n2. 数据处理和方法\n3. 结果分析和可视化\n4. 结论和改进建议';
        suggestions = [
          { text: '生成PDF报告', type: 'generate-pdf' },
          { text: '生成Word文档', type: 'generate-word' }
        ];
      } else {
        response = '我理解您的问题。请告诉我更多关于您的实验细节，这样我能提供更有针对性的帮助。';
        suggestions = [
          { text: '查看实验常见问题', type: 'faq' },
          { text: '获取实验模板', type: 'templates' }
        ];
      }

      // 添加AI回复到聊天历史
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: response,
        suggestions
      }]);

      setIsLoading(false);
    }, 1500);
  };

  // 处理回车键发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理建议点击
  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'apply-parameters' && onSuggestionApply) {
      onSuggestionApply(suggestion.data);
    } else {
      setQuery(suggestion.text);
      setChatHistory(prev => [...prev, { role: 'user', content: suggestion.text }]);

      // 模拟AI处理
      setIsLoading(true);
      setTimeout(() => {
        let response = '我正在处理您的请求...';
        let suggestions = [];

        switch (suggestion.type) {
          case 'design':
            response = '设计一个好的实验需要考虑以下几点：\n\n1. 明确的研究问题和假设\n2. 适当的对照组和实验组\n3. 充分的样本量\n4. 控制混淆变量\n5. 可靠的测量方法\n6. 适当的统计分析方法';
            suggestions = [
              { text: '如何制定研究问题？', type: 'research-question' },
              { text: '如何确定样本量？', type: 'sample-size' }
            ];
            break;
          case 'analysis':
            response = '实验数据分析通常包括以下步骤：\n\n1. 数据清洗和预处理\n2. 描述性统计分析\n3. 假设检验\n4. 相关性和因果性分析\n5. 结果可视化\n6. 结论和解释';
            suggestions = [
              { text: '常用的统计方法有哪些？', type: 'statistics-methods' },
              { text: '如何解释p值？', type: 'p-value' }
            ];
            break;
          case 'faq':
            response = '以下是实验中常见的问题和解决方法：\n\n1. 数据不足：增加样本量或使用数据增强\n2. 过拟合：使用正则化、早停或交叉验证\n3. 性能不佳：尝试不同的模型或调整超参数\n4. 结果不稳定：使用不同的随机种子多次运行';
            suggestions = [
              { text: '如何处理异常值？', type: 'outliers' },
              { text: '如何解决类别不平衡问题？', type: 'imbalance' }
            ];
            break;
          case 'explain-parameters':
            response = '参数优化建议的原因：\n\n1. 学习率降低：当前学习率可能过大，导致优化过程震荡，降低有助于模型更稳定地收敛\n2. 批量大小增加：更大的批量可以提供更稳定的梯度估计，但也需要更多内存\n3. 训练轮次增加：当前模型可能未完全收敛，增加训练轮次可能提高性能';
            suggestions = [
              { text: '应用这些参数', type: 'apply-parameters', data: { learningRate: 0.0005, batchSize: 64, epochs: 100 } },
              { text: '查看更多参数优化建议', type: 'more-parameters' }
            ];
            break;
          default:
            response = '我需要更多信息来回答您的问题。请提供更多关于您实验的细节。';
            suggestions = [
              { text: '分享我的实验设计', type: 'share-design' },
              { text: '上传我的实验数据', type: 'upload-data' }
            ];
        }

        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: response,
          suggestions
        }]);

        setIsLoading(false);
      }, 1000);
    }
  };

  // 清空聊天记录
  const handleClearChat = () => {
    setChatHistory(experimentId ? [
      {
        role: 'assistant',
        content: `欢迎使用实验AI助手。我已连接到您的${experimentType || ''}实验(ID: ${experimentId})，有什么可以帮助您的？`,
        suggestions: [
          { text: '如何优化我的实验参数？', type: 'parameter' },
          { text: '帮我分析实验数据', type: 'analysis' },
          { text: '我的实验遇到了问题，请帮我排查', type: 'debug' },
          { text: '生成实验报告', type: 'report' }
        ]
      }
    ] : [
      {
        role: 'assistant',
        content: '欢迎使用实验AI助手。请问有什么可以帮助您的？',
        suggestions: [
          { text: '如何设计一个好的实验？', type: 'design' },
          { text: '如何分析实验数据？', type: 'analysis' },
          { text: '常见实验问题的解决方法', type: 'faq' }
        ]
      }
    ]);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {t('ai.experimentAssistant')}
          </Typography>
          {experimentId && (
            <Chip
              size="small"
              icon={<ScienceIcon />}
              label={experimentType || t('experiment.experiment')}
              sx={{ ml: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }}
            />
          )}
        </Box>
        <Tooltip title={t('common.clear')}>
          <IconButton color="inherit" onClick={handleClearChat} size="small">
            <ClearAllIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{
        flex: 1,
        p: 2,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: 'background.default'
      }}>
        {chatHistory.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                borderRadius: 2,
                position: 'relative',
                '&::before': message.role === 'assistant' ? {
                  content: '""',
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  left: -8,
                  top: 8,
                  borderTop: '8px solid transparent',
                  borderRight: '8px solid #fff',
                  borderBottom: '8px solid transparent',
                } : message.role === 'user' ? {
                  content: '""',
                  position: 'absolute',
                  width: 0,
                  height: 0,
                  right: -8,
                  top: 8,
                  borderTop: '8px solid transparent',
                  borderLeft: '8px solid #e3f2fd',
                  borderBottom: '8px solid transparent',
                } : {}
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-line',
                  color: message.role === 'user' ? 'primary.dark' : 'text.primary'
                }}
              >
                {message.content}
              </Typography>
            </Paper>

            {message.suggestions && message.suggestions.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {message.suggestions.map((suggestion, sIndex) => (
                  <Chip
                    key={sIndex}
                    label={suggestion.text}
                    size="small"
                    clickable
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                    icon={
                      suggestion.type.includes('parameter') ? <AutoFixHighIcon fontSize="small" /> :
                      suggestion.type.includes('debug') || suggestion.type.includes('fix') ? <BugReportIcon fontSize="small" /> :
                      suggestion.type.includes('report') || suggestion.type.includes('generate') ? <PictureAsPdfIcon fontSize="small" /> :
                      suggestion.type.includes('code') ? <CodeIcon fontSize="small" /> :
                      <LiveHelpIcon fontSize="small" />
                    }
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {t('ai.thinking')}...
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={t('ai.askExperimentQuestion')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={3}
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!query.trim() || isLoading}
          sx={{ ml: 1 }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Card>
  );
};

export default ExperimentAIAssistant;
