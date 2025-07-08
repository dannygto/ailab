import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
  TextField,
  Chip,
  FormGroup,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
  Slider
} from '@mui/material';
import { StorageIcon as DataIcon, DeleteIcon, CloudDownloadIcon as ExportIcon, BackupIcon, RestoreIcon, SecurityIcon, ScheduleIcon, SaveIcon, GetAppIcon } from '../../utils/icons';

const DataSettings: React.FC = () => {
  const [DataSettings, setDataSettings] = useState({
    autoBackupIcon: true,
    BackupIconInterval: 24, // 小时
    retentionDays: 30,
    compressionEnabled: true,
    encryptionEnabled: true,
    exportFormat: 'json',
    maxExportSize: 1000, // MB
    dataValidation: true,
    anonymizeData: false,
    includeMetadata: true,
    CloudSyncIcon: false,
    localStorageLimit: 5000 // MB
  });

  const [BackupIconHistory, setBackupIconHistory] = useState([
    { id: 1, date: '2024-01-15 10:30', size: '245MB', type: 'auto', status: 'completed' },
    { id: 2, date: '2024-01-14 10:30', size: '240MB', type: 'auto', status: 'completed' },
    { id: 3, date: '2024-01-13 15:45', size: '238MB', type: 'manual', status: 'completed' },
    { id: 4, date: '2024-01-12 10:30', size: '235MB', type: 'auto', status: 'completed' },
    { id: 5, date: '2024-01-11 10:30', size: '232MB', type: 'auto', status: 'failed' },
  ]);

  const [StorageIconUsage, setStorageIconUsage] = useState({
    used: 2456, // MB
    total: 5000, // MB
    experiments: 1200,
    templates: 300,
    media: 800,
    BackupIcons: 156
  });

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setDataSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSavesettings = async () => {
    try {
      // 这里应该调用api保存设置
      console.log('Saving data settings:', dataSettings);
      setSuccess('数据设置已保存');
    } catch (err) {
      setError('保存设置时发生错误');
    }
  };

  const handleBackupIconNow = async () => {
    try {
      // 创建手动备份
      console.log('Creating manual BackupIcon...');
      setSuccess('手动备份已开始');
      // 这里应该调用备份api
    } catch (err) {
      setError('备份失败');
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // 导出数据
      console.log('Exporting data...');
      setTimeout(() => {
        setIsExporting(false);
        setSuccess('数据导出完成');
      }, 3000);
    } catch (err) {
      setIsExporting(false);
      setError('数据导出失败');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // 导入数据
      console.log('Importing data from:', file.name);
      setTimeout(() => {
        setIsImporting(false);
        setSuccess('数据导入完成');
      }, 3000);
    } catch (err) {
      setIsImporting(false);
      setError('数据导入失败');
    }
  };

  const handleDeleteBackupIcon = (id: number) => {
    setBackupIconHistory(prev => prev.filter(BackupIcon => BackupIcon.id !== id));
    setSuccess('备份已删除');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getUsagePercentage = () => {
    return (StorageIconUsage.used / StorageIconUsage.total) * 100;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DataIcon />
        数据设置
      </Typography>

      <Grid container spacing={3}>
        {/* 存储使用情况 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="存储使用情况" />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  已使用 {StorageIconUsage.used} MB / {StorageIconUsage.total} MB
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getUsagePercentage()} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{StorageIconUsage.experiments}MB</Typography>
                    <Typography variant="body2" color="text.secondary">实验数据</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{StorageIconUsage.templates}MB</Typography>
                    <Typography variant="body2" color="text.secondary">模板数据</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{StorageIconUsage.media}MB</Typography>
                    <Typography variant="body2" color="text.secondary">媒体文件</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{StorageIconUsage.BackupIcons}MB</Typography>
                    <Typography variant="body2" color="text.secondary">备份文件</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 备份设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="备份设置" />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dataSettings.autoBackupIcon}
                      onChange={(e) => handleSettingChange('autoBackupIcon', e.target.checked)}
                    />
                  }
                  label="启用自动备份"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={dataSettings.compressionEnabled}
                      onChange={(e) => handleSettingChange('compressionEnabled', e.target.checked)}
                    />
                  }
                  label="启用压缩"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={dataSettings.encryptionEnabled}
                      onChange={(e) => handleSettingChange('encryptionEnabled', e.target.checked)}
                    />
                  }
                  label="启用加密"
                />
              </FormGroup>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>备份间隔（小时）</Typography>
                <Slider
                  value={dataSettings.BackupIconInterval}
                  onChange={(e, value) => handleSettingChange('BackupIconInterval', value)}
                  aria-labelledby="BackupIcon-interval-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={168}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>保留天数</Typography>
                <Slider
                  value={dataSettings.retentionDays}
                  onChange={(e, value) => handleSettingChange('retentionDays', value)}
                  aria-labelledby="retention-days-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  marks
                  min={1}
                  max={365}
                />
              </Box>

              <Button
                variant="contained"
                startIcon={<BackupIcon />}
                onClick={handleBackupIconNow}
                fullWidth
                sx={{ mt: 2 }}
              >
                立即备份
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 数据管理 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="数据管理" />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={dataSettings.dataValidation}
                      onChange={(e) => handleSettingChange('dataValidation', e.target.checked)}
                    />
                  }
                  label="数据验证"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={dataSettings.anonymizeData}
                      onChange={(e) => handleSettingChange('anonymizeData', e.target.checked)}
                    />
                  }
                  label="数据匿名化"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={dataSettings.includeMetadata}
                      onChange={(e) => handleSettingChange('includeMetadata', e.target.checked)}
                    />
                  }
                  label="包含元数据"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={dataSettings.CloudSyncIcon}
                      onChange={(e) => handleSettingChange('CloudSyncIcon', e.target.checked)}
                    />
                  }
                  label="云端同步"
                />
              </FormGroup>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>导出格式</InputLabel>
                <Select
                  value={dataSettings.exportFormat}
                  label="导出格式"
                  onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                >
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="xlsx">Excel</MenuItem>
                  <MenuItem value="xml">XML</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={1} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={handleExportData}
                    fullWidth
                    disabled={isExporting}
                  >
                    {isExporting ? '导出中...' : '导出数据'}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    startIcon={<GetAppIcon />}
                    component="label"
                    fullWidth
                    disabled={isImporting}
                  >
                    {isImporting ? '导入中...' : '导入数据'}
                    <input
                      type="file"
                      hidden
                      accept=".json,.csv,.xlsx,.xml"
                      onChange={handleImportData}
                    />
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 备份历史 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="备份历史" />
            <CardContent>
              <List>
                {BackupIconHistory.map((BackupIcon) => (
                  <ListItem key={BackupIcon.id}>
                    <ListItemText
                      primary={`备份 - ${BackupIcon.date}`}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            大小: {BackupIcon.size}
                          </Typography>
                          <Chip 
                            label={BackupIcon.type === 'auto' ? '自动' : '手动'} 
                            size="small" 
                            variant="outlined"
                          />
                          <Chip 
                            label={BackupIcon.status === 'completed' ? '完成' : '失败'} 
                            size="small" 
                            color={getStatusColor(BackupIcon.status) as any}
                          />
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton>
                        <RestoreIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteBackupIcon(BackupIcon.id)} color="error">
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
            startIcon={<SaveIcon />}
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

export default DataSettings;



