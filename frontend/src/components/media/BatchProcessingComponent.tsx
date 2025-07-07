import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { CloudCheckCircleIcon as SuccessIcon, ErrorIcon as ErrorIcon, DeleteIcon as DeleteIcon, DownloadIcon as DownloadIcon, PlayArrowIcon as ProcessIcon } from '../../utils/icons';
import { useDropzone } from 'react-dropzone';
import aiService from '../../services/aiService';

interface BatchFile {
  id: string;
  file: File;
  type: 'audio' | 'image' | 'chart' | 'formula';
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
  progress: number;
}

interface BatchProcessingComponentProps {
  onBatchComplete?: (results: BatchFile[]) => void;
}

const BatchProcessingComponent: React.FC<BatchProcessingComponentProps> = ({ onBatchComplete }) => {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingDialogOpen, setProcessingDialogOpen] = useState(false);
  const [batchsettings, setBatchsettings] = useState({
    LanguageIcon: 'zh-CN',
    qualityMode: 'balanced' as 'fast' | 'balanced' | 'accurate',
    autoDetectType: true
  });

  // �ļ��ϷŴ���
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: BatchFile[] = acceptedFiles.map(file => {
      // �����ļ������Զ���⴦������
      let type: 'audio' | 'image' | 'chart' | 'formula' = 'image';
      
      if (file.type.startsWith('audio/')) {
        type = 'audio';
      } else if (file.type.startsWith('image/')) {
        // �����ļ��������ж���ͼ�����ǹ�ʽ
        const fileName = file.name.toLowerCase();
        if (fileName.includes('chart') || fileName.includes('graph') || fileName.includes('plot')) {
          type = 'chart';
        } else if (fileName.includes('formula') || fileName.includes('equation') || fileName.includes('math')) {
          type = 'formula';
        } else {
          type = 'image'; // Ĭ��OCR
        }
      }

      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type,
        status: 'pending' as const,
        progress: 0
      };
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'],
      'audio/*': ['.mp3', '.wav', '.webm', '.ogg', '.m4a']
    },
    multiple: true
  });

  // �Ƴ��ļ�
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // �����ļ���������
  const changeFileType = (id: string, newType: 'audio' | 'image' | 'chart' | 'formula') => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, type: newType } : f
    ));
  };

  // ���������ļ�
  const processFile = async (file: BatchFile): Promise<BatchFile> => {
    const updatedFile = { ...file, status: 'processing' as const, progress: 10 };
    
    try {
      let result;
      
      switch (file.type) {
        case 'audio':
          result = await aiService.speechToText(file.file, {
            LanguageIcon: batchsettings.LanguageIcon,
            enableTimestamps: true
          });
          break;
        case 'image':
          result = await aiService.imageOCR(file.file, {
            LanguageIcon: batchsettings.LanguageIcon,
            recognitionMode: batchsettings.qualityMode === 'fast' ? 'fast' : 'accurate'
          });
          break;
        case 'chart':
          result = await aiService.analyzeScientificChart(file.file, {
            chartType: 'auto',
            extractData: true,
            includeAxisLabels: true
          });
          break;
        case 'formula':
          result = await aiService.recognizeFormula(file.file, {
            format: 'latex',
            includeExplanation: true
          });
          break;
      }

      if (result.success) {
        return {
          ...updatedFile,
          status: 'completed',
          result: result.data,
          progress: 100
        };
      } else {
        return {
          ...updatedFile,
          status: 'error',
          error: result.error || '����ʧ��',
          progress: 0
        };
      }
    } catch (error) {
      return {
        ...updatedFile,
        status: 'error',
        error: error instanceof Error ? error.message : 'δ֪����',
        progress: 0
      };
    }
  };

  // �������������ļ�
  const processBatch = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProcessingDialogOpen(true);
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    // ���ò������ƣ�ͬʱ�������3���ļ���
    const concurrencyLimit = 3;
    const results: BatchFile[] = [];
    
    for (let i = 0; i < pendingFiles.length; i += concurrencyLimit) {
      const batch = pendingFiles.slice(i, i + concurrencyLimit);
      
      // ���д�����ǰ����
      const batchPromises = batch.map(file => processFile(file));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      // �����ļ��б�
      setFiles(prev => {
        const updated = [...prev];
        batchResults.forEach(result => {
          const index = updated.findIndex(f => f.id === result.id);
          if (index !== -1) {
            updated[index] = result;
          }
        });
        return updated;
      });
      
      // �����ӳ٣������������
      if (i + concurrencyLimit < pendingFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsProcessing(false);
    setProcessingDialogOpen(false);
    
    if (onBatchComplete) {
      onBatchComplete(results);
    }
  };

  // �������н��
  const exportBatchResults = () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      settings: batchsettings,
      results: completedFiles.map(f => ({
        filename: f.file.name,
        type: f.type,
        result: f.result
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `batch-processing-results-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  };

  const getStatusIcon = (status: BatchFile['status']) => {
    switch (status) {
      case 'completed':
        return <SuccessIcon sx={{ color: 'success.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'processing':
        return <LinearProgress sx={{ width: 20 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: BatchFile['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'error':
        return 'error';
      case 'processing':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        ����ý�崦��
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* �ļ��ϴ����� */}
      <div
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'action.hover' : 'background.default',
          mb: 3,
          transition: 'all 0.2s'
        }}
      >
        <input {...getInputProps()} />
        <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? '�ſ����ϴ��ļ�' : '��ק�ļ����˴�����ѡ��'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ֧����Ƶ�ļ���MP3, WAV, WebM�ȣ���ͼ���ļ���PNG, JPG, GIF�ȣ�
        </Typography>
      </div>

      {/* �������� */}
      {files.length > 0 && (
        <div sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ������������
          </Typography>
          <div sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>����</InputLabel>
              <Select
                value={batchsettings.LanguageIcon}
                label="����"
                onChange={(e) => setBatchsettings(prev => ({ ...prev, LanguageIcon: e.target.value }))}
              >
                <MenuItem value="zh-CN">����</MenuItem>
                <MenuItem value="en-US">Ӣ��</MenuItem>
                <MenuItem value="ja-JP">����</MenuItem>
                <MenuItem value="ko-KR">����</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>����ģʽ</InputLabel>
              <Select
                value={batchsettings.qualityMode}
                label="����ģʽ"
                onChange={(e) => setBatchsettings(prev => ({ ...prev, qualityMode: e.target.value as any }))}
              >
                <MenuItem value="fast">����</MenuItem>
                <MenuItem value="balanced">ƽ��</MenuItem>
                <MenuItem value="accurate">��ȷ</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      )}

      {/* �ļ��б� */}
      {files.length > 0 && (
        <div sx={{ mb: 3 }}>
          <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              �ļ��б� ({files.length} ���ļ�)
            </Typography>
            <div sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<ProcessIcon />}
                onClick={processBatch}
                disabled={isProcessing || files.filter(f => f.status === 'pending').length === 0}
              >
                ��ʼ��������
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={exportBatchResults}
                disabled={files.filter(f => f.status === 'completed').length === 0}
              >
                �������
              </Button>
            </div>
          </div>

          <List>
            {files.map((file) => (
              <ListItem key={file.id} divider>
                <ListItemIcon>
                  {getStatusIcon(file.status)}
                </ListItemIcon>
                <ListItemText
                  primary={file.file.name}
                  secondary={
                    <div sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Chip 
                        label={file.type} 
                        size="small" 
                        color={getStatusColor(file.status) as any}
                      />
                      <Typography variant="caption">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      {file.status === 'processing' && (
                        <LinearProgress 
                          variant="determinate" 
                          value={file.progress} 
                          sx={{ width: 100, ml: 1 }}
                        />
                      )}
                    </div>
                  }
                />
                <ListItemSecondaryAction>
                  <div sx={{ display: 'flex', gap: 1 }}>
                    {file.status === 'pending' && (
                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <Select
                          value={file.type}
                          onChange={(e) => changeFileType(file.id, e.target.value as any)}
                        >
                          <MenuItem value="audio">����</MenuItem>
                          <MenuItem value="image">OCR</MenuItem>
                          <MenuItem value="chart">ͼ��</MenuItem>
                          <MenuItem value="formula">��ʽ</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                    <IconButton 
                      edge="end" 
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'processing'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </div>
      )}

      {/* ��������״̬ */}
      {files.length > 0 && (
        <Alert severity="info">
          <Typography variant="body2">
            ״̬����: {' '}
            ��� {files.filter(f => f.status === 'completed').length} ��, {' '}
            ���� {files.filter(f => f.status === 'error').length} ��, {' '}
            ������ {files.filter(f => f.status === 'pending').length} ��
          </Typography>
        </Alert>
      )}

      {/* �������ȶԻ��� */}
      <Dialog open={processingDialogOpen} disableEscapeKeyDown>
        <DialogTitle>����������...</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            ���ڴ����ļ������Ժ�...
          </Typography>
          <LinearProgress />
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default BatchProcessingComponent;


