import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardHeader,
  CardContent,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  BrandingWatermark as BrandingWatermarkIcon,
  VerifiedUser as VerifiedUserIcon,
  Public as PublicIcon,
  Code as CodeIcon,
  Layers as LayersIcon,
  Build as BuildIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// 技术组件类型
interface TechnologyComponent {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'security';
  currentVersion: string;
  currentProvider: 'foreign' | 'domestic';
  domesticAlternative?: {
    name: string;
    provider: string;
    version: string;
    compatibility: number; // 0-100
    migrationComplexity: 'low' | 'medium' | 'high';
    status: 'available' | 'in-progress' | 'planned' | 'not-available';
  };
  description: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  dependencies: string[];
}

// 国产兼容性检查结果
interface CompatibilityCheck {
  componentId: string;
  status: 'compatible' | 'partially-compatible' | 'incompatible' | 'unknown';
  issues: string[];
  recommendations: string[];
}

// 替换计划项
interface MigrationPlanItem {
  componentId: string;
  priority: number; // 1-5, 1最高
  estimatedEffort: number; // 人天
  dependencies: string[];
  status: 'not-started' | 'in-progress' | 'completed';
  startDate?: Date;
  completionDate?: Date;
  assignedTo?: string;
}

interface DomesticTechnologySupportProps {
  onSaveSettings?: (settings: any) => void;
}

/**
 * 国产化支持组件
 * 提供技术组件国产化替换、兼容性检查和迁移计划管理
 */
