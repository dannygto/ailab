import React, { useState } from 'react';
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
