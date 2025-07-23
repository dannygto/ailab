import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Typography,
  Alert,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AutoFixHigh as AutoFixHighIcon,
  SmartToy as SmartToyIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { aiDataFormatService, DataSample, DataFormatAnalysis } from '../../services/aiDataFormatService';

interface AIDataAnalyzerProps {
  onAnalysisComplete?: (analysis: DataFormatAnalysis) => void;
  onParseRuleGenerated?: (parseRule: string) => void;
  initialSamples?: DataSample[];
  dataSourceType?: string;
}

const AIDataAnalyzer: React.FC<AIDataAnalyzerProps> = ({
  onAnalysisComplete,
  onParseRuleGenerated,
  initialSamples = [],
  dataSourceType = '未知'
}) => {
  const [samples, setSamples] = useState<DataSample[]>(initialSamples);
  const [newSampleData, setNewSampleData] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DataFormatAnalysis | null>(null);
  const [testingRule, setTestingRule] = useState(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddSample = () => {
    if (newSampleData.trim()) {
      const newSample: DataSample = {
        rawData: newSampleData.trim(),
        timestamp: new Date().toISOString(),
        source: dataSourceType
      };
      setSamples(prev => [...prev, newSample]);
      setNewSampleData('');
    }
  };

  const handleRemoveSample = (index: number) => {
    setSamples(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (samples.length === 0) {
      setError('请先添加一些数据样本');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const result = await aiDataFormatService.analyzeDataFormat(samples);
      
      if (result.success) {
        setAnalysis(result.analysis);
        onAnalysisComplete?.(result.analysis);
      } else {
        setError(result.error || '分析失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析过程中发生错误');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTestParseRule = async () => {
    if (!analysis) return;

    setTestingRule(true);
    setError(null);

    try {
      const result = await aiDataFormatService.validateParseRule(analysis.parseRule, samples);
      
      if (result.valid) {
        setTestResults(result.parsedData || []);
      } else {
        setError(result.errors?.join(', ') || '解析规则测试失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '测试解析规则时发生错误');
    } finally {
      setTestingRule(false);
    }
  };

  const handleApplyParseRule = () => {
    if (analysis) {
      onParseRuleGenerated?.(analysis.parseRule);
    }
  };

  const handleCopyParseRule = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis.parseRule);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return '高置信度';
    if (confidence >= 0.7) return '中等置信度';
    return '低置信度';
  };

  return (
    <Card>
      <CardHeader
        avatar={<SmartToyIcon color="primary" />}
        title="AI智能数据格式识别"
        subheader={`当前数据源: ${dataSourceType}`}
        action={
          <Tooltip title="AI会分析您提供的数据样本，自动识别格式并生成解析规则">
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        }
      />

      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            AI可以帮助您快速识别未知设备的数据格式，并自动生成解析规则。请提供一些数据样本开始分析。
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 数据样本输入 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            数据样本 ({samples.length})
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="添加数据样本"
              placeholder="粘贴从设备接收到的原始数据..."
              value={newSampleData}
              onChange={(e) => setNewSampleData(e.target.value)}
              variant="outlined"
            />
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleAddSample}
                disabled={!newSampleData.trim()}
              >
                添加样本
              </Button>
              <Button
                variant="outlined"
                onClick={() => setNewSampleData('')}
                disabled={!newSampleData.trim()}
              >
                清空
              </Button>
            </Box>
          </Box>

          {samples.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>查看已添加的样本 ({samples.length})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {samples.map((sample, index) => (
                    <ListItem 
                      key={index}
                      secondaryAction={
                        <IconButton onClick={() => handleRemoveSample(index)}>
                          <ErrorIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`样本 ${index + 1}`}
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              时间: {sample.timestamp}
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={sample.rawData}
                              variant="outlined"
                              size="small"
                              InputProps={{ readOnly: true }}
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>

        {/* AI分析按钮 */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={analyzing ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
            onClick={handleAnalyze}
            disabled={analyzing || samples.length === 0}
            sx={{ minWidth: 200 }}
          >
            {analyzing ? '正在分析...' : 'AI智能分析'}
          </Button>
        </Box>

        {/* 分析结果 */}
        {analysis && (
          <Box>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              分析结果
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      识别格式
                    </Typography>
                    <Chip 
                      label={analysis.format.toUpperCase()} 
                      color="primary" 
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      置信度
                    </Typography>
                    <Chip 
                      label={`${(analysis.confidence * 100).toFixed(1)}%`}
                      color={getConfidenceColor(analysis.confidence)}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      {getConfidenceText(analysis.confidence)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      字段数量
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {analysis.structure.fields.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      嵌套结构
                    </Typography>
                    <Chip 
                      label={analysis.structure.nested ? '是' : '否'}
                      color={analysis.structure.nested ? 'warning' : 'success'}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* 字段信息表格 */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">识别的数据字段</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>字段名</TableCell>
                        <TableCell>数据类型</TableCell>
                        <TableCell>单位</TableCell>
                        <TableCell>描述</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analysis.structure.fields.map((field, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {field.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={field.type} 
                              size="small" 
                              variant="outlined"
                              color={
                                field.type === 'number' ? 'primary' :
                                field.type === 'datetime' ? 'secondary' :
                                field.type === 'boolean' ? 'success' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>{field.unit || '-'}</TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {field.description}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            {/* 解析规则 */}
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">生成的解析规则</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="解析规则代码"
                    value={analysis.parseRule}
                    variant="outlined"
                    InputProps={{ 
                      readOnly: true,
                      endAdornment: (
                        <IconButton onClick={handleCopyParseRule}>
                          <ContentCopyIcon />
                        </IconButton>
                      )
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={testingRule ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                    onClick={handleTestParseRule}
                    disabled={testingRule}
                  >
                    测试解析规则
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleApplyParseRule}
                  >
                    应用此规则
                  </Button>
                </Box>

                {/* 测试结果 */}
                {testResults && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      解析测试结果:
                    </Typography>
                    <Alert severity="success" sx={{ mb: 2 }}>
                      成功解析 {testResults.length} 条数据记录
                    </Alert>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="解析后的数据预览"
                      value={JSON.stringify(testResults.slice(0, 3), null, 2)}
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>

            {/* AI建议 */}
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">AI优化建议</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {analysis.suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <InfoIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={suggestion} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AIDataAnalyzer;
