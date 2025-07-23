import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';

import { ExpandMoreIcon, CheckIcon as CheckIconIcon, ErrorIcon, InfoIcon, SecurityIcon, SettingsIcon } from '../../utils/icons';

import { AI_MODELS, AI_PROVIDERS, DEFAULT_AI_CONFIG } from '../../config/ai-models';
import api from '../../services/api';

interface AIConfig {
  selectedModel: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  customEndpoint?: string;
}

const AIModelsettings: React.FC = () => {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [selectedProvider, setSelectedProvider] = useState<string>('火山方舟'); // 默认火山方舟，对应默认模型
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 从localStorage加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('ai-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...DEFAULT_AI_CONFIG, ...parsed });
        
        // 根据选中的模型设置provider
        const model = AI_MODELS.find(m => m.id === parsed.selectedModel);
        if (model) {
          setSelectedProvider(model.provider);
        }
      } catch (error) {
        console.error('Failed to load AI config:', error);
      }
    } else {
      // 如果没有保存的配置，确保默认值是一致的
      const defaultModel = AI_MODELS.find(m => m.id === DEFAULT_AI_CONFIG.selectedModel);
      if (defaultModel) {
        setSelectedProvider(defaultModel.provider);
      }
    }
  }, []);

  // 保存配置到localStorage
  const saveConfig = () => {
    localStorage.setItem('ai-config', JSON.stringify(config));
    alert('配置已保存！');
  };  // 测试api连接
  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const selectedModel = AI_MODELS.find(m => m.id === config.selectedModel);
      if (!selectedModel) {
        throw new Error('未找到选中的模型');
      }

      if (!config.apiKey) {
        throw new Error('请先设置api密钥');
      }

      // console.log removed

      // 使用api服务的测试连接方法
      const result = await api.testModelConnection(config.selectedModel);
      
      setTestResult({
        success: result.success,
        message: result.message + (result.latency ? ` (响应时间: ${result.latency}ms)` : '')
      });

      if (result.success) {
        // console.log removed
      } else {
        console.warn('?? AI连接测试失败:', result.message);
      }
      
    } catch (error) {
      console.error('? 连接测试异常:', error);
      setTestResult({
        success: false,
        message: error instanceof Error ? `连接测试失败: ${error.message}` : '连接测试失败'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 根据provider筛选模型
  const filteredModels = AI_MODELS.filter(model => model.provider === selectedProvider);

  const selectedModel = AI_MODELS.find(m => m.id === config.selectedModel);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          AI模型配置
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          配置AI模型以启用智能助手功能。请选择合适的模型并配置api密钥。
        </Alert>

        <Grid container spacing={3}>
          {/* 模型选择部分 */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  模型选择
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel shrink>服务提供商</InputLabel>
                      <TextField value={selectedProvider} InputProps={{ readOnly: true }} variant="outlined" />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel shrink>具体模型</InputLabel>
                      <TextField value={config.selectedModel} InputProps={{ readOnly: true }} variant="outlined" />
                    </FormControl>
                  </Grid>
                </Grid>                {/* 选中模型的详细信息 */}
                {selectedModel && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2">
                        {selectedModel.name}
                      </Typography>                      {((selectedModel.maxTokens || 0) >= 64000 || (selectedModel.contextWindow || 0) >= 64000) && (
                        <Chip 
                          label="推荐用于实验数据" 
                          size="small" 
                          color="primary"
                          variant="filled"
                        />
                      )}
                      {((selectedModel.maxTokens || 0) >= 200000 || (selectedModel.contextWindow || 0) >= 200000) && (
                        <Chip 
                          label="超长上下文" 
                          size="small" 
                          color="success"
                          variant="filled"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedModel.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      {selectedModel.supportedFeatures.map(feature => (
                        <Chip key={feature} label={feature} size="small" variant="outlined" />
                      ))}
                    </Box>                    {selectedModel && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          上下文窗口：
                        </Typography>                        <Chip 
                          label={`${selectedModel.contextWindow ? (selectedModel.contextWindow >= 1000 ? Math.round(selectedModel.contextWindow / 1000) + 'K' : selectedModel.contextWindow) : ((selectedModel.maxTokens || 4096) >= 1000 ? Math.round((selectedModel.maxTokens || 4096) / 1000) + 'K' : (selectedModel.maxTokens || 4096))} tokens`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    )}
                    
                    {selectedModel && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          最大输出token：
                        </Typography>                        <Chip 
                          label={`${selectedModel.outputTokenLimit ? (selectedModel.outputTokenLimit >= 1000 ? Math.round(selectedModel.outputTokenLimit / 1000) + 'K' : selectedModel.outputTokenLimit) : ((selectedModel.maxTokens || 4096) >= 1000 ? Math.round((selectedModel.maxTokens || 4096) / 1000) + 'K' : (selectedModel.maxTokens || 4096))} tokens`}
                          size="small"
                          color={(selectedModel.outputTokenLimit || 0) >= 16000 || (selectedModel.maxTokens || 0) >= 16000 ? "success" : "default"}
                          variant="outlined"
                        />                        {((selectedModel.outputTokenLimit || 0) < 16000 && (selectedModel.maxTokens || 0) < 16000) && (
                          <Typography variant="caption" color="warning.main">
                            （建议选择16K+模型用于处理实验数据）
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* api配置 */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon />
                  api配置
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="api密钥"
                      type="password"
                      fullWidth
                      value={config.apiKey}
                      onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="请输入api密钥"
                      helperText="您的api密钥将安全存储在本地，不会上传到服务器"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Temperature"
                      type="number"
                      fullWidth
                      value={config.temperature}
                      onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      inputProps={{ min: 0, max: 2, step: 0.1 }}
                      helperText="控制回答的随机性 (0-2)"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="最大Token数"
                      type="number"
                      fullWidth
                      value={config.maxTokens}
                      onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      inputProps={{ min: 100, max: 200000, step: 100 }}
                      helperText="单次对话的最大长度"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="系统提示词"
                      multiline
                      rows={3}
                      fullWidth
                      value={config.systemPrompt}
                      onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                      placeholder="定义AI助手的行为和风格"
                    />
                  </Grid>
                </Grid>

                {/* 测试连接 */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button 
                    variant="outlined" 
                    onClick={testConnection}
                    disabled={isLoading || !config.apiKey}
                  >
                    {isLoading ? '测试中...' : '测试连接'}
                  </Button>
                  
                  <Button 
                    variant="contained" 
                    onClick={saveConfig}
                  >
                    保存配置
                  </Button>
                </Box>

                {/* 测试结果 */}
                {testResult && (
                  <Alert 
                    severity={testResult.success ? 'success' : 'error'} 
                    sx={{ mt: 2 }}
                    icon={testResult.success ? <CheckIconIcon /> : <ErrorIcon />}
                  >
                    {testResult.message}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 侧边栏：模型信息 */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  支持的模型
                </Typography>
                
                {AI_PROVIDERS.map(provider => (
                  <Accordion key={provider}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">{provider}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {AI_MODELS.filter(m => m.provider === provider).map(model => (
                          <ListItem key={model.id}>
                            <ListItemIcon>
                              {model.available ? <CheckIconIcon color="success" /> : <ErrorIcon color="error" />}
                            </ListItemIcon>
                            <ListItemText 
                              primary={model.name}
                              secondary={`${model.maxTokens || 'N/A'} tokens`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>

            {/* 使用说明 */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon />
                  使用说明
                </Typography>
                
                <Typography variant="body2" paragraph>
                  1. 选择适合的AI服务提供商和模型
                </Typography>
                <Typography variant="body2" paragraph>
                  2. 在对应官网申请api密钥
                </Typography>
                <Typography variant="body2" paragraph>
                  3. 配置api密钥和参数
                </Typography>
                <Typography variant="body2" paragraph>
                  4. 测试连接确保配置正确
                </Typography>
                <Typography variant="body2">
                  5. 保存配置后即可使用AI助手功能
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AIModelsettings;




