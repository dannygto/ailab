import React from 'react';
import { 
  Box, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import { SearchIcon } from '../../../utils/icons';
import { experimentTypes } from '../../../utils/experimentTypes';

interface ExperimentFilterProps {
  search: string;
  typeFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

const ExperimentFilter: React.FC<ExperimentFilterProps> = ({
  search,
  typeFilter,
  statusFilter,
  onSearchChange,
  onTypeFilterChange,
  onStatusFilterChange,
  onClearFilters
}) => {
  return (
    <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      <TextField
        placeholder="搜索实验..."
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flexGrow: 1, minWidth: '200px' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      <FormControl size="small" sx={{ minWidth: '150px' }}>
        <InputLabel>实验类型</InputLabel>
        <Select
          value={typeFilter}
          label="实验类型"
          onChange={(e) => onTypeFilterChange(e.target.value)}
        >
          <MenuItem value="all">所有类型</MenuItem>
          {experimentTypes.map(type => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl size="small" sx={{ minWidth: '150px' }}>
        <InputLabel>状态</InputLabel>
        <Select
          value={statusFilter}
          label="状态"
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <MenuItem value="all">所有状态</MenuItem>
          <MenuItem value="draft">草稿</MenuItem>
          <MenuItem value="ready">就绪</MenuItem>
          <MenuItem value="running">运行中</MenuItem>
          <MenuItem value="paused">已暂停</MenuItem>
          <MenuItem value="completed">已完成</MenuItem>
          <MenuItem value="failed">失败</MenuItem>
          <MenuItem value="stopped">已停止</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default ExperimentFilter;