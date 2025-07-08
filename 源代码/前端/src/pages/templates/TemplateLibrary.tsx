import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Pagination,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FavoriteIcon } from '../../utils/icons';
import { FavoriteBorderIcon } from '../../utils/icons';
import { FilterListIcon } from '../../utils/icons';
import { SearchIcon } from '../../utils/icons';
import { AddIcon } from '../../utils/icons';
import { toast } from 'react-toastify';

import api from '../../services/api';
import { ExperimentTemplate, ExperimentType } from '../../types';
import { experimentTypeOptions } from '../../utils/experimentTypes';

const TemplateLibrary: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<ExperimentType[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
    const { data: templatesResponse, isLoading, error } = useQuery(
    ['templates', page],
    async () => {
      const response = await api.getTemplates({ page, limit: 12 });
      return response;
    }
  );

  const templates = templatesResponse?.success && templatesResponse.data ? templatesResponse.data.data : [];

  useEffect(() => {
    // 从本地存储加载收藏
    const savedFavorites = localStorage.getItem('templateFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (templateId: string) => {
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    
    setFavorites(newFavorites);
    localStorage.setItem('templateFavorites', JSON.stringify(newFavorites));
    
    toast.success(
      favorites.includes(templateId) 
        ? '已从收藏中移除' 
        : '已添加到收藏'
    );
  };

  const handleCreateTemplate = () => {
    navigate('/templates/create');
  };

  const handleOpenTemplate = (id: string) => {
    navigate(`/templates/${id}`);
  };

  const handleUseTemplate = (template: ExperimentTemplate) => {
    navigate('/experiments/create', { 
      state: { templateId: template.id, template }
    });
  };

  const handlePageChange = (Event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const filteredTemplates = templates
    ? templates.filter(template => {
        const matchesSearch = searchTerm === '' || 
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = selectedTypes.length === 0 || 
          selectedTypes.includes(template.type);
        
        const matchesDifficulty = selectedDifficulty === '' || 
          template.difficulty === selectedDifficulty;
        
        return matchesSearch && matchesType && matchesDifficulty;
      })
    : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          实验模板库
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
        >
          创建模板
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          placeholder="搜索模板..."
          variant="outlined"
          size="small"
          sx={{ mr: 2, flexGrow: 1 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
          }}
        />
        <Tooltip title="筛选">
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {showFilters && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>实验类型</InputLabel>
                <Select
                  multiple
                  value={selectedTypes}
                  onChange={(e) => setSelectedTypes(e.target.value as ExperimentType[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as ExperimentType[]).map((value) => (
                        <Chip 
                          key={value} 
                          label={experimentTypeOptions.find(opt => opt.value === value)?.label || value} 
                          size="small" 
                        />
                      ))}
                    </Box>
                  )}
                >
                  {experimentTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>难度级别</InputLabel>
                <Select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <MenuItem value="">全部难度</MenuItem>
                  <MenuItem value="beginner">初级</MenuItem>
                  <MenuItem value="intermediate">中级</MenuItem>
                  <MenuItem value="advanced">高级</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          加载模板失败，请稍后重试
        </Typography>
      ) : (
        <>
          {filteredTemplates.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="h6">
                没有找到匹配的实验模板
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                请尝试调整搜索条件或创建新的模板
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredTemplates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {template.name}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleFavorite(template.id)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          {favorites.includes(template.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {template.description.length > 100 
                          ? `${template.description.substring(0, 100)}...` 
                          : template.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', mb: 1 }}>
                        <Chip 
                          label={experimentTypeOptions.find(opt => opt.value === template.type)?.label || template.type} 
                          size="small" 
                          sx={{ mr: 1 }} 
                        />
                        <Chip 
                          label={
                            template.difficulty === 'beginner' ? '初级' :
                            template.difficulty === 'intermediate' ? '中级' : '高级'
                          } 
                          size="small" 
                          color={
                            template.difficulty === 'beginner' ? 'success' :
                            template.difficulty === 'intermediate' ? 'primary' : 'error'
                          }
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {template.tags.slice(0, 3).map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                        {template.tags.length > 3 && (
                          <Chip label={`+${template.tags.length - 3}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button size="small" onClick={() => handleOpenTemplate(template.id)}>
                        查看详情
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleUseTemplate(template)}
                      >
                        使用模板
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={5} // 这里应该用实际的总页数
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default TemplateLibrary;


