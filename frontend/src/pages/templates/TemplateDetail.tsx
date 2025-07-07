import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Divider, 
  Paper,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowBackIcon } from '../../utils/icons';
import { EditIcon } from '../../utils/icons';
import { DeleteIcon } from '../../utils/icons';
import { share } from '../../utils/icons';
import { FavoriteIcon } from '../../utils/icons';
import { FavoriteBorderIcon } from '../../utils/icons';
import { CheckCircleOutlineIcon } from '../../utils/icons';
import { ScienceIcon } from '../../utils/icons';
import { DataObjectIcon } from '../../utils/icons';
import { MenuBookIcon } from '../../utils/icons';
import { analytics } from '../../utils/icons';
import { CodeIcon } from '../../utils/icons';
import { toast } from 'react-toastify';

import api from '../../services/api';
import { experimentTypeOptions } from '../../utils/experimentTypes';
import ConfirmDialog from '../../components/common/ConfirmDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
      {...other}
    >
      {value === index && <div sx={{ p: 3 }}>{children}</div>}
    </div>
  );
}

const TemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { data: templateResponse, isLoading, error } = useQuery(
    ['template', id],
    async () => {
      const response = await api.getTemplateById(id || '');
      if (!response.success) {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || '获取模板详情失败';
        throw new Error(errorMessage);
      }
      return response;
    }
  );

  const template = templateResponse?.success ? templateResponse.data as any : null;

  React.useEffect(() => {
    // 从本地存储检查是否收藏
    const savedFavorites = localStorage.getItem('templateFavorites');
    if (savedFavorites && id) {
      setIsFavorite(JSON.parse(savedFavorites).includes(id));
    }
  }, [id]);

  const handleTabChange = (Event: React.SyntheticEvent, newValue: number) => {
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
        state: { templateId: template.id, template }
      });
    }
  };

  const toggleFavorite = () => {
    if (!id) return;
    
    const savedFavorites = localStorage.getItem('templateFavorites');
    let favorites: string[] = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    if (isFavorite) {
      favorites = favorites.filter(favId => favId !== id);
      toast.success('已从收藏中移除');
    } else {
      favorites.push(id);
      toast.success('已添加到收藏');
    }
    
    localStorage.setItem('templateFavorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const handleDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    // 模拟删除操作
    toast.success('模板已删除');
    navigate('/templates');
  };

  if (isLoading) {
    return (
      <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          返回模板列表
        </Button>
        <Typography color="error" variant="h6" sx={{ mt: 2 }}>
          加载模板失败，请稍后重试
        </Typography>
      </div>
    );
  }

  const getTypeLabel = (type: string) => {
    return experimentTypeOptions.find(opt => opt.value === type)?.label || type;
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'primary';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <div sx={{ p: 3 }}>
      <div sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          返回模板列表
        </Button>
      </div>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {template.name}
          </Typography>
          <div>
            <Tooltip title={isFavorite ? "取消收藏" : "收藏模板"}>
              <IconButton onClick={toggleFavorite} color={isFavorite ? "error" : "default"}>
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
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
          </div>
        </div>

        <div sx={{ display: 'flex', mb: 2 }}>
          <Chip 
            label={getTypeLabel(template.type)} 
            sx={{ mr: 1 }} 
          />
          <Chip 
            label={getDifficultyLabel(template.difficulty)} 
            color={getDifficultyColor(template.difficulty) as any}
          />
        </div>

        <Typography variant="body1" paragraph>
          {template.description}
        </Typography>

        <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {template.tags.map((tag: any) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </div>

        <Typography variant="body2" color="textSecondary">
          创建于 {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '未知'}
          {template.updatedAt && template.updatedAt !== template.createdAt && 
            ` · 更新于 ${new Date(template.updatedAt).toLocaleDateString()}`}
        </Typography>

        <div sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleUseTemplate}
          >
            使用此模板
          </Button>
        </div>
      </Paper>

      <div sx={{ width: '100%' }}>
        <div sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="template detail tabs">
            <Tab label="实验说明" icon={<MenuBookIcon />} iconPosition="start" />
            <Tab label="实验参数" icon={<DataObjectIcon />} iconPosition="start" />
            <Tab label="实验资源" icon={<ScienceIcon />} iconPosition="start" />
            <Tab label="预期结果" icon={<AnalyticsIcon />} iconPosition="start" />
          </Tabs>
        </div>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>实验步骤</Typography>
          <List>
            {(template as any).instructions?.map((instruction: any, index: number) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={instruction} />
              </ListItem>
            ))}
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>实验参数设置</Typography>
          <Grid container spacing={2}>
            {template.parameters && Object.entries(template.parameters).map(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                return null; // 复杂对象单独处理
              }
              return (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">
                        {key}
                      </Typography>
                      <Typography variant="body1">
                        {value?.toString() || '未设置'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          {template.parameters?.subjectSpecificParams && (
            <div sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>学科特定参数</Typography>
              <Grid container spacing={2}>
                {template.parameters?.subjectSpecificParams && Object.entries(template.parameters.subjectSpecificParams).map(([key, params]) => (
                  <Grid item xs={12} key={key}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {key}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                          {Object.entries(params as object).map(([paramKey, paramValue]) => (
                            <Grid item xs={12} sm={6} md={4} key={paramKey}>
                              <Typography variant="subtitle2" color="textSecondary">
                                {paramKey}
                              </Typography>
                              <Typography variant="body1">
                                {Array.isArray(paramValue) 
                                  ? paramValue.join(', ') 
                                  : paramValue?.toString() || '未设置'}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>实验资源</Typography>
          <Grid container spacing={2}>
            {template.data?.equipment && template.data.equipment.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      设备清单
                    </Typography>
                    <List dense>
                      {template.data?.equipment?.map((item: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ScienceIcon />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {template.data?.software && template.data.software.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      软件工具
                    </Typography>
                    <List dense>
                      {template.data?.software?.map((item: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CodeIcon />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {template.data?.materials && template.data.materials.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      耗材清单
                    </Typography>
                    <List dense>
                      {template.data?.materials?.map((item: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircleOutlineIcon />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>预期实验结果</Typography>
          <Card>
            <CardContent>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                backgroundColor: '#f5f5f5', 
                padding: '16px', 
                borderRadius: '4px' 
              }}>
                {JSON.stringify(template.expectedResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabPanel>
      </div>      <ConfirmDialog
        open={confirmDeleteOpen}
        title="删除模板"
        message="确定要删除这个模板吗？此操作不可恢复。"
        onConfirm={handleDeleteConfirm}
        onCancelIcon={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
};

export default TemplateDetail;


