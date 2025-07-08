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
        placeholder="����ʵ��..."
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
        <InputLabel>ʵ������</InputLabel>
        <Select
          value={typeFilter}
          label="ʵ������"
          onChange={(e) => onTypeFilterChange(e.target.value)}
        >          <MenuItem value="all">��������</MenuItem>
          {experimentTypes.map(type => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl size="small" sx={{ minWidth: '150px' }}>
        <InputLabel>״̬</InputLabel>
        <Select
          value={statusFilter}
          label="״̬"
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <MenuItem value="all">����״̬</MenuItem>
          <MenuItem value="draft">�ݸ�</MenuItem>
          <MenuItem value="ready">����</MenuItem>
          <MenuItem value="running">������</MenuItem>
          <MenuItem value="PauseIcond">����ͣ</MenuItem>
          <MenuItem value="completed">�����</MenuItem>
          <MenuItem value="failed">ʧ��</MenuItem>
          <MenuItem value="StopIconped">��ֹͣ</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default ExperimentFilter;


