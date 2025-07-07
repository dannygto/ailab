import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { AddIcon as AddIcon, DeleteIcon as DeleteIcon, EditIcon as EditIcon, RefreshIcon as RefreshIcon } from '../../utils/icons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { ExperimentType } from '../../types';
import { experimentResourceOptions } from '../experiments/components/ExperimentResourceSelect';

// 资源类型定义
interface Resource {
  id: string;
  name: string;
  type: 'physical' | 'virtual' | 'hybrid';
  category: string;
  experimentType: ExperimentType;
  equipment?: string;
  software?: string;
  description?: string;
  availability: boolean;
  location?: string;
  quantity?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  createdAt: string;
  updatedAt: string;
}

// 新建资源表单数据类型
interface ResourceFormData {
  name: string;
  type: 'physical' | 'virtual' | 'hybrid';
  category: string;
  experimentType: ExperimentType;
  equipment?: string;
  software?: string;
  description?: string;
  availability: boolean;
  location?: string;
  quantity?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

// 初始表单数据
const initialFormData: ResourceFormData = {
  name: '',
  type: 'physical',
  category: '',
  experimentType: 'observation',
  equipment: '',
  software: '',
  description: '',
  availability: true,
  location: '',
  quantity: 1,
  lastMaintenance: '',
  nextMaintenance: ''
};

// 资源类别选项
const resourceCategories = [
  { value: 'basic_equipment', label: '基础设备' },
  { value: 'advanced_equipment', label: '高级设备' },
  { value: 'software', label: '软件工具' },
  { value: 'consumable', label: '耗材' },
  { value: 'dataset', label: '数据集' },
  { value: 'model', label: '模型' },
  { value: 'other', label: '其他' }
];

// 实验类型选项 - K12标准
const experimentTypeOptions = [
  { value: 'observation', label: '观察实验' },
  { value: 'measurement', label: '测量实验' },
  { value: 'comparison', label: '对比实验' },
  { value: 'exploration', label: '探究实验' },
  { value: 'design', label: '设计制作' },
  { value: 'analysis', label: '分析实验' },
  { value: 'synthesis', label: '综合实验' },
  { value: 'custom', label: '自定义实验' }
];

function ResourceManagement() {
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState<ExperimentType>('observation');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);  const [editMode, setEditMode] = useState(false);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>(initialFormData);
  
  // 使用React Query获取资源数据
  const { data: resources = [], isLoading, error, refetch } = useQuery<Resource[], Error>(
    ['resources', currentTab],
    async (): Promise<Resource[]> => {
      try {
        // 在开发环境中，使用模拟数据
        if (process.env.NODE_ENV === 'development') {
          // 生成该类型的模拟资源数据
          return generateMockResources(currentTab);
        }
          const response = await api.getResources(currentTab);
        return response.data || [];
      } catch (error) {
        console.error('获取资源失败:', error);
        throw error;
      }
    }
  );

