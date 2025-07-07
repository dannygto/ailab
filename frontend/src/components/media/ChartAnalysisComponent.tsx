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
  FormControlLabel
} from '@mui/material';
import { BarChartIcon } from '../../utils/icons';
import aiService from '../../services/aiService';
import { ScientificChartParams, ScientificChartResponse } from '../../types/mediaTypes';

interface ChartAnalysisComponentProps {
  onChartAnalysisComplete?: (result: ScientificChartResponse) => void;
}

const ChartAnalysisComponent: React.FC<ChartAnalysisComponentProps> = ({ onChartAnalysisComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScientificChartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<string>('auto');
  const [extractData, setExtractData] = useState<boolean>(true);
  const [includeAxisLabels, setIncludeAxisLabels] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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

  // ����ͼ������
  const handleChartAnalysis = async () => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const params: ScientificChartParams = {
        chartType: chartType as 'auto' | 'line' | 'bar' | 'scatter' | 'pie',
        extractData,
        includeAxisLabels
      };
      
      // ����FormData��������api����
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // ����ͼ������api
      const response = await aiService.analyzeScientificChart(imageFile, params);
      
      if (response.success && response.data) {
        setResult(response.data);
        
        // ����ṩ�˻ص������������
        if (onChartAnalysisComplete) {
          onChartAnalysisComplete(response.data);
        }
      } else {
        throw new Error(response.error || 'ͼ������ʧ��');
      }
    } catch (err) {
      console.error('ͼ������ʧ��:', err);
      setError('ͼ������ʧ�ܣ������ԡ�');
    } finally {
      setIsProcessing(false);
    }
  };

  // ����ȡ��������Ⱦ�ɱ���
  const renderDataTable = () => {
    if (!result?.extractedData) return null;
    
    const { labels, series } = result.extractedData;
    
    return (
      <div sx={{ mt: 3, overflowX: 'auto' }}>
        <Typography variant="subtitle1" gutterBottom>
          ��ȡ������:
        </Typography>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>
                ���/X��
              </th>
              {series.map((s, i) => (
                <th key={i} style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>
                  {s.name || `ϵ�� ${i+1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {label }
                </td>
                {series.map((s, j) => (
                  <td key={j} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                    {s.data[i] !== undefined ? s.data[i].toLocaleString() : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        ��ѧͼ������
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <div sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>ͼ������</InputLabel>
          <Select
            value={chartType}
            label="ͼ������"
            onChange={(e) => setChartType(e.target.value)}
            disabled={isProcessing}
          >
            <MenuItem value="auto">�Զ����</MenuItem>
            <MenuItem value="line">����ͼ</MenuItem>
            <MenuItem value="bar">��״ͼ</MenuItem>
            <MenuItem value="scatter">ɢ��ͼ</MenuItem>
            <MenuItem value="pie">��ͼ</MenuItem>
          </Select>
        </FormControl>
        
        <FormControlLabel
          control={
            <Checkbox
              checked={extractData}
              onChange={(e) => setExtractData(e.target.checked)}
              disabled={isProcessing}
            />
          }
          label="��ȡ����"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={includeAxisLabels}
              onChange={(e) => setIncludeAxisLabels(e.target.checked)}
              disabled={isProcessing}
            />
          }
          label="ʶ���������ǩ"
        />
      </div>
      
      <div sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<BarChartIcon />}
          disabled={isProcessing}
        >
          ѡ��ͼ��ͼƬ
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
            onClick={handleChartAnalysis}
            disabled={isProcessing}
          >
            ��ʼ����
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
            ͼ��Ԥ��:
          </Typography>
          <img 
            src={imagePreview} 
            alt="�ϴ���ͼ��" 
            style={{ maxWidth: '100%', maxHeight: '400px' }} 
          />
        </div>
      )}
      
      {result && (
        <div sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            �������:
          </Typography>
          
          <div sx={{ mb: 2 }}>
            <Typography variant="subtitle1">ͼ������:</Typography>
            <Typography variant="body1">{result.chartType}</Typography>
          </div>
          
          {result.title && (
            <div sx={{ mb: 2 }}>
              <Typography variant="subtitle1">ͼ������:</Typography>
              <Typography variant="body1">{result.title}</Typography>
            </div>
          )}
          
          {result.axisLabels && (
            <div sx={{ mb: 2 }}>
              <Typography variant="subtitle1">�������ǩ:</Typography>
              <Typography variant="body1">
                X��: {result.axisLabels.x || 'δ��⵽'}
              </Typography>
              <Typography variant="body1">
                Y��: {result.axisLabels.y || 'δ��⵽'}
              </Typography>
            </div>
          )}
          
          <div sx={{ mb: 2 }}>
            <Typography variant="subtitle1">ͼ������:</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {result.interpretation}
              </Typography>
            </Paper>
          </div>
          
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            ���Ŷ�: {(result.confidence * 100).toFixed(1)}%
          </Typography>
          
          {renderDataTable()}
        </div>
      )}
    </Paper>
  );
};

export default ChartAnalysisComponent;

