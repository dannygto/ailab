const fs = require('fs');
const path = require('path');

// 修复 ExperimentStatusPanel.tsx
function fixExperimentStatusPanel() {
  const filePath = path.join(__dirname, 'frontend/src/pages/experiments/components/ExperimentStatusPanel.tsx');
  
  const content = `import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Stack,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface ExperimentStatusPanelProps {
  experimentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress?: number;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onRefresh?: () => void;
}

const ExperimentStatusPanel: React.FC<ExperimentStatusPanelProps> = ({
  experimentId,
  status,
  progress = 0,
  onStart,
  onPause,
  onStop,
  onRefresh
}) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentProgress, setCurrentProgress] = useState(progress);

  useEffect(() => {
    setCurrentStatus(status);
    setCurrentProgress(progress);
  }, [status, progress]);

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (currentStatus) {
      case 'pending': return '等待中';
      case 'running': return '运行中';
      case 'completed': return '已完成';
      case 'failed': return '失败';
      case 'paused': return '已暂停';
      default: return '未知';
    }
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              实验状态监控
            </Typography>
            <Tooltip title="刷新状态">
              <IconButton onClick={onRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                实验 ID: {experimentId}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
              <Chip
                label={getStatusLabel()}
                color={getStatusColor()}
                variant="filled"
                size="small"
              />
            </Grid>
          </Grid>

          {currentStatus === 'running' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  进度
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(currentProgress)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={currentProgress} 
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
          )}

          {currentStatus === 'failed' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              实验执行失败，请检查实验配置或联系管理员
            </Alert>
          )}

          <Stack direction="row" spacing={1}>
            {currentStatus === 'pending' && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={onStart}
                size="small"
              >
                开始
              </Button>
            )}
            
            {currentStatus === 'running' && (
              <React.Fragment>
                <Button
                  variant="outlined"
                  startIcon={<PauseIcon />}
                  onClick={onPause}
                  size="small"
                >
                  暂停
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={onStop}
                  size="small"
                >
                  停止
                </Button>
              </React.Fragment>
            )}

            {currentStatus === 'paused' && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={onStart}
                size="small"
              >
                继续
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ExperimentStatusPanel;
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ExperimentStatusPanel.tsx');
}

// 修复 ExperimentCreateV2.tsx
function fixExperimentCreateV2() {
  const filePath = path.join(__dirname, 'frontend/src/pages/experiments/ExperimentCreateV2.tsx');
  
  const content = `import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Alert,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// 假设的组件
const BasicInfoForm = ({ data, onChange }: any) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">基本信息表单</Typography>
    <Typography variant="body2" color="text.secondary">
      配置实验的基本信息
    </Typography>
  </Box>
);

const ConfigurationForm = ({ data, onChange }: any) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">实验配置</Typography>
    <Typography variant="body2" color="text.secondary">
      设置实验参数和配置
    </Typography>
  </Box>
);

const ResourceForm = ({ data, onChange }: any) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">资源推荐</Typography>
    <Typography variant="body2" color="text.secondary">
      选择和配置实验资源
    </Typography>
  </Box>
);

const ConfirmationForm = ({ data }: any) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">确认信息</Typography>
    <Typography variant="body2" color="text.secondary">
      确认实验配置并创建
    </Typography>
  </Box>
);

