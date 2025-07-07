import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
  Divider,
  Chip,
  FormGroup,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { SecurityIcon as SecurityIcon, DeleteIcon as DeleteIcon, AddIcon as AddIcon, EditIcon as EditIcon, visibility as visibility } from '../../utils/icons';

const securitySettings: React.FC = () => {
  const [SecuritySettings, setSecuritySettings] = useState({
    enableTwoFactor: false,
    enablePasswordPolicy: true,
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    enableAuditLog: true,
    enableEncryption: true,
    sslEnabled: true,
    corsEnabled: true,
    allowedOrigins: ['http://localhost:3000', 'https://yourdomain.com']
  });

  const [apiKeys, setapiKeys] = useState([
    { id: 1, name: 'OpenAI api Key', value: '***********', created: '2024-01-15' },
    { id: 2, name: 'Azure api Key', value: '***********', created: '2024-01-20' },
    { id: 3, name: 'Google api Key', value: '***********', created: '2024-01-25' },
  ]);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showValues, setShowValues] = useState<{[key: number]: boolean}>({});

  const handleSettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSavesettings = async () => {
    try {
      // 这里应该调用api保存设置
      console.log('Saving security settings:', securitySettings);
      setSuccess('安全设置已保存');
    } catch (err) {
      setError('保存设置时发生错误');
    }
  };

  const handleAddapiKey = () => {
    // 处理添加api密钥
    console.log('Adding new api key');
  };

  const handleDeleteapiKey = (id: number) => {
    setapiKeys(prev => prev.filter(key => key.id !== id));
  };

  const toggleShowValue = (id: number) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon />
        安全设置
      </Typography>

      <Grid container spacing={3}>
        {/* 认证设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="认证设置" />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.enableTwoFactor}
                      onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
                    />
                  }
                  label="启用双因素认证"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.enablePasswordPolicy}
                      onChange={(e) => handleSettingChange('enablePasswordPolicy', e.target.checked)}
                    />
                  }
                  label="启用密码策略"
                />
              </FormGroup>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                密码策略
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="最小密码长度"
                    type="number"
                    value={securitySettings.minPasswordLength}
                    onChange={(e) => handleSettingChange('minPasswordLength', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 6, max: 20 } }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.requireSpecialChars}
                          onChange={(e) => handleSettingChange('requireSpecialChars', e.target.checked)}
                        />
                      }
                      label="需要特殊字符"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.requireNumbers}
                          onChange={(e) => handleSettingChange('requireNumbers', e.target.checked)}
                        />
                      }
                      label="需要数字"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.requireUppercase}
                          onChange={(e) => handleSettingChange('requireUppercase', e.target.checked)}
                        />
                      }
                      label="需要大写字母"
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 会话设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="会话设置" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="会话超时时间（分钟）"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 5, max: 480 } }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="最大登录尝试次数"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 3, max: 10 } }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="锁定时间（分钟）"
                    type="number"
                    value={securitySettings.lockoutDuration}
                    onChange={(e) => handleSettingChange('lockoutDuration', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 5, max: 60 } }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 系统安全 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="系统安全" />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.enableAuditLog}
                      onChange={(e) => handleSettingChange('enableAuditLog', e.target.checked)}
                    />
                  }
                  label="启用审计日志"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.enableEncryption}
                      onChange={(e) => handleSettingChange('enableEncryption', e.target.checked)}
                    />
                  }
                  label="启用数据加密"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.sslEnabled}
                      onChange={(e) => handleSettingChange('sslEnabled', e.target.checked)}
                    />
                  }
                  label="启用SSL/TLS"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.corsEnabled}
                      onChange={(e) => handleSettingChange('corsEnabled', e.target.checked)}
                    />
                  }
                  label="启用CORS"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* api密钥管理 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="api密钥管理" 
              action={
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddapiKey}
                >
                  添加密钥
                </Button>
              }
            />
            <CardContent>
              <List>
                {apiKeys.map((key) => (
                  <ListItem key={key.id}>
                    <ListItemText
                      primary={key.name}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {showValues[key.id] ? key.value : '***********'}
                          </Typography>
                          <Chip label={key.created} size="small" />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => toggleShowValue(key.id)}>
                        {showValues[key.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                      <IconButton>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteapiKey(key.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 保存按钮 */}
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            onClick={handleSavesettings}
            sx={{ mr: 2 }}
          >
            保存设置
          </Button>
          <Button variant="outlined">
            重置为默认
          </Button>
        </Grid>
      </Grid>

      {/* 成功消息 */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* 错误消息 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SecuritySettings;


