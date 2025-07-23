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
  Grid
} from '@mui/material';
import {
  Science as TestIcon
} from '@mui/icons-material';
import { ModbusConfiguration } from '../../../types/devices';
import AIDataAnalyzer from '../AIDataAnalyzer';

export interface ModbusDataSourceConfigProps {
  deviceId?: string;
  initialConfig?: ModbusConfiguration;
  onSave: (config: ModbusConfiguration) => void;
  onTest: (config: ModbusConfiguration) => Promise<boolean>;
}

const ModbusDataSourceConfig: React.FC<ModbusDataSourceConfigProps> = ({
  deviceId,
  initialConfig,
  onSave,
  onTest
}) => {
  const [config, setConfig] = useState<ModbusConfiguration>({
    slaveId: 1,
    function: 3,
    startAddress: 0,
    quantity: 1,
    dataType: 'uint16',
    byteOrder: 'big',
    wordOrder: 'big',
    host: '192.168.1.100',
    port: 502,
    ...initialConfig
  });

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [connectionType, setConnectionType] = useState<'tcp' | 'rtu'>(
    config.host ? 'tcp' : 'rtu'
  );

  const modbusFunction = [
    { value: 1, label: '读取线圈 (01)' },
    { value: 2, label: '读取离散输入 (02)' },
    { value: 3, label: '读取保持寄存器 (03)' },
    { value: 4, label: '读取输入寄存器 (04)' }
  ];

  const dataTypes = [
    { value: 'uint16', label: '16位无符号整数' },
    { value: 'int16', label: '16位整数' },
    { value: 'uint32', label: '32位无符号整数' },
    { value: 'int32', label: '32位整数' },
    { value: 'float32', label: '32位浮点数' },
    { value: 'float64', label: '64位浮点数' }
  ];

  const byteOrders = [
    { value: 'big', label: '大端 (Big Endian)' },
    { value: 'little', label: '小端 (Little Endian)' }
  ];

  const parityOptions = [
    { value: 'none', label: '无校验' },
    { value: 'even', label: '偶校验' },
    { value: 'odd', label: '奇校验' }
  ];

  const handleConfigChange = (field: keyof ModbusConfiguration, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConnectionTypeChange = (type: 'tcp' | 'rtu') => {
    setConnectionType(type);
    if (type === 'tcp') {
      // 设置TCP默认值
      setConfig(prev => ({
        ...prev,
        host: prev.host || '192.168.1.100',
        port: prev.port || 502,
        serialPort: undefined,
        baudRate: undefined,
        dataBits: undefined,
        stopBits: undefined,
        parity: undefined
      }));
    } else {
      // 设置RTU默认值
      setConfig(prev => ({
        ...prev,
        serialPort: prev.serialPort || 'COM1',
        baudRate: prev.baudRate || 9600,
        dataBits: prev.dataBits || 8,
        stopBits: prev.stopBits || 1,
        parity: prev.parity || 'none',
        host: undefined,
        port: undefined
      }));
    }
  };

  const handleTestConnection = async () => {
    setIsTestLoading(true);
    try {
      const success = await onTest(config);
      setTestResult({
        success,
        message: success ? 'Modbus连接测试成功！' : 'Modbus连接测试失败，请检查配置参数。'
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
    const baseValid = config.slaveId >= 0 && 
                     config.startAddress >= 0 && 
                     config.quantity > 0;
    
    if (connectionType === 'tcp') {
      return baseValid && 
             config.host && config.host.trim() !== '' && 
             config.port && config.port > 0;
    } else {
      return baseValid && 
             config.serialPort && config.serialPort.trim() !== '' && 
             config.baudRate && config.baudRate > 0;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Modbus数据源配置
      </Typography>
      
      {/* 连接类型选择 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>连接类型</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant={connectionType === 'tcp' ? 'contained' : 'outlined'}
              onClick={() => handleConnectionTypeChange('tcp')}
            >
              Modbus TCP
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant={connectionType === 'rtu' ? 'contained' : 'outlined'}
              onClick={() => handleConnectionTypeChange('rtu')}
            >
              Modbus RTU
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 连接配置 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>连接配置</Typography>
        <Grid container spacing={3}>
          {connectionType === 'tcp' ? (
            <>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="IP地址"
                  value={config.host || ''}
                  onChange={(e) => handleConfigChange('host', e.target.value)}
                  placeholder="192.168.1.100"
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="端口"
                  type="number"
                  value={config.port || 502}
                  onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
                  required
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="串口"
                  value={config.serialPort || ''}
                  onChange={(e) => handleConfigChange('serialPort', e.target.value)}
                  placeholder="COM1"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="波特率"
                  type="number"
                  value={config.baudRate || 9600}
                  onChange={(e) => handleConfigChange('baudRate', parseInt(e.target.value))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="数据位"
                  type="number"
                  value={config.dataBits || 8}
                  onChange={(e) => handleConfigChange('dataBits', parseInt(e.target.value))}
                  InputProps={{
                    inputProps: { min: 5, max: 8 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="停止位"
                  type="number"
                  value={config.stopBits || 1}
                  onChange={(e) => handleConfigChange('stopBits', parseInt(e.target.value))}
                  InputProps={{
                    inputProps: { min: 1, max: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>校验位</InputLabel>
                  <Select
                    value={config.parity || 'none'}
                    onChange={(e) => handleConfigChange('parity', e.target.value)}
                  >
                    {parityOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Modbus参数配置 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Modbus参数</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="从站ID"
              type="number"
              value={config.slaveId}
              onChange={(e) => handleConfigChange('slaveId', parseInt(e.target.value))}
              InputProps={{
                inputProps: { min: 0, max: 255 }
              }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>功能码</InputLabel>
              <Select
                value={config.function}
                onChange={(e) => handleConfigChange('function', parseInt(e.target.value as string))}
              >
                {modbusFunction.map(func => (
                  <MenuItem key={func.value} value={func.value}>
                    {func.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="起始地址"
              type="number"
              value={config.startAddress}
              onChange={(e) => handleConfigChange('startAddress', parseInt(e.target.value))}
              InputProps={{
                inputProps: { min: 0, max: 65535 }
              }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="读取数量"
              type="number"
              value={config.quantity}
              onChange={(e) => handleConfigChange('quantity', parseInt(e.target.value))}
              InputProps={{
                inputProps: { min: 1, max: 125 }
              }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>数据类型</InputLabel>
              <Select
                value={config.dataType}
                onChange={(e) => handleConfigChange('dataType', e.target.value)}
              >
                {dataTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>字节序</InputLabel>
              <Select
                value={config.byteOrder}
                onChange={(e) => handleConfigChange('byteOrder', e.target.value)}
              >
                {byteOrders.map(order => (
                  <MenuItem key={order.value} value={order.value}>
                    {order.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>字序</InputLabel>
              <Select
                value={config.wordOrder}
                onChange={(e) => handleConfigChange('wordOrder', e.target.value)}
              >
                {byteOrders.map(order => (
                  <MenuItem key={order.value} value={order.value}>
                    {order.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="缩放因子"
              type="number"
              value={config.scale || 1}
              onChange={(e) => handleConfigChange('scale', parseFloat(e.target.value))}
              InputProps={{
                inputProps: { step: 0.01 }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="偏移量"
              type="number"
              value={config.offset || 0}
              onChange={(e) => handleConfigChange('offset', parseFloat(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="单位"
              value={config.unit || ''}
              onChange={(e) => handleConfigChange('unit', e.target.value)}
              placeholder="例: °C, V, A"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* AI数据分析器 */}
      <AIDataAnalyzer
        dataSourceType="modbus"
        onAnalysisComplete={(analysis) => {
          // 基于AI分析结果建议配置
          const numericFields = analysis.structure.fields.filter(f => f.type === 'number');
          if (numericFields.length > 0 && numericFields[0].unit) {
            handleConfigChange('unit', numericFields[0].unit);
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

export default ModbusDataSourceConfig;
