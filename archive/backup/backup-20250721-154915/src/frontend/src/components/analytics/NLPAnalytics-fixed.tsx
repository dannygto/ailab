import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  TextField,
  Button,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton
} from '@mui/material';
import { TextFieldsIcon, SearchIcon, SummarizeIcon, CategoryIcon, ReportIcon, ContentCopyIcon } from '../../utils/icons';

// 导入服务
import { aiService } from '../../services';
import { 
  TextClassificationParams, 
  TextClassificationResponse,
  TextSummaryParams,
  TextSummaryResponse,
  ExperimentReportParams,
  ExperimentReportResponse,
  SemanticSearchParams,
  SemanticSearchResponse
} from '../../types/nlpTypes';

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
  const [multiLabelClassification, setMultiLabelClassification] = useState(false);
  const [classificationResult, setClassificationResult] = useState<TextClassificationResponse | null>(null);

  // 文本摘要状态
  const [summaryText, setSummaryText] = useState('');
  const [summaryFormat, setSummaryFormat] = useState<'bullet' | 'paragraph'>('paragraph');
  const [summaryMaxLength, setSummaryMaxLength] = useState(200);
  const [summaryResult, setSummaryResult] = useState<TextSummaryResponse | null>(null);

  // 实验报告生成状态
  const [reportTemplate, setReportTemplate] = useState('standard');
  const [reportLanguageIcon, setReportLanguageIcon] = useState<'zh-CN' | 'en-US'>('zh-CN');
  const [experimentId, setExperimentId] = useState('');
  const [reportResult, setReportResult] = useState<ExperimentReportResponse | null>(null);

  // 语义搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SemanticSearchResponse | null>(null);

  // 处理标签页切换
  const handleTabChange = (EventIcon: React.SyntheticEvent, newValue: number) => {
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
      const response = await aiService.analyzeTextClassification({
        text: classificationText,
        multiLabel: multiLabelClassification
      });
      
      if (response.success && response.data) {
        setClassificationResult(response.data);
      } else {
        setError('文本分类失败');
      }
    } catch (err) {
      console.error('文本分类错误:', err);
      setError('网络连接时发生错误');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理文本摘要
  const handleGenerateSummary = async () => {
    if (!summaryText.trim()) {
      setError('请输入要摘要的文本');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiService.generateTextSummary({
        text: summaryText,
        format: summaryFormat,
        maxLength: summaryMaxLength
      });
      
      if (response.success && response.data) {
        setSummaryResult(response.data);
      } else {
        setError('文本摘要失败');
      }
    } catch (err) {
      console.error('文本摘要错误:', err);
      setError('网络连接时发生错误');
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
      const response = await aiService.generateExperimentReport({
        experimentId: experimentId,
        format: 'markdown',
        LanguageIcon: reportLanguageIcon,
        includeVisualizations: true
      });
      
      if (response.success && response.data) {
        setReportResult(response.data);
      } else {
        setError('实验报告生成失败');
      }
    } catch (err) {
      console.error('实验报告生成错误:', err);
      setError('网络连接时发生错误');
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
      const response = await aiService.semanticSearchExperiments({
        query: searchQuery,
        includeMetadata: true,
        limit: 10
      });
      
      if (response.success && response.data) {
        setSearchResult(response.data);
      } else {
        setError('语义搜索失败');
      }
    } catch (err) {
      console.error('语义搜索错误:', err);
      setError('网络连接时发生错误');
    } finally {
      setLoading(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        自然语言处理智能分析
      </Typography>
      
      <Paper sx={{ mt: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<CategoryIcon />} 
            label="文本分类" 
            id="nlp-tab-0" 
            aria-controls="nlp-tabpanel-0" 
          />
          <Tab 
            icon={<SummarizeIcon />} 
            label="文本摘要" 
            id="nlp-tab-1" 
            aria-controls="nlp-tabpanel-1" 
          />
          <Tab 
            icon={<ReportIcon />} 
            label="实验报告" 
            id="nlp-tab-2" 
            aria-controls="nlp-tabpanel-2" 
          />
          <Tab 
            icon={<SearchIcon />} 
            label="学术论文" 
            id="nlp-tab-3" 
            aria-controls="nlp-tabpanel-3" 
          />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {/* 文本分类模块 */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="文本分类器" avatar={<CategoryIcon />} />
                <CardContent>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="请输入要分类的文本"
                    value={classificationText}
                    onChange={(e) => setClassificationText(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>分类模式</InputLabel>
                    <Select
                      value={multiLabelClassification ? 'multi' : 'single'}
                      onChange={(e) => setMultiLabelClassification(e.target.value === 'multi')}
                    >
                      <MenuItem value="single">单标签分类</MenuItem>
                      <MenuItem value="multi">多标签分类</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    onClick={handleAnalyzeClassification}
                    disabled={loading || !classificationText.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : <TextFieldsIcon />}
                    fullWidth
                  >
                    开始分类
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {classificationResult && (
                <Card>
                  <CardHeader 
                    title="分类结果" 
                    subheader={`主要类别: ${classificationResult.dominantCategory} (${(classificationResult.confidence * 100).toFixed(1)}%)`}
                    action={
                      <IconButton onClick={() => copyToClipboard(JSON.stringify(classificationResult, null, 2))}>
                        <ContentCopyIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      分类详情
                    </Typography>
                    {classificationResult.categories && classificationResult.categories.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {classificationResult.categories.map((category, index) => (
                          <Chip
                            key={index}
                            label={`${category.category} (${(category.confidence * 100).toFixed(1)}%)`}
                            variant={index === 0 ? "filled" : "outlined"}
                            color={index === 0 ? "primary" : "default"}
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                    )}
                    
                    {classificationResult.metadata && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          文本元数据
                        </Typography>
                        <Typography variant="body2">
                          字数: {classificationResult.metadata.wordCount} | 
                          语言: {classificationResult.metadata.LanguageIcon}
                        </Typography>
                        {classificationResult.metadata.keywords && classificationResult.metadata.keywords.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" gutterBottom>关键词:</Typography>
                            {classificationResult.metadata.keywords.map((keyword, index) => (
                              <Chip
                                key={index}
                                label={keyword}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* 文本摘要功能 */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="文本摘要生成" avatar={<SummarizeIcon />} />
                <CardContent>
                  <TextField
                    fullWidth
                    multiline
                    rows={8}
                    label="输入要摘要的文本"
                    value={summaryText}
                    onChange={(e) => setSummaryText(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>摘要格式</InputLabel>
                        <Select
                          value={summaryFormat}
                          onChange={(e) => setSummaryFormat(e.target.value as 'bullet' | 'paragraph')}
                        >
                          <MenuItem value="paragraph">段落格式</MenuItem>
                          <MenuItem value="bullet">要点格式</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="最大长度"
                        value={summaryMaxLength}
                        onChange={(e) => setSummaryMaxLength(parseInt(e.target.value) || 200)}
                        inputProps={{ min: 50, max: 1000 }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="contained"
                    onClick={handleGenerateSummary}
                    disabled={loading || !summaryText.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : <SummarizeIcon />}
                    fullWidth
                  >
                    生成摘要
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {summaryResult && (
                <Card>
                  <CardHeader 
                    title="摘要结果" 
                    subheader={summaryResult.metadata ? 
                      `压缩率: ${(summaryResult.metadata.compressionRatio * 100).toFixed(1)}% (${summaryResult.metadata.originalLength} → ${summaryResult.metadata.summaryLength}字符)` 
                      : '摘要生成完成'
                    }
                    action={
                      <IconButton onClick={() => copyToClipboard(summaryResult.summary)}>
                        <ContentCopyIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <Typography variant="body1" paragraph>
                      {summaryResult.summary}
                    </Typography>
                    
                    {summaryResult.keyPoints && summaryResult.keyPoints.length > 0 && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          要点提取
                        </Typography>
                        <List dense>
                          {summaryResult.keyPoints.map((point, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={`? ${point}`} />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* 实验报告生成 */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="实验报告生成器" avatar={<ReportIcon />} />
                <CardContent>
                  <TextField
                    fullWidth
                    label="实验ID"
                    value={experimentId}
                    onChange={(e) => setExperimentId(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>报告模板</InputLabel>
                    <Select
                      value={reportTemplate}
                      onChange={(e) => setReportTemplate(e.target.value)}
                    >
                      <MenuItem value="standard">��׼ģ��</MenuItem>
                      <MenuItem value="detailed">��ϸģ��</MenuItem>
                      <MenuItem value="summary">ժҪģ��</MenuItem>
                      <MenuItem value="academic">ѧ��ģ��</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>��������</InputLabel>
                    <Select
                      value={reportLanguageIcon}
                      onChange={(e) => setReportLanguageIcon(e.target.value as 'zh-CN' | 'en-US')}
                    >
                      <MenuItem value="zh-CN">����</MenuItem>
                      <MenuItem value="en-US">Ӣ��</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    onClick={handleGenerateReport}
                    disabled={loading || !experimentId.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : <ReportIcon />}
                    fullWidth
                  >
                    ���ɱ���
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              {reportResult && (
                <Card>
                  <CardHeader 
                    title="ʵ�鱨��" 
                    subheader={`ʵ��: ${reportResult.metadata?.experimentId || experimentId}`}
                    action={
                      <IconButton onClick={() => copyToClipboard(reportResult.report)}>
                        <ContentCopyIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <Typography 
                      variant="body1" 
                      component="div" 
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {reportResult.report}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* ����������� */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="��������" avatar={<SearchIcon />} />
                <CardContent>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="������ѯ"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ mb: 2 }}
                    placeholder="������Ȼ���Բ�ѯ���磺���ڹ�ѧʵ�����Ŀ"
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleSemanticSearch}
                    disabled={loading || !searchQuery.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                    fullWidth
                  >
                    ��������
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              {searchResult && (
                <Card>
                  <CardHeader 
                    title="�������" 
                    subheader={`�ҵ� ${searchResult.results.length || 0} �����ʵ��`}
                  />
                  <CardContent>
                    {searchResult.results && searchResult.results.length > 0 ? (
                      <List>
                        {searchResult.results.map((result, index) => (
                          <React.Fragment key={index}>
                            <ListItem>
                              <ListItemText
                                primary={result.title || `ʵ�� ${result.id}`}
                                secondary={
                                  <>
                                    <Typography component="span" variant="body2" color="text.primary">
                                      ���ƶ�: {(result.relevanceScore * 100).toFixed(1)}%
                                    </Typography>
                                    {result.snippet && (
                                      <>
                                        <br />
                                        {result.snippet}
                                      </>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                            {index < searchResult.results.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary">
                        δ�ҵ����ʵ��
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default NLPAnalytics;


