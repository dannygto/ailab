import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import { GuidanceSuggestion, GuidanceSuggestionType } from '../../types/guidance';
import { AddIcon } from '../../utils/icons';
import { SearchIcon } from '../../utils/icons';
import { FilterListIcon } from '../../utils/icons';

interface GuidanceSuggestionListProps {
  suggestions: GuidanceSuggestion[];
  onSelect: (suggestion: GuidanceSuggestion) => void;
  onCreate: (suggestion: Partial<GuidanceSuggestion>) => Promise<void>;
}

const GuidanceSuggestionList: React.FC<GuidanceSuggestionListProps> = ({
  suggestions,
  onSelect,
  onCreate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState<Partial<GuidanceSuggestion>>({
    title: '',
    content: '',
    type: GuidanceSuggestionType.CONCEPT,
    importance: 3
  });

  // ���˽���
  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = searchTerm === '' || 
      suggestion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === '' || suggestion.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleOpenCreateDialog = () => {
    setShowCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
  };

  const handleCreateSuggestion = async () => {
    try {
      await onCreate(newSuggestion);
      setNewSuggestion({
        title: '',
        content: '',
        type: GuidanceSuggestionType.CONCEPT,
        importance: 3
      });
      handleCloseCreateDialog();
    } catch (error) {
      console.error('��������ʧ��:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSuggestion(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setNewSuggestion(prev => ({ ...prev, [name]: value }));
  };

  const getTypeLabel = (type: GuidanceSuggestionType): string => {
    switch (type) {
      case GuidanceSuggestionType.CONCEPT:
        return '��������';
      case GuidanceSuggestionType.PRACTICAL:
        return 'ʵ������';
      case GuidanceSuggestionType.SAFETY:
        return '��ȫ��ʾ';
      case GuidanceSuggestionType.NEXT_STEP:
        return '��һ��';
      case GuidanceSuggestionType.CORRECTION:
        return '��������';
      case GuidanceSuggestionType.REINFORCEMENT:
        return 'ǿ������';
      default:
        return '����';
    }
  };

  const getChipColor = (type: GuidanceSuggestionType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (type) {
      case GuidanceSuggestionType.CONCEPT:
        return 'primary';
      case GuidanceSuggestionType.PRACTICAL:
        return 'info';
      case GuidanceSuggestionType.SAFETY:
        return 'error';
      case GuidanceSuggestionType.NEXT_STEP:
        return 'success';
      case GuidanceSuggestionType.CORRECTION:
        return 'warning';
      case GuidanceSuggestionType.REINFORCEMENT:
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div>
      <div sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">ָ�������</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenCreateDialog}
        >
          ��������
        </Button>
      </div>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={5}>
            <TextField
              fullWidth
              placeholder="��������..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon color="action" sx={{ mr: 1 }} />
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel id="suggestion-type-LabelIcon">
                <FilterListIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                ������ɸѡ
              </InputLabel>
              <Select
                labelId="suggestion-type-LabelIcon"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                label={
                  <>
                    <FilterListIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    ������ɸѡ
                  </>
                }
              >
                <MenuItem value="">ȫ������</MenuItem>
                {Object.values(GuidanceSuggestionType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {getTypeLabel(type as GuidanceSuggestionType)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="textSecondary">
              �� {filteredSuggestions.length} ������
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <List sx={{ width: '100%' }}>
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <React.Fragment key={suggestion.id}>
                <ListItem
                  alignItems="flex-start"
                  button
                  onClick={() => onSelect(suggestion)}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <div sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" component="span">
                          {suggestion.title}
                        </Typography>
                        <Chip 
                          label={getTypeLabel(suggestion.type)} 
                          size="small" 
                          color={getChipColor(suggestion.type)}
                        />
                      </div>
                    }
                    secondary={
                      <div sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {suggestion.content}
                        </Typography>
                        <div sx={{ display: 'flex', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                            ��Ҫ��: {suggestion.importance}/5
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ����ʱ��: {new Date(suggestion.createdAt).toLocaleDateString()}
                          </Typography>
                        </div>
                      </div>
                    }
                  />
                </ListItem>
                {index < filteredSuggestions.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="û���ҵ�ƥ���ָ������"
                secondary="�볢�Ե������������򴴽��µĽ���"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* �����½���Ի��� */}
      <Dialog open={showCreateDialog} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>������ָ������</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="����"
                name="title"
                value={newSuggestion.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>����</InputLabel>
                <Select
                  name="type"
                  value={newSuggestion.type}
                  onChange={handleSelectChange}
                  label="����"
                >
                  {Object.values(GuidanceSuggestionType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {getTypeLabel(type as GuidanceSuggestionType)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>��Ҫ��</InputLabel>
                <Select
                  name="importance"
                  value={newSuggestion.importance}
                  onChange={handleSelectChange}
                  label="��Ҫ��"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value} {value === 1 ? '(��)' : value === 5 ? '(��)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="����"
                name="content"
                value={newSuggestion.content}
                onChange={handleInputChange}
                multiline
                rows={6}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>ȡ��</Button>
          <Button 
            onClick={handleCreateSuggestion}
            variant="contained"
            disabled={!newSuggestion.title || !newSuggestion.content}
          >
            ����
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GuidanceSuggestionList;

