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
  Alert
} from '@mui/material';
import { MicIcon } from '../../utils/icons';
import { StopIcon } from '../../utils/icons';
import aiService from '../../services/aiService';
import { SpeechToTextParams, SpeechToTextResponse } from '../../types/mediaTypes';

interface SpeechToTextComponentProps {
  onTranscriptionComplete?: (result: SpeechToTextResponse) => void;
}

const SpeechToTextComponent: React.FC<SpeechToTextComponentProps> = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SpeechToTextResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [LanguageIcon, setLanguageIcon] = useState<string>('zh-CN');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // ��ʼ¼��
  const startRecording = async () => {
    setError(null);
    setResult(null);
    chunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudioBlob(audioBlob);
        
        // �ر���Ƶ��
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('�޷�������˷�:', err);
      setError('�޷�������˷磬��ȷ�������豸����˷粢������ʹ��Ȩ�ޡ�');
    }
  };
  
  // ֹͣ¼��
  const StopIconRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // �����ϴ�����Ƶ�ļ�
  const handleFileChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    if (Event.target.files && Event.target.files[0]) {
      setAudioFile(Event.target.files[0]);
      
      // ������Ԥ����URL
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(Event.target.files[0]);
      }
      
      setResult(null);
      setError(null);
    }
  };
  
  // �����ϴ��ļ���תд
  const handleFileTranscription = async () => {
    if (!audioFile) return;
    await processAudioBlob(audioFile);
  };
  
  // ������Ƶ����
  const processAudioBlob = async (blob: Blob) => {
    setIsProcessing(true);
    
    try {
      const params: SpeechToTextParams = {
        LanguageIcon,
        enableTimestamps: true
      };
      
      // ����FormData��������api����
      const formData = new FormData();
      formData.append('audio', blob);
      formData.append('params', JSON.stringify(params));
      
      // ��Blobת��ΪFile����
      const audioFile = new File([blob], 'recording.webm', { type: 'audio/webm' });
      
      // ��������ʶ��api
      const response = await aiService.speechToText(audioFile, params);
      
      if (response.success && response.data) {
        setResult(response.data);
        
        // ����ṩ�˻ص������������
        if (onTranscriptionComplete) {
          onTranscriptionComplete(response.data);
        }
      } else {
        throw new Error(response.error || '����ʶ��ʧ��');
      }
    } catch (err) {
      console.error('����תдʧ��:', err);
      setError('����תдʧ�ܣ������ԡ�');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        ����ת�ı�
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <div sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200, mb: 2 }} size="small">
          <InputLabel>����</InputLabel>
          <Select
            value={LanguageIcon}
            label="����"
            onChange={(e) => setLanguageIcon(e.target.value)}
            disabled={isRecording || isProcessing}
          >
            <MenuItem value="zh-CN">���� (����)</MenuItem>
            <MenuItem value="en-US">Ӣ�� (����)</MenuItem>
            <MenuItem value="ja-JP">����</MenuItem>
            <MenuItem value="ko-KR">����</MenuItem>
          </Select>
        </FormControl>
      </div>
      
      <div sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {isRecording ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={StopIconRecording}
            disabled={isProcessing}
          >
            ֹͣ¼��
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<MicIcon />}
            onClick={startRecording}
            disabled={isProcessing}
          >
            ��ʼ¼��
          </Button>
        )}
        
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
          ��
        </Typography>
        
        <div sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            component="label"
            disabled={isRecording || isProcessing}
          >
            �ϴ���Ƶ�ļ�
            <input
              type="file"
              hidden
              accept="audio/*"
              onChange={handleFileChange}
            />
          </Button>
          
          {audioFile && (
            <Button
              variant="contained"
              onClick={handleFileTranscription}
              disabled={isProcessing}
            >
              ��ʼתд
            </Button>
          )}
        </div>
      </div>
      
      {audioFile && (
        <div sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            ��ƵԤ��:
          </Typography>
          <audio ref={audioRef} controls style={{ width: '100%' }} />
        </div>
      )}
      
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
      
      {result && (
        <div sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            תд���:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="body1">{result.text}</Typography>
          </Paper>
          
          <div sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              ����: {result.metadata.LanguageIcon} | 
              ʱ��: {result.metadata.duration.toFixed(1)}�� | 
              ����: {result.metadata.wordCount} | 
              ���Ŷ�: {(result.confidence * 100).toFixed(1)}%
            </Typography>
          </div>
          
          {result.segments && result.segments.length > 0 && (
            <div sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                ��ϸʱ���:
              </Typography>
              {result.segments.map((segment, index) => (
                <div key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {`[${segment.start.toFixed(1)}s - ${segment.end.toFixed(1)}s] ${segment.text}`}
                  </Typography>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Paper>
  );
};

export default SpeechToTextComponent;


