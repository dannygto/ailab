import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Checkbox,
  FormControlLabel,
  Tab,
  Tabs
} from '@mui/material';
import { FunctionsIcon } from '../../utils/icons';
import aiService from '../../services/aiService';
import { FormulaRecognitionParams, FormulaRecognitionResponse } from '../../types/mediaTypes';

interface FormulaRecognitionComponentProps {
  onFormulaRecognitionComplete?: (result: FormulaRecognitionResponse) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`formula-tabpanel-${index}`}
      aria-labelledby={`formula-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div sx={{ p: 2 }}>
          {children}
        </div>
      )}
    </div>
  );
};

const FormulaRecognitionComponent: React.FC<FormulaRecognitionComponentProps> = ({ onFormulaRecognitionComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<FormulaRecognitionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<string>('latex');
  const [includeExplanation, setIncludeExplanation] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);

  // ����ͼƬ�ϴ�
  const handleFileChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    if (Event.target.files && Event.target.files[0]) {
      const file = Event.target.files[0];
      setImageFile(file);
      
      // ����Ԥ��
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      // ���ý��
      setResult(null);
      setError(null);
    }
  };

  // ������ʽʶ��
  const handleFormulaRecognition = async () => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const params: FormulaRecognitionParams = {
        format: format as 'latex' | 'mathml' | 'text',
        includeExplanation
      };
      
      // ����FormData��������api����
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // ���ù�ʽʶ��api
      const response = await aiService.recognizeFormula(imageFile, params);
      
      if (response.success && response.data) {
        setResult(response.data);
        
        // ����ṩ�˻ص������������
        if (onFormulaRecognitionComplete) {
          onFormulaRecognitionComplete(response.data);
        }
      } else {
        throw new Error(response.error || '��ʽʶ��ʧ��');
      }
    } catch (err) {
      console.error('��ʽʶ��ʧ��:', err);
      setError('��ʽʶ��ʧ�ܣ������ԡ�');
    } finally {
      setIsProcessing(false);
    }
  };

  // ������ǩҳ�л�
  const handleTabChange = (_Event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // ���ƹ�ʽ��������
  const copyFormula = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('�Ѹ��Ƶ�������');
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        ��ѧ��ʽʶ��
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <div sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>�����ʽ</InputLabel>
          <Select
            value={format}
            label="�����ʽ"
            onChange={(e) => setFormat(e.target.value)}
            disabled={isProcessing}
          >
            <MenuItem value="latex">LaTeX</MenuItem>
            <MenuItem value="mathml">MathML</MenuItem>
            <MenuItem value="text">���ı�</MenuItem>
          </Select>
        </FormControl>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={includeExplanation}
              onChange={(e) => setIncludeExplanation(e.target.checked)}
              disabled={isProcessing}
            />
          }
          label="������ʽ����"
        />
      </div>
      
      <div sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<FunctionsIcon />}
          disabled={isProcessing}
        >
          ѡ��ʽͼƬ
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
        
        {imageFile && (
          <Button
            variant="contained"
            onClick={handleFormulaRecognition}
            disabled={isProcessing}
          >
            ��ʼʶ��
          </Button>
        )}
      </div>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isProcessing && (
        <div sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </div>
      )}
      
      {imagePreview && (
        <div sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            ��ʽԤ��:
          </Typography>
          <img 
            src={imagePreview} 
            alt="�ϴ��Ĺ�ʽ" 
            style={{ maxWidth: '100%', maxHeight: '300px' }} 
          />
        </div>
      )}
      
      {result && (
        <div sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            ʶ����:
          </Typography>
          
          <div sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              ���Ŷ�: {(result.confidence * 100).toFixed(1)}% | 
              ԭʼ��ʽ: {result.originalFormat}
            </Typography>
            
            {result.convertedFormats && Object.keys(result.convertedFormats).length > 0 && (
              <div sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="��ʽ��ʽ��ǩҳ">
                  {result.convertedFormats.latex && <Tab label="LaTeX" id="formula-tab-0" aria-controls="formula-tabpanel-0" />}
                  {result.convertedFormats.mathml && <Tab label="MathML" id="formula-tab-1" aria-controls="formula-tabpanel-1" />}
                  {result.convertedFormats.text && <Tab label="���ı�" id="formula-tab-2" aria-controls="formula-tabpanel-2" />}
                </Tabs>
                
                {result.convertedFormats.latex && (
                  <TabPanel value={tabValue} index={0}>
                    <div sx={{ position: 'relative' }}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'background.default',
                          fontFamily: 'monospace',
                          overflowX: 'auto'
                        }}
                      >
                        <pre style={{ margin: 0 }}>{result.convertedFormats.latex}</pre>
                      </Paper>
                      <Button 
                        size="small" 
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => copyFormula(result.convertedFormats?.latex || '')}
                      >
                        ����
                      </Button>
                    </div>
                  </TabPanel>
                )}
                
                {result.convertedFormats.mathml && (
                  <TabPanel value={tabValue} index={1}>
                    <div sx={{ position: 'relative' }}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'background.default',
                          fontFamily: 'monospace',
                          overflowX: 'auto'
                        }}
                      >
                        <pre style={{ margin: 0 }}>{result.convertedFormats.mathml}</pre>
                      </Paper>
                      <Button 
                        size="small" 
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => copyFormula(result.convertedFormats?.mathml || '')}
                      >
                        ����
                      </Button>
                    </div>
                  </TabPanel>
                )}
                
                {result.convertedFormats.text && (
                  <TabPanel value={tabValue} index={2}>
                    <div sx={{ position: 'relative' }}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'background.default',
                          fontFamily: 'monospace'
                        }}
                      >
                        <Typography variant="body1">{result.convertedFormats.text}</Typography>
                      </Paper>
                      <Button 
                        size="small" 
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => copyFormula(result.convertedFormats?.text || '')}
                      >
                        ����
                      </Button>
                    </div>
                  </TabPanel>
                )}
              </div>
            )}
            
            {!result.convertedFormats && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  bgcolor: 'background.default',
                  fontFamily: 'monospace',
                  position: 'relative'
                }}
              >
                <pre style={{ margin: 0 }}>{result.formula}</pre>
                <Button 
                  size="small" 
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                  onClick={() => copyFormula(result.formula)}
                >
                  ����
                </Button>
              </Paper>
            )}
          </div>
          
          {result.explanation && (
            <div sx={{ mt: 3 }}>
              <Typography variant="subtitle1">��ʽ����:</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {result.explanation}
                </Typography>
              </Paper>
            </div>
          )}
        </div>
      )}
    </Paper>
  );
};

export default FormulaRecognitionComponent;

