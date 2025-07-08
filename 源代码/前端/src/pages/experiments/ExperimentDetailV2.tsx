import React, { useState } from 'react';
import { EditIcon as EditIcon, DeleteIcon as DeleteIcon, RefreshIcon as RefreshIcon } from '..\..\utils/icons';
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
;
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
