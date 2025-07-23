import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Tabs, 
  Tab, 
  Alert, 
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { TextFieldsIcon, SearchIcon, SummarizeIcon, CategoryIcon, ReportIcon, ContentCopyIcon } from '../../utils/icons';

// 智能分析服务
const mockAiService = {
  analyzeTextClassification: async (params: any) => {
    // 模拟分析结果
    return {
      success: true,
      data: {
        categories: [
          { label: '科学', confidence: 0.85 },
          { label: '实验', confidence: 0.72 },
          { label: '教育', confidence: 0.63 }
        ]
      }
    };
  },
  
  generateTextSummary: async (params: any) => {
    return {
      success: true,
      data: {
        summary: '这是一个自动生成的文本摘要。系统分析了原文的主要内容并提取了关键信息。'
      }
    };
  },
  
  generateExperimentReport: async (params: any) => {
    return {
      success: true,
      data: {
        content: '实验报告已生成。包含实验目的、方法、结果和结论等完整内容。'
      }
    };
  },
  
  performSemanticSearch: async (params: any) => {
    return {
      success: true,
      data: {
        results: [
          { title: '相关实验1', snippet: '这是相关实验的描述...', similarity: 0.89 },
          { title: '相关实验2', snippet: '这是另一个相关实验...', similarity: 0.76 }
        ]
      }
    };
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`nlp-tabpanel-${index}`}
      aria-labelledby={`nlp-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const NLPAnalytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 文本分类状态
  const [classificationText, setClassificationText] = useState('');
  const [classificationResult, setClassificationResult] = useState<any>(null);

  // 文本摘要状态
  const [summaryText, setSummaryText] = useState('');
  const [summaryResult, setSummaryResult] = useState<any>(null);

  // 实验报告生成状态
  const [experimentId, setExperimentId] = useState('');
  const [reportResult, setReportResult] = useState<any>(null);

  // 语义搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);

  // 处理标签页切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  // 处理文本分类
  const handleAnalyzeClassification = async () => {
    if (!classificationText.trim()) {
      setError('请输入要分析的文本');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockAiService.analyzeTextClassification({
        text: classificationText
      });
      
      if (response.success && response.data) {
        setClassificationResult(response.data);
      } else {
        setError('文本分析失败');
      }
    } catch (err) {
      console.error('文本分析错误:', err);
      setError('分析过程时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理文本摘要
  const handleAnalyzeSummary = async () => {
    if (!summaryText.trim()) {
      setError('请输入要摘要的文本');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockAiService.generateTextSummary({
        text: summaryText
      });
      
      if (response.success && response.data) {
        setSummaryResult(response.data);
      } else {
        setError('文本摘要失败');
      }
    } catch (err) {
      console.error('文本摘要错误:', err);
      setError('分析过程时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理实验报告生成
  const handleGenerateReport = async () => {
    if (!experimentId.trim()) {
      setError('请输入实验ID');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockAiService.generateExperimentReport({
        experimentId
      });
      
      if (response.success && response.data) {
        setReportResult(response.data);
      } else {
        setError('实验报告生成失败');
      }
    } catch (err) {
      console.error('实验报告生成错误:', err);
      setError('分析过程时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理语义搜索
  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) {
      setError('请输入搜索查询');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await mockAiService.performSemanticSearch({
        query: searchQuery
      });
      
      if (response.success && response.data) {
        setSearchResult(response.data);
      } else {
        setError('语义搜索失败');
      }
    } catch (err) {
      console.error('语义搜索错误:', err);
      setError('分析过程时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 复制结果到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        智能文本分析
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="NLP分析标签页">
          <Tab icon={<CategoryIcon />} label="文本分类" />
          <Tab icon={<SummarizeIcon />} label="文本摘要" />
          <Tab icon={<ReportIcon />} label="报告生成" />
          <Tab icon={<SearchIcon />} label="语义搜索" />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 文本分类面板 */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="输入要分析的文本"
            placeholder="请输入需要分类的文本内容..."
            value={classificationText}
            onChange={(e) => setClassificationText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleAnalyzeClassification}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CategoryIcon />}
          >
            {loading ? '分析中...' : '开始分析'}
          </Button>
        </Box>

        {classificationResult && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              分类结果
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {classificationResult.categories.map((category: any, index: number) => (
                <Chip
                  key={index}
                  label={`${category.label} (${(category.confidence * 100).toFixed(1)}%)`}
                  color={category.confidence > 0.7 ? 'primary' : 'default'}
                />
              ))}
            </Box>
          </Paper>
        )}
      </TabPanel>

      {/* 文本摘要面板 */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="输入要摘要的文本"
            placeholder="请输入需要生成摘要的文本内容..."
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleAnalyzeSummary}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SummarizeIcon />}
          >
            {loading ? '生成中...' : '生成摘要'}
          </Button>
        </Box>

        {summaryResult && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">摘要结果</Typography>
              <IconButton onClick={() => copyToClipboard(summaryResult.summary)}>
                <ContentCopyIcon />
              </IconButton>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {summaryResult.summary}
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* 报告生成面板 */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="实验ID"
            placeholder="请输入实验ID"
            value={experimentId}
            onChange={(e) => setExperimentId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <ReportIcon />}
          >
            {loading ? '生成中...' : '生成报告'}
          </Button>
        </Box>

        {reportResult && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">实验报告</Typography>
              <IconButton onClick={() => copyToClipboard(reportResult.content)}>
                <ContentCopyIcon />
              </IconButton>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {reportResult.content}
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {/* 语义搜索面板 */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="搜索查询"
            placeholder="输入搜索关键词或问题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSemanticSearch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
          >
            {loading ? '搜索中...' : '开始搜索'}
          </Button>
        </Box>

        {searchResult && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              搜索结果
            </Typography>
            <List>
              {searchResult.results.map((result: any, index: number) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={result.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {result.snippet}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          相似度: {(result.similarity * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </TabPanel>
    </Box>
  );
};

export default NLPAnalytics;
