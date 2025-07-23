import React, { useState, useEffect, useCallback } from 'react';
import { EditIcon, DeleteIcon, RefreshIcon, ArrowBackIcon } from '../../utils/icons';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Container,
  Button,
  IconButton,
  Divider,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import experimentService from '../../services/experimentService';
import ExperimentStatusPanelV2 from './components/ExperimentStatusPanelV2';
import { experimentStatusService } from '../../services/experimentStatus.service';

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

/**
 * 实验详情页面 V3
 * 集成了改进的实验状态监控服务
 */
const ExperimentDetailV3: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [experiment, setExperiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载实验详情
  const loadExperiment = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await experimentService.getExperiment(id);
      if (response.success) {
        setExperiment(response.data);
      } else {
        setError('无法加载实验详情');
      }
    } catch (error) {
      console.error('加载实验详情失败:', error);
      setError('加载实验详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadExperiment();

    // 每次进入实验详情页面时，确保开始监控此实验的状态
    if (id) {
      // 初始获取一次状态（会被缓存）
      experimentStatusService.refreshStatus(id);
    }

    return () => {
      // 离开页面时停止监控
      if (id) {
        experimentStatusService.stopMonitoring(id);
      }
    };
  }, [id, loadExperiment]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    loadExperiment();
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/experiments/edit/${id}`);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('确定要删除此实验吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await experimentService.deleteExperiment(id);
      if (response.success) {
        navigate('/experiments');
      } else {
        setError('删除实验失败');
      }
    } catch (error) {
      console.error('删除实验失败:', error);
      setError('删除实验失败');
    }
  };

  const handleBack = () => {
    navigate('/experiments');
  };

  if (loading && !experiment) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !experiment) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
          <Button onClick={handleRefresh} size="small" sx={{ ml: 2 }}>
            重试
          </Button>
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
      {/* 面包屑导航 */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          component="button"
          onClick={handleBack}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="small" />
          实验列表
        </Link>
        <Typography color="text.primary">实验详情</Typography>
      </Breadcrumbs>

      {/* 标题和操作栏 */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            {experiment.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={handleEdit}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
            <IconButton size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          {experiment.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={experiment.type}
            color="secondary"
            variant="filled"
            size="small"
            sx={{ mr: 1 }}
          />
          <Chip
            label={experiment.status}
            color="primary"
            variant="filled"
            size="small"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 实验状态面板 */}
        {id && <ExperimentStatusPanelV2 experimentId={id} />}
      </Paper>

      {/* 选项卡 */}
      <Paper elevation={2}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="配置" />
          <Tab label="执行详情" />
          <Tab label="结果" />
          <Tab label="日志" />
        </Tabs>

        {/* 配置选项卡 */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            实验配置
          </Typography>
          {experiment.config ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <pre>{JSON.stringify(experiment.config, null, 2)}</pre>
            </Paper>
          ) : (
            <Alert severity="info">此实验没有配置信息</Alert>
          )}
        </TabPanel>

        {/* 执行详情选项卡 */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            执行详情
          </Typography>
          {id && (
            <Box sx={{ mt: 2 }}>
              <ExperimentStatusPanelV2
                experimentId={id}
                showDetails={true}
                autoRefresh={true}
              />
            </Box>
          )}
        </TabPanel>

        {/* 结果选项卡 */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            实验结果
          </Typography>
          {experiment.results ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <pre>{JSON.stringify(experiment.results, null, 2)}</pre>
            </Paper>
          ) : (
            <Alert severity="info">此实验暂无结果数据</Alert>
          )}
        </TabPanel>

        {/* 日志选项卡 */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            实验日志
          </Typography>
          {id ? (
            <Box sx={{ mt: 2 }}>
              <ExperimentStatusPanelV2
                experimentId={id}
                showDetails={true}
                autoRefresh={true}
              />
            </Box>
          ) : (
            <Alert severity="info">无法获取日志</Alert>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ExperimentDetailV3;
