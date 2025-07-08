import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Experiment } from '../../types';
import { toast } from 'react-hot-toast';
import ExperimentListContent from './components/ExperimentListContent';
import ExperimentStatistics from '../../components/domain/experiments/ExperimentStatistics';
import { Box, Paper, Divider } from '@mui/material';

const ExperimentList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const experimentsPerPage = 6;

  // 初始加载数据
  useEffect(() => {
    fetchExperiments();
  }, []);

  // 应用过滤条件
  useEffect(() => {
    let result = [...experiments];
    
    // 应用搜索过滤
    if (search) {
      result = result.filter(exp => 
        exp.name.toLowerCase().includes(search.toLowerCase()) ||
        exp.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 应用类型过滤
    if (typeFilter !== 'all') {
      result = result.filter(exp => exp.type === typeFilter);
    }
    
    // 应用状态过滤
    if (statusFilter !== 'all') {
      result = result.filter(exp => exp.status === statusFilter);
    }
    
    setFilteredExperiments(result);
    setTotalPages(Math.ceil(result.length / experimentsPerPage));
    // 重置页码
    if (page > Math.ceil(result.length / experimentsPerPage)) {
      setPage(1);
    }
  }, [search, typeFilter, statusFilter, experiments, page]);
  // 获取实验列表
  const fetchExperiments = async () => {
    setLoading(true);
    try {
      const response = await api.getExperiments();
      // 处理分页响应
      if (response && typeof response === 'object') {
        const data = Array.isArray(response) ? response : (response.data || []);
        setExperiments(data);
        setFilteredExperiments(data);
        if (response.totalPages) {
          setTotalPages(response.totalPages);
        } else {
          setTotalPages(Math.ceil(data.length / experimentsPerPage));
        }
      } else {
        setExperiments([]);
        setFilteredExperiments([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('获取实验列表失败:', error);
      toast.error('获取实验列表失败，请稍后再试');
      // 使用模拟数据
      const mockData: Experiment[] = [
        { 
          id: '1', 
          name: '图像分类实验', 
          type: 'observation', 
          status: 'running', 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          description: '使用ResNet50模型进行图像分类',
          userId: 'user1',
          parameters: {},
          data: { datasetId: 'imagenet-mini' },
          results: {},
          metadata: { framework: 'pytorch' }
        },
        { 
          id: '2', 
          name: '目标检测实验', 
          type: 'measurement', 
          status: 'completed', 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          description: '使用YOLO v8模型进行目标检测',
          userId: 'user1',
          parameters: {},
          data: { datasetId: 'coco-mini' },
          results: {},
          metadata: { framework: 'tensorflow' }
        },
        { 
          id: '3', 
          name: '自然语言处理实验', 
          type: 'analysis', 
          status: 'pending', 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          description: 'BERT模型用于文本分类任务',
          userId: 'user1',
          parameters: {},
          data: { datasetId: 'imdb-reviews' },
          results: {},
          metadata: { framework: 'transformers' }
        },
        { 
          id: '4', 
          name: '语音识别实验', 
          type: 'exploration', 
          status: 'failed', 
          createdAt: new Date(), 
          updatedAt: new Date(), 
          description: '基于Transformer的语音识别模型',
          userId: 'user1',
          parameters: {},
          data: { datasetId: 'common-voice' },
          results: {},
          metadata: { framework: 'pytorch' }
        },
      ];
      setExperiments(mockData);
      setFilteredExperiments(mockData);
      setTotalPages(Math.ceil(mockData.length / experimentsPerPage));
    } finally {
      setLoading(false);
    }
  };

  // 获取当前页面的实验
  const getCurrentPageExperiments = () => {
    const startIndex = (page - 1) * experimentsPerPage;
    return filteredExperiments.slice(startIndex, startIndex + experimentsPerPage);
  };

  // 处理分页更改
  const handlePageChange = (Event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 统计概览区域 */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <ExperimentStatistics 
          title="实验统计概览" 
          enableTimeRangeSelection={true} 
          defaultTimeRange="90d"
        />
      </Paper>
      
      <Divider sx={{ my: 3 }} />
      
      {/* 实验列表内容 */}
      <ExperimentListContent
        loading={loading}
        experiments={experiments}
        filteredExperiments={filteredExperiments}
        search={search}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        page={page}
        totalPages={totalPages}
        setSearch={setSearch}
        setTypeFilter={setTypeFilter}
        setStatusFilter={setStatusFilter}
        handlePageChange={handlePageChange}
        getCurrentPageExperiments={getCurrentPageExperiments}
      />
    </Box>
  );
};

export default ExperimentList;
