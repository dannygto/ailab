import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import { MicIcon, StopIcon, UploadIcon } from '../../utils/icons';

interface TranscriptionResult {
  text: string;
  confidence: number;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

interface SpeechToTextComponentProps {
  onTranscriptionComplete?: (result: TranscriptionResult) => void;
}

const SpeechToTextComponent: React.FC<SpeechToTextComponentProps> = ({ 
  onTranscriptionComplete 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('zh-CN');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = () => {
    setIsRecording(true);
    setError(null);
    // 实现录音逻辑
  };

  const stopRecording = () => {
    setIsRecording(false);
    // 停止录音并处理音频
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setError(null);
    }
  };

  const processAudio = async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 模拟音频处理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: TranscriptionResult = {
        text: '这是一个示例转录结果。',
        confidence: 0.95,
        segments: [
          { start: 0, end: 2.5, text: '这是一个' },
          { start: 2.5, end: 5.0, text: '示例转录结果。' }
        ]
      };

      setResult(mockResult);
      onTranscriptionComplete?.(mockResult);
    } catch (err) {
      setError('音频处理失败，请重试。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        语音转文字
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>语言</InputLabel>
          <Select
            value={language}
            label="语言"
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="zh-CN">中文 (普通话)</MenuItem>
            <MenuItem value="en-US">English (US)</MenuItem>
            <MenuItem value="ja-JP">日本語</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant={isRecording ? "contained" : "outlined"}
            color={isRecording ? "error" : "primary"}
            startIcon={isRecording ? <StopIcon /> : <MicIcon />}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? '停止录音' : '开始录音'}
          </Button>

          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            上传音频文件
          </Button>
        </Box>
      </Box>

      {audioFile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            已选择文件: {audioFile.name}
          </Typography>
          <audio ref={audioRef} controls style={{ width: '100%' }} />
        </Box>
      )}

      {audioFile && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={processAudio}
            disabled={isProcessing}
            fullWidth
          >
            {isProcessing ? '处理中...' : '开始转录'}
          </Button>
        </Box>
      )}

      {result && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            转录结果
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="body1">{result.text}</Typography>
          </Paper>

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            置信度: {(result.confidence * 100).toFixed(1)}%
          </Typography>

          {result.segments && result.segments.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                时间分段
              </Typography>
              {result.segments.map((segment, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2">
                    {segment.start.toFixed(1)}s - {segment.end.toFixed(1)}s: {segment.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SpeechToTextComponent;
