import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { AddIcon, EditIcon, DeleteIcon, VisibilityIcon as ViewIcon, ScienceIcon } from '../utils/icons';

// 实验资源管理
interface ExperimentResource {
  id: string;
  name: string;
  subject: string;
  gradeLevel: string;
  type: 'observation' | 'measurement' | 'investigation' | 'verification' | 'design';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  duration: number; // ����
  materials: string[];
  objectives: string[];
  description: string;
  status: 'draft' | 'published' | 'archived';
  createdDate: string;
  updatedDate: string;
}

const ExperimentResourceManager: React.FC = () => {
  const [resources, setResources] = useState<ExperimentResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<ExperimentResource | null>(null);
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');

  // ģ�����ݼ���
  useEffect(() => {
    const mockResources: ExperimentResource[] = [
      {
        id: '1',
        name: '����������̽��',
        subject: '��ѧ',
        gradeLevel: 'Сѧ',
        type: 'investigation',
        difficulty: 'basic',
        duration: 45,
        materials: ['����', '����', '����Ƭ', 'ֽƬ', 'ָ����'],
        objectives: ['�˽�����Ļ�������', '�۲�ż����໥����', 'ѧ��ʹ��ָ����'],
        description: 'ͨ��ʵ�ʲ�������ѧ���˽�������������ʹż�����',
        status: 'published',
        createdDate: '2025-01-15',
        updatedDate: '2025-01-20'
      },
      {
        id: '2',
        name: 'ֲ��ϸ���۲�',
        subject: '����',
        gradeLevel: '����',
        type: 'observation',
        difficulty: 'intermediate',
        duration: 90,
        materials: ['��΢��', '���', '�ز�Ƭ', '�ǲ�Ƭ', '��Һ'],
        objectives: ['ѧ��ʹ����΢��', '�۲�ֲ��ϸ���ṹ', 'ʶ��ϸ���ڡ�ϸ��Ĥ��ϸ����'],
        description: 'ʹ����΢���۲���б�Ƥϸ�����˽�ֲ��ϸ���Ļ����ṹ',
        status: 'published',
        createdDate: '2025-01-10',
        updatedDate: '2025-01-18'
      },
      {
        id: '3',
        name: '�򵥵�·����',
        subject: '����',
        gradeLevel: '����',
        type: 'design',
        difficulty: 'intermediate',
        duration: 60,
        materials: ['���', '����', 'LED��', '����', '����'],
        objectives: ['�����·�Ļ������', 'ѧ�����Ӽ򵥵�·', '�˽������·��'],
        description: 'ͨ�������򵥵�·�������·�Ļ���ԭ���͵���������',
        status: 'draft',
        createdDate: '2025-01-12',
        updatedDate: '2025-01-22'
      }
    ];

    setTimeout(() => {
      setResources(mockResources);
      setLoading(false);
    }, 1000);
  }, []);

  // ������Դ
  const filteredResources = resources.filter(resource => {
    if (filterSubject !== 'all' && resource.subject !== filterSubject) {
      return false;
    }
    if (filterGrade !== 'all' && resource.gradeLevel !== filterGrade) {
      return false;
    }
    return true;
  });

  const handleAddResource = () => {
    setEditingResource(null);
    setOpenDialog(true);
  };

  const handleEditResource = (resource: ExperimentResource) => {
    setEditingResource(resource);
    setOpenDialog(true);
  };

  const handleDeleteResource = (resourceId: string) => {
    setResources(prev => prev.filter(r => r.id !== resourceId));
  };

  const handleSaveResource = (resourceData: Partial<ExperimentResource>) => {
    if (editingResource) {
      // �༭��Դ
      setResources(prev => prev.map(r => 
        r.id === editingResource.id 
          ? { ...r, ...resourceData, updatedDate: new Date().toISOString().split('T')[0] }
          : r
      ));
    } else {
      // ��������Դ
      const newResource: ExperimentResource = {
        id: Date.now().toString(),
        name: resourceData.name || '',
        subject: resourceData.subject || '',
        gradeLevel: resourceData.gradeLevel || '',
        type: resourceData.type || 'observation',
        difficulty: resourceData.difficulty || 'basic',
        duration: resourceData.duration || 45,
        materials: resourceData.materials || [],
        objectives: resourceData.objectives || [],
        description: resourceData.description || '',
        status: 'draft',
        createdDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0]
      };
      setResources(prev => [...prev, newResource]);
    }
    setOpenDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>������...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      {/* ҳ����� */}
      <Typography variant="h4" gutterBottom>
        ʵ����Դ����
      </Typography>
      
      {/* �������� */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>ѧ��</InputLabel>
            <Select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              label="ѧ��"
            >
              <MenuItem value="all">ȫ��ѧ��</MenuItem>
              <MenuItem value="��ѧ">��ѧ</MenuItem>
              <MenuItem value="����">����</MenuItem>
              <MenuItem value="��ѧ">��ѧ</MenuItem>
              <MenuItem value="����">����</MenuItem>
              <MenuItem value="��Ϣ����">��Ϣ����</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>�꼶</InputLabel>
            <Select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              label="�꼶"
            >
              <MenuItem value="all">ȫ���꼶</MenuItem>
              <MenuItem value="Сѧ">Сѧ</MenuItem>
              <MenuItem value="����">����</MenuItem>
              <MenuItem value="����">����</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddResource}
        >
          ����ʵ����Դ
        </Button>
      </Box>

      {/* ͳ����Ϣ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                ����Դ��
              </Typography>
              <Typography variant="h5" component="div">
                {resources.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                �ѷ���
              </Typography>
              <Typography variant="h5" component="div">
                {resources.filter(r => r.status === 'published').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                �ݸ�
              </Typography>
              <Typography variant="h5" component="div">
                {resources.filter(r => r.status === 'draft').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                �ѹ鵵
              </Typography>
              <Typography variant="h5" component="div">
                {resources.filter(r => r.status === 'archived').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ��Դ�б� */}
      <Grid container spacing={3}>
        {filteredResources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScienceIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div" noWrap>
                    {resource.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={resource.subject} size="small" color="primary" />
                  <Chip label={resource.gradeLevel} size="small" />
                  <Chip 
                    label={resource.difficulty} 
                    size="small" 
                    color={getDifficultyColor(resource.difficulty) as any}
                  />
                  <Chip 
                    label={resource.status} 
                    size="small" 
                    color={getStatusColor(resource.status) as any}
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {resource.description.length > 100 
                    ? `${resource.description.substring(0, 100)}...` 
                    : resource.description}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  ʱ��: {resource.duration} ����
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ����: {resource.materials.length} ��
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ����: {resource.updatedDate}
                </Typography>
              </CardContent>
              
              <CardActions>
                <Tooltip title="�鿴����">
                  <IconButton size="small">
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="�༭">
                  <IconButton size="small" onClick={() => handleEditResource(resource)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="ɾ��">
                  <IconButton size="small" color="error" onClick={() => handleDeleteResource(resource.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredResources.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          û���ҵ�����������ʵ����Դ
        </Alert>
      )}

      {/* ��Դ�༭�Ի��� */}
      <ResourceDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveResource}
        resource={editingResource}
      />
    </Box>
  );
};

// ��Դ�༭�Ի������
interface ResourceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (resource: Partial<ExperimentResource>) => void;
  resource: ExperimentResource | null;
}

