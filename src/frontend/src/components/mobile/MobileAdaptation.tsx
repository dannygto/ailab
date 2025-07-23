import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  useMediaQuery,
  Theme,
  Collapse,
  Button,
  Fab,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  TouchApp as TouchAppIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// 定义设备类型
type DeviceType = 'mobile' | 'tablet' | 'desktop';

// 移动端适配设置类型
interface MobileAdaptationSettings {
  enableTouchGestures: boolean;
  enableZoomControl: boolean;
  adaptInterfaceAutomatically: boolean;
  useCompactMode: boolean;
  enableOfflineMode: boolean;
  fontScale: number;
  deviceSpecificSettings: {
    [key in DeviceType]: {
      enabled: boolean;
      adaptiveLayout: boolean;
      optimizePerformance: boolean;
    }
  };
}

interface MobileAdaptationProps {
  children: React.ReactNode;
  defaultSettings?: Partial<MobileAdaptationSettings>;
}

/**
 * 移动端适配组件
 * 提供响应式布局和移动设备特定的交互优化
 */
const MobileAdaptation: React.FC<MobileAdaptationProps> = ({
  children,
  defaultSettings
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // 媒体查询判断当前设备类型
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up('sm') && theme.breakpoints.down('md')
  );

  // 确定当前设备类型
  const getCurrentDeviceType = useCallback((): DeviceType => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
  }, [isMobile, isTablet]);

  // 适配设置状态
  const [settings, setSettings] = useState<MobileAdaptationSettings>({
    enableTouchGestures: true,
    enableZoomControl: true,
    adaptInterfaceAutomatically: true,
    useCompactMode: isMobile,
    enableOfflineMode: false,
    fontScale: 1,
    deviceSpecificSettings: {
      mobile: {
        enabled: true,
        adaptiveLayout: true,
        optimizePerformance: true
      },
      tablet: {
        enabled: true,
        adaptiveLayout: true,
        optimizePerformance: false
      },
      desktop: {
        enabled: false,
        adaptiveLayout: false,
        optimizePerformance: false
      }
    },
    ...defaultSettings
  });

  // 设置抽屉开关状态
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 折叠面板状态
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean
  }>({
    deviceSpecific: false,
    advanced: false
  });

  // 当前设备类型
  const [currentDevice, setCurrentDevice] = useState<DeviceType>(getCurrentDeviceType());

  // 监听窗口大小变化，更新设备类型
  useEffect(() => {
    const deviceType = getCurrentDeviceType();
    setCurrentDevice(deviceType);

    // 如果启用了自动适配，则根据设备类型更新设置
    if (settings.adaptInterfaceAutomatically) {
      setSettings(prev => ({
        ...prev,
        useCompactMode: deviceType === 'mobile',
        fontScale: deviceType === 'mobile' ? 0.9 : deviceType === 'tablet' ? 1 : 1
      }));
    }
  }, [isMobile, isTablet, settings.adaptInterfaceAutomatically, getCurrentDeviceType]);

  // 切换设置项
  const handleToggleSetting = (key: keyof MobileAdaptationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 切换设备特定设置
  const handleToggleDeviceSetting = (
    device: DeviceType,
    key: keyof MobileAdaptationSettings['deviceSpecificSettings']['mobile']
  ) => {
    setSettings(prev => ({
      ...prev,
      deviceSpecificSettings: {
        ...prev.deviceSpecificSettings,
        [device]: {
          ...prev.deviceSpecificSettings[device],
          [key]: !prev.deviceSpecificSettings[device][key]
        }
      }
    }));
  };

  // 切换折叠面板
  const handleToggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 调整字体大小
  const handleFontSizeChange = (delta: number) => {
    setSettings(prev => ({
      ...prev,
      fontScale: Math.max(0.8, Math.min(1.5, prev.fontScale + delta))
    }));
  };

  // 创建缩放控制器
  const renderZoomControls = () => {
    if (!settings.enableZoomControl || !isMobile) return null;

    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Tooltip title={t('mobile.zoomIn')}>
          <Fab
            color="primary"
            size="small"
            onClick={() => handleFontSizeChange(0.1)}
          >
            <ZoomInIcon />
          </Fab>
        </Tooltip>
        <Tooltip title={t('mobile.zoomOut')}>
          <Fab
            color="primary"
            size="small"
            onClick={() => handleFontSizeChange(-0.1)}
          >
            <ZoomOutIcon />
          </Fab>
        </Tooltip>
      </Box>
    );
  };

  // 获取当前设备图标
  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case 'mobile':
        return <SmartphoneIcon />;
      case 'tablet':
        return <TabletIcon />;
      case 'desktop':
        return <LaptopIcon />;
    }
  };

  // 创建设置抽屉
  const renderSettingsDrawer = () => (
    <Drawer
      anchor="right"
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
    >
      <Box sx={{ width: 320, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => setSettingsOpen(false)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {t('mobile.adaptationSettings')}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getDeviceIcon(currentDevice)}
            <Typography variant="body1" sx={{ ml: 1 }}>
              {t(`device.${currentDevice}`)}
            </Typography>
          </Box>
          <Chip
            label={t('mobile.detected')}
            color="primary"
            size="small"
          />
        </Box>

        <List>
          <ListItem>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.adaptInterfaceAutomatically}
                  onChange={() => handleToggleSetting('adaptInterfaceAutomatically')}
                />
              }
              label={
                <Typography variant="body2">
                  {t('mobile.adaptAutomatically')}
                </Typography>
              }
            />
          </ListItem>

          <ListItem>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.useCompactMode}
                  onChange={() => handleToggleSetting('useCompactMode')}
                />
              }
              label={
                <Typography variant="body2">
                  {t('mobile.useCompactMode')}
                </Typography>
              }
            />
          </ListItem>

          <ListItem>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableTouchGestures}
                  onChange={() => handleToggleSetting('enableTouchGestures')}
                />
              }
              label={
                <Typography variant="body2">
                  {t('mobile.enableTouchGestures')}
                </Typography>
              }
            />
          </ListItem>

          <ListItem>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableZoomControl}
                  onChange={() => handleToggleSetting('enableZoomControl')}
                />
              }
              label={
                <Typography variant="body2">
                  {t('mobile.enableZoomControl')}
                </Typography>
              }
            />
          </ListItem>

          <ListItem>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableOfflineMode}
                  onChange={() => handleToggleSetting('enableOfflineMode')}
                />
              }
              label={
                <Typography variant="body2">
                  {t('mobile.enableOfflineMode')}
                </Typography>
              }
            />
          </ListItem>

          {/* 字体缩放控制 */}
          <ListItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" gutterBottom>
                {t('mobile.fontScale')}: {settings.fontScale.toFixed(1)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleFontSizeChange(-0.1)}
                  disabled={settings.fontScale <= 0.8}
                >
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <Box
                  sx={{
                    flex: 1,
                    height: 8,
                    bgcolor: 'grey.300',
                    borderRadius: 4,
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      height: '100%',
                      width: `${((settings.fontScale - 0.8) / 0.7) * 100}%`,
                      bgcolor: 'primary.main',
                      borderRadius: 4
                    }}
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleFontSizeChange(0.1)}
                  disabled={settings.fontScale >= 1.5}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </ListItem>

          {/* 设备特定设置 */}
          <ListItem
            button
            onClick={() => handleToggleSection('deviceSpecific')}
          >
            <ListItemIcon>
              <SmartphoneIcon />
            </ListItemIcon>
            <ListItemText primary={t('mobile.deviceSpecificSettings')} />
            {expandedSections.deviceSpecific ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>

          <Collapse in={expandedSections.deviceSpecific}>
            <List component="div" disablePadding>
              {(['mobile', 'tablet', 'desktop'] as DeviceType[]).map((device) => (
                <Box key={device} sx={{ pl: 4, pr: 2, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getDeviceIcon(device)}
                    <span style={{ marginLeft: 8 }}>{t(`device.${device}`)}</span>
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={settings.deviceSpecificSettings[device].enabled}
                        onChange={() => handleToggleDeviceSetting(device, 'enabled')}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {t('mobile.enableOptimization')}
                      </Typography>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={settings.deviceSpecificSettings[device].adaptiveLayout}
                        onChange={() => handleToggleDeviceSetting(device, 'adaptiveLayout')}
                        disabled={!settings.deviceSpecificSettings[device].enabled}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {t('mobile.adaptiveLayout')}
                      </Typography>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={settings.deviceSpecificSettings[device].optimizePerformance}
                        onChange={() => handleToggleDeviceSetting(device, 'optimizePerformance')}
                        disabled={!settings.deviceSpecificSettings[device].enabled}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {t('mobile.optimizePerformance')}
                      </Typography>
                    }
                  />
                </Box>
              ))}
            </List>
          </Collapse>

          {/* 高级设置 */}
          <ListItem
            button
            onClick={() => handleToggleSection('advanced')}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={t('mobile.advancedSettings')} />
            {expandedSections.advanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>

          <Collapse in={expandedSections.advanced}>
            <Box sx={{ p: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                startIcon={<TouchAppIcon />}
                sx={{ mb: 1 }}
              >
                {t('mobile.calibrateTouchScreen')}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="small"
                color="secondary"
              >
                {t('mobile.resetToDefaults')}
              </Button>
            </Box>
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );

  // 如果移动设备优化被禁用且当前不是移动设备，直接渲染子组件
  if (!settings.deviceSpecificSettings[currentDevice].enabled && currentDevice === 'desktop') {
    return <>{children}</>;
  }

  // 移动端友好的容器样式
  const containerStyles = {
    // 应用字体缩放
    fontSize: `${settings.fontScale}rem`,
    // 紧凑模式
    ...(settings.useCompactMode && {
      '& .MuiButton-root': {
        py: 0.5,
        minHeight: 32
      },
      '& .MuiToolbar-root': {
        minHeight: 48
      },
      '& .MuiListItem-root': {
        py: 0.5
      },
      '& .MuiCard-root': {
        p: 1
      },
      '& .MuiCardContent-root': {
        p: 1,
        '&:last-child': {
          pb: 1
        }
      }
    }),
    // 触摸优化
    ...(settings.enableTouchGestures && {
      '& .MuiButton-root, & .MuiIconButton-root, & .MuiListItem-button': {
        touchAction: 'manipulation',
      },
      '& input, & select, & textarea': {
        fontSize: `${settings.fontScale}rem`
      }
    })
  };

  return (
    <Box sx={containerStyles}>
      {/* 显示适配设置按钮 */}
      {(isMobile || isTablet) && (
        <Tooltip title={t('mobile.adaptationSettings')}>
          <Fab
            color="primary"
            size="small"
            sx={{
              position: 'fixed',
              bottom: settings.enableZoomControl ? 120 : 16,
              right: 16,
              zIndex: 1000
            }}
            onClick={() => setSettingsOpen(true)}
          >
            <SmartphoneIcon />
          </Fab>
        </Tooltip>
      )}

      {/* 渲染子组件 */}
      {children}

      {/* 渲染缩放控制 */}
      {renderZoomControls()}

      {/* 渲染设置抽屉 */}
      {renderSettingsDrawer()}
    </Box>
  );
};

export default MobileAdaptation;
