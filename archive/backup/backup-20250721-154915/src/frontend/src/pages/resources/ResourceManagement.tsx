import React, { useState, useEffect } from 'react';
import { AddIcon, EditIcon, DeleteIcon, RefreshIcon } from '../../utils/icons';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
;

interface Resource {
  id: string;
  name: string;
  type: string;
  category: string;
  status: boolean;
  description: string;
  experimentType: string;
}

const ResourceManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentResource, setCurrentResource] = useState<Partial<Resource>>({});

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      // 模拟API调用
      setTimeout(() => {
        setResources([
          {
            id: '1',
            name: '显微镜 A',
            type: 'physical',
            category: 'equipment',
            status: true,
            description: '高精度显微镜',
            experimentType: 'biology'
          },
          {
            id: '2',
            name: '试剂盒 B',
            type: 'virtual',
            category: 'material',
            status: true,
            description: '化学试剂盒',
            experimentType: 'chemistry'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('加载资源失败');
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (resource?: Resource) => {
    if (resource) {
      setCurrentResource(resource);
      setEditMode(true);
    } else {
      setCurrentResource({});
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentResource({});
    setEditMode(false);
  };

  const handleSaveResource = async () => {
    try {
      // 模拟保存操作
      console.log('Saving resource:', currentResource);
      handleCloseDialog();
      loadResources();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      // 模拟删除操作
      console.log('Deleting resource:', id);
      loadResources();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        资源管理
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        管理实验所需的各种资源，包括设备、材料等。
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="resource tabs">
          <Tab label="全部资源" />
          <Tab label="设备管理" />
          <Tab label="材料管理" />
          <Tab label="软件资源" />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField
          placeholder="搜索资源..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300 }}
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          添加资源
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      {resource.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(resource)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {resource.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={resource.type} size="small" variant="outlined" />
                    <Chip label={resource.category} size="small" variant="outlined" />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      状态: {resource.status ? '可用' : '不可用'}
                    </Typography>
                    <Chip
                      label={resource.status ? '可用' : '不可用'}
                      color={resource.status ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 新建/编辑资源对话框 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? '编辑资源' : '添加新资源'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="资源名称"
                value={currentResource.name || ''}
                onChange={(e) => setCurrentResource(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>实验类型</InputLabel>
                <Select
                  value={currentResource.experimentType || ''}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, experimentType: e.target.value }))}
                >
                  <MenuItem value="biology">生物实验</MenuItem>
                  <MenuItem value="chemistry">化学实验</MenuItem>
                  <MenuItem value="physics">物理实验</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>资源类型</InputLabel>
                <Select
                  value={currentResource.type || ''}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="physical">物理资源</MenuItem>
                  <MenuItem value="virtual">虚拟资源</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>资源类别</InputLabel>
                <Select
                  value={currentResource.category || ''}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, category: e.target.value }))}
                >
                  <MenuItem value="equipment">设备</MenuItem>
                  <MenuItem value="material">材料</MenuItem>
                  <MenuItem value="software">软件</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>可用状态</InputLabel>
                <Select
                  value={currentResource.status ? 'true' : 'false'}
                  onChange={(e) => setCurrentResource(prev => ({ ...prev, status: e.target.value === 'true' }))}
                >
                  <MenuItem value="true">可用</MenuItem>
                  <MenuItem value="false">不可用</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="描述"
                multiline
                rows={3}
                value={currentResource.description || ''}
                onChange={(e) => setCurrentResource(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSaveResource} variant="contained">
            {editMode ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourceManagement;
