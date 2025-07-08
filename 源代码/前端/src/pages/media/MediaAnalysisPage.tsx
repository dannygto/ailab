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

interface Processingsettings {
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
  const [settingsOpen, setsettingsOpen] = useState(false);
  const [SettingsIcon, setsettings] = useState<Processingsettings>({
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
  
  // ������ǩҳ�л�
  const handleTabChange = (_Event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // ���ӽ������ʷ��¼
  const addToHistory = (type: 'speech' | 'ocr' | 'chart' | 'formula', filename: string, result: any, status: 'success' | 'error' = 'success') => {
    const newRecord = {
      id: `${type}-${Date.now()}`,
      type,
      timestamp: new Date(),
      filename,
      result,
      status
    };
    
    setProcessingHistory(prev => [newRecord, ...prev].slice(0, 20)); // �������20����¼
    
    // �Զ����湦��
    if (settings.autoSave) {
      localStorage.setItem('mediaAnalysisHistory', JSON.stringify([newRecord, ...processingHistory].slice(0, 50)));
    }
  };
  
  // �������н��
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
  
  // �����ض����͵Ľ��
  const exportResult = (type: keyof typeof processingResults) => {
    const result = processingResults[type];
    if (!result) return;
    
    let exportContent = '';
    let filename = '';
    
    switch (type) {
      case 'speech':
        const speechResult = result as SpeechToTextResponse;
        exportContent = `����תд���\nʱ��: ${new Date().toLocaleString()}\n\n${speechResult.text}\n\n���Ŷ�: ${(speechResult.confidence * 100).toFixed(1)}%\n����: ${speechResult.metadata.LanguageIcon}\nʱ��: ${speechResult.metadata.duration}��`;
        filename = `speech-transcription-${Date.now()}.txt`;
        break;
      case 'ocr':
        const ocrResult = result as OCRResponse;
        exportContent = `OCRʶ����\nʱ��: ${new Date().toLocaleString()}\n\n${ocrResult.text}\n\n���Ŷ�: ${(ocrResult.confidence * 100).toFixed(1)}%\n����: ${ocrResult.metadata.LanguageIcon}`;
        filename = `ocr-result-${Date.now()}.txt`;
        break;
      case 'chart':
        const chartResult = result as ScientificChartResponse;
        exportContent = `ͼ���������\nʱ��: ${new Date().toLocaleString()}\n\nͼ������: ${chartResult.chartType}\n����: ${chartResult.interpretation}\n\n���Ŷ�: ${(chartResult.confidence * 100).toFixed(1)}%`;
        filename = `chart-analysis-${Date.now()}.txt`;
        break;
      case 'formula':
        const formulaResult = result as FormulaRecognitionResponse;
        exportContent = `��ʽʶ����\nʱ��: ${new Date().toLocaleString()}\n\n��ʽ: ${formulaResult.formula}\n��ʽ: ${formulaResult.originalFormat}\n\n${formulaResult.explanation || ''}\n\n���Ŷ�: ${(formulaResult.confidence * 100).toFixed(1)}%`;
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
  
  // ��������תд���
  const handleSpeechToTextComplete = (result: SpeechToTextResponse) => {
    setProcessingResults(prev => ({
      ...prev,
      speech: result
    }));
    addToHistory('speech', '¼���ļ�', result);
    
    if (settings.enableNotificationsIcon) {
      new Notification('����תд���', {
        body: `ʶ���ı�����: ${result.text.length}�ַ������Ŷ�: ${(result.confidence * 100).toFixed(1)}%`,
        icon: '/logo18060.png'
      });
    }
  };
  
  // ����OCR���
  const handleOCRComplete = (result: OCRResponse) => {
    setProcessingResults(prev => ({
      ...prev,
      ocr: result
    }));
    addToHistory('ocr', 'ͼƬ�ļ�', result);
    
    if (settings.enableNotificationsIcon) {
      new Notification('OCRʶ�����', {
        body: `ʶ���ı�����: ${result.text.length}�ַ������Ŷ�: ${(result.confidence * 100).toFixed(1)}%`,
        icon: '/logo18060.png'
      });
    }
  };
  
  // ����ͼ���������
  const handleChartAnalysisComplete = (result: ScientificChartResponse) => {
    setProcessingResults(prev => ({
      ...prev,
      chart: result
    }));
    addToHistory('chart', 'ͼ��ͼƬ', result);
    
    if (settings.enableNotificationsIcon) {
      new Notification('ͼ���������', {
        body: `ͼ������: ${result.chartType}�����Ŷ�: ${(result.confidence * 100).toFixed(1)}%`,
        icon: '/logo18060.png'
      });
    }
  };
  
  // ������ʽʶ�����
  const handleFormulaRecognitionComplete = (result: FormulaRecognitionResponse) => {
    setProcessingResults(prev => ({
      ...prev,
      formula: result
    }));
    addToHistory('formula', '��ʽͼƬ', result);
    
    if (settings.enableNotificationsIcon) {
      new Notification('��ʽʶ�����', {
        body: `��ʽ��ʽ: ${result.originalFormat}�����Ŷ�: ${(result.confidence * 100).toFixed(1)}%`,
        icon: '/logo18060.png'
      });
    }
  };
  
  // ����֪ͨȨ��
  React.useEffect(() => {
    if (settings.enableNotificationsIcon && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings.enableNotificationsIcon]);
  
  // �ӱ��ش洢������ʷ��¼
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
            ý������ʶ�������
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip 
              label={`����ģʽ: ${settings.qualityMode === 'fast' ? '����' : settings.qualityMode === 'balanced' ? 'ƽ��' : '��ȷ'}`}
              variant="outlined" 
              size="small"
            />
            <Chip 
              label={`����: ${settings.defaultLanguageIcon === 'zh-CN' ? '����' : settings.defaultLanguageIcon}`}
              variant="outlined" 
              size="small"
            />
          </Stack>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          ��ģ���ṩ����ý�����ݵ�����ʶ����������ܣ���������ת�ı���ͼ��OCR����ѧͼ����������ѧ��ʽʶ�𣬰����û�������ȡ���������ý�����ݡ�
        </Typography>
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ѡ���·���ǩҳʹ�ò�ͬ��ý�崦�����ܡ������������ֱ�Ӹ��ƻ򵼳�����ʵ������ͱ��档</span>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportAllResults}
              sx={{ ml: 2 }}
            >
              �������н��
            </Button>
          </Box>
        </Alert>
      </Paper>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="ý�崦��ѡ�"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="����ת�ı�" id="media-tab-0" aria-controls="media-tabpanel-0" />
          <Tab label="ͼ������ʶ��" id="media-tab-1" aria-controls="media-tabpanel-1" />
          <Tab label="��ѧͼ������" id="media-tab-2" aria-controls="media-tabpanel-2" />
          <Tab label="��ѧ��ʽʶ��" id="media-tab-3" aria-controls="media-tabpanel-3" />
          <Tab label="ʵʱЭ��" id="media-tab-4" aria-controls="media-tabpanel-4" />
          <Tab label="������" id="media-tab-5" aria-controls="media-tabpanel-5" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <SpeechToTextComponent onTranscriptionComplete={handleSpeechToTextComplete} />
        
        {processingResults.speech && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              ���ڴ������
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                ����תд ({new Date().toLocaleString()})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ʱ��: {processingResults.speech.metadata.duration.toFixed(1)}�� | 
                ����: {processingResults.speech.metadata.wordCount} | 
                ���Ŷ�: {(processingResults.speech.confidence * 100).toFixed(1)}%
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
              ���ڴ������
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                ͼ��OCR ({new Date().toLocaleString()})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ����: {processingResults.ocr.metadata.LanguageIcon} | 
                ����: {processingResults.ocr.metadata.orientation}�� | 
                ���Ŷ�: {(processingResults.ocr.confidence * 100).toFixed(1)}%
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
              ���ڴ������
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                ͼ������ ({new Date().toLocaleString()})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ͼ������: {processingResults.chart.chartType} | 
                ���Ŷ�: {(processingResults.chart.confidence * 100).toFixed(1)}%
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
              ���ڴ������
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                ��ʽʶ�� ({new Date().toLocaleString()})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                ԭʼ��ʽ: {processingResults.formula.originalFormat} | 
                ���Ŷ�: {(processingResults.formula.confidence * 100).toFixed(1)}%
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
          experimentId={undefined} 
          onSessionChange={(session) => {
            console.log('Э���Ự״̬����:', session);
          }}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={5}>
        <AIServiceMonitor 
          autoRefreshIcon={true}
          RefreshIconInterval={30000}
        />
      </TabPanel>
      
      {/* ����������ť */}
      <Fab 
        color="primary" 
        aria-label="����"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setsettingsOpen(true)}
      >
        <SettingsIcon />
      </Fab>
      
      {/* ���öԻ��� */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setsettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ý�崦������</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Ĭ������</InputLabel>
              <Select
                value={settings.defaultLanguageIcon}
                label="Ĭ������"
                onChange={(e) => setsettings(prev => ({ ...prev, defaultLanguageIcon: e.target.value }))}
              >
                <MenuItem value="zh-CN">���� (����)</MenuItem>
                <MenuItem value="en-US">Ӣ�� (����)</MenuItem>
                <MenuItem value="ja-JP">����</MenuItem>
                <MenuItem value="ko-KR">����</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>��������</InputLabel>
              <Select
                value={settings.qualityMode}
                label="��������"
                onChange={(e) => setsettings(prev => ({ ...prev, qualityMode: e.target.value as 'fast' | 'balanced' | 'accurate' }))}
              >
                <MenuItem value="fast">����ģʽ (���죬���Ƚϵ�)</MenuItem>
                <MenuItem value="balanced">ƽ��ģʽ (�Ƽ�)</MenuItem>
                <MenuItem value="accurate">��ȷģʽ (���������ȸ���)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={(e) => setsettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                />
              }
              label="�Զ����洦�����"
              sx={{ mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableNotificationsIcon}
                  onChange={(e) => setsettings(prev => ({ ...prev, enableNotificationsIcon: e.target.checked }))}
                />
              }
              label="�������֪ͨ"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setsettingsOpen(false)}>ȡ��</Button>
          <Button 
            onClick={() => {
              // �������õ����ش洢
              localStorage.setItem('mediaAnalysissettings', JSON.stringify(settings));
              setsettingsOpen(false);
            }}
            variant="contained"
          >
            ��������
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MediaAnalysisPage;