const DomesticTechnologySupport: React.FC<DomesticTechnologySupportProps> = ({
  onSaveSettings
}) => {
  const { t } = useTranslation();

  // 状态管理
  const [activeTab, setActiveTab] = useState<'components' | 'compatibility' | 'migration'>('components');
  const [isChecking, setIsChecking] = useState(false);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<TechnologyComponent | null>(null);
  const [migrationEnabled, setMigrationEnabled] = useState(true);
  const [compatibilityMode, setCompatibilityMode] = useState('strict');
  const [enforceDomesticPolicy, setEnforceDomesticPolicy] = useState(false);

  // 模拟技术组件数据
  const [components, setComponents] = useState<TechnologyComponent[]>([
    {
      id: 'react',
      name: 'React',
      category: 'frontend',
      currentVersion: '18.2.0',
      currentProvider: 'foreign',
      domesticAlternative: {
        name: 'Vue.js + 兼容层',
        provider: '国产开源社区',
        version: '3.3.4',
        compatibility: 85,
        migrationComplexity: 'high',
        status: 'available'
      },
      description: '用户界面构建库',
      importance: 'critical',
      dependencies: ['nodejs']
    },
    {
      id: 'mui',
      name: 'Material UI',
      category: 'frontend',
      currentVersion: '5.14.5',
      currentProvider: 'foreign',
      domesticAlternative: {
        name: 'Ant Design',
        provider: '蚂蚁集团',
        version: '5.8.3',
        compatibility: 90,
        migrationComplexity: 'medium',
        status: 'available'
      },
      description: 'UI组件库',
      importance: 'high',
      dependencies: ['react']
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'backend',
      currentVersion: '18.17.1',
      currentProvider: 'foreign',
      domesticAlternative: {
        name: 'Deno兼容包装器',
        provider: '国产开源社区',
        version: '1.36.1',
        compatibility: 75,
        migrationComplexity: 'medium',
        status: 'in-progress'
      },
      description: 'JavaScript运行时',
      importance: 'critical',
      dependencies: []
    },
    {
      id: 'express',
      name: 'Express',
      category: 'backend',
      currentVersion: '4.18.2',
      currentProvider: 'foreign',
      domesticAlternative: {
        name: 'Koa + 兼容层',
        provider: '国产开源社区',
        version: '2.14.2',
        compatibility: 95,
        migrationComplexity: 'low',
        status: 'available'
      },
      description: 'Web应用框架',
      importance: 'high',
      dependencies: ['nodejs']
    },
    {
      id: 'mongodb',
      name: 'MongoDB',
      category: 'database',
      currentVersion: '6.0.8',
      currentProvider: 'foreign',
      domesticAlternative: {
        name: 'TiDB',
        provider: 'PingCAP',
        version: '7.1.0',
        compatibility: 70,
        migrationComplexity: 'high',
        status: 'available'
      },
      description: '文档数据库',
      importance: 'critical',
      dependencies: []
    },
    {
      id: 'nginx',
      name: 'Nginx',
      category: 'infrastructure',
      currentVersion: '1.25.1',
      currentProvider: 'foreign',
      domesticAlternative: {
        name: 'OpenResty/Tengine',
        provider: '淘宝/阿里巴巴',
        version: '3.1.0',
        compatibility: 98,
        migrationComplexity: 'low',
        status: 'available'
      },
      description: 'Web服务器',
      importance: 'high',
      dependencies: []
    },
    {
      id: 'docker',
      name: 'Docker',
      category: 'infrastructure',
      currentVersion: '24.0.5',
      currentProvider: 'foreign',
      domesticAlternative: {
        name: '容器云平台',
        provider: '华为云',
        version: '2.3.0',
        compatibility: 92,
        migrationComplexity: 'medium',
        status: 'available'
      },
      description: '容器化平台',
      importance: 'high',
      dependencies: []
    },
    {
      id: 'openssl',
      name: 'OpenSSL',
      category: 'security',
      currentVersion: '3.1.2',
      currentProvider: 'foreign',
      domesticAlternative: {
        name: '国密算法库',
        provider: '国家密码管理局认证',
        version: '2.2.0',
        compatibility: 80,
        migrationComplexity: 'medium',
        status: 'available'
      },
      description: '加密库',
      importance: 'critical',
      dependencies: []
    },
    {
      id: 'tensorflow',
      name: 'TensorFlow',
      category: 'backend',
      currentVersion: '2.13.0',
      currentProvider: 'foreign',
      domesticAlternative: {
        name: '昇思MindSpore',
        provider: '华为',
        version: '2.0.0',
        compatibility: 65,
        migrationComplexity: 'high',
        status: 'available'
      },
      description: '机器学习框架',
      importance: 'medium',
      dependencies: ['python']
    },
    {
      id: 'python',
      name: 'Python',
      category: 'backend',
      currentVersion: '3.11.4',
      currentProvider: 'foreign',
      domesticAlternative: {
        name: 'Python(龙芯平台优化版)',
        provider: '龙芯中科',
        version: '3.10.12',
        compatibility: 99,
        migrationComplexity: 'low',
        status: 'available'
      },
      description: '编程语言',
      importance: 'high',
      dependencies: []
    }
  ]);

  // 模拟兼容性检查结果
  const [compatibilityResults, setCompatibilityResults] = useState<CompatibilityCheck[]>([
    {
      componentId: 'react',
      status: 'partially-compatible',
      issues: [
        '部分组件生命周期方法在Vue中需要重写',
        'React Context API需要使用Vue的Provide/Inject替代'
      ],
      recommendations: [
        '使用兼容层适配器减少迁移工作量',
        '考虑使用Vue Composition API代替React Hooks'
      ]
    },
    {
      componentId: 'mui',
      status: 'compatible',
      issues: [],
      recommendations: [
        '使用AntD组件映射表进行组件替换',
        '调整主题配置以匹配当前设计系统'
      ]
    },
    {
      componentId: 'nodejs',
      status: 'partially-compatible',
      issues: [
        '部分Node.js特有API在Deno中不可用',
        '文件系统权限模型差异'
      ],
      recommendations: [
        '使用兼容性包装器处理API差异',
        '逐步迁移非关键模块验证兼容性'
      ]
    },
    {
      componentId: 'mongodb',
      status: 'incompatible',
      issues: [
        'NoSQL到SQL模型转换挑战',
        '查询语法差异显著',
        '事务模型不同'
      ],
      recommendations: [
        '考虑使用ORM抽象层',
        '设计数据迁移策略',
        '增加全面测试覆盖'
      ]
    },
    {
      componentId: 'openssl',
      status: 'partially-compatible',
      issues: [
        '加密算法标准不同',
        'API调用方式有差异'
      ],
      recommendations: [
        '实现加密适配层',
        '添加国密算法支持'
      ]
    }
  ]);

  // 模拟迁移计划
  const [migrationPlan, setMigrationPlan] = useState<MigrationPlanItem[]>([
    {
      componentId: 'express',
      priority: 1,
      estimatedEffort: 5,
      dependencies: ['nodejs'],
      status: 'completed',
      startDate: new Date(2023, 6, 15),
      completionDate: new Date(2023, 6, 20),
      assignedTo: '张工程师'
    },
    {
      componentId: 'mui',
      priority: 2,
      estimatedEffort: 15,
      dependencies: ['react'],
      status: 'in-progress',
      startDate: new Date(2023, 7, 1),
      assignedTo: '李工程师'
    },
    {
      componentId: 'react',
      priority: 3,
      estimatedEffort: 30,
      dependencies: ['nodejs'],
      status: 'not-started'
    },
    {
      componentId: 'mongodb',
      priority: 2,
      estimatedEffort: 20,
      dependencies: [],
      status: 'not-started'
    },
    {
      componentId: 'openssl',
      priority: 1,
      estimatedEffort: 10,
      dependencies: [],
      status: 'in-progress',
      startDate: new Date(2023, 7, 15),
      assignedTo: '王工程师'
    }
  ]);

  // 执行兼容性检查
  const runCompatibilityCheck = () => {
    setIsChecking(true);

    // 模拟异步检查过程
    setTimeout(() => {
      // 随机更新一些兼容性结果
      const updatedResults = [...compatibilityResults];
      const randomIndex = Math.floor(Math.random() * updatedResults.length);
      const randomStatus: CompatibilityCheck['status'] = ['compatible', 'partially-compatible', 'incompatible'][Math.floor(Math.random() * 3)];

      updatedResults[randomIndex] = {
        ...updatedResults[randomIndex],
        status: randomStatus,
        issues: randomStatus === 'compatible' ? [] : updatedResults[randomIndex].issues,
        recommendations: [
          ...updatedResults[randomIndex].recommendations,
          '检查更新于 ' + new Date().toLocaleTimeString()
        ]
      };

      setCompatibilityResults(updatedResults);
      setIsChecking(false);
    }, 2000);
  };

  // 更新组件状态
  const updateComponent = (componentId: string, updates: Partial<TechnologyComponent>) => {
    setComponents(components.map(component =>
      component.id === componentId ? { ...component, ...updates } : component
    ));
  };

  // 更新迁移计划项
  const updateMigrationPlan = (componentId: string, updates: Partial<MigrationPlanItem>) => {
    setMigrationPlan(migrationPlan.map(item =>
      item.componentId === componentId ? { ...item, ...updates } : item
    ));
  };

  // 切换组件到国产化版本
  const switchToDomestic = (component: TechnologyComponent) => {
    if (!component.domesticAlternative || component.domesticAlternative.status !== 'available') {
      return;
    }

    updateComponent(component.id, {
      currentProvider: 'domestic'
    });

    // 更新迁移计划状态
    const planItem = migrationPlan.find(item => item.componentId === component.id);
    if (planItem) {
      updateMigrationPlan(component.id, {
        status: 'completed',
        completionDate: new Date()
      });
    }
  };

  // 打开迁移对话框
  const openMigrationDialog = (component: TechnologyComponent) => {
    setSelectedComponent(component);
    setShowMigrationDialog(true);
  };

  // 保存设置
  const saveSettings = () => {
    if (onSaveSettings) {
      onSaveSettings({
        migrationEnabled,
        compatibilityMode,
        enforceDomesticPolicy,
        components: components.map(c => ({
          id: c.id,
          currentProvider: c.currentProvider
        }))
      });
    }
  };

  // 获取组件状态样式
  const getComponentStatusColor = (component: TechnologyComponent) => {
    if (component.currentProvider === 'domestic') {
      return 'success';
    }

    if (!component.domesticAlternative) {
      return 'error';
    }

    switch (component.domesticAlternative.status) {
      case 'available':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'planned':
        return 'secondary';
      case 'not-available':
        return 'error';
      default:
        return 'default';
    }
  };

  // 获取兼容性状态样式
  const getCompatibilityStatusColor = (status: CompatibilityCheck['status']) => {
    switch (status) {
      case 'compatible':
        return 'success';
      case 'partially-compatible':
        return 'warning';
      case 'incompatible':
        return 'error';
      case 'unknown':
      default:
        return 'default';
    }
  };

  // 获取迁移状态样式
  const getMigrationStatusColor = (status: MigrationPlanItem['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'not-started':
      default:
        return 'default';
    }
  };

  // 获取组件类别图标
  const getCategoryIcon = (category: TechnologyComponent['category']) => {
    switch (category) {
      case 'frontend':
        return <CodeIcon />;
      case 'backend':
        return <LayersIcon />;
      case 'database':
        return <StorageIcon />;
      case 'infrastructure':
        return <BuildIcon />;
      case 'security':
        return <SecurityIcon />;
      default:
        return <SettingsIcon />;
    }
  };

  // 计算国产化率
  const calculateDomesticRate = () => {
    const domesticCount = components.filter(c => c.currentProvider === 'domestic').length;
    return (domesticCount / components.length) * 100;
  };

  // 计算迁移完成率
  const calculateMigrationCompletionRate = () => {
    const completedCount = migrationPlan.filter(item => item.status === 'completed').length;
    return (completedCount / migrationPlan.length) * 100;
  };

  // 渲染进度指示器
  const renderProgressIndicator = (value: number) => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" value={value} color={
        value < 30 ? 'error' : value < 70 ? 'warning' : 'success'
      } />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );

  // 渲染兼容性状态标签
  const renderCompatibilityStatus = (status: CompatibilityCheck['status']) => {
    const statusText = {
      'compatible': t('domestic.fullyCompatible'),
      'partially-compatible': t('domestic.partiallyCompatible'),
      'incompatible': t('domestic.incompatible'),
      'unknown': t('domestic.unknown')
    }[status];

    return (
      <Chip
        label={statusText}
        size="small"
        color={getCompatibilityStatusColor(status)}
      />
    );
  };

  // 渲染组件列表
  const renderComponentsList = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          <AlertTitle>{t('domestic.componentStatusOverview')}</AlertTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {t('domestic.domesticRate')}:
            </Typography>
            {renderProgressIndicator(calculateDomesticRate())}
          </Box>
          <Typography variant="body2">
            {t('domestic.totalComponents')}: {components.length},
            {t('domestic.domesticComponents')}: {components.filter(c => c.currentProvider === 'domestic').length},
            {t('domestic.foreignComponents')}: {components.filter(c => c.currentProvider === 'foreign').length}
          </Typography>
        </Alert>
      </Box>

      {/* 组件列表 */}
      <Grid container spacing={2}>
        {components.map(component => (
          <Grid item xs={12} md={6} key={component.id}>
            <Card
              variant="outlined"
              sx={{
                mb: 2,
                borderColor: component.currentProvider === 'domestic' ? 'success.main' : 'grey.300'
              }}
            >
              <CardHeader
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: getComponentStatusColor(component)
                    }}
                  >
                    {getCategoryIcon(component.category)}
                  </Avatar>
                }
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                      {component.name}
                    </Typography>
                    {component.currentProvider === 'domestic' && (
                      <Chip
                        label={t('domestic.domestic')}
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                }
                subheader={
                  <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t(`domestic.category.${component.category}`)} · v{component.currentVersion}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 0.5 }}>
                      {t('domestic.importance')}: {t(`domestic.importanceLevel.${component.importance}`)}
                    </Typography>
                  </Box>
                }
                action={
                  component.currentProvider === 'foreign' &&
                  component.domesticAlternative?.status === 'available' ? (
                    <Tooltip title={t('domestic.switchToDomestic')}>
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => switchToDomestic(component)}
                        sx={{ mt: 1 }}
                      >
                        <PublicIcon />
                      </IconButton>
                    </Tooltip>
                  ) : null
                }
              />
              <Divider />
              <CardContent>
                <Typography variant="body2" paragraph>
                  {component.description}
                </Typography>

                {component.currentProvider === 'foreign' && component.domesticAlternative ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('domestic.alternativeSolution')}:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={component.domesticAlternative.name}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {component.domesticAlternative.provider} · v{component.domesticAlternative.version}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {t('domestic.compatibility')}:
                      </Typography>
                      <Box sx={{ width: 100 }}>
                        {renderProgressIndicator(component.domesticAlternative.compatibility)}
                      </Box>
                      <Chip
                        label={t(`domestic.complexity.${component.domesticAlternative.migrationComplexity}`)}
                        size="small"
                        color={
                          component.domesticAlternative.migrationComplexity === 'low' ? 'success' :
                          component.domesticAlternative.migrationComplexity === 'medium' ? 'warning' :
                          'error'
                        }
                        sx={{ ml: 1 }}
                      />
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openMigrationDialog(component)}
                      startIcon={<InfoIcon />}
                    >
                      {t('domestic.migrationDetails')}
                    </Button>
                  </Box>
                ) : component.currentProvider === 'foreign' ? (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    {t('domestic.noAlternativeAvailable')}
                  </Alert>
                ) : (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    {t('domestic.alreadyUsingDomestic')}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // 渲染兼容性检查页面
  const renderCompatibilityCheck = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {t('domestic.compatibilityAnalysis')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={runCompatibilityCheck}
          disabled={isChecking}
        >
          {isChecking ? t('domestic.checking') : t('domestic.runCheck')}
        </Button>
      </Box>

      {/* 兼容性设置 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('domestic.compatibilitySettings')}
        </Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Switch
                checked={migrationEnabled}
                onChange={() => setMigrationEnabled(!migrationEnabled)}
              />
            }
            label={t('domestic.enableMigrationAssistant')}
          />
          <FormControl sx={{ ml: 2, minWidth: 200 }}>
            <InputLabel>{t('domestic.compatibilityMode')}</InputLabel>
            <Select
              value={compatibilityMode}
              onChange={(e) => setCompatibilityMode(e.target.value)}
              label={t('domestic.compatibilityMode')}
              size="small"
            >
              <MenuItem value="strict">{t('domestic.strictMode')}</MenuItem>
              <MenuItem value="loose">{t('domestic.looseMode')}</MenuItem>
              <MenuItem value="custom">{t('domestic.customMode')}</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={enforceDomesticPolicy}
                onChange={() => setEnforceDomesticPolicy(!enforceDomesticPolicy)}
              />
            }
            label={t('domestic.enforceDomesticPolicy')}
            sx={{ ml: 2 }}
          />
        </FormGroup>
      </Paper>

      {/* 兼容性检查结果 */}
      {compatibilityResults.length > 0 ? (
        <List>
          {compatibilityResults.map(result => {
            const component = components.find(c => c.id === result.componentId);
            if (!component) return null;

            return (
              <Accordion key={result.componentId}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar sx={{ bgcolor: getCompatibilityStatusColor(result.status), mr: 2 }}>
                      {getCategoryIcon(component.category)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">
                        {component.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {renderCompatibilityStatus(result.status)}
                        {component.domesticAlternative && (
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            → {component.domesticAlternative.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {result.issues.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('domestic.identifiedIssues')}:
                      </Typography>
                      <List dense>
                        {result.issues.map((issue, index) => (
                          <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <WarningIcon color="warning" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={issue} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {result.recommendations.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('domestic.recommendations')}:
                      </Typography>
                      <List dense>
                        {result.recommendations.map((recommendation, index) => (
                          <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <InfoIcon color="info" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={recommendation} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {component.currentProvider === 'foreign' &&
                   component.domesticAlternative?.status === 'available' && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PublicIcon />}
                      onClick={() => switchToDomestic(component)}
                      sx={{ mt: 2 }}
                    >
                      {t('domestic.switchToDomestic')}
                    </Button>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </List>
      ) : (
        <Alert severity="info">
          {t('domestic.noCompatibilityData')}
        </Alert>
      )}
    </Box>
  );

  // 渲染迁移计划页面
  const renderMigrationPlan = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          <AlertTitle>{t('domestic.migrationProgress')}</AlertTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {t('domestic.completionRate')}:
            </Typography>
            {renderProgressIndicator(calculateMigrationCompletionRate())}
          </Box>
          <Typography variant="body2">
            {t('domestic.totalTasks')}: {migrationPlan.length},
            {t('domestic.completedTasks')}: {migrationPlan.filter(item => item.status === 'completed').length},
            {t('domestic.inProgressTasks')}: {migrationPlan.filter(item => item.status === 'in-progress').length}
          </Typography>
        </Alert>
      </Box>

      {/* 迁移计划表格 */}
      <List>
        {migrationPlan
          .sort((a, b) => a.priority - b.priority)
          .map(item => {
            const component = components.find(c => c.id === item.componentId);
            if (!component) return null;

            return (
              <Paper variant="outlined" sx={{ mb: 2 }} key={item.componentId}>
                <ListItem
                  secondaryAction={
                    <Chip
                      label={t(`domestic.migrationStatus.${item.status}`)}
                      color={getMigrationStatusColor(item.status)}
                    />
                  }
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: getComponentStatusColor(component) }}>
                      {getCategoryIcon(component.category)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {component.name}
                        </Typography>
                        <Chip
                          label={`P${item.priority}`}
                          size="small"
                          color={item.priority <= 2 ? 'error' : 'default'}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        {component.domesticAlternative && (
                          <Typography variant="body2">
                            → {component.domesticAlternative.name} ({component.domesticAlternative.provider})
                          </Typography>
                        )}
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {t('domestic.estimatedEffort')}: {item.estimatedEffort} {t('domestic.personDays')}
                          {item.assignedTo && ` · ${t('domestic.assignedTo')}: ${item.assignedTo}`}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('domestic.dependencies')}:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {item.dependencies.length > 0 ? (
                      item.dependencies.map(depId => {
                        const dep = components.find(c => c.id === depId);
                        return dep ? (
                          <Chip
                            key={depId}
                            label={dep.name}
                            size="small"
                            variant="outlined"
                          />
                        ) : null;
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('domestic.noDependencies')}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    {item.status === 'not-started' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => updateMigrationPlan(item.componentId, {
                          status: 'in-progress',
                          startDate: new Date()
                        })}
                      >
                        {t('domestic.startMigration')}
                      </Button>
                    )}

                    {item.status === 'in-progress' && (
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() => {
                          updateMigrationPlan(item.componentId, {
                            status: 'completed',
                            completionDate: new Date()
                          });
                          if (component.currentProvider === 'foreign' &&
                              component.domesticAlternative?.status === 'available') {
                            switchToDomestic(component);
                          }
                        }}
                      >
                        {t('domestic.completeMigration')}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            );
          })}
      </List>
    </Box>
  );

  // 渲染迁移详情对话框
  const renderMigrationDialog = () => (
    <Dialog
      open={showMigrationDialog}
      onClose={() => setShowMigrationDialog(false)}
      maxWidth="md"
      fullWidth
    >
      {selectedComponent && selectedComponent.domesticAlternative && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                {getCategoryIcon(selectedComponent.category)}
              </Avatar>
              <Typography variant="h6">
                {t('domestic.migrationFrom')} {selectedComponent.name} {t('domestic.migrationTo')} {selectedComponent.domesticAlternative.name}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('domestic.currentImplementation')}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" paragraph>
                    <strong>{t('domestic.name')}:</strong> {selectedComponent.name}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>{t('domestic.version')}:</strong> {selectedComponent.currentVersion}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>{t('domestic.provider')}:</strong> {t('domestic.foreign')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t('domestic.description')}:</strong> {selectedComponent.description}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('domestic.domesticAlternative')}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" paragraph>
                    <strong>{t('domestic.name')}:</strong> {selectedComponent.domesticAlternative.name}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>{t('domestic.version')}:</strong> {selectedComponent.domesticAlternative.version}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>{t('domestic.provider')}:</strong> {selectedComponent.domesticAlternative.provider}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>{t('domestic.compatibility')}:</strong> {selectedComponent.domesticAlternative.compatibility}%
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t('domestic.migrationComplexity')}:</strong> {t(`domestic.complexity.${selectedComponent.domesticAlternative.migrationComplexity}`)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  {t('domestic.migrationSteps')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>1</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={t('domestic.evaluateDependencies')}
                      secondary={t('domestic.identifyAllDependencies')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>2</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={t('domestic.createCompatibilityLayer')}
                      secondary={t('domestic.developAdapter')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>3</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={t('domestic.migrateIncrementally')}
                      secondary={t('domestic.phaseByPhaseMigration')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>4</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={t('domestic.thoroughTesting')}
                      secondary={t('domestic.ensureCompatibility')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>5</Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={t('domestic.deployAndMonitor')}
                      secondary={t('domestic.carefulDeployment')}
                    />
                  </ListItem>
                </List>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <AlertTitle>{t('domestic.estimatedTimeAndResources')}</AlertTitle>
                  {t('domestic.basedOnComplexity')} {selectedComponent.domesticAlternative.migrationComplexity} {t('domestic.complexity')},
                  {t('domestic.estimatedEffortIs')} {
                    selectedComponent.domesticAlternative.migrationComplexity === 'low' ? '5-10' :
                    selectedComponent.domesticAlternative.migrationComplexity === 'medium' ? '10-20' :
                    '20-40'
                  } {t('domestic.personDays')}.
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowMigrationDialog(false)}>
              {t('common.close')}
            </Button>
            {selectedComponent.currentProvider === 'foreign' &&
             selectedComponent.domesticAlternative.status === 'available' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  switchToDomestic(selectedComponent);
                  setShowMigrationDialog(false);
                }}
              >
                {t('domestic.switchToDomestic')}
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 头部 */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <BrandingWatermarkIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom>
                {t('domestic.technologySupportTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('domestic.technologySupportDescription')}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveSettings}
          >
            {t('common.saveSettings')}
          </Button>
        </Box>
      </Paper>

      {/* 导航标签 */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex' }}>
          <Box
            onClick={() => setActiveTab('components')}
            sx={{
              px: 3,
              py: 2,
              cursor: 'pointer',
              borderBottom: activeTab === 'components' ? 2 : 0,
              borderColor: 'primary.main',
              color: activeTab === 'components' ? 'primary.main' : 'text.secondary',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LayersIcon sx={{ mr: 1 }} />
            <Typography>
              {t('domestic.components')}
            </Typography>
          </Box>
          <Box
            onClick={() => setActiveTab('compatibility')}
            sx={{
              px: 3,
              py: 2,
              cursor: 'pointer',
              borderBottom: activeTab === 'compatibility' ? 2 : 0,
              borderColor: 'primary.main',
              color: activeTab === 'compatibility' ? 'primary.main' : 'text.secondary',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <VerifiedUserIcon sx={{ mr: 1 }} />
            <Typography>
              {t('domestic.compatibility')}
            </Typography>
          </Box>
          <Box
            onClick={() => setActiveTab('migration')}
            sx={{
              px: 3,
              py: 2,
              cursor: 'pointer',
              borderBottom: activeTab === 'migration' ? 2 : 0,
              borderColor: 'primary.main',
              color: activeTab === 'migration' ? 'primary.main' : 'text.secondary',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <PublicIcon sx={{ mr: 1 }} />
            <Typography>
              {t('domestic.migrationPlan')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 内容区域 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'components' && renderComponentsList()}
        {activeTab === 'compatibility' && renderCompatibilityCheck()}
        {activeTab === 'migration' && renderMigrationPlan()}

        {/* 迁移详情对话框 */}
        {renderMigrationDialog()}
      </Box>
    </Box>
  );
};

export default DomesticTechnologySupport;
