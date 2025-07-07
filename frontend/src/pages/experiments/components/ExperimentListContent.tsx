import React from 'react';
import { 
  Box, 
  Typography, 
  Button,
  CircularProgress,
  Pagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Experiment } from '../../../types';
import { ExperimentGrid } from './ExperimentGrid';
import ExperimentFilter from './ExperimentFilter';

interface ExperimentListContentProps {
  loading: boolean;
  experiments: Experiment[];
  filteredExperiments: Experiment[];
  search: string;
  typeFilter: string;
  statusFilter: string;
  page: number;
  totalPages: number;
  setSearch: (value: string) => void;
  setTypeFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  handlePageChange: (Event: React.ChangeEvent<unknown>, value: number) => void;
  getCurrentPageExperiments: () => Experiment[];
}

const ExperimentListContent: React.FC<ExperimentListContentProps> = ({
  loading,
  experiments,
  filteredExperiments,
  search,
  typeFilter,
  statusFilter,
  page,
  totalPages,
  setSearch,
  setTypeFilter,
  setStatusFilter,
  handlePageChange,
  getCurrentPageExperiments
}) => {
  const navigate = useNavigate();
  
  // 清除所有过滤器
  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
  };
  
  return (
    <div sx={{ p: 3 }}>
      <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">实验列表</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/experiments/create')}
        >
          创建新实�?
        </Button>
      </div>
      
      {/* 过滤和搜索工具栏 */}
      <ExperimentFilter 
        search={search}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onTypeFilterChange={setTypeFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={handleClearFilters}
      />
      
      {loading ? (
        <div sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </div>
      ) : filteredExperiments.length === 0 ? (
        <div sx={{ textAlign: 'center', my: 5 }}>
          <Typography variant="h6" color="text.secondary">
            没有找到符合条件的实�?
          </Typography>
          <Button 
            variant="outlined" 
            sx={{ mt: 2 }} 
            onClick={handleClearFilters}
          >
            清除过滤条件
          </Button>
        </div>
      ) : (
        <>
          <ExperimentGrid experiments={getCurrentPageExperiments()} />
          
          {/* 分页控件 */}
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

export default ExperimentListContent;
