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
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Usb as UsbIcon,
  Save as SaveIcon,
  Science as TestTubeIcon,
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { USBConfiguration } from '../../../types/devices';
import AIDataAnalyzer from '../AIDataAnalyzer';
import { DataFormatAnalysis } from '../../../services/aiDataFormatService';

interface USBDataSourceConfigProps {
  deviceId?: string;
  initialConfig?: USBConfiguration;
  onSave?: (config: USBConfiguration) => void;
  onTest?: (config: USBConfiguration) => Promise<boolean>;
}

const USBDataSourceConfig: React.FC<USBDataSourceConfigProps> = ({
  deviceId,
  initialConfig,
  onSave,
  onTest
}) => {
  const [config, setConfig] = useState<USBConfiguration>(initialConfig || {
    port: 'COM1',
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    flowControl: 'none',
    dataFormat: 'json',
    parseRule: '',
    separator: ',',
    encoding: 'utf8'
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAIAnalyzer, setShowAIAnalyzer] = useState(false);

  const handleConfigChange = (field: keyof USBConfiguration, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleAIAnalysisComplete = (analysis: DataFormatAnalysis) => {
    // 根据AI分析结果更新配置
    setConfig(prev => ({
      ...prev,
      dataFormat: analysis.format as any,
      parseRule: analysis.parseRule,
      separator: analysis.structure.separator || prev.separator,
      encoding: analysis.structure.encoding || prev.encoding
    }));
  };

  const handleAIParseRuleGenerated = (parseRule: string) => {
    setConfig(prev => ({ ...prev, parseRule }));
  };

  const handleTest = async () => {
    if (!onTest) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const success = await onTest(config);
      setTestResult({
        success,
        message: success ? 'USB连接测试成功' : 'USB连接测试失败'
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

  const availablePorts = [
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8',
    '/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyACM0', '/dev/ttyACM1'
  ];

  const baudRates = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];

  return (
    <Card>
      <CardHeader
        avatar={<UsbIcon />}
        title="USB数据源配置"
        subheader={deviceId ? `设备ID: ${deviceId}` : '新建USB数据源'}
        action={
          <Tooltip title="USB串口通信配置，集成AI智能识别">
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        }
      />
      
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            配置USB串口连接参数，支持标准串口通信协议和多种数据格式解析。集成AI智能识别，快速配置未知设备数据格式。
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
              连接参数
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>串口端口</InputLabel>
              <Select
                value={config.port}
                onChange={(e) => handleConfigChange('port', e.target.value)}
                label="串口端口"
              >
                {availablePorts.map(port => (
                  <MenuItem key={port} value={port}>
                    {port}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>波特率</InputLabel>
              <Select
                value={config.baudRate}
                onChange={(e) => handleConfigChange('baudRate', Number(e.target.value))}
                label="波特率"
              >
                {baudRates.map(rate => (
                  <MenuItem key={rate} value={rate}>
                    {rate}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>数据位</InputLabel>
              <Select
                value={config.dataBits}
                onChange={(e) => handleConfigChange('dataBits', Number(e.target.value))}
                label="数据位"
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={7}>7</MenuItem>
                <MenuItem value={8}>8</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>停止位</InputLabel>
              <Select
                value={config.stopBits}
                onChange={(e) => handleConfigChange('stopBits', Number(e.target.value))}
                label="停止位"
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={1.5}>1.5</MenuItem>
                <MenuItem value={2}>2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>校验位</InputLabel>
              <Select
                value={config.parity}
                onChange={(e) => handleConfigChange('parity', e.target.value)}
                label="校验位"
              >
                <MenuItem value="none">无校验</MenuItem>
                <MenuItem value="even">偶校验</MenuItem>
                <MenuItem value="odd">奇校验</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>流控制</InputLabel>
              <Select
                value={config.flowControl}
                onChange={(e) => handleConfigChange('flowControl', e.target.value)}
                label="流控制"
              >
                <MenuItem value="none">无流控</MenuItem>
                <MenuItem value="hardware">硬件流控</MenuItem>
                <MenuItem value="software">软件流控</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="字符编码"
              value={config.encoding}
              onChange={(e) => handleConfigChange('encoding', e.target.value)}
              placeholder="utf8"
              helperText="字符编码格式，如 utf8, ascii, latin1"
            />
          </Grid>

          {/* 数据解析参数 */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              数据解析参数
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>数据格式</InputLabel>
              <Select
                value={config.dataFormat}
                onChange={(e) => handleConfigChange('dataFormat', e.target.value)}
                label="数据格式"
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="xml">XML</MenuItem>
                <MenuItem value="raw">原始数据</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="分隔符"
              value={config.separator}
              onChange={(e) => handleConfigChange('separator', e.target.value)}
              placeholder="例如: , | ; \\t \\n"
              helperText="CSV格式时使用，支持转义字符"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="解析规则"
              value={config.parseRule}
              onChange={(e) => handleConfigChange('parseRule', e.target.value)}
              placeholder="输入JavaScript解析函数或正则表达式"
              helperText="可选：自定义数据解析规则，例如正则表达式或JavaScript函数。可通过下方AI分析自动生成。"
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
              AI可以分析您的设备数据样本，自动识别数据格式并生成解析规则，大大简化配置过程。
            </Typography>
            <AIDataAnalyzer
              dataSourceType="USB串口"
              onAnalysisComplete={handleAIAnalysisComplete}
              onParseRuleGenerated={handleAIParseRuleGenerated}
            />
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default USBDataSourceConfig;
