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
import { VisibilityIcon } from '../../utils/icons';
import { toast } from 'react-hot-toast';

// 导入核心组件
import { Button, ButtonType } from '../../components/core/atoms/Button';
import { Card } from '../../components/core/atoms/Card';

// 导入实验服务
import { experimentService } from '../../services';
import { Experiment, ExperimentType, ExperimentStatus } from '../../types';

// 实验状态配置和映射
import { experimentTypes } from '../../utils/experimentTypes';
import { experimentStatusMap } from '../../constants/experimentStatus';

/**
 * 实验列表页面 - 重构版V2
 *
 * 使用新的服务实现的实验列表页面，具有更好的性能和安全性和更好优化
 */
const ExperimentListV2: React.FC = () => {
  const navigate = useNavigate();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 分页状态
  const [page, setPage] = useState(0); // MUI分页从0开始
  const [rowsPerPage, setRowsPerPage] = useState(10);


  // 获取实验列表
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
        // 使用类型转换确保数据类型正确
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
        throw new Error((response as any).error || '获取实验列表失败');
      }
    } catch (err) {
      console.error('获取实验列表失败:', err);
      setError('获取实验列表失败，请稍后重试');
      toast.error('获取实验列表失败，请稍后重试');

      // 使用模拟数据以便展示UI
      const mockData: Experiment[] = [
        {
          id: '1',
          name: '图像分类实验',
          type: 'observation',
          status: 'running' as ExperimentStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: '使用ResNet50模型进行图像分类',
          userId: 'user1',
          parameters: {},
          data: {},
          results: {},
          metadata: {}
        },
        {
          id: '2',
          name: '目标检测实验',
          type: 'measurement',
          status: 'completed' as ExperimentStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: '使用YOLO v8模型进行目标检测',
          userId: 'user1',
          parameters: {},
          data: {},
          results: {},
          metadata: {}
        },
        {
          id: '3',
          name: '自然语言处理实验',
          type: 'analysis',
          status: 'pending' as ExperimentStatus,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: 'BERT模型进行文本分类任务',
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

  // 初始化加载
  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  // 处理页面变化
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // 处理每页行数变化
  const handleChangeRowsPerPage = (Event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(Event.target.value, 10));
    setPage(0); // 重置到第一页
  };

  // 处理搜索
  const handleSearch = (Event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(Event.target.value);
  };

  // 处理类型筛选
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">ʵ���б�</Typography>
        <Button
          buttonType={ButtonType.PRIMARY}
          startIcon={<AddIcon />}
          onClick={handleCreateExperiment}
        >
          ������ʵ��
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
        </Box>
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
    </Box>
  );
};

export default ExperimentListV2;


