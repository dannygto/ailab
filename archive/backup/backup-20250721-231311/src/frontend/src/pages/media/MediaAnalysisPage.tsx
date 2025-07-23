import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Stack
} from '@mui/material';
import { SettingsIcon } from '../../utils/icons';
import { DownloadIcon } from '../../utils/icons';
import SpeechToTextComponent from '../../components/media/SpeechToTextComponent';
import OCRComponent from '../../components/media/OCRComponent';
import ChartAnalysisComponent from '../../components/media/ChartAnalysisComponent';
import FormulaRecognitionComponent from '../../components/media/FormulaRecognitionComponent';
import RealTimeCollaboration from '../../components/media/RealTimeCollaboration';
import AIServiceMonitor from '../../components/media/AIServiceMonitor';
import { SpeechToTextResponse, OCRResponse, ScientificChartResponse, FormulaRecognitionResponse } from '../../types/mediaTypes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ProcessingSettings {
  autoSave: boolean;
  defaultLanguageIcon: string;
  qualityMode: 'fast' | 'balanced' | 'accurate';
  enableNotificationsIcon: boolean;
  maxFileSize: number; // MB
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`media-tabpanel-${index}`}
      aria-labelledby={`media-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const MediaAnalysisPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [processingResults, setProcessingResults] = useState<{
    speech?: SpeechToTextResponse;
    ocr?: OCRResponse;
    chart?: ScientificChartResponse;
    formula?: FormulaRecognitionResponse;
  }>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mediaSettings, setMediaSettings] = useState<ProcessingSettings>({
    autoSave: true,
    defaultLanguageIcon: 'zh-CN',
    qualityMode: 'balanced',
    enableNotificationsIcon: true,
    maxFileSize: 50
  });
  const [processingHistory, setProcessingHistory] = useState<Array<{
    id: string;
    type: 'speech' | 'ocr' | 'chart' | 'formula';
    timestamp: Date;
    filename: string;
    result: any;
    status: 'success' | 'error';
  }>>([]);
  
  // 标签页切换处理
  const handleTabChange = (_Event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // 添加处理记录到历史
  const addToHistory = (type: 'speech' | 'ocr' | 'chart' | 'formula', filename: string, result: any, status: 'success' | 'error' = 'success') => {
    const newRecord = {
      id: `${type}-${Date.now()}`,
      type,
      timestamp: new Date(),
      filename,
      result,
      status
    };
    
    setProcessingHistory(prev => [newRecord, ...prev].slice(0, 20)); // 保留最新20条记录
    
    // 自动保存到本地存储
    if (mediaSettings.autoSave) {
      localStorage.setItem('mediaAnalysisHistory', JSON.stringify([newRecord, ...processingHistory].slice(0, 50)));
    }
  };
  
  // 导出所有处理结果
  const exportAllResults = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      results: processingResults,
      history: processingHistory,
      SettingsIcon
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `media-analysis-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  };
  
  // 导出单个处理结果
  const exportResult = (type: keyof typeof processingResults) => {
    const result = processingResults[type];
    if (!result) return;
    
    let exportContent = '';
    let filename = '';
    
    switch (type) {
      case 'speech':
        const speechResult = result as SpeechToTextResponse;
        exportContent = `语音转文本结果\n时间: ${new Date().toLocaleString()}\n\n${speechResult.text}\n\n置信度: ${(speechResult.confidence * 100).toFixed(1)}%\n语言: ${speechResult.metadata.language}\n时长: ${speechResult.metadata.duration}秒`;
        filename = `speech-transcription-${Date.now()}.txt`;
        break;
      case 'ocr':
        const ocrResult = result as OCRResponse;
        exportContent = `OCR识别结果\n时间: ${new Date().toLocaleString()}\n\n${ocrResult.text}\n\n置信度: ${(ocrResult.confidence * 100).toFixed(1)}%\n语言: ${ocrResult.metadata.language}`;
        filename = `ocr-result-${Date.now()}.txt`;
        break;
      case 'chart':
        const chartResult = result as ScientificChartResponse;
        exportContent = `图表分析结果\n时间: ${new Date().toLocaleString()}\n\n图表类型: ${chartResult.chartType}\n解析: ${chartResult.interpretation}\n\n置信度: ${(chartResult.confidence * 100).toFixed(1)}%`;
        filename = `chart-analysis-${Date.now()}.txt`;
        break;
      case 'formula':
        const formulaResult = result as FormulaRecognitionResponse;
        exportContent = `公式识别结果\n时间: ${new Date().toLocaleString()}\n\n公式: ${formulaResult.formula}\n原始格式: ${formulaResult.originalFormat}\n\n${formulaResult.explanation || ''}\n\n置信度: ${(formulaResult.confidence * 100).toFixed(1)}%`;
        filename = `formula-recognition-${Date.now()}.txt`;
        break;
    }
    
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(link.href);
  };
  
  // 语音转文本完成处理
  const handleSpeechToTextComplete = (result: SpeechToTextResponse) => {
    setProcessingResults(prev => ({
      ...prev,
      speech: result
    }));
    addToHistory('speech', '录音文件', result);
    
    if (mediaSettings.enableNotificationsIcon) {
      new Notification('语音转文本完成', {
        body: `识别文本长度: ${result.text.length}字符，置信度: ${(result.confidence * 100).toFixed(1)}%`,
        icon: '/logo18060.png'
      });
    }
  };
  
  // OCR 识别完成处理
  const handleOCRComplete = (result: OCRResponse) => {
    setProcessingResults(prev => ({
      ...prev,
      ocr: result
    }));
    addToHistory('ocr', '图片文件', result);
    
    if (mediaSettings.enableNotificationsIcon) {
      new Notification('OCR识别完成', {
        body: `识别文本长度: ${result.text.length}字符，置信度: ${(result.confidence * 100).toFixed(1)}%`,
        icon: '/logo18060.png'
      });
    }
  };
  
  // 图表分析完成处理
  const handleChartAnalysisComplete = (result: ScientificChartResponse) => {
    setProcessingResults(prev => ({
      ...prev,
      chart: result
    }));
    addToHistory('chart', 'ͼ��ͼƬ', result);
    
    if (mediaSettings.enableNotificationsIcon) {
      new Notification('图表分析完成', {
        body: `分析结果: ${result.charts.length}个图表，${result.metadata.processingTime}ms`,
        icon: '/logo18060.png'
      });
    }
  };
  
  // 公式识别完成处理
  const handleFormulaRecognitionComplete = (result: FormulaRecognitionResponse) => {
    setProcessingResults(prev => ({
      ...prev,
      formula: result
    }));
    addToHistory('formula', '��ʽͼƬ', result);
    
    if (mediaSettings.enableNotificationsIcon) {
      new Notification('公式识别完成', {
        body: `识别公式: ${result.formulas.length}个，置信度: ${(result.confidence * 100).toFixed(1)}%`,
        icon: '/logo18060.png'
      });
    }
  };
  
  // 请求通知权限
  React.useEffect(() => {
    if (mediaSettings.enableNotificationsIcon && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [mediaSettings.enableNotificationsIcon]);
  
  // 从本地存储加载处理历史
  React.useEffect(() => {
    const savedHistory = localStorage.getItem('mediaAnalysisHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setProcessingHistory(parsedHistory);
      } catch (error) {
        console.error('Failed to load processing history:', error);
      }
    }
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            媒体分析与识别
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip 
              label={`质量模式: ${mediaSettings.qualityMode === 'fast' ? '快速' : mediaSettings.qualityMode === 'balanced' ? '平衡' : '精确'}`}
              variant="outlined" 
              size="small"
            />
            <Chip 
              label={`语言: ${mediaSettings.defaultLanguageIcon === 'zh-CN' ? '中文' : mediaSettings.defaultLanguageIcon}`}
              variant="outlined" 
              size="small"
            />
          </Stack>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          本系统提供多种媒体文件的智能分析与识别服务，包括语音转文本、图像OCR、科学图表分析及公式识别等功能，旨在帮助用户高效获取和处理多媒体信息。
        </Typography>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>请选择合适的标签页进行相应的媒体文件分析，系统将自动处理并反馈结果至此页面。</span>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportAllResults}
              sx={{ ml: 2 }}
            >
              导出处理结果
            </Button>
          </Box>
        </Alert>
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="媒体文件分析标签"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="语音转文本" id="media-tab-0" aria-controls="media-tabpanel-0" />
          <Tab label="图像OCR识别" id="media-tab-1" aria-controls="media-tabpanel-1" />
          <Tab label="科学图表分析" id="media-tab-2" aria-controls="media-tabpanel-2" />
          <Tab label="公式识别" id="media-tab-3" aria-controls="media-tabpanel-3" />
          <Tab label="实时协作" id="media-tab-4" aria-controls="media-tabpanel-4" />
          <Tab label="AI服务监控" id="media-tab-5" aria-controls="media-tabpanel-5" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <SpeechToTextComponent onTranscriptionComplete={handleSpeechToTextComplete} />
        
        {processingResults.speech && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              处理结果
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                语音转文本 ({new Date().toLocaleString()})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                时长: {processingResults.speech.metadata.duration.toFixed(1)}秒 | 
                字数: {processingResults.speech.metadata.wordCount} | 
                置信度: {(processingResults.speech.confidence * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body1" paragraph>
                {processingResults.speech.text.substring(0, 150)}
                {processingResults.speech.text.length > 150 ? '...' : ''}
              </Typography>
            </Paper>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <OCRComponent onOCRComplete={handleOCRComplete} />
        
        {processingResults.ocr && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              处理结果
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                图像OCR ({new Date().toLocaleString()})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                语言: {processingResults.ocr.metadata.language} | 
                方向: {processingResults.ocr.metadata.orientation}° | 
                置信度: {(processingResults.ocr.confidence * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body1" paragraph>
                {processingResults.ocr.text.substring(0, 150)}
                {processingResults.ocr.text.length > 150 ? '...' : ''}
              </Typography>
            </Paper>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <ChartAnalysisComponent onChartAnalysisComplete={handleChartAnalysisComplete} />
        
        {processingResults.chart && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              处理结果
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                科学图表分析 ({new Date().toLocaleString()})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                图表类型: {processingResults.chart.chartType} | 
                置信度: {(processingResults.chart.confidence * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body1" paragraph>
                {processingResults.chart.interpretation.substring(0, 150)}
                {processingResults.chart.interpretation.length > 150 ? '...' : ''}
              </Typography>
            </Paper>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={3}>
        <FormulaRecognitionComponent onFormulaRecognitionComplete={handleFormulaRecognitionComplete} />
        
        {processingResults.formula && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              处理结果
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                公式识别 ({new Date().toLocaleString()})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                原始格式: {processingResults.formula.originalFormat} | 
                置信度: {(processingResults.formula.confidence * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body1" fontFamily="monospace" paragraph>
                {processingResults.formula.formula.substring(0, 100)}
                {processingResults.formula.formula.length > 100 ? '...' : ''}
              </Typography>
              {processingResults.formula.explanation && (
                <Typography variant="body2" color="text.secondary">
                  {processingResults.formula.explanation.substring(0, 150)}
                  {processingResults.formula.explanation.length > 150 ? '...' : ''}
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={4}>
        <RealTimeCollaboration 
          experimentId={null} 
          onSessionChange={(session: any) => {
            // console.log removed
          }}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={5}>
        <AIServiceMonitor 
          autoRefreshIcon={true}
          RefreshIconInterval={30000}
        />
      </TabPanel>
      
      {/* 设置按钮 */}
      <Fab 
        color="primary" 
        aria-label="设置"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setSettingsOpen(true)}
      >
        <SettingsIcon />
      </Fab>
      
      {/* 设置对话框 */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>媒体分析设置</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>默认语言</InputLabel>
              <Select
                value={mediaSettings.defaultLanguageIcon}
                label="默认语言"
                onChange={(e) => setMediaSettings(prev => ({ ...prev, defaultLanguageIcon: e.target.value }))}
              >
                <MenuItem value="zh-CN">中文 (简体)</MenuItem>
                <MenuItem value="en-US">英文 (美国)</MenuItem>
                <MenuItem value="ja-JP">日语</MenuItem>
                <MenuItem value="ko-KR">韩语</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>处理质量</InputLabel>
              <Select
                value={mediaSettings.qualityMode}
                label="处理质量"
                onChange={(e) => setMediaSettings(prev => ({ ...prev, qualityMode: e.target.value as 'fast' | 'balanced' | 'accurate' }))}
              >
                <MenuItem value="fast">极速模式 (低延迟, 低精度)</MenuItem>
                <MenuItem value="balanced">平衡模式 (适中)</MenuItem>
                <MenuItem value="accurate">精准模式 (高精度, 低延迟)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={mediaSettings.autoSave}
                  onChange={(e) => setMediaSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                />
              }
              label="自动保存处理结果"
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={mediaSettings.enableNotificationsIcon}
                  onChange={(e) => setMediaSettings(prev => ({ ...prev, enableNotificationsIcon: e.target.checked }))}
                />
              }
              label="启用处理完成通知"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>取消</Button>
          <Button 
            onClick={() => {
              // 保存设置到本地存储
              localStorage.setItem('mediaAnalysissettings', JSON.stringify(mediaSettings));
              setSettingsOpen(false);
            }}
            variant="contained"
          >
            保存设置
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MediaAnalysisPage;



