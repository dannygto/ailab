import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import api from '../../services/api';

const apiTestTool: React.FC = () => {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/health');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 发送api请求
  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      let result;
      const config: any = {
        method,
        url: endpoint,
      };
      
      if (method !== 'GET' && requestBody) {
        try {
          config.data = JSON.parse(requestBody);
        } catch (e) {
          setError('请求体JSON格式无效');
          setLoading(false);
          return;
        }
      }
      
      const response = await api.api.request(config);
      result = response.data;
      
      setResponse(result);
    } catch (error: any) {
      console.error('api请求失败:', error);
      setError(`请求失败: ${error.message}`);
      
      if (error.response) {
        setResponse({
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 预设端点
  const presetEndpoints = [
    { label: '健康检查', value: '/health' },
    { label: '获取当前用户', value: '/auth/me' },
    { label: '仪表盘统计', value: '/dashboard/stats' },
    { label: 'AI助手测试', value: '/ai-assistant/test' },
    { label: '实验列表', value: '/experiments?limit=5' }
  ];

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        api测试工具
      </Typography>
      
      <div sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          使用此工具可以发送测试请求到后端api，验证连接和响应
        </Typography>
      </div>
      
      <div sx={{ mb: 3 }}>
        <FormControl sx={{ width: 120, mr: 2 }}>
          <InputLabel>请求方法</InputLabel>
          <Select
            value={method}
            label="请求方法"
            onChange={(e) => setMethod(e.target.value)}
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          label="api端点"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          sx={{ width: 300, mr: 2 }}
          helperText="例如: /health, /auth/me"
        />
        
        <Button 
          variant="contained" 
          onClick={handleSendRequest}
          disabled={loading || !endpoint}
        >
          发送请求
        </Button>
      </div>
      
      <div sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          预设端点:
        </Typography>
        <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {presetEndpoints.map((ep) => (
            <Button 
              key={ep.value} 
              size="small" 
              variant="outlined"
              onClick={() => setEndpoint(ep.value)}
            >
              {ep.label}
            </Button>
          ))}
        </div>
      </div>
      
      {method !== 'GET' && (
        <div sx={{ mb: 3 }}>
          <TextField
            label="请求体 (JSON)"
            multiline
            rows={4}
            fullWidth
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            placeholder='{"key": "value"}'
          />
        </div>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        响应结果:
      </Typography>
      
      {loading && (
        <div sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </div>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {response && (
        <div sx={{ mt: 2 }}>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              maxHeight: 400, 
              overflow: 'auto',
              backgroundColor: '#f5f5f5'
            }}
          >
            <pre style={{ margin: 0 }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </Paper>
        </div>
      )}
    </Paper>
  );
};

export default apiTestTool;

