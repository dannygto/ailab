import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  TextField,
  Autocomplete
} from '@mui/material';
import { LinkOutlinedIcon as LinkIcon, ScienceIcon as ExperimentIcon, ReportIcon } from '../../utils/icons';
import { SpeechToTextResponse, OCRResponse, ScientificChartResponse, FormulaRecognitionResponse } from '../../types/mediaTypes';

interface ExperimentMediaIntegrationProps {
  mediaResults: {
    speech?: SpeechToTextResponse;
    ocr?: OCRResponse;
    chart?: ScientificChartResponse;
    formula?: FormulaRecognitionResponse;
  };
  onIntegrationComplete?: (data: any) => void;
}

interface Experiment {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

const ExperimentMediaIntegration: React.FC<ExperimentMediaIntegrationProps> = ({ 
  mediaResults, 
  onIntegrationComplete 
}) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string>('');
  const [integrationMode, setIntegrationMode] = useState<'attach' | 'analyze' | 'report'>('attach');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // ģ���ȡʵ���б�
  useEffect(() => {
    const mockExperiments: Experiment[] = [
      {
        id: 'exp-001',
        name: '�¶ȶԻ�ѧ��Ӧ���ʵ�Ӱ��',
        type: 'measurement',
        status: 'running',
        createdAt: '2025-01-15'
      },
      {
        id: 'exp-002', 
        name: '���ն�ֲ��������ʵ��',
        type: 'observation',
        status: 'completed',
        createdAt: '2025-01-10'
      },
      {
        id: 'exp-003',
        name: '��������ǿ�Ȳ���',
        type: 'measurement',
        status: 'draft',
        createdAt: '2025-01-20'
      }
    ];
    setExperiments(mockExperiments);
  }, []);