  // 创建资源的mutation
  const createResourceMutation = useMutation(
    async (data: ResourceFormData) => {
      if (process.env.NODE_ENV === 'development') {
        // 模拟api调用
        return { ...data, id: `mock-${Date.now()}` };
      }
      const response = await api.createResource(data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['resources', currentTab]);
        toast.success('资源创建成功');
        handleCloseDialog();
      },
      onError: (error: any) => {
        toast.error(`创建失败: ${error.message}`);
      }
    }
  );

  // 更新资源的mutation
  const updateResourceMutation = useMutation(
    async ({ id, data }: { id: string; data: ResourceFormData }) => {
      if (process.env.NODE_ENV === 'development') {
        // 模拟api调用
        return { ...data, id };
      }
      const response = await api.updateResource(id, data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['resources', currentTab]);
        toast.success('资源更新成功');
        handleCloseDialog();
      },
      onError: (error: any) => {
        toast.error(`更新失败: ${error.message}`);
      }
    }
  );

  // 删除资源的mutation
  const deleteResourceMutation = useMutation(
    async (id: string) => {
      if (process.env.NODE_ENV === 'development') {
        // 模拟api调用
        return { success: true };
      }
      await api.deleteResource(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['resources', currentTab]);
        toast.success('资源删除成功');
      },
      onError: (error: any) => {
        toast.error(`删除失败: ${error.message}`);
      }
    }
  );  // 处理文本输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // 处理下拉选择变化
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({ ...formData, [name]: value });
    }
  };

  // 打开新建资源对话框
  const handleAddResource = () => {
    setEditMode(false);
    setFormData({ ...initialFormData, experimentType: currentTab });
    setOpenDialog(true);
  };

  // 打开编辑资源对话框
  const handleEditResource = (resource: Resource) => {
    setEditMode(true);
    setCurrentResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      category: resource.category,
      experimentType: resource.experimentType,
      equipment: resource.equipment || '',
      software: resource.software || '',
      description: resource.description || '',
      availability: resource.availability,
      location: resource.location || '',
      quantity: resource.quantity || 1,
      lastMaintenance: resource.lastMaintenance || '',
      nextMaintenance: resource.nextMaintenance || ''
    });
    setOpenDialog(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setCurrentResource(null);
  };

  // 提交资源表单
  const handleSubmitResource = () => {
    if (editMode && currentResource) {
      updateResourceMutation.mutate({ id: currentResource.id, data: formData });
    } else {
      createResourceMutation.mutate(formData);
    }
  };

  // 删除资源
  const handleDeleteResource = (id: string) => {
    if (window.confirm('确定要删除这个资源吗？')) {
      deleteResourceMutation.mutate(id);
    }
  };
  // 切换选项卡
  const handleTabChange = (_: React.SyntheticEvent, newValue: ExperimentType) => {
    setCurrentTab(newValue);
  };  // 过滤资源
  const filteredResources = Array.isArray(resources) ? resources.filter((resource: Resource) => 
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  // 生成模拟资源数据
  const generateMockResources = (type: ExperimentType): Resource[] => {
    const options = experimentResourceOptions[type] || [];
    return options.map((option, index) => ({
      id: `mock-${type}-${index}`,
      name: option.label,
      type: option.equipment && option.equipment !== '无需实体设备' ? 'physical' : 'virtual',
      category: option.equipment ? 'basic_equipment' : 'dataset',
      experimentType: type,
      equipment: option.equipment || undefined,
      software: option.software || undefined,
      description: `这是${option.label}的详细描述，包含其用途和适用场景。`,
      availability: true,
      location: option.equipment ? '实验室A区' : '系统库',
      quantity: option.equipment ? Math.floor(Math.random() * 10) + 1 : undefined,
      lastMaintenance: option.equipment ? '2023-01-15' : undefined,
      nextMaintenance: option.equipment ? '2023-07-15' : undefined,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    }));
  };

  return (
    <div sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        实验资源管理
      </Typography>
      
      <div sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          管理多学科实验所需的物理设备、虚拟资源和数据集。您可以添加新资源、更新现有资源信息或删除不再使用的资源。
        </Typography>
      </div>

      <div sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="实验类型选项卡"
        >          <Tab label="观察实验" value="observation" />
          <Tab label="测量实验" value="measurement" />
          <Tab label="对比实验" value="comparison" />
          <Tab label="探究实验" value="exploration" />
          <Tab label="设计制作" value="design" />
          <Tab label="分析实验" value="analysis" />
          <Tab label="综合实验" value="synthesis" />
        </Tabs>
      </div>

      <div sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField
          label="搜索资源"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
        >
          刷新
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddResource}
        >
          添加资源
        </Button>
      </div>

      {isLoading ? (
        <div sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </div>
      ) : error ? (
        <Alert severity="error">
          加载资源失败: {(error as Error).message}
        </Alert>
      ) : filteredResources.length === 0 ? (
        <Alert severity="info">
          未找到符合条件的资源
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredResources.map((resource: Resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card variant="outlined">
                <CardContent>
                  <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                      {resource.name}
                    </Typography>
                    <div>
                      <IconButton
                        size="small"
                        onClick={() => handleEditResource(resource)}
                        aria-label="编辑"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteResource(resource.id)}
                        aria-label="删除"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                  
                  <div sx={{ mb: 1 }}>
                    <Chip
                      label={resource.type === 'physical' ? '物理资源' : resource.type === 'virtual' ? '虚拟资源' : '混合资源'}
                      size="small"
                      color={resource.type === 'physical' ? 'primary' : resource.type === 'virtual' ? 'secondary' : 'default'}
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={resourceCategories.find(c => c.value === resource.category)?.label || resource.category}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={resource.availability ? '可用' : '不可用'}
                      size="small"
                      color={resource.availability ? 'success' : 'error'}
                      sx={{ mb: 1 }}
                    />
                  </div>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  {resource.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {resource.description}
                    </Typography>
                  )}
                  
                  {resource.equipment && (
                    <Typography variant="body2">
                      <strong>设备:</strong> {resource.equipment}
                    </Typography>
                  )}
                  
                  {resource.software && (
                    <Typography variant="body2">
                      <strong>软件:</strong> {resource.software}
                    </Typography>
                  )}
                  
                  {resource.location && (
                    <Typography variant="body2">
                      <strong>位置:</strong> {resource.location}
                    </Typography>
                  )}
                  
                  {resource.quantity !== undefined && (
                    <Typography variant="body2">
                      <strong>数量:</strong> {resource.quantity}
                    </Typography>
                  )}
                  
                  {resource.lastMaintenance && (
                    <Typography variant="body2">
                      <strong>上次维护:</strong> {resource.lastMaintenance}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}      {/* 新建/编辑资源对话框 */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        aria-labelledby="resource-dialog-title"
        aria-describedby="resource-dialog-description"
      >
        <DialogTitle id="resource-dialog-title">
          {editMode ? '编辑资源' : '新建资源'}
        </DialogTitle>
        <DialogContent id="resource-dialog-description">
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="资源名称"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>实验类型</InputLabel>                <Select
                  name="experimentType"
                  value={formData.experimentType}
                  onChange={handleSelectChange}
                  label="实验类型"
                  required
                >
                  {experimentTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>资源类型</InputLabel>                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  label="资源类型"
                  required
                >
                  <MenuItem value="physical">物理资源</MenuItem>
                  <MenuItem value="virtual">虚拟资源</MenuItem>
                  <MenuItem value="hybrid">混合资源</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>资源类别</InputLabel>                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  label="资源类别"
                  required
                >
                  {resourceCategories.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="描述"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="设备"
                name="equipment"
                value={formData.equipment}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="软件"
                name="software"
                value={formData.software}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="位置"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="数量"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="上次维护日期"
                name="lastMaintenance"
                type="date"
                value={formData.lastMaintenance}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="下次维护日期"
                name="nextMaintenance"
                type="date"
                value={formData.nextMaintenance}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>可用状态</InputLabel>                <Select
                  name="availability"
                  value={formData.availability ? "true" : "false"}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      availability: e.target.value === "true"
                    });
                  }}
                  label="可用状态"
                >
                  <MenuItem value="true">可用</MenuItem>
                  <MenuItem value="false">不可用</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button 
            onClick={handleSubmitResource} 
            variant="contained" 
            disabled={!formData.name || !formData.type}
          >
            {editMode ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>    </div>
  );
}

export default ResourceManagement;



