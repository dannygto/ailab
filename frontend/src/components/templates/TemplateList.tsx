import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Grid, 
  Button, 
  Chip, 
  CardActions, 
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ExperimentTemplate } from '../../types';
import { templateService } from '../../services';
import TemplateSearch from './TemplateSearch';

interface TemplateListProps {
  initialFilters?: any;
  showSearchBar?: boolean;
  maxItems?: number;
  onTemplateSelect?: (template: ExperimentTemplate) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({ 
  initialFilters, 
  showSearchBar = true,
  maxItems,
  onTemplateSelect
}) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ExperimentTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState(initialFilters || {});
  
  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const limit = maxItems || 12;
      const response = await templateService.getTemplates({
        page,
        limit,
        ...filters
      });
      
      if (response.success && response.data) {
        setTemplates(response.data.items || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError('�޷�����ģ������');
      }
    } catch (err) {
      setError('����ģ��ʱ���ִ���');
      console.error('ģ����ش���:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTemplates();
  }, [page, filters]);
  
  const handleSearch = (searchFilters: any) => {
    setFilters({ ...filters, ...searchFilters });
    setPage(1); // ���õ���һҳ
  };
  
  const handlePageChange = (Event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleTemplateClick = (template: ExperimentTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    } else {
      navigate(`/templates/${template.id}`);
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'info';
      case 'advanced': return 'warning';
      case 'expert': return 'error';
      default: return 'default';
    }
  };
  
  return (
    <div sx={{ width: '100%' }}>
      {showSearchBar && (
        <div sx={{ mb: 3 }}>
          <TemplateSearch onSearch={handleSearch} />
        </div>
      )}
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {loading ? (
        <div sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </div>
      ) : templates.length === 0 ? (
        <Alert severity="info">δ�ҵ�����������ʵ��ģ��</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
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
                    image={template.thumbnailUrl || '/images/default-template.jpg'}
                    alt={template.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                    <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Chip 
                        label={template.type} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      {template.subject && (
                        <Chip 
                          label={template.subject} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      )}
                      {template.difficulty && (
                        <Chip 
                          label={template.difficulty} 
                          size="small" 
                          color={getDifficultyColor(template.difficulty) as any}
                          variant="outlined"
                        />
                      )}
                    </div>
                    {template.duration && (
                      <Typography variant="caption" display="block">
                        Ԥ��ʱ��: {template.duration} ����
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleTemplateClick(template)}
                    >
                      �鿴����
                    </Button>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate(`/experiments/create?templateId=${template.id}`)}
                    >
                      ����ʵ��
                    </Button>
                  </CardActions>
                </Card>
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

export default TemplateList;

