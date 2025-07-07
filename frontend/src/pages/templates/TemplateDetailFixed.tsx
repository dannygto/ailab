import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Badge
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
import { HistoryIcon } from '../../utils/icons';
import { GetAppIcon } from '../../utils/icons';
import { UploadFileIcon } from '../../utils/icons';
import { AnalyticsIcon } from '../../utils/icons';
import { toast } from 'react-toastify';

import { templateService, enhancedTemplateService } from '../../services';
import { experimentTypeOptions } from '../../utils/experimentTypes';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ExperimentTemplate, TemplateVersion } from '../../types';

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

const TemplateDetailFixed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // ״̬����
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);
  
  // ����״̬
  const [sharePublic, setSharePublic] = useState(false);
  const [shareUsers, setShareUsers] = useState('');
  
  // ����״̬
  const [userRating, setUserRating] = useState<number | null>(0);
  const [userComment, setUserComment] = useState('');

  // ��ȡģ������
  const { data: template, isLoading, error } = useQuery<ExperimentTemplate>(
    ['template', id],
    async () => {
      if (!id) throw new Error('ģ��ID������');
      const response = await templateService.getTemplate(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || '��ȡģ������ʧ��');
      }
      return response.data;
    },
    { enabled: !!id }
  );

  // ��ȡģ��汾
  const { data: versions } = useQuery<TemplateVersion[]>(
    ['template-versions', id],
    async () => {
      if (!id) return [];
      const response = await enhancedTemplateService.getTemplateVersions(id);
      return response.success && response.data ? response.data : [];
    },
    { enabled: !!id }
  );

  // ��ȡģ�����
  const { data: analytics } = useQuery(
    ['template-analytics', id],
    async () => {
      if (!id) return null;
      const response = await enhancedTemplateService.getTemplateAnalytics(id);
      return response.success && response.data ? response.data : null;
    },
    { enabled: !!id }
  );

  // ��ȡ����ģ��
  const { data: similarTemplates } = useQuery<ExperimentTemplate[]>(
    ['similar-templates', id],
    async () => {
      if (!id) return [];
      const response = await enhancedTemplateService.getSimilarTemplates(id);
      return response.success && response.data ? response.data : [];
    },
    { enabled: !!id }
  );

  // ɾ��ģ��mutation
  const deleteMutation = useMutation(
    async (templateId: string) => {
      const response = await templateService.deleteTemplate(templateId);
      if (!response.success) {
        throw new Error(response.message || 'ɾ��ģ��ʧ��');
      }
      return response;
    },
    {
      onSuccess: () => {
        toast.success('ģ����ɾ��');
        navigate('/templates');
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );

  // ����ģ��mutation
  const shareMutation = useMutation(
    async (data: { templateId: string; isPublic: boolean; specificUsers?: string[] }) => {
      const response = await enhancedTemplateService.shareTemplate(data.templateId, {
        isPublic: data.isPublic,
        specificUsers: data.specificUsers,
        permissions: {
          canView: true,
          canEdit: false,
          canUse: true,
          canShare: false
        }
      });
      if (!response.success) {
        throw new Error(response.message || '����ģ��ʧ��');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('ģ����������Ѹ���');
        setShareDialogOpen(false);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );

  // ����ģ��mutation
  const rateMutation = useMutation(
    async (data: { templateId: string; rating: number; comment?: string }) => {
      const response = await enhancedTemplateService.rateTemplate(data.templateId, data.rating, data.comment);
      if (!response.success) {
        throw new Error(response.message || '����ʧ��');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('��л�������֣�');
        setRatingDialogOpen(false);
        queryClient.invalidateQueries(['template', id]);
        queryClient.invalidateQueries(['template-analytics', id]);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );

  // ��ʼ���ղ�״̬
  useEffect(() => {
    if (id) {
      const savedFavorites = localStorage.getItem('templateFavorites');
      if (savedFavorites) {
        try {
          const favorites: string[] = JSON.parse(savedFavorites);
          setIsFavorite(favorites.includes(id));
        } catch (error) {
          console.error('�����ղ��б�ʧ��:', error);
        }
      }
    }
  }, [id]);

  // �¼���������
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
      toast.success('�Ѵ��ղ����Ƴ�');
    } else {
      favorites.push(id);
      toast.success('�����ӵ��ղ�');
    }
    
    localStorage.setItem('templateFavorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const handleDeleteConfirm = () => {
    if (id) {
      deleteMutation.mutate(id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleShare = () => {
    if (!id) return;
    
    const userIds = shareUsers.split(',').map(u => u.trim()).filter(u => u);
    
    shareMutation.mutate({
      templateId: id,
      isPublic: sharePublic,
      specificUsers: userIds.length > 0 ? userIds : undefined
    });
  };

  const handleRate = () => {
    if (!id || userRating === null) return;
    
    rateMutation.mutate({
      templateId: id,
      rating: userRating,
      comment: userComment || undefined
    });
  };

  const handleExport = async (format: 'json' | 'pdf' | 'docx') => {
    if (!id) return;
    
    try {
      const response = await enhancedTemplateService.exportTemplate(id, format);
      if (response.success && response.data) {
        // �����ļ�
        window.open(response.data.url, '_blank');
        toast.success('ģ�嵼���ɹ�');
      } else {
        toast.error(response.message || '����ʧ��');
      }
    } catch (error) {
      toast.error('����ģ��ʱ����');
    }
    setExportDialogOpen(false);
  };

  const handleVersionrestore = async (version: TemplateVersion) => {
    if (!id) return;
    
    try {
      const response = await enhancedTemplateService.restoreTemplateVersion(id, version.id);
      if (response.success) {
        toast.success(`�ѻָ����汾 ${version.version}`);
        queryClient.invalidateQueries(['template', id]);
        setVersionDialogOpen(false);
      } else {
        toast.error(response.message || '�ָ��汾ʧ��');
      }
    } catch (error) {
      toast.error('�ָ��汾ʱ����');
    }
  };

  // ���ߺ���
  const getTypeLabel = (type: string) => {
    return experimentTypeOptions.find(opt => opt.value === type)?.label || type;
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '����';
      case 'intermediate': return '�м�';
      case 'advanced': return '�߼�';
      case 'expert': return 'ר��';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string): 'success' | 'primary' | 'warning' | 'error' | 'default' => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'primary';
      case 'advanced': return 'warning';
      case 'expert': return 'error';
      default: return 'default';
    }
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
          ����ģ���б�
        </Button>
        <Typography color="error" variant="h6" sx={{ mt: 2 }}>
          ����ģ��ʧ�ܣ����Ժ�����
        </Typography>
      </div>
    );
  }

  return (
    <div sx={{ p: 3 }}>
      <div sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          ����ģ���б�
        </Button>
      </div>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {template.name}
            </Typography>
            
            {/* ������ʾ */}
            {analytics && (
              <div sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={analytics.averageRating} readOnly precision={0.1} />
                <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  ({analytics.ratingsCount} ������)
                </Typography>
              </div>
            )}
          </div>
          
          <div>
            <Tooltip title={isFavorite ? "ȡ���ղ�" : "�ղ�ģ��"}>
              <IconButton onClick={toggleFavorite} color={isFavorite ? "error" : "default"}>
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="�༭ģ��">
              <IconButton onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="����ģ��">
              <IconButton onClick={() => setShareDialogOpen(true)}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="�汾��ʷ">
              <IconButton onClick={() => setVersionDialogOpen(true)}>
                <Badge badgeContent={versions?.length || 0} color="primary">
                  <HistoryIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="����ģ��">
              <IconButton onClick={() => setExportDialogOpen(true)}>
                <GetAppIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="ɾ��ģ��">
              <IconButton onClick={() => setConfirmDeleteOpen(true)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div sx={{ display: 'flex', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label={getTypeLabel(template.type)} 
            variant="outlined"
          />
          <Chip 
            label={getDifficultyLabel(template.difficulty)} 
            color={getDifficultyColor(template.difficulty)}
          />
          <Chip 
            label={`${template.grade}`}
            variant="outlined"
          />
          <Chip 
            label={`${template.duration}����`}
            variant="outlined"
          />
          {analytics && (
            <Chip 
              label={`��ʹ�� ${analytics.usageCount} ��`}
              variant="outlined"
              color="primary"
            />
          )}
        </div>

        <Typography variant="body1" paragraph>
          {template.description}
        </Typography>

        <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {template.tags?.map((tag: string) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </div>

        <Typography variant="body2" color="textSecondary">
          ������ {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'δ֪'}
          {template.updatedAt && template.updatedAt !== template.createdAt && 
            ` �� ������ ${new Date(template.updatedAt).toLocaleDateString()}`}
          {template.authorName && ` �� ����: ${template.authorName}`}
        </Typography>

        <div sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleUseTemplate}
          >
            ʹ�ô�ģ��
          </Button>
          <Button 
            variant="outlined"
            onClick={() => setRatingDialogOpen(true)}
          >
            ����
          </Button>
        </div>
      </Paper>

      <div sx={{ width: '100%' }}>
        <div sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="template detail tabs">
            <Tab label="ʵ��˵��" icon={<MenuBookIcon />} iconPosition="start" />
            <Tab label="ʵ�����" icon={<DataObjectIcon />} iconPosition="start" />
            <Tab label="ʵ����Դ" icon={<ScienceIcon />} iconPosition="start" />
            <Tab label="Ԥ�ڽ��" icon={<AnalyticsIcon />} iconPosition="start" />
            <Tab label="���ݷ���" icon={<AnalyticsIcon />} iconPosition="start" />
          </Tabs>
        </div>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>ʵ�鲽��</Typography>
          <List>
            {template.steps?.map((step, index) => (
              <ListItem key={step.id || index}>
                <ListItemIcon>
                  <CheckCircleOutlineIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={step.title} 
                  secondary={step.description}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>ʵ���������</Typography>
          <Grid container spacing={2}>
            {template.objectives && template.objectives.map((objective, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="textSecondary">
                      Ŀ�� {index + 1}
                    </Typography>
                    <Typography variant="body1">
                      {objective}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {(!template.objectives || template.objectives.length === 0) && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  ����ʵ��Ŀ����Ϣ
                </Typography>
              </Grid>
            )}
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>ʵ�����</Typography>
          <Grid container spacing={2}>
            {template.materials?.map((material, index) => (
              <Grid item xs={12} sm={6} md={4} key={material.id || index}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {material.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ����: {material.quantity}
                    </Typography>
                    <Typography variant="body2">
                      {material.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>Ԥ�ڽ��</Typography>
          <Typography variant="body1">
            {template.expectedResults || '����Ԥ�ڽ������'}
          </Typography>
          
          {template.objectives && template.objectives.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                ѧϰĿ��
              </Typography>
              <List>
                {template.objectives.map((objective, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={objective} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>���ݷ���</Typography>
          {analytics ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">ʹ��ͳ��</Typography>
                    <Typography>ʹ�ô���: {analytics.usageCount}</Typography>
                    <Typography>�ղش���: {analytics.favoriteCount}</Typography>
                    <Typography>�ɹ���: {(analytics.successRate * 100).toFixed(1)}%</Typography>
                    <Typography>ƽ�����ʱ��: {analytics.averageCompletionTime}����</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">���ģ��</Typography>
                    {similarTemplates && similarTemplates.map((similar) => (
                      <div 
                        key={similar.id} 
                        sx={{ 
                          p: 1, 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => navigate(`/templates/${similar.id}`)}
                      >
                        <Typography variant="body2">{similar.name}</Typography>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Typography>���޷�������</Typography>
          )}
        </TabPanel>
      </div>

      {/* �����Ի��� */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>����ģ��</DialogTitle>
        <DialogContent>
          <div sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={sharePublic}
                  onChange={(e) => setSharePublic(e.target.checked)}
                />
              }
              label="��������"
            />
            <TextField
              fullWidth
              margin="normal"
              label="�������ض��û� (�ö��ŷָ��û�ID)"
              value={shareUsers}
              onChange={(e) => setShareUsers(e.target.value)}
              disabled={sharePublic}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>ȡ��</Button>
          <Button onClick={handleShare} variant="contained" disabled={shareMutation.isLoading}>
            {shareMutation.isLoading ? '������...' : 'ȷ�Ϸ���'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ���ֶԻ��� */}
      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ϊģ������</DialogTitle>
        <DialogContent>
          <div sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div>
              <Typography component="legend">��������</Typography>
              <Rating
                value={userRating}
                onChange={(Event, newValue) => {
                  setUserRating(newValue);
                }}
                size="large"
              />
            </div>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="���� (��ѡ)"
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>ȡ��</Button>
          <Button 
            onClick={handleRate} 
            variant="contained" 
            disabled={rateMutation.isLoading || userRating === 0}
          >
            {rateMutation.isLoading ? '�ύ��...' : '�ύ����'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* �����Ի��� */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>����ģ��</DialogTitle>
        <DialogContent>
          <Typography>ѡ�񵼳���ʽ:</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleExport('json')}>JSON</Button>
          <Button onClick={() => handleExport('pdf')}>PDF</Button>
          <Button onClick={() => handleExport('docx')}>Word</Button>
        </DialogActions>
      </Dialog>

      {/* �汾��ʷ�Ի��� */}
      <Dialog open={versionDialogOpen} onClose={() => setVersionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>�汾��ʷ</DialogTitle>
        <DialogContent>
          <List>
            {versions?.map((version) => (
              <ListItem key={version.id}>
                <ListItemText
                  primary={`�汾 ${version.version}`}
                  secondary={`${version.createdByName} �� ${new Date(version.createdAt).toLocaleString()} �� ${version.changeLog}`}
                />
                <Button
                  size="small"
                  onClick={() => handleVersionrestore(version)}
                  disabled={version.isCurrentVersion}
                >
                  {version.isCurrentVersion ? '��ǰ�汾' : '�ָ�'}
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionDialogOpen(false)}>�ر�</Button>
        </DialogActions>
      </Dialog>

      {/* ɾ��ȷ�϶Ի��� */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onCancelIcon={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="ɾ��ģ��"
        message="ȷ��Ҫɾ�����ģ���𣿴˲����޷�������"
      />
    </div>
  );
};

export default TemplateDetailFixed;

