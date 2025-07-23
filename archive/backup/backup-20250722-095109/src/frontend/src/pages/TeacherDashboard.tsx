import React, { useState, useEffect } from 'react';
import { PersonIcon, EditIcon, DeleteIcon } from '../utils/icons';
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
;

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
    // console.log removed
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

