import React, { useState, useEffect } from 'react';
import { ArrowBackIcon, FavoriteIcon, FavoriteBorderIcon, EditIcon, ShareIcon, DeleteIcon, CheckCircleIcon } from '../../utils/icons';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const TemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        // 模拟API调用
        setTimeout(() => {
          setTemplate({
            id,
            name: '生物实验模板',
            description: '用于生物学科的标准实验模板',
            type: 'biology',
            difficulty: 'intermediate',
            steps: [
              '准备实验材料',
              '设置实验环境',
              '执行实验步骤',
              '记录实验数据',
              '分析实验结果'
            ],
            parameters: [
              { name: '温度', value: '25°C', description: '实验环境温度' },
              { name: '湿度', value: '60%', description: '实验环境湿度' }
            ],
            resources: {
              equipment: ['显微镜', '培养皿'],
              materials: ['试剂A', '试剂B'],
              software: ['数据分析软件']
            },
            expectedResults: '观察到细胞分裂现象，记录分裂过程数据',
            subjectParameters: [
              { name: '观察时间', value: '30分钟' },
              { name: '放大倍数', value: '400倍' }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('加载模板失败');
        setLoading(false);
      }
    };

    if (id) {
      loadTemplate();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const savedFavorites = localStorage.getItem('templateFavorites');
      if (savedFavorites) {
        setIsFavorite(JSON.parse(savedFavorites).includes(id));
      }
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/templates');
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/templates/edit/${id}`);
    }
  };

  const handleUseTemplate = () => {
    if (template) {
      navigate('/experiments/create', {
        state: { template }
      });
    }
  };

  const toggleFavorite = () => {
    if (!id) return;
    
    let favorites: string[] = [];
    const savedFavorites = localStorage.getItem('templateFavorites');
    if (savedFavorites) {
      favorites = JSON.parse(savedFavorites);
      favorites = favorites.filter(favId => favId !== id);
      setIsFavorite(false);
    } else {
      favorites.push(id);
      setIsFavorite(true);
    }
    
    localStorage.setItem('templateFavorites', JSON.stringify(favorites));
  };

  const handleDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    // 执行删除逻辑
    navigate('/templates');
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
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          返回
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!template) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          返回
        </Button>
        <Alert severity="warning" sx={{ mt: 2 }}>
          模板不存在
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
        返回模板列表
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            {template.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isFavorite ? '取消收藏' : '收藏模板'}>
              <IconButton onClick={toggleFavorite}>
                {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="编辑模板">
              <IconButton onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="分享模板">
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="删除模板">
              <IconButton onClick={() => setConfirmDeleteOpen(true)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', mb: 2 }}>
          <Chip 
            label={template.type} 
            color="primary" 
            variant="outlined" 
            size="small" 
            sx={{ mr: 1 }} 
          />
          <Chip 
            label={template.difficulty} 
            color="secondary" 
            variant="outlined" 
            size="small" 
          />
        </Box>

        <Typography variant="body1" paragraph>
          {template.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUseTemplate}
            size="large"
          >
            使用此模板
          </Button>
        </Box>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="template detail tabs">
            <Tab label="实验步骤" />
            <Tab label="参数设置" />
            <Tab label="实验资源" />
            <Tab label="预期结果" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>实验步骤</Typography>
          <List>
            {template.steps.map((step: string, index: number) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>实验参数设置</Typography>
          <Grid container spacing={2}>
            {template.parameters.map((param: any, index: number) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {param.value}
                    </Typography>
                    <Typography variant="subtitle1">
                      {param.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {param.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {template.subjectParameters && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>学科特定参数</Typography>
              <Grid container spacing={2}>
                {template.subjectParameters.map((param: any, index: number) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">
                          {param.name}
                        </Typography>
                        <Typography variant="body1" color="primary">
                          {param.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>实验资源</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                实验设备
              </Typography>
              <List dense>
                {template.resources.equipment.map((item: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                实验材料
              </Typography>
              <List dense>
                {template.resources.materials.map((item: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                软件工具
              </Typography>
              <List dense>
                {template.resources.software.map((item: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>预期实验结果</Typography>
          <Card>
            <CardContent>
              <Typography variant="body1">
                {template.expectedResults || '暂无预期结果描述'}
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default TemplateDetail;