  // ����ý�����Զ��Ƽ�ʵ��
  const getRecommendedExperiments = () => {
    // �򵥵Ĺؼ���ƥ���Ƽ�
    const keywords: string[] = [];
    
    if (mediaResults.speech) {
      keywords.push(...mediaResults.speech.text.split(/\s+/).slice(0, 5));
    }
    if (mediaResults.ocr) {
      keywords.push(...mediaResults.ocr.text.split(/\s+/).slice(0, 5));
    }
    
    return experiments.filter(exp => 
      keywords.some(keyword => 
        exp.name.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };

  // ִ�м��ɲ���
  const handleIntegration = async () => {
    if (!selectedExperiment) return;
    
    setIsLoading(true);
    
    try {
      const integrationData = {
        experimentId: selectedExperiment,
        mode: integrationMode,
        mediaResults,
        tags,
        notes,
        timestamp: new Date().toISOString()
      };

      // ģ��api����
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onIntegrationComplete) {
        onIntegrationComplete(integrationData);
      }
      
      // ���ñ���
      setSelectedExperiment('');
      setTags([]);
      setNotes('');
      
    } catch (error) {
      console.error('Integration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // �������ܱ�ǩ����
  const generateSmartTags = () => {
    const suggestedTags: string[] = [];
    
    if (mediaResults.speech) {
      suggestedTags.push('������¼', 'ʵ���¼');
      // �����������ݣ�������ر�ǩ
      const text = mediaResults.speech.text.toLowerCase();
      if (text.includes('�¶�')) suggestedTags.push('�¶�');
      if (text.includes('ѹ��')) suggestedTags.push('ѹ��');
      if (text.includes('��Ӧ')) suggestedTags.push('��ѧ��Ӧ');
    }
    
    if (mediaResults.ocr) {
      suggestedTags.push('�ĵ�ɨ��', '���ݼ�¼');
      const text = mediaResults.ocr.text.toLowerCase();
      if (text.includes('����')) suggestedTags.push('ʵ������');
      if (text.includes('���')) suggestedTags.push('ʵ����');
    }
    
    if (mediaResults.chart) {
      suggestedTags.push('ͼ������', '���ݿ��ӻ�');
      if (mediaResults.chart.chartType) {
        suggestedTags.push(mediaResults.chart.chartType);
      }
    }
    
    if (mediaResults.formula) {
      suggestedTags.push('��ѧ��ʽ', '����');
    }
    
    return Array.from(new Set(suggestedTags)); // ȥ��
  };

  const smartTags = generateSmartTags();
  const recommendedExperiments = getRecommendedExperiments();

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        ʵ�����ݼ���
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* ý�������� */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          �ɼ��ɵ�ý����
        </Typography>
        <Grid container spacing={2}>
          {mediaResults.speech && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    ����תд���
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {mediaResults.speech.text.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={`${mediaResults.speech.metadata.wordCount} ��`} size="small" />
                    <Chip label={`${(mediaResults.speech.confidence * 100).toFixed(1)}% ���Ŷ�`} size="small" sx={{ ml: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {mediaResults.ocr && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    OCRʶ����
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {mediaResults.ocr.text.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={`${mediaResults.ocr.blocks.length} �ı���`} size="small" />
                    <Chip label={`${(mediaResults.ocr.confidence * 100).toFixed(1)}% ���Ŷ�`} size="small" sx={{ ml: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {mediaResults.chart && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    ͼ���������
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {mediaResults.chart.interpretation.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={mediaResults.chart.chartType} size="small" />
                    <Chip label={`${(mediaResults.chart.confidence * 100).toFixed(1)}% ���Ŷ�`} size="small" sx={{ ml: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {mediaResults.formula && (
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    ��ʽʶ����
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                    {mediaResults.formula.formula}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={mediaResults.formula.originalFormat} size="small" />
                    <Chip label={`${(mediaResults.formula.confidence * 100).toFixed(1)}% ���Ŷ�`} size="small" sx={{ ml: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* �Ƽ�ʵ�� */}
      {recommendedExperiments.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            ����ý�����ݣ�Ϊ���Ƽ��� {recommendedExperiments.length} �����ʵ��
          </Alert>
          <Grid container spacing={2}>
            {recommendedExperiments.map(exp => (
              <Grid item xs={12} md={4} key={exp.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedExperiment === exp.id ? 2 : 1,
                    borderColor: selectedExperiment === exp.id ? 'primary.main' : 'divider'
                  }}
                  onClick={() => setSelectedExperiment(exp.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ExperimentIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle2" noWrap>
                        {exp.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={exp.type} size="small" />
                      <Chip label={exp.status} size="small" color={exp.status === 'completed' ? 'success' : 'default'} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* �������� */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ��������
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>ѡ��ʵ��</InputLabel>
              <Select
                value={selectedExperiment}
                label="ѡ��ʵ��"
                onChange={(e) => setSelectedExperiment(e.target.value)}
              >
                {experiments.map(exp => (
                  <MenuItem key={exp.id} value={exp.id}>
                    {exp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>����ģʽ</InputLabel>
              <Select
                value={integrationMode}
                label="����ģʽ"
                onChange={(e) => setIntegrationMode(e.target.value as 'attach' | 'analyze' | 'report')}
              >
                <MenuItem value="attach">���ӵ�ʵ��</MenuItem>
                <MenuItem value="analyze">��ȷ���</MenuItem>
                <MenuItem value="report">���ɱ���</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Autocomplete
              multiple
              options={smartTags}
              value={tags}
              onChange={(_, newValue) => setTags(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="��ǩ"
                  placeholder="ѡ��������ǩ"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />
          </Grid>
        </Grid>
      </Box>

      {/* ��ע */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="���ɱ�ע"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="���ӹ��ڴ˴�ý�����ݼ��ɵı�ע..."
        />
      </Box>

      {/* ������ť */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<LinkIcon />}
          onClick={handleIntegration}
          disabled={!selectedExperiment || isLoading}
        >
          {isLoading ? '������...' : '���ɵ�ʵ��'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<ReportIcon />}
          disabled={!selectedExperiment}
        >
          Ԥ�����ɱ���
        </Button>
      </Box>

      {/* ����ģʽ˵�� */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          ����ģʽ˵��:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ? <strong>���ӵ�ʵ��</strong>: ��ý������Ϊ�������ӵ�ʵ���¼��<br/>
          ? <strong>��ȷ���</strong>: ʹ��AI����ý��������ʵ�����ݵĹ�����<br/>
          ? <strong>���ɱ���</strong>: ����ý�������Զ�����ʵ�鱨��Ƭ��
        </Typography>
      </Box>
    </Paper>
  );
};

export default ExperimentMediaIntegration;

