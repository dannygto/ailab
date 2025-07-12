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
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';
import {
  Science as TestIcon,
  Visibility as ViewIcon,
  VisibilityOff
} from '@mui/icons-material';
import { DatabaseConfiguration } from '../../../types/devices';
import AIDataAnalyzer from '../AIDataAnalyzer';

export interface DatabaseDataSourceConfigProps {
  deviceId?: string;
  initialConfig?: DatabaseConfiguration;
  onSave: (config: DatabaseConfiguration) => void;
  onTest: (config: DatabaseConfiguration) => Promise<boolean>;
}

const DatabaseDataSourceConfig: React.FC<DatabaseDataSourceConfigProps> = ({
  deviceId,
  initialConfig,
  onSave,
  onTest
}) => {
  const [config, setConfig] = useState<DatabaseConfiguration>({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: '',
    query: '',
    valueField: '',
    ssl: false,
    connectionTimeout: 30000,
    ...initialConfig
  });

  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);

  const databaseTypes = [
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'sqlite', label: 'SQLite' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'influxdb', label: 'InfluxDB' }
  ];

  const handleConfigChange = (field: keyof DatabaseConfiguration, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    setIsTestLoading(true);
    try {
      const success = await onTest(config);
      setTestResult({
        success,
        message: success ? '数据库连接测试成功！' : '数据库连接测试失败，请检查配置参数。'
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
    return config.host.trim() !== '' && 
           config.database.trim() !== '' && 
           config.username.trim() !== '' &&
           config.query.trim() !== '' &&
           config.valueField.trim() !== '';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        数据库数据源配置
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>基本配置</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>数据库类型</InputLabel>
              <Select
                value={config.type}
                onChange={(e) => handleConfigChange('type', e.target.value as DatabaseConfiguration['type'])}
              >
                {databaseTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="主机地址"
              value={config.host}
              onChange={(e) => handleConfigChange('host', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="端口"
              type="number"
              value={config.port}
              onChange={(e) => handleConfigChange('port', parseInt(e.target.value))}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="数据库名"
              value={config.database}
              onChange={(e) => handleConfigChange('database', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="用户名"
              value={config.username}
              onChange={(e) => handleConfigChange('username', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={config.password}
              onChange={(e) => handleConfigChange('password', e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <ViewIcon />}
                  </IconButton>
                )
              }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="SQL查询语句"
              multiline
              rows={4}
              value={config.query}
              onChange={(e) => handleConfigChange('query', e.target.value)}
              placeholder="SELECT * FROM sensor_data WHERE device_id = ? ORDER BY timestamp DESC LIMIT 100"
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="数据值字段"
              value={config.valueField}
              onChange={(e) => handleConfigChange('valueField', e.target.value)}
              placeholder="例: value, sensor_value"
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="时间字段"
              value={config.timeField || ''}
              onChange={(e) => handleConfigChange('timeField', e.target.value)}
              placeholder="例: timestamp, created_at"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="表名/集合名"
              value={config.table || config.collection || ''}
              onChange={(e) => {
                if (config.type === 'mongodb') {
                  handleConfigChange('collection', e.target.value);
                } else {
                  handleConfigChange('table', e.target.value);
                }
              }}
              placeholder={config.type === 'mongodb' ? '集合名' : '表名'}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="连接超时 (毫秒)"
              type="number"
              value={config.connectionTimeout || 30000}
              onChange={(e) => handleConfigChange('connectionTimeout', parseInt(e.target.value))}
              InputProps={{
                inputProps: { min: 1000, step: 1000 }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.ssl || false}
                  onChange={(e) => handleConfigChange('ssl', e.target.checked)}
                />
              }
              label="使用SSL连接"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* AI数据分析器 */}
      <AIDataAnalyzer
        dataSourceType="database"
        onAnalysisComplete={(analysis) => {
          // 应用AI分析结果到配置
          const valueFields = analysis.structure.fields.filter(field => field.type === 'number');
          const timeFields = analysis.structure.fields.filter(field => field.type === 'datetime');
          
          if (valueFields.length > 0) {
            handleConfigChange('valueField', valueFields[0].name);
          }
          if (timeFields.length > 0) {
            handleConfigChange('timeField', timeFields[0].name);
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

export default DatabaseDataSourceConfig;
