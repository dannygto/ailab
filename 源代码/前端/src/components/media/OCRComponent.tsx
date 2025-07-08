import React, { useState, useRef } from 'react';
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
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { ImageIcon } from '../../utils/icons';
import { ContentCopyIcon } from '../../utils/icons';
import aiService from '../../services/aiService';
import { OCRParams, OCRResponse, TextBlock } from '../../types/mediaTypes';

interface OCRComponentProps {
  onOCRComplete?: (result: OCRResponse) => void;
}

const OCRComponent: React.FC<OCRComponentProps> = ({ onOCRComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [LanguageIcon, setLanguageIcon] = useState<string>('auto');
  const [recognitionMode, setRecognitionMode] = useState<'fast' | 'accurate'>('accurate');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
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
  
  // ����OCRʶ��
  const handleOCRProcess = async () => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const params: OCRParams = {
        LanguageIcon: LanguageIcon !== 'auto' ? LanguageIcon : undefined,
        detectOrientation: true,
        recognitionMode
      };
      
      // ����FormData��������api����
      const formData = new FormData();
      formData.append('image', imageFile);
      
      // ����OCR api
      const response = await aiService.imageOCR(imageFile, params);
      
      if (response.success && response.data) {
        setResult(response.data);
        
        // ����ṩ�˻ص������������
        if (onOCRComplete) {
          onOCRComplete(response.data);
        }
        
        // �ӳ���Ⱦ�߽��ȷ��ͼ���Ѽ���
        if (response.data.blocks.length > 0) {
          setTimeout(() => {
            if (showBoundingBoxes && response.data) {
              drawBoundingBoxes(response.data.blocks);
            }
          }, 300);
        }
      } else {
        throw new Error((response as any).error || 'OCR识别失败');
      }
    } catch (err) {
      console.error('OCR����ʧ��:', err);
      setError('OCR����ʧ�ܣ������ԡ�');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // ����ʶ���ı���������
  const copyToClipboard = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      // �������������ʾ������ʹ��toast
      alert('�ı��Ѹ��Ƶ�������');
    }
  };
  
  // �л��߽����ʾ
  const toggleBoundingBoxes = () => {
    const newState = !showBoundingBoxes;
    setShowBoundingBoxes(newState);
    
    if (newState && result?.blocks) {
      setTimeout(() => drawBoundingBoxes(result.blocks), 0);
    } else {
      clearCanvas();
    }
  };
  
  // ���Ʊ߽��
  const drawBoundingBoxes = (blocks: TextBlock[]) => {
    if (!canvasRef.current || !imageRef.current || !imageRef.current.complete) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // ����canvas��С��ͼ��һ��
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    
    // ���֮ǰ�Ļ���
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // �������ű���
    const scaleX = canvas.width / result!.metadata.dimensions.width;
    const scaleY = canvas.height / result!.metadata.dimensions.height;
    
    // ����ÿ���ı���ı߽��
    blocks.forEach((block, index) => {
      const { x, y, width, height } = block.boundingBox;
      
      // ��������ʹ�ò�ͬ��ɫ
      let color = 'rgba(255, 0, 0, 0.3)';  // Ĭ�Ϻ�ɫ�����ʣ�
      if (block.type === 'line') {
        color = 'rgba(0, 255, 0, 0.3)';  // ��Ϊ��ɫ
      } else if (block.type === 'paragraph') {
        color = 'rgba(0, 0, 255, 0.3)';  // ����Ϊ��ɫ
      }
      
      // ���ư�͸�����
      ctx.fillStyle = color;
      ctx.fillRect(
        x * scaleX, 
        y * scaleY, 
        width * scaleX, 
        height * scaleY
      );
      
      // ���Ʊ߿�
      ctx.strokeStyle = color.replace('0.3', '0.8');
      ctx.lineWidth = 2;
      ctx.strokeRect(
        x * scaleX, 
        y * scaleY, 
        width * scaleX, 
        height * scaleY
      );
      
      // Ϊÿ���������ӱ�ǩ
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(
        `${index + 1}`, 
        x * scaleX, 
        (y * scaleY) - 5
      );
    });
  };
  
  // ���Canvas
  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        ͼ������ʶ�� (OCR)
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>����</InputLabel>
          <Select
            value={LanguageIcon}
            label="����"
            onChange={(e) => setLanguageIcon(e.target.value)}
            disabled={isProcessing}
          >
            <MenuItem value="auto">�Զ����</MenuItem>
            <MenuItem value="zh-Hans">���� (����)</MenuItem>
            <MenuItem value="en">Ӣ��</MenuItem>
            <MenuItem value="ja">����</MenuItem>
            <MenuItem value="ko">����</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel>ʶ��ģʽ</InputLabel>
          <Select
            value={recognitionMode}
            label="ʶ��ģʽ"
            onChange={(e) => setRecognitionMode(e.target.value as 'fast' | 'accurate')}
            disabled={isProcessing}
          >
            <MenuItem value="fast">����ģʽ</MenuItem>
            <MenuItem value="accurate">��ȷģʽ</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<ImageIcon />}
          disabled={isProcessing}
        >
          ѡ��ͼƬ
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
            onClick={handleOCRProcess}
            disabled={isProcessing}
          >
            ��ʼʶ��
          </Button>
        )}
        
        {result && (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ContentCopyIcon />}
            onClick={copyToClipboard}
          >
            �����ı�
          </Button>
        )}
        
        {result && result.blocks.length > 0 && (
          <ToggleButtonGroup
            value={showBoundingBoxes ? 'show' : 'hide'}
            exclusive
            onChange={toggleBoundingBoxes}
            aria-label="��ʾ�߽��"
            size="small"
          >
            <ToggleButton value="show" aria-label="��ʾ�߽��">
              ��ʾ�߽��
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {isProcessing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {imagePreview && (
        <Box sx={{ mb: 3, position: 'relative' }}>
          <Typography variant="subtitle2" gutterBottom>
            ͼ��Ԥ��:
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <img 
              ref={imageRef}
              src={imagePreview} 
              alt="�ϴ���ͼ��" 
              style={{ maxWidth: '100%', maxHeight: '400px' }} 
            />
            <canvas 
              ref={canvasRef}
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                pointerEvents: 'none'
              }} 
            />
          </Box>
        </Box>
      )}
      
      {result && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            ʶ����:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', maxHeight: '300px', overflow: 'auto' }}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {result.text}
            </Typography>
          </Paper>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              ����: {result.metadata.LanguageIcon} | 
              ���Ŷ�: {(result.confidence * 100).toFixed(1)}% | 
              ����: {result.metadata.orientation}�� | 
              ʶ�� {result.blocks.length} ���ı���
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default OCRComponent;

