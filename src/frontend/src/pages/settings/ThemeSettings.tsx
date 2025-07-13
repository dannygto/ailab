import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Snackbar,
  FormGroup,
  Slider,
  Paper,
  Avatar,
  Chip
} from '@mui/material';
import { PaletteIcon as ThemeIcon, Brightness4Icon as DarkModeIcon, Brightness7Icon as LightModeIcon, ColorLensIcon as ColorIcon, FormatSizeIcon as FontSizeIcon, SaveIcon } from '../../utils/icons';

const ThemeSettings: React.FC = () => {
  const [themeSettings, setThemeSettings] = useState({
    mode: 'light' as 'light' | 'dark',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    backgroundColor: '#f5f5f5',
    textColor: '#000000',
    fontSize: 14,
    borderRadius: 8,
    elevation: 4,
    compactMode: false,
    highContrast: false,
    animations: true,
    customCss: ''
  });

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const predefinedThemes = [
    { name: '默认蓝色', primary: '#1976d2', secondary: '#dc004e', mode: 'light' },
    { name: '绿色自然', primary: '#2e7d32', secondary: '#ed6c02', mode: 'light' },
    { name: '紫色优雅', primary: '#7b1fa2', secondary: '#d32f2f', mode: 'light' },
    { name: '深色主题', primary: '#90caf9', secondary: '#f48fb1', mode: 'dark' },
    { name: '高对比度', primary: '#000000', secondary: '#ffffff', mode: 'light' }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setThemeSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleThemePresetSelect = (theme: any) => {
    setThemeSettings(prev => ({
      ...prev,
      primaryColor: theme.primary,
      secondaryColor: theme.secondary,
      mode: theme.mode as 'light' | 'dark'
    }));
  };

  const handleSavesettings = async () => {
    try {
      // 调用API保存主题设置
      const response = await fetch('/api/settings/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeSettings),
      });

      if (response.ok) {
        // 应用主题到全局
        localStorage.setItem('theme-settings', JSON.stringify(themeSettings));
        setSuccess('主题设置已保存');

        // 触发主题更新事件
        window.dispatchEvent(new CustomEvent('theme-updated', {
          detail: themeSettings
        }));
      } else {
        throw new Error('保存失败');
      }
    } catch (err) {
      console.error('保存主题设置错误:', err);
      setError('保存设置时发生错误');
    }
  };

  const resetToDefault = () => {
    setThemeSettings({
      mode: 'light',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      backgroundColor: '#f5f5f5',
      textColor: '#000000',
      fontSize: 14,
      borderRadius: 8,
      elevation: 4,
      compactMode: false,
      highContrast: false,
      animations: true,
      customCss: ''
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ThemeIcon />
        主题设置
      </Typography>

      <Grid container spacing={3}>
        {/* 主题模式 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="主题模式" />
            <CardContent>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.mode === 'dark'}
                      onChange={(e) => handleSettingChange('mode', e.target.checked ? 'dark' : 'light')}
                      icon={<LightModeIcon />}
                      checkedIcon={<DarkModeIcon />}
                    />
                  }
                  label={themeSettings.mode === 'dark' ? '深色模式' : '浅色模式'}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.compactMode}
                      onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                    />
                  }
                  label="紧凑模式"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.highContrast}
                      onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
                    />
                  }
                  label="高对比度"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeSettings.animations}
                      onChange={(e) => handleSettingChange('animations', e.target.checked)}
                    />
                  }
                  label="启用动画"
                />
              </FormGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* 颜色设置 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="颜色设置" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography>主色调:</Typography>
                    <input
                      type="color"
                      value={themeSettings.primaryColor}
                      onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                      style={{ width: 40, height: 40, border: 'none', borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {themeSettings.primaryColor}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography>辅助色:</Typography>
                    <input
                      type="color"
                      value={themeSettings.secondaryColor}
                      onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                      style={{ width: 40, height: 40, border: 'none', borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {themeSettings.secondaryColor}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography>背景色:</Typography>
                    <input
                      type="color"
                      value={themeSettings.backgroundColor}
                      onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                      style={{ width: 40, height: 40, border: 'none', borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {themeSettings.backgroundColor}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 预设主题 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="预设主题" />
            <CardContent>
              <Grid container spacing={2}>
                {predefinedThemes.map((theme, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: themeSettings.primaryColor === theme.primary ? 2 : 1,
                        borderColor: themeSettings.primaryColor === theme.primary ? 'primary.main' : 'divider',
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                      onClick={() => handleThemePresetSelect(theme)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 1,
                            bgcolor: theme.primary
                          }}
                        />
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 1,
                            bgcolor: theme.secondary
                          }}
                        />
                        <Typography variant="body2">{theme.name}</Typography>
                      </Box>
                      <Chip
                        label={theme.mode === 'dark' ? '深色' : '浅色'}
                        size="small"
                        variant="outlined"
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 字体和布局 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="字体和布局" />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>字体大小</Typography>
                  <Slider
                    value={themeSettings.fontSize}
                    onChange={(e, value) => handleSettingChange('fontSize', value)}
                    aria-labelledby="font-size-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={10}
                    max={20}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>圆角大小</Typography>
                  <Slider
                    value={themeSettings.borderRadius}
                    onChange={(e, value) => handleSettingChange('borderRadius', value)}
                    aria-labelledby="border-radius-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={0}
                    max={20}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>阴影深度</Typography>
                  <Slider
                    value={themeSettings.elevation}
                    onChange={(e, value) => handleSettingChange('elevation', value)}
                    aria-labelledby="elevation-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={0}
                    max={24}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 预览 */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="主题预览" />
            <CardContent>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: themeSettings.backgroundColor,
                  color: themeSettings.textColor,
                  borderRadius: themeSettings.borderRadius / 8,
                  boxShadow: themeSettings.elevation
                }}
              >
                <Typography variant="h6" sx={{ color: themeSettings.primaryColor, mb: 2 }}>
                  预览标题
                </Typography>
                <Typography paragraph>
                  这是主题预览文本。您可以在这里看到当前主题设置的效果。
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: themeSettings.primaryColor,
                    mr: 1,
                    borderRadius: themeSettings.borderRadius / 8
                  }}
                >
                  主要按钮
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    color: themeSettings.secondaryColor,
                    borderColor: themeSettings.secondaryColor,
                    borderRadius: themeSettings.borderRadius / 8
                  }}
                >
                  次要按钮
                </Button>
              </Paper>
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
            保存主题
          </Button>
          <Button
            variant="outlined"
            onClick={resetToDefault}
          >
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

export default ThemeSettings;



