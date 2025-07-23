import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  SelectChangeEvent,
  Alert,
  Tooltip,
  IconButton,
  InputAdornment,
  Chip
} from '@mui/material';
import { InfoIcon, HelpOutlineIcon, CheckCircleIcon } from '../../utils/icons';

interface SecurityQuestion {
  id: string;
  question: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface SecurityQuestionProps {
  onAnswerChange: (question: string, answer: string) => void;
}

const SecurityQuestionSelector: React.FC<SecurityQuestionProps> = ({ onAnswerChange }) => {
  // 预设的安全问题列表，增加了分类和难度
  const predefinedQuestions = useMemo<SecurityQuestion[]>(() => [
    { id: 'q1', question: '您的出生地是？', category: '个人信息', difficulty: 'easy' },
    { id: 'q2', question: '您的第一所学校名称是？', category: '教育', difficulty: 'medium' },
    { id: 'q3', question: '您童年的宠物名字是？', category: '个人信息', difficulty: 'easy' },
    { id: 'q4', question: '您最喜欢的电影是？', category: '兴趣爱好', difficulty: 'medium' },
    { id: 'q5', question: '您童年最好的朋友名字是？', category: '个人关系', difficulty: 'medium' },
    { id: 'q6', question: '您的第一辆车的品牌是？', category: '个人信息', difficulty: 'medium' },
    { id: 'q7', question: '您最喜欢的历史人物是？', category: '兴趣爱好', difficulty: 'hard' },
    { id: 'q8', question: '您最有纪念意义的日期是？(年/月/日)', category: '个人信息', difficulty: 'hard' },
    { id: 'q9', question: '您最喜欢的数学公式或定理是？', category: '学术', difficulty: 'hard' },
    { id: 'q10', question: '您最敬佩的老师姓名是？', category: '教育', difficulty: 'medium' },
    { id: 'q11', question: '您第一次参加工作的公司名称是？', category: '职业', difficulty: 'medium' },
    { id: 'custom', question: '自定义问题', category: '自定义', difficulty: 'medium' },
  ], []);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [answerStrength, setAnswerStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  const handleQuestionChange = (event: SelectChangeEvent) => {
    const questionId = event.target.value;
    setSelectedQuestionId(questionId);
    setShowCustom(questionId === 'custom');

    // 清除先前的答案
    setAnswer('');
    setAnswerStrength('weak');

    // 获取当前问题文本
    const currentQuestion = questionId === 'custom'
      ? customQuestion
      : predefinedQuestions.find(q => q.id === questionId)?.question || '';

    // 通知父组件
    onAnswerChange(currentQuestion, '');
  };

  const handleCustomQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomQuestion = event.target.value;
    setCustomQuestion(newCustomQuestion);

    // 通知父组件
    if (selectedQuestionId === 'custom') {
      onAnswerChange(newCustomQuestion, answer);
    }
  };

  // 评估答案强度
  const evaluateAnswerStrength = (answer: string): 'weak' | 'medium' | 'strong' => {
    if (!answer) return 'weak';
    if (answer.length < 3) return 'weak';
    if (answer.length < 6) return 'medium';
    return 'strong';
  };

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswer = event.target.value;
    setAnswer(newAnswer);

    // 评估答案强度
    setAnswerStrength(evaluateAnswerStrength(newAnswer));

    // 获取当前问题文本
    const currentQuestion = selectedQuestionId === 'custom'
      ? customQuestion
      : predefinedQuestions.find(q => q.id === selectedQuestionId)?.question || '';

    // 通知父组件
    onAnswerChange(currentQuestion, newAnswer);
  };

  // 获取答案强度颜色
  const getAnswerStrengthColor = () => {
    switch (answerStrength) {
      case 'strong':
        return 'success.main';
      case 'medium':
        return 'warning.main';
      case 'weak':
      default:
        return 'error.main';
    }
  };

  // 当组件挂载时，默认选择第一个问题
  useEffect(() => {
    if (predefinedQuestions.length > 0) {
      const firstQuestion = predefinedQuestions[0];
      setSelectedQuestionId(firstQuestion.id);
      onAnswerChange(firstQuestion.question, '');
    }
  }, [onAnswerChange, predefinedQuestions]);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        安全验证问题（用于找回密码）
      </Typography>

      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel>选择安全问题</InputLabel>
        <Select
          value={selectedQuestionId}
          onChange={handleQuestionChange}
          label="选择安全问题"
        >
          {predefinedQuestions.map(q => (
            <MenuItem key={q.id} value={q.id}>
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>{q.question}</Typography>
                {q.category && q.id !== 'custom' && (
                  <Chip
                    label={q.category}
                    size="small"
                    sx={{ ml: 1 }}
                    color={
                      q.difficulty === 'hard' ? 'error' :
                      q.difficulty === 'medium' ? 'warning' : 'success'
                    }
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {showCustom && (
        <TextField
          fullWidth
          label="自定义安全问题"
          value={customQuestion}
          onChange={handleCustomQuestionChange}
          margin="normal"
          variant="outlined"
          placeholder="请输入您的自定义安全问题"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="创建一个难以被他人猜到的问题">
                  <IconButton size="small">
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
      )}

      {selectedQuestionId && (
        <>
          <TextField
            fullWidth
            label="答案"
            value={answer}
            onChange={handleAnswerChange}
            margin="normal"
            variant="outlined"
            placeholder="请输入您的答案"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="答案越详细越安全">
                    <IconButton size="small">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />

          {answer && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ mr: 1 }}>
                答案强度:
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: getAnswerStrengthColor(), fontWeight: 'bold' }}
              >
                {answerStrength === 'strong' ? '强' : answerStrength === 'medium' ? '中' : '弱'}
              </Typography>
              <Box
                sx={{
                  ml: 1,
                  height: 4,
                  width: '100%',
                  bgcolor: 'grey.300',
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width:
                      answerStrength === 'strong'
                        ? '100%'
                        : answerStrength === 'medium'
                          ? '66%'
                          : '33%',
                    bgcolor: getAnswerStrengthColor(),
                    borderRadius: 2,
                    transition: 'width 0.3s',
                  }}
                />
              </Box>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            请记住您的问题和答案，这将用于账号找回。建议使用只有您知道的个人信息。
          </Typography>
          {answer.length > 0 && answer.length < 3 && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              答案太短，建议使用更详细的描述提高安全性
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default SecurityQuestionSelector;