const ResourceDialog: React.FC<ResourceDialogProps> = ({ open, onClose, onSave, resource }) => {  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    gradeLevel: '',
    type: 'observation' as 'observation' | 'measurement' | 'investigation' | 'verification' | 'design',
    difficulty: 'basic' as 'basic' | 'intermediate' | 'advanced',
    duration: 45,
    description: '',
    materials: '',
    objectives: ''
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name,
        subject: resource.subject,
        gradeLevel: resource.gradeLevel,
        type: resource.type,
        difficulty: resource.difficulty,
        duration: resource.duration,
        description: resource.description,
        materials: resource.materials.join(', '),
        objectives: resource.objectives.join(', ')
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        gradeLevel: '',
        type: 'observation',
        difficulty: 'basic',
        duration: 45,
        description: '',
        materials: '',
        objectives: ''
      });
    }
  }, [resource, open]);

  const handleSubmit = () => {
    if (!formData.name || !formData.subject) {
      return;
    }
    
    const submitData = {
      ...formData,
      materials: formData.materials.split(',').map(m => m.trim()).filter(m => m),
      objectives: formData.objectives.split(',').map(o => o.trim()).filter(o => o)
    };
    
    onSave(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {resource ? '�༭ʵ����Դ' : '����ʵ����Դ'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="ʵ������"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>ѧ��</InputLabel>
              <Select
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                label="ѧ��"
              >
                <MenuItem value="��ѧ">��ѧ</MenuItem>
                <MenuItem value="����">����</MenuItem>
                <MenuItem value="��ѧ">��ѧ</MenuItem>
                <MenuItem value="����">����</MenuItem>
                <MenuItem value="��Ϣ����">��Ϣ����</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>�꼶</InputLabel>
              <Select
                value={formData.gradeLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                label="�꼶"
              >
                <MenuItem value="Сѧ">Сѧ</MenuItem>
                <MenuItem value="����">����</MenuItem>
                <MenuItem value="����">����</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>ʵ������</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                label="ʵ������"
              >
                <MenuItem value="observation">�۲�ʵ��</MenuItem>
                <MenuItem value="measurement">����ʵ��</MenuItem>
                <MenuItem value="investigation">̽��ʵ��</MenuItem>
                <MenuItem value="verification">��֤ʵ��</MenuItem>
                <MenuItem value="design">���ʵ��</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>�Ѷ�</InputLabel>
              <Select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                label="�Ѷ�"
              >
                <MenuItem value="basic">����</MenuItem>
                <MenuItem value="intermediate">�е�</MenuItem>
                <MenuItem value="advanced">�߼�</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <TextField
            fullWidth
            label="ʵ��ʱ�������ӣ�"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 45 }))}
          />
          
          <TextField
            fullWidth
            label="ʵ������"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
          
          <TextField
            fullWidth
            label="ʵ����ϣ��ö��ŷָ���"
            multiline
            rows={2}
            value={formData.materials}
            onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
            placeholder="����, ����, ����Ƭ, ֽƬ"
          />
          
          <TextField
            fullWidth
            label="ѧϰĿ�꣨�ö��ŷָ���"
            multiline
            rows={2}
            value={formData.objectives}
            onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
            placeholder="�˽�����Ļ�������, �۲�ż����໥����"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ȡ��</Button>
        <Button onClick={handleSubmit} variant="contained">
          ����
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExperimentResourceManager;

