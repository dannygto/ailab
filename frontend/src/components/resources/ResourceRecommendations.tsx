import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid,
  Chip,
  Button,
  Rating,
  Skeleton,
  Divider,
  CircularProgress,
  Pagination,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { SearchIcon as SearchIcon, BookmarkIcon as BookmarkIcon, BookmarkBorderIcon as BookmarkBorderIcon, FilterListIcon as FilterIcon, sort as sortIcon } from '../../utils/icons';
import { resourceService } from '../../services';
import { Resource, ResourceFilters } from '../../services/resourceService';

export interface ResourceRecommendationsProps {
  experimentId?: string;
  experimentType?: string;
  subject?: string;
  limit?: number;
  onResourceSelect?: (resource: Resource) => void;
  showFilters?: boolean;
}

const ResourceRecommendations: React.FC<ResourceRecommendationsProps> = ({
  experimentId,
  experimentType,
  subject,
  limit = 12,
  onResourceSelect,
  showFilters = true
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<ResourceFilters>({
    sort: 'popularity',
    sortDirection: 'desc'
  });
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [savedResources, setSavedResources] = useState<string[]>([]);
  
  // ������Դ�Ƽ�
  useEffect(() => {
    loadResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentId, experimentType, subject, page, filters]);
  
  const loadResources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // �����������
      const params: any = {
        page,
        limit,
        ...filters
      };
      
      // ������������ز���
      if (experimentId) {
        params.experimentId = experimentId;
      }
      
      if (experimentType) {
        params.experimentType = experimentType;
      }
      
      if (subject) {
        params.subject = subject;
      }
      
      // ������Դ�����ȡ�Ƽ���Դ
      const response = await resourceService.getRecommendedResources(params);
      
      if (response.success && response.data) {
        setResources(response.data.resources || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError('�޷������Ƽ���Դ');
      }
    } catch (err) {
      console.error('������Դ�Ƽ�����:', err);
      setError('�����Ƽ���Դʱ��������');
    } finally {
      setLoading(false);
    }
  };
  
  // ������Դ����/�ղ�
  const handleToggleSave = (resourceId: string) => {
    const isSaved = savedResources.includes(resourceId);
    
    if (isSaved) {
      setSavedResources(savedResources.filter(id => id !== resourceId));
    } else {
      setSavedResources([...savedResources, resourceId]);
    }
    
    // ʵ��Ӧ��������Ӧ�õ���api���浽�û��ղ�
  };
  
  // ������Դѡ��
  const handleResourceSelect = (resource: Resource) => {
    if (onResourceSelect) {
      onResourceSelect(resource);
    }
  };
  
  // ��������
  const handleSearch = (Event: React.FormEvent<HTMLFormElement>) => {
    Event.preventDefault();
    setPage(1); // ���õ���һҳ
    loadResources();
  };
  
  // �������������
  const handleFilterChange = (name: string, value: any) => {
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(1); // ���õ���һҳ
  };
  
  // ������й�����
  const handleClearFilters = () => {
    setFilters({
      sort: 'popularity',
      sortDirection: 'desc'
    });
    setPage(1);
  };
  
  // ������ҳ���
  const handlePageChange = (Event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // ��ȡ��Դ����ͼ�����ɫ
  const getResourceTypeInfo = (type: string) => {
    switch (type) {
      case 'document':
        return { color: 'primary', label: '�ĵ�' };
      case 'video':
        return { color: 'secondary', label: '��Ƶ' };
      case 'simulation':
        return { color: 'success', label: 'ģ��' };
      case 'dataset':
        return { color: 'info', label: '���ݼ�' };
      case 'template':
        return { color: 'warning', label: 'ģ��' };
      case 'external':
        return { color: 'default', label: '�ⲿ��Դ' };
      default:
        return { color: 'default', label: '����' };
    }
  };
  
  // ��ȡ�Ѷȱ�ǩ��ɫ
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'info';
      case 'advanced': return 'warning';
      case 'expert': return 'error';
      default: return 'default';
    }
  };
  
  // ��Ⱦ���������
  const renderFilterPanel = () => (
    <div sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
      <form onSubmit={handleSearch}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="������Դ"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search ? (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleFilterChange('search', '')}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>��Դ����</InputLabel>
              <Select
                value={filters.type || ''}
                label="��Դ����"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">ȫ������</MenuItem>
                <MenuItem value="document">�ĵ�</MenuItem>
                <MenuItem value="video">��Ƶ</MenuItem>
                <MenuItem value="simulation">ģ��</MenuItem>
                <MenuItem value="dataset">���ݼ�</MenuItem>
                <MenuItem value="template">ģ��</MenuItem>
                <MenuItem value="external">�ⲿ��Դ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>ѧ��</InputLabel>
              <Select
                value={filters.subject || ''}
                label="ѧ��"
                onChange={(e) => handleFilterChange('subject', e.target.value)}
              >
                <MenuItem value="">ȫ��ѧ��</MenuItem>
                <MenuItem value="physics">����</MenuItem>
                <MenuItem value="chemistry">��ѧ</MenuItem>
                <MenuItem value="biology">����</MenuItem>
                <MenuItem value="math">��ѧ</MenuItem>
                <MenuItem value="computer_ScienceIcon">�������ѧ</MenuItem>
                <MenuItem value="robotics">������</MenuItem>
                <MenuItem value="environment">������ѧ</MenuItem>
                <MenuItem value="astronomy">����ѧ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>�Ѷ�</InputLabel>
              <Select
                value={filters.difficulty || ''}
                label="�Ѷ�"
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <MenuItem value="">ȫ���Ѷ�</MenuItem>
                <MenuItem value="beginner">���ż�</MenuItem>
                <MenuItem value="intermediate">�м�</MenuItem>
                <MenuItem value="advanced">�߼�</MenuItem>
                <MenuItem value="expert">ר�Ҽ�</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>ѧ��</InputLabel>
              <Select
                value={filters.grade || ''}
                label="ѧ��"
                onChange={(e) => handleFilterChange('grade', e.target.value)}
              >
                <MenuItem value="">ȫ��ѧ��</MenuItem>
                <MenuItem value="elementary">Сѧ</MenuItem>
                <MenuItem value="middle">����</MenuItem>
                <MenuItem value="high">����</MenuItem>
                <MenuItem value="university">��ѧ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>����ʽ</InputLabel>
              <Select
                value={filters.sort || 'popularity'}
                label="����ʽ"
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <MenuItem value="popularity">���ų̶�</MenuItem>
                <MenuItem value="rating">����</MenuItem>
                <MenuItem value="createdAt">����ʱ��</MenuItem>
                <MenuItem value="title">����</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>����˳��</InputLabel>
              <Select
                value={filters.sortDirection || 'desc'}
                label="����˳��"
                onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
              >
                <MenuItem value="desc">����</MenuItem>
                <MenuItem value="asc">����</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={6}>
            <div sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
              <Button 
                variant="contained" 
                type="submit"
                startIcon={<SearchIcon />}
              >
                ����
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                ���ɸѡ
              </Button>
            </div>
          </Grid>
        </Grid>
      </form>
    </div>
  );
  
  // ��Ⱦ��Դ��Ƭ
  const renderResourceCard = (resource: Resource) => {
    const typeInfo = getResourceTypeInfo(resource.type);
    const isSaved = savedResources.includes(resource.id);
    
    return (
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 4
          }
        }}
      >
        <CardMedia
          component="img"
          height="140"
          image={resource.thumbnailUrl || `/images/resource-${resource.type}.jpg`}
          alt={resource.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6" component="div" sx={{ mb: 1 }}>
              {resource.title}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => handleToggleSave(resource.id)}
              color={isSaved ? 'primary' : 'default'}
            >
              {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </div>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {resource.description.length > 120 
              ? `${resource.description.substring(0, 120)}...` 
              : resource.description}
          </Typography>
          
          <div sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip 
              label={typeInfo.label} 
              size="small" 
              color={typeInfo.color as any} 
              sx={{ mr: 1 }}
            />
            {resource.difficulty && (
              <Chip 
                label={resource.difficulty === 'beginner' ? '����' : 
                       resource.difficulty === 'intermediate' ? '�м�' : 
                       resource.difficulty === 'advanced' ? '�߼�' : 'ר��'}
                size="small"
                color={getDifficultyColor(resource.difficulty) as any}
                variant="outlined"
              />
            )}
          </div>
          
          {resource.rating !== undefined && (
            <div sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating 
                value={resource.rating} 
                precision={0.5} 
                size="small" 
                readOnly 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({resource.ratingsCount || 0})
              </Typography>
            </div>
          )}
          
          <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {resource.tags?.slice(0, 3).map((tag) => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {resource.tags && resource.tags.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                +{resource.tags.length - 3}
              </Typography>
            )}
          </div>
        </CardContent>
        <Divider />
        <div sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <Button 
            size="small" 
            onClick={() => handleResourceSelect(resource)}
            color="primary"
          >
            �鿴����
          </Button>
        </div>
      </Card>
    );
  };
  
  // ��Ⱦ������״̬
  const renderLoading = () => (
    <Grid container spacing={3}>
      {[...Array(limit > 3 ? 3 : limit)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ height: '100%' }}>
            <Skeleton variant="rectangular" height={140} />
            <CardContent>
              <Skeleton variant="text" height={32} />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="60%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
  
  return (
    <div sx={{ width: '100%' }}>
      <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          �Ƽ���Դ
        </Typography>
        
        {showFilters && (
          <Button 
            startIcon={<FilterIcon />} 
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            variant={showFilterPanel ? "contained" : "outlined"}
          >
            {showFilterPanel ? '����ɸѡ' : '��ʾɸѡ'}
          </Button>
        )}
      </div>
      
      {showFilters && showFilterPanel && renderFilterPanel()}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        renderLoading()
      ) : resources.length === 0 ? (
        <Alert severity="info">
          δ�ҵ�������������Դ�Ƽ�
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {resources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={resource.id}>
                {renderResourceCard(resource)}
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <div sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResourceRecommendations;

