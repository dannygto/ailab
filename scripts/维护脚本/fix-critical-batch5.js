const fs = require('fs');
const path = require('path');

// 修复 SimpleSettings.tsx
function fixSimpleSettings() {
  const filePath = path.join(__dirname, 'frontend/src/pages/SimpleSettings.tsx');
  
  const content = `import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const SimpleSettings: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          系统设置
        </Typography>

        <Paper elevation={2}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="settings tabs">
              <Tab label="通用设置" />
              <Tab label="用户管理" />
              <Tab label="系统配置" />
              <Tab label="安全设置" />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <Typography variant="h6">通用设置</Typography>
            <Typography>配置系统的通用参数</Typography>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <Typography variant="h6">用户管理</Typography>
            <Typography>管理系统用户和权限</Typography>
          </TabPanel>

          <TabPanel value={value} index={2}>
            <Typography variant="h6">系统配置</Typography>
            <Typography>配置系统核心参数</Typography>
          </TabPanel>

          <TabPanel value={value} index={3}>
            <Typography variant="h6">安全设置</Typography>
            <Typography>配置系统安全相关设置</Typography>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default SimpleSettings;
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed SimpleSettings.tsx');
}

// 修复 SimpleSettingsTest.tsx
function fixSimpleSettingsTest() {
  const filePath = path.join(__dirname, 'frontend/src/pages/SimpleSettingsTest.tsx');
  
  const content = `import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const SimpleSettingsTest: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          设置测试页面
        </Typography>

        <Paper elevation={2}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="settings tabs">
              <Tab label="通用设置" />
              <Tab label="AI模型设置" />
              <Tab label="安全设置" />
              <Tab label="通知设置" />
              <Tab label="备份设置" />
              <Tab label="高级设置" />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <Typography variant="h6">通用设置</Typography>
            <Typography>配置系统通用参数</Typography>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <Typography variant="h6">AI模型设置</Typography>
            <Typography>配置AI模型相关参数</Typography>
          </TabPanel>

          <TabPanel value={value} index={2}>
            <Typography variant="h6">安全设置</Typography>
            <Typography>配置系统安全相关设置</Typography>
          </TabPanel>

          <TabPanel value={value} index={3}>
            <Typography variant="h6">通知设置</Typography>
            <Typography>配置系统通知相关设置</Typography>
          </TabPanel>

          <TabPanel value={value} index={4}>
            <Typography variant="h6">备份设置</Typography>
            <Typography>配置系统备份相关设置</Typography>
          </TabPanel>

          <TabPanel value={value} index={5}>
            <Typography variant="h6">高级设置</Typography>
            <Typography>配置系统高级参数</Typography>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default SimpleSettingsTest;
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed SimpleSettingsTest.tsx');
}