const ExperimentCreateV2: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const steps = ['基本信息', '实验配置', '资源推荐', '确认信息'];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 实际的提交逻辑
      console.log('Creating experiment with data:', formData);
      navigate('/experiments');
    } catch (err) {
      setError('创建实验失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BasicInfoForm data={formData} onChange={handleFormChange} />;
      case 1:
        return <ConfigurationForm data={formData} onChange={handleFormChange} />;
      case 2:
        return <ResourceForm data={formData} onChange={handleFormChange} />;
      case 3:
        return <ConfirmationForm data={formData} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          创建新实验
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          {renderStepContent(activeStep)}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            上一步
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? '创建实验' : '下一步'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ExperimentCreateV2;
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ExperimentCreateV2.tsx');
}

// 修复 ExperimentDetail.tsx
function fixExperimentDetail() {
  const filePath = path.join(__dirname, 'frontend/src/pages/experiments/ExperimentDetail.tsx');
  
  const content = `import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import { useParams } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// 假设的组件
const ExperimentDataPanel = ({ experiment }: any) => (
  <Box>
    <Typography variant="h6">实验数据</Typography>
    <Typography variant="body2" color="text.secondary">
      显示实验的数据和结果
    </Typography>
  </Box>
);

const ExperimentResultPanel = ({ experiment }: any) => (
  <Box>
    <Typography variant="h6">实验结果</Typography>
    <Typography variant="body2" color="text.secondary">
      显示实验的分析结果
    </Typography>
  </Box>
);

const ExperimentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [experiment, setExperiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 模拟数据加载
  React.useEffect(() => {
    const loadExperiment = async () => {
      try {
        // 模拟API调用
        setTimeout(() => {
          setExperiment({
            id,
            name: '示例实验',
            description: '这是一个示例实验',
            status: 'completed'
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('加载实验详情失败');
        setLoading(false);
      }
    };

    if (id) {
      loadExperiment();
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!experiment) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 3 }}>
          实验不存在
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, pb: 5 }}>
      <Typography variant="h4" gutterBottom>
        {experiment.name}
      </Typography>

      <Paper elevation={2} sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="experiment detail tabs">
            <Tab label="概览" />
            <Tab label="数据" />
            <Tab label="监控" />
            <Tab label="结果" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6">实验概览</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {experiment.description}
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ExperimentDataPanel experiment={experiment} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ py: 2 }}>
            <Typography variant="h6">实验监控</Typography>
            <Typography variant="body2" color="text.secondary">
              实验执行状态和监控信息
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <ExperimentResultPanel experiment={experiment} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ExperimentDetail;
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ExperimentDetail.tsx');
}

// 修复 ExperimentDetailV2.tsx
function fixExperimentDetailV2() {
  const filePath = path.join(__dirname, 'frontend/src/pages/experiments/ExperimentDetailV2.tsx');
  
  const content = `import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ExperimentDetailV2: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [experiment, setExperiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 模拟数据加载
  React.useEffect(() => {
    const loadExperiment = async () => {
      try {
        setTimeout(() => {
          setExperiment({
            id,
            name: '高级实验',
            description: '这是一个高级实验示例',
            type: 'advanced',
            status: 'running',
            createdAt: new Date(),
            metadata: [
              { key: 'duration', value: '2 hours' },
              { key: 'participants', value: '12' }
            ],
            parameters: [
              { name: 'temperature', value: '25°C' },
              { name: 'pressure', value: '1 atm' }
            ],
            resources: [
              { name: '显微镜', type: 'equipment' },
              { name: '试剂A', type: 'material' }
            ],
            results: [
              { metric: 'accuracy', value: 0.95 },
              { metric: 'precision', value: 0.92 }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('加载实验详情失败');
        setLoading(false);
      }
    };

    if (id) {
      loadExperiment();
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!experiment) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 3 }}>
          实验不存在
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            {experiment.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small">
              <EditIcon />
            </IconButton>
            <IconButton size="small" color="error">
              <DeleteIcon />
            </IconButton>
            <IconButton size="small">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={experiment.status}
            color="primary"
            variant="filled"
            size="small"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>描述：</strong> {experiment.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              <strong>类型：</strong> {experiment.type}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>创建时间：</strong> {experiment.createdAt.toLocaleString('zh-CN')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Card elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="experiment detail tabs">
            <Tab label="基础信息" />
            <Tab label="实验参数" />
            <Tab label="数据分析" />
            <Tab label="实验结果" />
            <Tab label="日志记录" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>基础信息</Typography>
          <Grid container spacing={2}>
            {experiment.metadata.map((item: any, index: number) => (
              <Grid item xs={12} sm={6} key={index}>
                <Typography variant="body1">
                  <strong>{item.key}:</strong> {item.value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>实验参数</Typography>
          <Grid container spacing={2}>
            {experiment.parameters.map((param: any, index: number) => (
              <Grid item xs={12} sm={6} key={index}>
                <Typography variant="body1">
                  <strong>{param.name}:</strong> {param.value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>数据分析</Typography>
          <Typography variant="body2" color="text.secondary">
            实验数据分析和可视化内容
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>实验结果</Typography>
          {experiment.results.length > 0 ? (
            <Grid container spacing={2}>
              {experiment.results.map((result: any, index: number) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {(result.value * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {result.metric}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              暂无实验结果数据
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>日志记录</Typography>
          <Typography variant="body2" color="text.secondary">
            实验执行日志和历史记录
          </Typography>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ExperimentDetailV2;
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ExperimentDetailV2.tsx');
}

// 修复 ResourceManagement.tsx
function fixResourceManagement() {
  const filePath = path.join(__dirname, 'frontend/src/pages/resources/ResourceManagement.tsx');
  
  const content = `import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface Resource {
  id: string;
  name: string;
  type: string;
  category: string;
  status: boolean;
  description: string;
  experimentType: string;
}

const ResourceManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentResource, setCurrentResource] = useState<Partial<Resource>>({});

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      setTimeout(() => {
        setResources([
          {
            id: '1',
            name: '显微镜 A',
            type: 'physical',
            category: 'equipment',
            status: true,
            description: '高精度显微镜',
            experimentType: 'biology'
          },
          {
            id: '2',
            name: '试剂盒 B',
            type: 'virtual',
            category: 'material',
            status: true,
            description: '化学试剂盒',
            experimentType: 'chemistry'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('加载资源失败');
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (resource?: Resource) => {
    if (resource) {
      setCurrentResource(resource);
      setEditMode(true);
    } else {
      setCurrentResource({});
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentResource({});
    setEditMode(false);
  };

  const handleSaveResource = async () => {
    try {
      // 模拟保存操作
      console.log('Saving resource:', currentResource);
      handleCloseDialog();
      loadResources();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      // 模拟删除操作
      console.log('Deleting resource:', id);
      loadResources();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        资源管理
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        管理实验所需的各种资源，包括设备、材料等。
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="resource tabs">
          <Tab label="全部资源" />
          <Tab label="设备管理" />
          <Tab label="材料管理" />
          <Tab label="软件资源" />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField
          placeholder="搜索资源..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300 }}
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          添加资源
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      {resource.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(resource)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {resource.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={resource.type} size="small" variant="outlined" />
                    <Chip label={resource.category} size="small" variant="outlined" />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      状态: {resource.status ? '可用' : '不可用'}
                    </Typography>
                    <Chip
                      label={resource.status ? '可用' : '不可用'}
                      color={resource.status ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 新建/编辑资源对话框 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? '编辑资源' : '添加新资源'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="资源名称"
                value={currentResource.name || ''}
                onChange={(e) => setCurrentResource(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>实验类型</InputLabel>
                <Select
                  value={currentResource.experimentType || ''}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, experimentType: e.target.value }))}
                >
                  <MenuItem value="biology">生物实验</MenuItem>
                  <MenuItem value="chemistry">化学实验</MenuItem>
                  <MenuItem value="physics">物理实验</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>资源类型</InputLabel>
                <Select
                  value={currentResource.type || ''}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="physical">物理资源</MenuItem>
                  <MenuItem value="virtual">虚拟资源</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>资源类别</InputLabel>
                <Select
                  value={currentResource.category || ''}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="equipment">设备</MenuItem>
                  <MenuItem value="material">材料</MenuItem>
                  <MenuItem value="software">软件</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>可用状态</InputLabel>
                <Select
                  value={currentResource.status ? 'true' : 'false'}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, status: e.target.value === 'true' }))}
                >
                  <MenuItem value="true">可用</MenuItem>
                  <MenuItem value="false">不可用</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="描述"
                multiline
                rows={3}
                value={currentResource.description || ''}
                onChange={(e) => setCurrentResource(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSaveResource} variant="contained">
            {editMode ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourceManagement;
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ResourceManagement.tsx');
}

// 执行所有修复
console.log('Starting critical batch 4 fixes...');
fixExperimentStatusPanel();
fixExperimentCreateV2();
fixExperimentDetail();
fixExperimentDetailV2();
fixResourceManagement();
console.log('Critical batch 4 fixes completed!');
