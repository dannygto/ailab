import React, { useState, useEffect } from 'react';
import { ArrowBackIcon, FavoriteIcon, FavoriteBorderIcon, EditIcon, ShareIcon, DeleteIcon, CheckCircleIcon, GetAppIcon, HistoryIcon, StarIcon } from '../../utils/icons';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Rating,
  Badge
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

const TemplateDetailFixed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [isPublicShare, setIsPublicShare] = useState(false);
  const [shareUsers, setShareUsers] = useState('');
  const [userRating, setUserRating] = useState<number | null>(0);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setTimeout(() => {
          setTemplate({
            id,
            name: '高级生物实验模板',
            description: '用于高级生物学科的综合实验模板',
            type: 'biology',
            difficulty: 'advanced',
            rating: 4.5,
            usageCount: 156,
            author: '张教授',
            isPublic: true,
            steps: [
              '准备实验材料和设备',
              '配置实验环境参数',
              '执行预备实验步骤',
              '进行主要实验操作',
              '记录实验数据',
              '分析实验结果',
              '撰写实验报告'
            ],
            parameters: [
              { name: '温度', value: '25±2°C', description: '实验环境控制温度' },
              { name: '湿度', value: '60±5%', description: '实验环境相对湿度' },
              { name: '光照强度', value: '2000 lux', description: '实验光照条件' }
            ],
            resources: {
              equipment: ['高级显微镜', '培养箱', '离心机', '电子天平'],
              materials: ['培养基', '试剂盒A', '试剂盒B', '载玻片'],
              software: ['数据分析软件', '图像处理工具']
            },
            expectedResults: '观察到完整的细胞分裂周期，记录各阶段详细数据，获得高质量的显微图像'
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
        try {
          const favorites: string[] = JSON.parse(savedFavorites);
          setIsFavorite(favorites.includes(id));
        } catch (error) {
          console.error('解析收藏列表失败:', error);
        }
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
    if (id) {
      console.log('Deleting template:', id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleShare = () => {
    if (!id) return;
    
    const userIds = shareUsers.split(',').map(u => u.trim()).filter(u => u);
    
    console.log('Sharing template:', {
      templateId: id,
      isPublic: isPublicShare,
      specificUsers: userIds.length > 0 ? userIds : undefined
    });
  };

  const handleRate = () => {
    if (!id || userRating === null) return;
    
    console.log('Rating template:', {
      templateId: id,
      rating: userRating,
      comment: ratingComment
    });
  };

  const handleExport = async (format: 'json' | 'pdf' | 'docx') => {
    if (!id) return;
    
    try {
      console.log(`Exporting template ${id} as ${format}`);
      // 模拟导出操作
    } catch (error) {
      console.error('导出模板时出错');
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string): 'success' | 'primary' | 'warning' | 'error' | 'default' => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'primary';
      case 'advanced': return 'warning';
      default: return 'default';
    }
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
            {template.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <StarIcon color="warning" fontSize="small" />
                <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  {template.rating} ({template.usageCount} 次使用)
                </Typography>
              </Box>
            )}
            
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
              <IconButton onClick={() => setShareDialogOpen(true)}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="评分">
              <Badge badgeContent={template.rating} color="warning">
                <IconButton onClick={() => setRatingDialogOpen(true)}>
                  <StarIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            <Tooltip title="导出模板">
              <IconButton onClick={() => setExportDialogOpen(true)}>
                <GetAppIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="删除模板">
              <IconButton onClick={() => setConfirmDeleteOpen(true)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label={template.type} 
            color="primary" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={getDifficultyLabel(template.difficulty)}
            color={getDifficultyColor(template.difficulty)}
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={template.author} 
            variant="outlined" 
            size="small" 
          />
          {template.isPublic && (
            <Chip 
              label="公开" 
              color="success"
              variant="filled" 
              size="small" 
            />
          )}
        </Box>

        <Typography variant="body1" paragraph>
          {template.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setVersionDialogOpen(true)}
              size="small"
            >
              版本历史
            </Button>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUseTemplate}
            size="large"
          >
            使用
          </Button>
        </Box>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="template detail tabs">
            <Tab label="实验步骤" />
            <Tab label="实验参数设置" />
            <Tab label="实验资源" />
            <Tab label="预期结果" />
            <Tab label="数据分析" />
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
                <ListItemText 
                  primary={`步骤 ${index + 1}`}
                  secondary={step}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>实验参数设置</Typography>
          <Grid container spacing={2}>
            {template.parameters.map((param: any, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {param.value}
                    </Typography>
                    <Typography variant="subtitle1">
                      {param.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {param.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>实验资源</Typography>
          <Grid container spacing={3}>
            {Object.entries(template.resources).map(([category, items]: [string, any]) => (
              <Grid item xs={12} md={4} key={category}>
                <Typography variant="subtitle1" gutterBottom>
                  {category === 'equipment' ? '设备' : category === 'materials' ? '材料' : '软件'}
                </Typography>
                <List dense>
                  {items.map((item: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>预期结果</Typography>
          <Typography variant="body1" paragraph>
            {template.expectedResults || '暂无预期结果描述'}
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>数据分析</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">使用统计</Typography>
                  <Typography variant="h4" color="primary">
                    {template.usageCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    总使用次数
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">相似模板</Typography>
                  <Typography variant="body2">基于此模板的其他推荐</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>

      {/* 对话框组件 */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>分享模板</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublicShare}
                  onChange={(e) => setIsPublicShare(e.target.checked)}
                />
              }
              label="公开分享"
            />
            <TextField
              fullWidth
              label="指定用户 (逗号分隔)"
              value={shareUsers}
              onChange={(e) => setShareUsers(e.target.value)}
              sx={{ mt: 2 }}
              disabled={isPublicShare}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>取消</Button>
          <Button onClick={handleShare} variant="contained">
            确认分享
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>为模板评分</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography component="legend">请打分</Typography>
            <Rating
              value={userRating}
              onChange={(event, newValue) => setUserRating(newValue)}
              size="large"
            />
            <TextField
              fullWidth
              label="评价 (可选)"
              multiline
              rows={3}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>取消</Button>
          <Button onClick={handleRate} variant="contained">
            提交评价
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>导出模板</DialogTitle>
        <DialogContent>
          <Typography>选择导出格式:</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleExport('json')}>JSON</Button>
          <Button onClick={() => handleExport('pdf')}>PDF</Button>
          <Button onClick={() => handleExport('docx')}>Word</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={versionDialogOpen} onClose={() => setVersionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>版本历史</DialogTitle>
        <DialogContent>
          <Typography>版本历史记录将在此显示</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateDetailFixed;
