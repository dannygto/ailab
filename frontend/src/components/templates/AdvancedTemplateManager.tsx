import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Toolbar,
  Paper,
  Tooltip,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { AddIcon as AddIcon, SearchIcon as SearchIcon, FilterListIcon as FilterIcon, DeleteIcon as DeleteIcon, share as share, DownloadIcon as DownloadIcon, visibility as ViewIcon, EditIcon as EditIcon } from '../../utils/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { enhancedTemplateService } from '../../services';
import { ExperimentTemplate } from '../../types';
import { experimentTypeOptions } from '../../utils/experimentTypes';

interface AdvancedTemplateManagerProps {
  onTemplateSelect?: (template: ExperimentTemplate) => void;
  selectionMode?: boolean;
}

const AdvancedTemplateManager: React.FC<AdvancedTemplateManagerProps> = ({
  onTemplateSelect,
  selectionMode = false
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // �����͹���״̬
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | ''>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  
  // ��������״̬
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<'delete' | 'share' | 'CategoryIcon' | 'tags'>('delete');
  
  // ����/����״̬
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // �߼����˶Ի���״̬
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // ��ȡģ���б�
  const {
    data: templatesResponse,
    isLoading: templatesLoading,
    refetch: refetchTemplates
  } = useQuery(
    ['templates-advanced', {
      search: searchQuery,
      type: selectedType,
      difficulty: selectedDifficulty,
      grade: selectedGrade,
      categories: selectedCategories,
      tags: selectedTags,
      minRating,
      dateRange
    }],
    async () => {
      const params = {
        query: searchQuery,
        type: selectedType || undefined,
        difficulty: selectedDifficulty || undefined,
        grade: selectedGrade || undefined,
        categories: selectedCategories,
        tags: selectedTags,
        authorIds: [],
        minRating: minRating || undefined,
        createdAfter: dateRange.start || undefined,
        createdBefore: dateRange.end || undefined,
        limit: 50,
        sortBy: 'popularity' as const,
        sortOrder: 'desc' as const
      };
      
      const response = await enhancedTemplateService.advancedSearch(params);
      return response.success && response.data ? response.data : { items: [], total: 0 };
    }
  );

  // ��ȡ�����б�
  const { data: categories = [] } = useQuery(
    'template-categories',
    async () => {
      const response = await enhancedTemplateService.getTemplateCategories();
      return response.success && response.data ? response.data : [];
    }
  );

  // ��ȡ���ű�ǩ
  const { data: popularTags = [] } = useQuery(
    'popular-tags',
    async () => {
      const response = await enhancedTemplateService.getPopularTags(50);
      return response.success && response.data ? response.data : [];
    }
  );

  // ����ɾ��mutation
  const bulkDeleteMutation = useMutation(
    async (templateIds: string[]) => {
      const response = await enhancedTemplateService.bulkDeleteTemplates(templateIds);
      if (!response.success) {
        throw new Error(response.message || '����ɾ��ʧ��');
      }
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(`�ɹ�ɾ�� ${data?.deleted} ��ģ��`);
        if (data?.failed && data.failed.length > 0) {
          toast.warning(`${data.failed.length} ��ģ��ɾ��ʧ��`);
        }
        setSelectedTemplates([]);
        setBulkActionOpen(false);
        refetchTemplates();
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );

  // ��������mutation
  const bulkUpdateMutation = useMutation(
    async (data: { templateIds: string[]; updates: any }) => {
      const response = await enhancedTemplateService.bulkUpdateTemplates(data.templateIds, data.updates);
      if (!response.success) {
        throw new Error(response.message || '��������ʧ��');
      }
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(`�ɹ����� ${data?.updated} ��ģ��`);
        if (data?.failed && data.failed.length > 0) {
          toast.warning(`${data.failed.length} ��ģ�����ʧ��`);
        }
        setSelectedTemplates([]);
        setBulkActionOpen(false);
        refetchTemplates();
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );

  // ����ģ��mutation
  const importMutation = useMutation(
    async (file: File) => {
      const response = await enhancedTemplateService.importTemplate(file);
      if (!response.success) {
        throw new Error(response.message || '����ģ��ʧ��');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('ģ�嵼��ɹ�');
        setImportDialogOpen(false);
        refetchTemplates();
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );

  // �¼���������
  const handleSearch = () => {
    refetchTemplates();
  };

  const handleTemplateSelect = (templateId: string) => {
    if (selectionMode) {
      const template = templatesResponse?.items.find(t => t.id === templateId);
      if (template && onTemplateSelect) {
        onTemplateSelect(template);
      }
    } else {
      navigate(`/templates/${templateId}`);
    }
  };

  const handleBulkSelect = (templateId: string, checked: boolean) => {
    if (checked) {
      setSelectedTemplates(prev => [...prev, templateId]);
    } else {
      setSelectedTemplates(prev => prev.filter(id => id !== templateId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTemplates(templatesResponse?.items.map(t => t.id) || []);
    } else {
      setSelectedTemplates([]);
    }
  };

  const handleBulkAction = () => {
    if (selectedTemplates.length === 0) {
      toast.warning('����ѡ��ģ��');
      return;
    }

    switch (bulkAction) {
      case 'delete':
        bulkDeleteMutation.mutate(selectedTemplates);
        break;
      default:
        toast.info('���ܿ�����');
        break;
    }
  };

  const handleFileImport = (Event: React.ChangeEvent<HTMLInputElement>) => {
    const file = Event.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedDifficulty('');
    setSelectedGrade('');
    setSelectedCategories([]);
    setSelectedTags([]);
    setMinRating('');
    setDateRange({ start: '', end: '' });
  };

  const templates = templatesResponse?.items || [];
  const isAllSelected = templates.length > 0 && selectedTemplates.length === templates.length;
  const isIndeterminate = selectedTemplates.length > 0 && selectedTemplates.length < templates.length;

  return (
    <div sx={{ p: 3 }}>
      <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">�߼�ģ�����</Typography>
        <div sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            ����ģ��
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => setExportDialogOpen(true)}
          >
            ����ģ��
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/templates/create')}
          >
            ����ģ��
          </Button>
        </div>
      </div>

      {/* �����͹��˹����� */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="����ģ��..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>����</InputLabel>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label="����"
              >
                <MenuItem value="">ȫ��</MenuItem>
                {experimentTypeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>�Ѷ�</InputLabel>
              <Select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                label="�Ѷ�"
              >
                <MenuItem value="">ȫ��</MenuItem>
                <MenuItem value="beginner">����</MenuItem>
                <MenuItem value="intermediate">�м�</MenuItem>
                <MenuItem value="advanced">�߼�</MenuItem>
                <MenuItem value="expert">ר��</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterDialogOpen(true)}
              fullWidth
            >
              �߼�����
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button onClick={resetFilters} fullWidth>
              ���ù���
            </Button>
          </Grid>
        </Grid>

        {/* ��ѡ��������ʾ */}
        <div sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedCategories.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            return category ? (
              <Chip
                key={categoryId}
                label={`����: ${category.name}`}
                onDelete={() => setSelectedCategories(prev => prev.filter(id => id !== categoryId))}
                size="small"
              />
            ) : null;
          })}
          {selectedTags.map(tag => (
            <Chip
              key={tag}
              label={`��ǩ: ${tag}`}
              onDelete={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
              size="small"
            />
          ))}
          {minRating && (
            <Chip
              label={`����: ��${minRating}`}
              onDelete={() => setMinRating('')}
              size="small"
            />
          )}
        </div>
      </Paper>

      {/* �������������� */}
      {selectedTemplates.length > 0 && (
        <Toolbar sx={{ bgcolor: 'action.selected', borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            ��ѡ�� {selectedTemplates.length} ��ģ��
          </Typography>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setBulkAction('delete');
              setBulkActionOpen(true);
            }}
          >
            ����ɾ��
          </Button>
          <Button
            startIcon={<ShareIcon />}
            onClick={() => {
              setBulkAction('share');
              setBulkActionOpen(true);
            }}
          >
            ��������
          </Button>
        </Toolbar>
      )}

      {/* ģ���б� */}
      {templatesLoading ? (
        <div sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {/* ȫѡ��ѡ�� */}
          <div sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              }
              label={`ȫѡ (${templates.length} ��ģ��)`}
            />
          </div>

          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <div sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Checkbox
                        checked={selectedTemplates.includes(template.id)}
                        onChange={(e) => handleBulkSelect(template.id, e.target.checked)}
                        size="small"
                      />
                      <div sx={{ flex: 1, ml: 1 }}>
                        <Typography variant="h6" noWrap>
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          {template.description}
                        </Typography>
                        
                        <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                          <Chip 
                            label={template.type} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Chip 
                            label={template.difficulty} 
                            size="small" 
                            color="secondary"
                            variant="outlined"
                          />
                        </div>
                        
                        <Typography variant="caption" color="textSecondary">
                          ������ {new Date(template.createdAt || '').toLocaleDateString()}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                  
                  <div sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
                    <Tooltip title="�鿴����">
                      <IconButton 
                        size="small" 
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="�༭">
                      <IconButton 
                        size="small" 
                        onClick={() => navigate(`/templates/edit/${template.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                </Card>
              </Grid>
            ))}
          </Grid>

          {templates.length === 0 && (
            <div sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                û���ҵ�����������ģ��
              </Typography>
            </div>
          )}
        </>
      )}

      {/* �߼����˶Ի��� */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>�߼�����ѡ��</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={categories}
                getOptionLabel={(option) => option.name}
                value={categories.filter(c => selectedCategories.includes(c.id))}
                onChange={(Event, newValue) => {
                  setSelectedCategories(newValue.map(v => v.id));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="����" placeholder="ѡ�����" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                freeSolo
                options={popularTags.map(tag => tag.name)}
                value={selectedTags}
                onChange={(Event, newValue) => {
                  setSelectedTags(newValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="��ǩ" placeholder="ѡ��������ǩ" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="�������"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : '')}
                inputProps={{ min: 0, max: 5, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="�������ڴ�"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="�������ڵ�"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>ȡ��</Button>
          <Button onClick={() => {
            setFilterDialogOpen(false);
            handleSearch();
          }} variant="contained">
            Ӧ�ù���
          </Button>
        </DialogActions>
      </Dialog>

      {/* ��������ȷ�϶Ի��� */}
      <Dialog open={bulkActionOpen} onClose={() => setBulkActionOpen(false)}>
        <DialogTitle>
          {bulkAction === 'delete' ? '����ɾ��' : '��������'}ȷ��
        </DialogTitle>
        <DialogContent>
          <Typography>
            ȷ��Ҫ��ѡ�е� {selectedTemplates.length} ��ģ��ִ��
            {bulkAction === 'delete' ? 'ɾ��' : '����'}��
          </Typography>
          {bulkAction === 'delete' && (
            <Typography color="error" sx={{ mt: 1 }}>
              �˲����޷�������
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionOpen(false)}>ȡ��</Button>
          <Button 
            onClick={handleBulkAction} 
            color={bulkAction === 'delete' ? 'error' : 'primary'}
            variant="contained"
            disabled={bulkDeleteMutation.isLoading || bulkUpdateMutation.isLoading}
          >
            ȷ��
          </Button>
        </DialogActions>
      </Dialog>

      {/* ����Ի��� */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>����ģ��</DialogTitle>
        <DialogContent>
          <input
            accept=".json,.zip"
            style={{ display: 'none' }}
            id="template-import-file"
            type="file"
            onChange={handleFileImport}
          />
          <label htmlFor="template-import-file">
            <Button variant="outlined" component="span" fullWidth sx={{ mt: 2 }}>
              ѡ��ģ���ļ� (JSON/ZIP)
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>ȡ��</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdvancedTemplateManager;