// 修复 TeacherDashboard.tsx
function fixTeacherDashboard() {
  const filePath = path.join(__dirname, 'frontend/src/pages/TeacherDashboard.tsx');
  
  const content = `import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface StudentDialogProps {
  open: boolean;
  onClose: () => void;
  student?: Student | null;
}

const StudentDialog: React.FC<StudentDialogProps> = ({ open, onClose, student }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grade: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        grade: student.grade
      });
    } else {
      setFormData({ name: '', email: '', grade: '' });
    }
  }, [student]);

  const handleSave = () => {
    // 保存逻辑
    console.log('Saving student:', formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {student ? '编辑学生' : '添加学生'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="姓名"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            fullWidth
            label="邮箱"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          <FormControl fullWidth>
            <InputLabel>年级</InputLabel>
            <Select
              value={formData.grade}
              onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
            >
              <MenuItem value="初一">初一</MenuItem>
              <MenuItem value="初二">初二</MenuItem>
              <MenuItem value="初三">初三</MenuItem>
              <MenuItem value="高一">高一</MenuItem>
              <MenuItem value="高二">高二</MenuItem>
              <MenuItem value="高三">高三</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSave} variant="contained">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TeacherDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    // 模拟加载学生数据
    setTimeout(() => {
      setStudents([
        {
          id: '1',
          name: '张三',
          email: 'zhangsan@example.com',
          grade: '高一',
          status: 'active'
        },
        {
          id: '2',
          name: '李四',
          email: 'lisi@example.com',
          grade: '高二',
          status: 'active'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setOpenStudentDialog(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setOpenStudentDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>加载中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        教师控制台
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" color="primary">
                {students.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                学生总数
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" color="primary">
                12
              </Typography>
              <Typography variant="body2" color="text.secondary">
                进行中的实验
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" color="primary">
                8
              </Typography>
              <Typography variant="body2" color="text.secondary">
                今日完成实验
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" color="primary">
                95%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                系统运行状态
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 学生管理表格 */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              学生管理
            </Typography>
            <Button variant="contained" onClick={handleAddStudent}>
              添加学生
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>学生</TableCell>
                  <TableCell>邮箱</TableCell>
                  <TableCell>年级</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {student.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>
                      <Typography color={student.status === 'active' ? 'success.main' : 'text.secondary'}>
                        {student.status === 'active' ? '活跃' : '非活跃'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditStudent(student)}
                        sx={{ mr: 1 }}
                      >
                        编辑
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <StudentDialog
        open={openStudentDialog}
        onClose={() => setOpenStudentDialog(false)}
        student={selectedStudent}
      />
    </Box>
  );
};

export default TeacherDashboard;
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed TeacherDashboard.tsx');
}

// 修复 TemplateDetail.tsx
function fixTemplateDetail() {
  const filePath = path.join(__dirname, 'frontend/src/pages/templates/TemplateDetail.tsx');
  
  const content = `import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const TemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        // 模拟API调用
        setTimeout(() => {
          setTemplate({
            id,
            name: '生物实验模板',
            description: '用于生物学科的标准实验模板',
            type: 'biology',
            difficulty: 'intermediate',
            steps: [
              '准备实验材料',
              '设置实验环境',
              '执行实验步骤',
              '记录实验数据',
              '分析实验结果'
            ],
            parameters: [
              { name: '温度', value: '25°C', description: '实验环境温度' },
              { name: '湿度', value: '60%', description: '实验环境湿度' }
            ],
            resources: {
              equipment: ['显微镜', '培养皿'],
              materials: ['试剂A', '试剂B'],
              software: ['数据分析软件']
            },
            expectedResults: '观察到细胞分裂现象，记录分裂过程数据',
            subjectParameters: [
              { name: '观察时间', value: '30分钟' },
              { name: '放大倍数', value: '400倍' }
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('加载模板失败');
        setLoading(false);
      }
    };

    if (id) {
      loadTemplate();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const savedFavorites = localStorage.getItem('templateFavorites');
      if (savedFavorites) {
        setIsFavorite(JSON.parse(savedFavorites).includes(id));
      }
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/templates');
  };

  const handleEdit = () => {
    if (id) {
      navigate(\`/templates/edit/\${id}\`);
    }
  };

  const handleUseTemplate = () => {
    if (template) {
      navigate('/experiments/create', {
        state: { template }
      });
    }
  };

  const toggleFavorite = () => {
    if (!id) return;
    
    let favorites: string[] = [];
    const savedFavorites = localStorage.getItem('templateFavorites');
    if (savedFavorites) {
      favorites = JSON.parse(savedFavorites);
      favorites = favorites.filter(favId => favId !== id);
      setIsFavorite(false);
    } else {
      favorites.push(id);
      setIsFavorite(true);
    }
    
    localStorage.setItem('templateFavorites', JSON.stringify(favorites));
  };

  const handleDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    // 执行删除逻辑
    navigate('/templates');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          返回
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!template) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          返回
        </Button>
        <Alert severity="warning" sx={{ mt: 2 }}>
          模板不存在
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
        返回模板列表
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            {template.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isFavorite ? '取消收藏' : '收藏模板'}>
              <IconButton onClick={toggleFavorite}>
                {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="编辑模板">
              <IconButton onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="分享模板">
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="删除模板">
              <IconButton onClick={() => setConfirmDeleteOpen(true)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', mb: 2 }}>
          <Chip 
            label={template.type} 
            color="primary" 
            variant="outlined" 
            size="small" 
            sx={{ mr: 1 }} 
          />
          <Chip 
            label={template.difficulty} 
            color="secondary" 
            variant="outlined" 
            size="small" 
          />
        </Box>

        <Typography variant="body1" paragraph>
          {template.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUseTemplate}
            size="large"
          >
            使用此模板
          </Button>
        </Box>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="template detail tabs">
            <Tab label="实验步骤" />
            <Tab label="参数设置" />
            <Tab label="实验资源" />
            <Tab label="预期结果" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>实验步骤</Typography>
          <List>
            {template.steps.map((step: string, index: number) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>实验参数设置</Typography>
          <Grid container spacing={2}>
            {template.parameters.map((param: any, index: number) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {param.value}
                    </Typography>
                    <Typography variant="subtitle1">
                      {param.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {param.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {template.subjectParameters && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>学科特定参数</Typography>
              <Grid container spacing={2}>
                {template.subjectParameters.map((param: any, index: number) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">
                          {param.name}
                        </Typography>
                        <Typography variant="body1" color="primary">
                          {param.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>实验资源</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                实验设备
              </Typography>
              <List dense>
                {template.resources.equipment.map((item: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                实验材料
              </Typography>
              <List dense>
                {template.resources.materials.map((item: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>
                软件工具
              </Typography>
              <List dense>
                {template.resources.software.map((item: string, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>预期实验结果</Typography>
          <Card>
            <CardContent>
              <Typography variant="body1">
                {template.expectedResults || '暂无预期结果描述'}
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default TemplateDetail;
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed TemplateDetail.tsx');
}

// 修复 TemplateDetailFixed.tsx
function fixTemplateDetailFixed() {
  const filePath = path.join(__dirname, 'frontend/src/pages/templates/TemplateDetailFixed.tsx');
  
  const content = `import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Rating,
  Badge
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  GetApp as GetAppIcon,
  History as HistoryIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box role="tabpanel" hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const TemplateDetailFixed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [isPublicShare, setIsPublicShare] = useState(false);
  const [shareUsers, setShareUsers] = useState('');
  const [userRating, setUserRating] = useState<number | null>(0);
  const [ratingComment, setRatingComment] = useState('');

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setTimeout(() => {
          setTemplate({
            id,
            name: '高级生物实验模板',
            description: '用于高级生物学科的综合实验模板',
            type: 'biology',
            difficulty: 'advanced',
            rating: 4.5,
            usageCount: 156,
            author: '张教授',
            isPublic: true,
            steps: [
              '准备实验材料和设备',
              '配置实验环境参数',
              '执行预备实验步骤',
              '进行主要实验操作',
              '记录实验数据',
              '分析实验结果',
              '撰写实验报告'
            ],
            parameters: [
              { name: '温度', value: '25±2°C', description: '实验环境控制温度' },
              { name: '湿度', value: '60±5%', description: '实验环境相对湿度' },
              { name: '光照强度', value: '2000 lux', description: '实验光照条件' }
            ],
            resources: {
              equipment: ['高级显微镜', '培养箱', '离心机', '电子天平'],
              materials: ['培养基', '试剂盒A', '试剂盒B', '载玻片'],
              software: ['数据分析软件', '图像处理工具']
            },
            expectedResults: '观察到完整的细胞分裂周期，记录各阶段详细数据，获得高质量的显微图像'
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('加载模板失败');
        setLoading(false);
      }
    };

    if (id) {
      loadTemplate();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const savedFavorites = localStorage.getItem('templateFavorites');
      if (savedFavorites) {
        try {
          const favorites: string[] = JSON.parse(savedFavorites);
          setIsFavorite(favorites.includes(id));
        } catch (error) {
          console.error('解析收藏列表失败:', error);
        }
      }
    }
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleBack = () => {
    navigate('/templates');
  };

  const handleEdit = () => {
    if (id) {
      navigate(\`/templates/edit/\${id}\`);
    }
  };

  const handleUseTemplate = () => {
    if (template) {
      navigate('/experiments/create', {
        state: { template }
      });
    }
  };

  const toggleFavorite = () => {
    if (!id) return;
    
    let favorites: string[] = [];
    const savedFavorites = localStorage.getItem('templateFavorites');
    if (savedFavorites) {
      favorites = JSON.parse(savedFavorites);
      favorites = favorites.filter(favId => favId !== id);
      setIsFavorite(false);
    } else {
      favorites.push(id);
      setIsFavorite(true);
    }
    
    localStorage.setItem('templateFavorites', JSON.stringify(favorites));
  };

  const handleDeleteConfirm = () => {
    if (id) {
      console.log('Deleting template:', id);
    }
    setConfirmDeleteOpen(false);
  };

  const handleShare = () => {
    if (!id) return;
    
    const userIds = shareUsers.split(',').map(u => u.trim()).filter(u => u);
    
    console.log('Sharing template:', {
      templateId: id,
      isPublic: isPublicShare,
      specificUsers: userIds.length > 0 ? userIds : undefined
    });
  };

  const handleRate = () => {
    if (!id || userRating === null) return;
    
    console.log('Rating template:', {
      templateId: id,
      rating: userRating,
      comment: ratingComment
    });
  };

  const handleExport = async (format: 'json' | 'pdf' | 'docx') => {
    if (!id) return;
    
    try {
      console.log(\`Exporting template \${id} as \${format}\`);
      // 模拟导出操作
    } catch (error) {
      console.error('导出模板时出错');
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string): 'success' | 'primary' | 'warning' | 'error' | 'default' => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'primary';
      case 'advanced': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          返回
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 3 }}>
        返回模板列表
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            {template.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {template.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <StarIcon color="warning" fontSize="small" />
                <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  {template.rating} ({template.usageCount} 次使用)
                </Typography>
              </Box>
            )}
            
            <Tooltip title={isFavorite ? '取消收藏' : '收藏模板'}>
              <IconButton onClick={toggleFavorite}>
                {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="编辑模板">
              <IconButton onClick={handleEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="分享模板">
              <IconButton onClick={() => setShareDialogOpen(true)}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="评分">
              <Badge badgeContent={template.rating} color="warning">
                <IconButton onClick={() => setRatingDialogOpen(true)}>
                  <StarIcon />
                </IconButton>
              </Badge>
            </Tooltip>
            <Tooltip title="导出模板">
              <IconButton onClick={() => setExportDialogOpen(true)}>
                <GetAppIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="删除模板">
              <IconButton onClick={() => setConfirmDeleteOpen(true)} color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label={template.type} 
            color="primary" 
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={getDifficultyLabel(template.difficulty)}
            color={getDifficultyColor(template.difficulty)}
            variant="outlined" 
            size="small" 
          />
          <Chip 
            label={template.author} 
            variant="outlined" 
            size="small" 
          />
          {template.isPublic && (
            <Chip 
              label="公开" 
              color="success"
              variant="filled" 
              size="small" 
            />
          )}
        </Box>

        <Typography variant="body1" paragraph>
          {template.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => setVersionDialogOpen(true)}
              size="small"
            >
              版本历史
            </Button>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUseTemplate}
            size="large"
          >
            使用
          </Button>
        </Box>
      </Paper>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="template detail tabs">
            <Tab label="实验步骤" />
            <Tab label="实验参数设置" />
            <Tab label="实验资源" />
            <Tab label="预期结果" />
            <Tab label="数据分析" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>实验步骤</Typography>
          <List>
            {template.steps.map((step: string, index: number) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckCircleIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={\`步骤 \${index + 1}\`}
                  secondary={step}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>实验参数设置</Typography>
          <Grid container spacing={2}>
            {template.parameters.map((param: any, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {param.value}
                    </Typography>
                    <Typography variant="subtitle1">
                      {param.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {param.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>实验资源</Typography>
          <Grid container spacing={3}>
            {Object.entries(template.resources).map(([category, items]: [string, any]) => (
              <Grid item xs={12} md={4} key={category}>
                <Typography variant="subtitle1" gutterBottom>
                  {category === 'equipment' ? '设备' : category === 'materials' ? '材料' : '软件'}
                </Typography>
                <List dense>
                  {items.map((item: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>预期结果</Typography>
          <Typography variant="body1" paragraph>
            {template.expectedResults || '暂无预期结果描述'}
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>数据分析</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">使用统计</Typography>
                  <Typography variant="h4" color="primary">
                    {template.usageCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    总使用次数
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">相似模板</Typography>
                  <Typography variant="body2">基于此模板的其他推荐</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>

      {/* 对话框组件 */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>分享模板</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublicShare}
                  onChange={(e) => setIsPublicShare(e.target.checked)}
                />
              }
              label="公开分享"
            />
            <TextField
              fullWidth
              label="指定用户 (逗号分隔)"
              value={shareUsers}
              onChange={(e) => setShareUsers(e.target.value)}
              sx={{ mt: 2 }}
              disabled={isPublicShare}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>取消</Button>
          <Button onClick={handleShare} variant="contained">
            确认分享
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>为模板评分</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography component="legend">请打分</Typography>
            <Rating
              value={userRating}
              onChange={(event, newValue) => setUserRating(newValue)}
              size="large"
            />
            <TextField
              fullWidth
              label="评价 (可选)"
              multiline
              rows={3}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>取消</Button>
          <Button onClick={handleRate} variant="contained">
            提交评价
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>导出模板</DialogTitle>
        <DialogContent>
          <Typography>选择导出格式:</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleExport('json')}>JSON</Button>
          <Button onClick={() => handleExport('pdf')}>PDF</Button>
          <Button onClick={() => handleExport('docx')}>Word</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={versionDialogOpen} onClose={() => setVersionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>版本历史</DialogTitle>
        <DialogContent>
          <Typography>版本历史记录将在此显示</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVersionDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateDetailFixed;
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed TemplateDetailFixed.tsx');
}

// 执行所有修复
console.log('Starting critical batch 5 fixes...');
fixSimpleSettings();
fixSimpleSettingsTest();
fixTeacherDashboard();
fixTemplateDetail();
fixTemplateDetailFixed();
console.log('Critical batch 5 fixes completed!');
