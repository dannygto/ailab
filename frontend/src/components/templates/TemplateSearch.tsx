import React, { useState } from 'react';
import { 
  Paper, 
  InputBase, 
  IconButton, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Button,
  SelectChangeEvent
} from '@mui/material';
import { SearchIcon as SearchIcon } from '../../utils/icons';
import { TemplateGradeLevel, TemplateDifficultyLevel } from '../../types';

// ʵ������ѡ��
const EXPERIMENT_TYPES = [
  { value: 'physics', label: '����ʵ��' },
  { value: 'chemistry', label: '��ѧʵ��' },
  { value: 'biology', label: '����ʵ��' },
  { value: 'math', label: '��ѧʵ��' },
  { value: 'computer_ScienceIcon', label: '�������ѧ' },
  { value: 'robotics', label: '������' },
  { value: 'environment', label: '������ѧ' },
  { value: 'astronomy', label: '����ѧ' },
  { value: 'other', label: '����' }
];

// ѧ�Ʒ���ѡ��
const SUBJECT_CATEGORIES = [
  { value: 'mechanics', label: '��ѧ' },
  { value: 'electromagnetism', label: '���ѧ' },
  { value: 'optics', label: '��ѧ' },
  { value: 'thermodynamics', label: '����ѧ' },
  { value: 'organic_chemistry', label: '�л���ѧ' },
  { value: 'inorganic_chemistry', label: '�޻���ѧ' },
  { value: 'analytical_chemistry', label: '������ѧ' },
  { value: 'microbiology', label: '΢����ѧ' },
  { value: 'botany', label: 'ֲ��ѧ' },
  { value: 'zoology', label: '����ѧ' },
  { value: 'genetics', label: '�Ŵ�ѧ' },
  { value: 'ecology', label: '��̬ѧ' },
  { value: 'algebra', label: '����' },
  { value: 'geometry', label: '����' },
  { value: 'calculus', label: '΢����' },
  { value: 'statistics', label: 'ͳ��ѧ' },
  { value: 'programming', label: '���' },
  { value: 'artificial_intelligence', label: '�˹�����' },
  { value: 'data_ScienceIcon', label: '���ݿ�ѧ' },
  { value: 'other', label: '����' }
];

// �Ѷȵȼ�ѡ��
const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: '���ż�' },
  { value: 'intermediate', label: '�м�' },
  { value: 'advanced', label: '�߼�' },
  { value: 'expert', label: 'ר�Ҽ�' }
];

// ѧ�εȼ�ѡ��
const GRADE_LEVELS = [
  { value: 'elementary', label: 'Сѧ' },
  { value: 'middle', label: '����' },
  { value: 'high', label: '����' },
  { value: 'university', label: '��ѧ' }
];

interface TemplateSearchProps {
  onSearch: (filters: any) => void;
  defaultValues?: {
    search?: string;
    type?: string;
    subject?: string;
    difficulty?: TemplateDifficultyLevel;
    grade?: TemplateGradeLevel;
  };
}

const TemplateSearch: React.FC<TemplateSearchProps> = ({ onSearch, defaultValues = {} }) => {
  const [search, setSearch] = useState(defaultValues.search || '');
  const [type, setType] = useState(defaultValues.type || '');
  const [subject, setSubject] = useState(defaultValues.subject || '');
  const [difficulty, setDifficulty] = useState<string>(defaultValues.difficulty || '');
  const [grade, setGrade] = useState<string>(defaultValues.grade || '');
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  const handleTypeChange = (e: SelectChangeEvent) => {
    setType(e.target.value);
  };
  
  const handleSubjectChange = (e: SelectChangeEvent) => {
    setSubject(e.target.value);
  };
  
  const handleDifficultyChange = (e: SelectChangeEvent) => {
    setDifficulty(e.target.value);
  };
  
  const handleGradeChange = (e: SelectChangeEvent) => {
    setGrade(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: any = {};
    if (search) filters.search = search;
    if (type) filters.type = type;
    if (subject) filters.subject = subject;
    if (difficulty) filters.difficulty = difficulty;
    if (grade) filters.grade = grade;
    
    onSearch(filters);
  };
  
  const handleClear = () => {
    setSearch('');
    setType('');
    setSubject('');
    setDifficulty('');
    setGrade('');
    onSearch({});
  };
  
  return (
    <Paper
      component="form"
      elevation={3}
      sx={{ p: 3, mb: 2 }}
      onSubmit={handleSearchSubmit}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #e0e0e0',
              borderRadius: 1
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="����ģ�����ƻ�����"
              value={search}
              onChange={handleSearchChange}
            />
            {search && (
              <IconButton 
                size="small" 
                aria-label="clear" 
                onClick={() => setSearch('')}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton type="submit" aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="template-type-LabelIcon">ʵ������</InputLabel>
            <Select
              labelId="template-type-LabelIcon"
              value={type}
              label="ʵ������"
              onChange={handleTypeChange}
            >
              <MenuItem value="">ȫ������</MenuItem>
              {EXPERIMENT_TYPES.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="template-subject-LabelIcon">ѧ�Ʒ���</InputLabel>
            <Select
              labelId="template-subject-LabelIcon"
              value={subject}
              label="ѧ�Ʒ���"
              onChange={handleSubjectChange}
            >
              <MenuItem value="">ȫ��ѧ��</MenuItem>
              {SUBJECT_CATEGORIES.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="template-difficulty-LabelIcon">�Ѷȵȼ�</InputLabel>
            <Select
              labelId="template-difficulty-LabelIcon"
              value={difficulty}
              label="�Ѷȵȼ�"
              onChange={handleDifficultyChange}
            >
              <MenuItem value="">ȫ���Ѷ�</MenuItem>
              {DIFFICULTY_LEVELS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="template-grade-LabelIcon">����ѧ��</InputLabel>
            <Select
              labelId="template-grade-LabelIcon"
              value={grade}
              label="����ѧ��"
              onChange={handleGradeChange}
            >
              <MenuItem value="">ȫ��ѧ��</MenuItem>
              {GRADE_LEVELS.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={6}>
          <div sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              color="primary" 
              type="submit"
              startIcon={<SearchIcon />}
            >
              ����
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleClear}
              startIcon={<ClearIcon />}
            >
              ���ɸѡ
            </Button>
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TemplateSearch;

