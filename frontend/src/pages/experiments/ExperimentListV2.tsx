import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
  Chip,
  Skeleton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import { SearchIcon } from '../../utils/icons';
import { RefreshIcon } from '../../utils/icons';
import { AddIcon } from '../../utils/icons';
import { visibility } from '../../utils/icons';
import { toast } from 'react-hot-toast';

// ����������
import { Button, ButtonType } from '../../components/core/atoms/Button';
import { Card } from '../../components/core/atoms/Card';

// ����ʵ�����
import { experimentService } from '../../services';
import { Experiment, ExperimentType, ExperimentStatus } from '../../types';

// ʵ��״̬������ӳ��
import { experimentTypes } from '../../utils/experimentTypes';
import { experimentStatusMap } from '../../constants/experimentStatus';

/**
 * ʵ���б�ҳ�� - �ع���V2
 * 
 * ʹ���µ������ʵ�ֵ�ʵ���б�ҳ�棬���и��õ����Ͱ�ȫ�Ժ������Ż�
 */
const ExperimentListV2: React.FC = () => {
  const navigate = useNavigate();
  
  // ״̬����
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // ��ҳ״̬
  const [page, setPage] = useState(0); // MUI��ҳ��0��ʼ
  const [rowsPerPage, setRowsPerPage] = useState(10);


  // ��ȡʵ���б�
  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await experimentService.getExperiments({
        page: page + 1, // api��ҳ��1��ʼ
        limit: rowsPerPage,
        sort: 'updatedAt',
        order: 'desc'
      });
      
      if (response.success && response.data) {
        // ʹ������ת��ȷ�����ͼ���
        const apiExperiments = response.data.items || [];
        const convertedExperiments: Experiment[] = apiExperiments.map(item => ({
          id: item.id,
          name: item.title || '',
          type: item.type as ExperimentType,
          status: item.status as ExperimentStatus,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          description: item.description || '',
          userId: item.createdBy || '',
          parameters: {},
          data: {},
          results: {},
          metadata: {}
        }));
        
        setExperiments(convertedExperiments);
      } else {
        throw new Error(response.error || '��ȡʵ���б�ʧ��');
      }
    } catch (err) {
      console.error('��ȡʵ���б�ʧ��:', err);
      setError('��ȡʵ���б�ʧ�ܣ����Ժ�����');
      toast.error('��ȡʵ���б�ʧ�ܣ����Ժ�����');
      
      // ����ģ�������Ա�չʾUI
      const mockData: Experiment[] = [
        { 
          id: '1', 
          name: 'ͼ�����ʵ��', 
          type: 'observation', 
          status: 'running' as ExperimentStatus, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          description: 'ʹ��ResNet50ģ�ͽ���ͼ�����',
          userId: 'user1',
          parameters: {},
          data: {},
          results: {},
          metadata: {}
        },
        { 
          id: '2', 
          name: 'Ŀ����ʵ��', 
          type: 'measurement', 
          status: 'completed' as ExperimentStatus, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          description: 'ʹ��YOLO v8ģ�ͽ���Ŀ����',
          userId: 'user1',
          parameters: {},
          data: {},
          results: {},
          metadata: {}
        },
        { 
          id: '3', 
          name: '��Ȼ���Դ���ʵ��', 
          type: 'analysis', 
          status: 'pending' as ExperimentStatus, 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          description: 'BERTģ�������ı���������',
          userId: 'user1',
          parameters: {},
          data: {},
          results: {},
          metadata: {}
        }
      ];
      
      setExperiments(mockData);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  // ��ʼ����
  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);
  
  // ����ҳ��仯
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // ����ÿҳ�����仯
  const handleChangeRowsPerPage = (Event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(Event.target.value, 10));
    setPage(0); // ���õ���һҳ
  };
  
  // ��������
  const handleSearch = (Event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(Event.target.value);
  };
  
  // ��������ɸѡ
  const handleTypeFilterChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    setTypeFilter(Event.target.value as string);
  };
  
  // ����״̬ɸѡ
  const handleStatusFilterChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(Event.target.value as string);
  };
  
  // ����ˢ��
  const handleRefreshIcon = () => {
    fetchExperiments();
  };
  
  // ����������ʵ��
  const handleCreateExperiment = () => {
    navigate('/experiments/create');
  };
  
  // �����鿴ʵ������
  const handleViewExperiment = (id: string) => {
    navigate(`/experiments/${id}`);
  };
  
  // ��ȡ���˺��ʵ��
  const getFilteredExperiments = () => {
    return experiments.filter(exp => {
      // ��������
      const matchesSearch = searchTerm === '' || 
        exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // ���͹���
      const matchesType = typeFilter === 'all' || exp.type === typeFilter;
      
      // ״̬����
      const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };
  
  // ��ʽ������
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // ��ȡʵ��������ʾ����
  const getTypeDisplayName = (type: string) => {
    const typeObj = experimentTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };
  
  // ���˺��ʵ������
  const filteredExperiments = getFilteredExperiments();

  return (
    <div sx={{ p: 3 }}>
      <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">ʵ���б�</Typography>
        <Button 
          buttonType={ButtonType.PRIMARY}
          startIcon={<AddIcon />}
          onClick={handleCreateExperiment}
        >
          ������ʵ��
        </Button>
      </div>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Card sx={{ mb: 3 }}>
        <div sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="����ʵ��..."
            size="small"
            value={searchTerm}
            onChange={handleSearch}
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
              onChange={handleTypeFilterChange as any}
            >
              <MenuItem value="all">��������</MenuItem>
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
              onChange={handleStatusFilterChange as any}
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
          
          <Tooltip title="ˢ��">
            <IconButton onClick={handleRefreshIcon} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Card>
      
      <Card>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="medium">
            <TableHead>
              <TableRow>
                <TableCell>ʵ������</TableCell>
                <TableCell>ʵ������</TableCell>
                <TableCell>״̬</TableCell>
                <TableCell>����ʱ��</TableCell>
                <TableCell>����</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // ����״̬
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="30%" /></TableCell>
                  </TableRow>
                ))
              ) : filteredExperiments.length === 0 ? (
                // ������״̬
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      û���ҵ�����������ʵ��
                    </Typography>
                    <Button 
                      buttonType={ButtonType.PRIMARY}
                      sx={{ mt: 2 }}
                      onClick={handleCreateExperiment}
                    >
                      ������ʵ��
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                // չʾʵ������
                filteredExperiments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((experiment) => (
                    <TableRow key={experiment.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {experiment.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {experiment.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{getTypeDisplayName(experiment.type)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={experimentStatusMap[experiment.status as keyof typeof experimentStatusMap]?.label || experiment.status} 
                          color={experimentStatusMap[experiment.status as keyof typeof experimentStatusMap]?.color as any || 'default'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(experiment.createdAt)}</TableCell>
                      <TableCell>
                        <Button 
                          buttonType={ButtonType.PRIMARY}
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewExperiment(experiment.id)}
                        >
                          �鿴
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredExperiments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="ÿҳ����"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Card>
    </div>
  );
};

export default ExperimentListV2;


