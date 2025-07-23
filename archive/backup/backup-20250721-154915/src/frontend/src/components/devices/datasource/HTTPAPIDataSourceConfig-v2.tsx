import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Alert,
  Paper,
  Grid,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Science as TestIcon
} from '@mui/icons-material';
import { HTTPAPIConfiguration } from '../../../types/devices';
import AIDataAnalyzer from '../AIDataAnalyzer';

export interface HTTPAPIDataSourceConfigProps {
  deviceId?: string;
  initialConfig?: HTTPAPIConfiguration;
  onSave: (config: HTTPAPIConfiguration) => void;
  onTest: (config: HTTPAPIConfiguration) => Promise<boolean>;
}

const HTTPAPIDataSourceConfig: React.FC<HTTPAPIDataSourceConfigProps> = ({
  deviceId,
  initialConfig,
  onSave,
  onTest
}) => {
  const [config, setConfig] = useState<HTTPAPIConfiguration>({
    url: '',
    method: 'GET',
    responseFormat: 'json',
    timeout: 30000,
    retries: 3,
    ...initialConfig
  });

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [newHeader, setNewHeader] = useState({ key: '', value: '' });
  const [newParam, setNewParam] = useState({ key: '', value: '' });

  const httpMethods = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'DELETE', label: 'DELETE' }
  ];

  const responseFormats = [
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'csv', label: 'CSV' },
    { value: 'text', label: 'Plain Text' }
  ];

  const authTypes = [
    { value: 'none', label: '无认证' },
    { value: 'basic', label: 'Basic认证' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'apikey', label: 'API Key' }
  ];

  const handleConfigChange = (field: keyof HTTPAPIConfiguration, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAuthChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      auth: {
        type: 'none',
        ...prev.auth,
        [field]: value
      }
    }));
  };

  const handleAddHeader = () => {
    if (newHeader.key.trim() && newHeader.value.trim()) {
      setConfig(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [newHeader.key]: newHeader.value
        }
      }));
      setNewHeader({ key: '', value: '' });
    }
  };

  const handleRemoveHeader = (key: string) => {
    setConfig(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return {
        ...prev,
        headers: newHeaders
      };
    });
  };

  const handleAddParam = () => {
    if (newParam.key.trim() && newParam.value.trim()) {
      setConfig(prev => ({
        ...prev,
        params: {
          ...prev.params,
          [newParam.key]: newParam.value
        }
      }));
      setNewParam({ key: '', value: '' });
    }
  };

  const handleRemoveParam = (key: string) => {
    setConfig(prev => {
      const newParams = { ...prev.params };
      delete newParams[key];
      return {
        ...prev,
        params: newParams
      };
    });
  };

  const handleTestConnection = async () => {
    setIsTestLoading(true);
    try {
      const success = await onTest(config);
      setTestResult({
        success,
        message: success ? 'HTTP API连接测试成功！' : 'HTTP API连接测试失败，请检查配置参数。'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleSave = () => {
    onSave(config);
  };

  const isConfigValid = () => {
    try {
      new URL(config.url);
      return config.url.trim() !== '';
    } catch {
      return false;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        HTTP API数据源配置
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>基本配置</Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="API URL"
              value={config.url}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              placeholder="https://api.example.com/data"
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>HTTP方法</InputLabel>
              <Select
                value={config.method}
                onChange={(e) => handleConfigChange('method', e.target.value)}
              >
                {httpMethods.map(method => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>响应格式</InputLabel>
              <Select
                value={config.responseFormat}
                onChange={(e) => handleConfigChange('responseFormat', e.target.value)}
              >
                {responseFormats.map(format => (
                  <MenuItem key={format.value} value={format.value}>
                    {format.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="超时时间 (毫秒)"
              type="number"
              value={config.timeout || 30000}
              onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
              InputProps={{
                inputProps: { min: 1000, step: 1000 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="重试次数"
              type="number"
              value={config.retries || 3}
              onChange={(e) => handleConfigChange('retries', parseInt(e.target.value))}
              InputProps={{
                inputProps: { min: 0, max: 10 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="数据路径"
              value={config.dataPath || ''}
              onChange={(e) => handleConfigChange('dataPath', e.target.value)}
              placeholder="例: data.sensors 或 $.data.sensors"
              helperText="指定响应数据中的数据路径"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* 请求头配置 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>请求头配置</Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={5}>
            <TextField
              fullWidth
              label="请求头名称"
              size="small"
              value={newHeader.key}
              onChange={(e) => setNewHeader(prev => ({ ...prev, key: e.target.value }))}
              placeholder="Content-Type"
            />
          </Grid>
          
          <Grid item xs={5}>
            <TextField
              fullWidth
              label="请求头值"
              size="small"
              value={newHeader.value}
              onChange={(e) => setNewHeader(prev => ({ ...prev, value: e.target.value }))}
              placeholder="application/json"
            />
          </Grid>

          <Grid item xs={2}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleAddHeader}
              disabled={!newHeader.key.trim() || !newHeader.value.trim()}
              startIcon={<AddIcon />}
            >
              添加
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {config.headers && Object.entries(config.headers).map(([key, value]) => (
            <Chip
              key={key}
              label={`${key}: ${value}`}
              onDelete={() => handleRemoveHeader(key)}
              deleteIcon={<DeleteIcon />}
              variant="outlined"
            />
          ))}
        </Box>
      </Paper>

      {/* URL参数配置 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>URL参数配置</Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={5}>
            <TextField
              fullWidth
              label="参数名"
              size="small"
              value={newParam.key}
              onChange={(e) => setNewParam(prev => ({ ...prev, key: e.target.value }))}
              placeholder="timestamp"
            />
          </Grid>
          
          <Grid item xs={5}>
            <TextField
              fullWidth
              label="参数值"
              size="small"
              value={newParam.value}
              onChange={(e) => setNewParam(prev => ({ ...prev, value: e.target.value }))}
              placeholder="2024-01-01"
            />
          </Grid>

          <Grid item xs={2}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleAddParam}
              disabled={!newParam.key.trim() || !newParam.value.trim()}
              startIcon={<AddIcon />}
            >
              添加
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {config.params && Object.entries(config.params).map(([key, value]) => (
            <Chip
              key={key}
              label={`${key}: ${value}`}
              onDelete={() => handleRemoveParam(key)}
              deleteIcon={<DeleteIcon />}
              variant="outlined"
            />
          ))}
        </Box>
      </Paper>

      {/* 认证配置 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>认证配置</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>认证类型</InputLabel>
              <Select
                value={config.auth?.type || 'none'}
                onChange={(e) => handleAuthChange('type', e.target.value)}
              >
                {authTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {config.auth?.type === 'basic' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="用户名"
                  value={config.auth.username || ''}
                  onChange={(e) => handleAuthChange('username', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="密码"
                  type="password"
                  value={config.auth.password || ''}
                  onChange={(e) => handleAuthChange('password', e.target.value)}
                />
              </Grid>
            </>
          )}

          {config.auth?.type === 'bearer' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bearer Token"
                value={config.auth.token || ''}
                onChange={(e) => handleAuthChange('token', e.target.value)}
              />
            </Grid>
          )}

          {config.auth?.type === 'apikey' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Key Header"
                  value={config.auth.apiKeyHeader || ''}
                  onChange={(e) => handleAuthChange('apiKeyHeader', e.target.value)}
                  placeholder="X-API-Key"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Key"
                  value={config.auth.apiKey || ''}
                  onChange={(e) => handleAuthChange('apiKey', e.target.value)}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* 请求体配置 */}
      {(config.method === 'POST' || config.method === 'PUT') && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>请求体配置</Typography>
          <TextField
            fullWidth
            label="请求体"
            multiline
            rows={4}
            value={config.body || ''}
            onChange={(e) => handleConfigChange('body', e.target.value)}
            placeholder='{"param1": "value1", "param2": "value2"}'
          />
        </Paper>
      )}

      {/* 数据解析规则 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>数据解析</Typography>
        <TextField
          fullWidth
          label="解析规则"
          multiline
          rows={3}
          value={config.parseRule || ''}
          onChange={(e) => handleConfigChange('parseRule', e.target.value)}
          placeholder="例如：JSON路径或正则表达式"
          helperText="可选：自定义数据解析规则"
        />
      </Paper>

      {/* AI数据分析器 */}
      <AIDataAnalyzer
        dataSourceType="http"
        onAnalysisComplete={(analysis) => {
          if (analysis.structure.nested) {
            const fields = analysis.structure.fields.map(f => f.name);
            if (fields.length > 0) {
              handleConfigChange('dataPath', `data.${fields[0]}`);
            }
          }
          if (analysis.parseRule) {
            handleConfigChange('parseRule', analysis.parseRule);
          }
        }}
      />

      {/* 测试结果 */}
      {testResult && (
        <Alert 
          severity={testResult.success ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => setTestResult(null)}
        >
          {testResult.message}
        </Alert>
      )}

      {/* 操作按钮 */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleTestConnection}
          disabled={!isConfigValid() || isTestLoading}
          startIcon={<TestIcon />}
        >
          {isTestLoading ? '测试中...' : '测试连接'}
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!isConfigValid()}
        >
          保存配置
        </Button>
      </Box>
    </Box>
  );
};

export default HTTPAPIDataSourceConfig;
