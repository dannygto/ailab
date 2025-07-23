import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Chip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Cloud as CloudIcon, 
  Save as SaveIcon, 
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Science as TestTubeIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { MQTTConfiguration } from '../../../types/devices';
import AIDataAnalyzer from '../AIDataAnalyzer';
import { DataFormatAnalysis } from '../../../services/aiDataFormatService';

interface MQTTDataSourceConfigProps {
  deviceId?: string;
  initialConfig?: MQTTConfiguration;
  onSave?: (config: MQTTConfiguration) => void;
  onTest?: (config: MQTTConfiguration) => Promise<boolean>;
}

const MQTTDataSourceConfig: React.FC<MQTTDataSourceConfigProps> = ({
  deviceId,
  initialConfig,
  onSave,
  onTest
}) => {
  const [config, setConfig] = useState<MQTTConfiguration>(initialConfig || {
    host: 'localhost',
    port: 1883,
    username: '',
    password: '',
    clientId: `client_${Date.now()}`,
    topics: ['sensor/data'],
    qos: 0,
    cleanSession: true,
    keepAlive: 60,
    dataFormat: 'json',
    parseRule: '',
    ssl: false
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [newTopic, setNewTopic] = useState('');
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);

  const handleConfigChange = (field: keyof MQTTConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleAIAnalysisComplete = (analysis: DataFormatAnalysis) => {
    // 根据AI分析结果更新配置
    setConfig(prev => ({
      ...prev,
      dataFormat: analysis.format as any,
      parseRule: analysis.parseRule
    }));
  };

  const handleAIParseRuleGenerated = (parseRule: string) => {
    setConfig(prev => ({ ...prev, parseRule }));
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !config.topics.includes(newTopic.trim())) {
      setConfig(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
    }));
  };

  const handleTest = async () => {
    if (!onTest) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const success = await onTest(config);
      setTestResult({
        success,
        message: success ? 'MQTT连接测试成功' : 'MQTT连接测试失败'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
  };

  return (
    <Card>
      <CardHeader
        avatar={<CloudIcon />}
        title="MQTT数据源配置"
        subheader={deviceId ? `设备ID: ${deviceId}` : '新建MQTT数据源'}
        action={
          <Tooltip title="MQTT消息队列配置">
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        }
      />
      
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            配置MQTT代理连接参数，支持订阅多个主题和多种消息格式解析
          </Typography>
        </Box>

        {testResult && (
          <Alert 
            severity={testResult.success ? 'success' : 'error'} 
            sx={{ mb: 3 }}
            onClose={() => setTestResult(null)}
          >
            {testResult.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* 连接参数 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              MQTT代理连接
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="MQTT代理地址"
              value={config.host}
              onChange={(e) => handleConfigChange('host', e.target.value)}
              placeholder="例如: mqtt.example.com 或 192.168.1.100"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="端口"
              value={config.port}
              onChange={(e) => handleConfigChange('port', Number(e.target.value))}
              InputProps={{
                endAdornment: <InputAdornment position="end">{config.ssl ? '(SSL)' : ''}</InputAdornment>
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="用户名"
              value={config.username}
              onChange={(e) => handleConfigChange('username', e.target.value)}
              placeholder="可选"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="password"
              label="密码"
              value={config.password}
              onChange={(e) => handleConfigChange('password', e.target.value)}
              placeholder="可选"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="客户端ID"
              value={config.clientId}
              onChange={(e) => handleConfigChange('clientId', e.target.value)}
              helperText="唯一标识符，留空自动生成"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="心跳间隔(秒)"
              value={config.keepAlive}
              onChange={(e) => handleConfigChange('keepAlive', Number(e.target.value))}
            />
          </Grid>

          {/* SSL配置 */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.ssl}
                    onChange={(e) => handleConfigChange('ssl', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon />
                    <span>启用SSL/TLS加密</span>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={config.cleanSession}
                    onChange={(e) => handleConfigChange('cleanSession', e.target.checked)}
                  />
                }
                label="清理会话"
              />
            </Box>
          </Grid>

          {config.ssl && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="SSL证书"
                value={config.certificate || ''}
                onChange={(e) => handleConfigChange('certificate', e.target.value)}
                placeholder="粘贴PEM格式的证书内容（可选）"
                helperText="用于自签名证书或私有CA证书"
              />
            </Grid>
          )}

          {/* 主题订阅 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              主题订阅
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="新增主题"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="例如: sensor/temperature 或 device/+/data"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddTopic}
                disabled={!newTopic.trim()}
              >
                添加
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {config.topics.map((topic, index) => (
                <Chip
                  key={index}
                  label={topic}
                  onDelete={() => handleRemoveTopic(topic)}
                  deleteIcon={<DeleteIcon />}
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>QoS等级</InputLabel>
              <Select
                value={config.qos}
                onChange={(e) => handleConfigChange('qos', Number(e.target.value))}
                label="QoS等级"
              >
                <MenuItem value={0}>0 - 最多一次</MenuItem>
                <MenuItem value={1}>1 - 至少一次</MenuItem>
                <MenuItem value={2}>2 - 恰好一次</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>消息格式</InputLabel>
              <Select
                value={config.dataFormat}
                onChange={(e) => handleConfigChange('dataFormat', e.target.value)}
                label="消息格式"
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="xml">XML</MenuItem>
                <MenuItem value="raw">原始数据</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="消息解析规则"
              value={config.parseRule}
              onChange={(e) => handleConfigChange('parseRule', e.target.value)}
              placeholder="输入JavaScript解析函数或JSONPath表达式"
              helperText="可选：自定义消息解析规则，例如 $.data.temperature 或自定义JavaScript函数。可通过下方AI分析自动生成。"
            />
          </Grid>

          {/* 操作按钮 */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={testing ? <StopIcon /> : <PlayArrowIcon />}
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? '测试中...' : '测试连接'}
              </Button>
              
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                保存配置
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* AI智能数据分析 */}
        <Divider sx={{ my: 3 }} />
        
        <Accordion expanded={showAIAnalyzer} onChange={() => setShowAIAnalyzer(!showAIAnalyzer)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TestTubeIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                AI智能数据格式识别
              </Typography>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              AI可以分析您的MQTT消息数据，自动识别消息格式并生成解析规则，提升配置效率。
            </Typography>
            <AIDataAnalyzer
              dataSourceType="MQTT消息队列"
              onAnalysisComplete={handleAIAnalysisComplete}
              onParseRuleGenerated={handleAIParseRuleGenerated}
            />
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default MQTTDataSourceConfig;
