import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-hot-toast';
import { DEMO_DATA_CONFIG } from '../config/constants';
import systemSetupService from '../services/systemSetupService';
import DemoDataDeleteDialog from './DemoDataDeleteDialog';

interface DemoDataStatistics {
  users: number;
  experiments: number;
  devices: number;
  results: number;
  lastGenerated?: string;
}

/**
 * 模拟数据管理组件
 */
const DemoDataManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [demoDataStats, setDemoDataStats] = useState<DemoDataStatistics | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // 生成数据选项
  const [generateOptions, setGenerateOptions] = useState({
    dataLevel: 'standard',
    users: true,
    experiments: true,
    devices: true,
    results: true,
    userCount: DEMO_DATA_CONFIG.USER_COUNT.standard,
    experimentCount: DEMO_DATA_CONFIG.EXPERIMENT_COUNT.standard
  });

  // 加载模拟数据统计信息
  const loadDemoDataStats = async () => {
    setLoading(true);
    try {
      const response = await systemSetupService.getDemoDataStats();
      setDemoDataStats(response);
    } catch (error) {
      console.error('加载模拟数据统计失败:', error);
      toast.error('无法加载模拟数据统计信息');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadDemoDataStats();
  }, []);

  // 处理删除对话框打开
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // 处理删除对话框关闭
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // 处理删除成功
  const handleDeleteSuccess = () => {
    loadDemoDataStats();
  };

  // 处理数据级别变化
  const handleDataLevelChange = (event: SelectChangeEvent) => {
    const level = event.target.value as 'minimal' | 'standard' | 'comprehensive';
    setGenerateOptions({
      ...generateOptions,
      dataLevel: level,
      userCount: DEMO_DATA_CONFIG.USER_COUNT[level],
      experimentCount: DEMO_DATA_CONFIG.EXPERIMENT_COUNT[level]
    });
  };

  // 处理开关变化
  const handleSwitchChange = (name: keyof typeof generateOptions) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setGenerateOptions({
      ...generateOptions,
      [name]: event.target.checked
    });
  };

  // 处理数量变化
  const handleCountChange = (name: keyof typeof generateOptions) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value) || 0;
    setGenerateOptions({
      ...generateOptions,
      [name]: value
    });
  };

  // 处理生成模拟数据
  const handleGenerateDemoData = async () => {
    setGenerateLoading(true);
    try {
      await systemSetupService.generateDemoData(generateOptions);
      toast.success('模拟数据生成成功');
      loadDemoDataStats();
    } catch (error) {
      console.error('生成模拟数据失败:', error);
      toast.error('生成模拟数据失败');
    } finally {
      setGenerateLoading(false);
    }
  };

  // 导出模拟数据配置
  const handleExportConfig = async () => {
    try {
      const config = await systemSetupService.exportDemoDataConfig();
      const dataStr = JSON.stringify(config, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileName = `demo-data-config-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileName);
      linkElement.click();
      
      toast.success('模拟数据配置已导出');
    } catch (error) {
      console.error('导出模拟数据配置失败:', error);
      toast.error('导出模拟数据配置失败');
    }
  };

  return (
    <div>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">模拟数据管理</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadDemoDataStats}
            disabled={loading}
            size="small"
          >
            刷新
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : demoDataStats ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    模拟数据统计
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="textSecondary">用户数</Typography>
                      <Typography variant="h6">{demoDataStats.users}</Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="textSecondary">实验数</Typography>
                      <Typography variant="h6">{demoDataStats.experiments}</Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="textSecondary">设备数</Typography>
                      <Typography variant="h6">{demoDataStats.devices}</Typography>
                    </Grid>
                    
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="textSecondary">结果数</Typography>
                      <Typography variant="h6">{demoDataStats.results}</Typography>
                    </Grid>
                  </Grid>
                  
                  {demoDataStats.lastGenerated && (
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                      最后生成时间: {new Date(demoDataStats.lastGenerated).toLocaleString()}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleOpenDeleteDialog}
                    disabled={!demoDataStats || Object.values(demoDataStats).every(val => val === 0)}
                  >
                    删除所有模拟数据
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    <DownloadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    配置导出
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" paragraph sx={{ mt: 1 }}>
                    导出当前模拟数据的配置信息，以便将来恢复或在其他环境中复现。
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportConfig}
                  >
                    导出配置
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">
            当前系统中没有模拟数据，或无法获取模拟数据统计信息。
          </Alert>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>生成模拟数据</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>数据级别</InputLabel>
              <Select
                value={generateOptions.dataLevel}
                onChange={handleDataLevelChange}
                label="数据级别"
              >
                <MenuItem value="minimal">最小数据集 (少量基础数据)</MenuItem>
                <MenuItem value="standard">标准数据集 (推荐)</MenuItem>
                <MenuItem value="comprehensive">全面数据集 (大量样本数据)</MenuItem>
              </Select>
            </FormControl>
            
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
              <Typography variant="body2" color="textSecondary" sx={{ width: '100%', mb: 1 }}>
                数据类型:
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={generateOptions.users}
                    onChange={handleSwitchChange('users')}
                  />
                }
                label="用户"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={generateOptions.experiments}
                    onChange={handleSwitchChange('experiments')}
                  />
                }
                label="实验"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={generateOptions.devices}
                    onChange={handleSwitchChange('devices')}
                  />
                }
                label="设备"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={generateOptions.results}
                    onChange={handleSwitchChange('results')}
                  />
                }
                label="结果"
              />
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="用户数量"
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 100 } }}
                    value={generateOptions.userCount}
                    onChange={handleCountChange('userCount')}
                    disabled={!generateOptions.users}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="实验数量"
                    type="number"
                    InputProps={{ inputProps: { min: 1, max: 200 } }}
                    value={generateOptions.experimentCount}
                    onChange={handleCountChange('experimentCount')}
                    disabled={!generateOptions.experiments}
                  />
                </Grid>
              </Grid>
            </Box>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              生成模拟数据可能需要几分钟时间，取决于数据量大小。
            </Alert>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={generateLoading ? <CircularProgress size={20} color="inherit" /> : <AddCircleIcon />}
            onClick={handleGenerateDemoData}
            disabled={generateLoading}
          >
            {generateLoading ? '生成中...' : '生成模拟数据'}
          </Button>
        </Box>
      </Paper>
      
      <DemoDataDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default DemoDataManager;
