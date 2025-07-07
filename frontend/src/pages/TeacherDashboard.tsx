import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { AddIcon as AddIcon, EditIcon as EditIcon, DeleteIcon as DeleteIcon } from '../utils/icons';

// ѧ����������
interface Student {
  id: string;
  name: string;
  grade: string;
  class: string;
  email: string;
  status: 'active' | 'inactive';
  joinDate: string;
  completedExperiments: number;
}

// �༶��������
interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  studentCount: number;
  teacher: string;
}

const TeacherDashboard: React.FC = () => {  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // ģ�����ݼ���
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: '1',
        name: '��С��',
        grade: '����',
        class: '����(3)��',
        email: 'zhangxm@example.com',
        status: 'active',
        joinDate: '2024-09-01',
        completedExperiments: 5
      },
      {
        id: '2',
        name: '��С��',
        grade: '����',
        class: '����(3)��',
        email: 'lixh@example.com',
        status: 'active',
        joinDate: '2024-09-01',
        completedExperiments: 7
      },
      {
        id: '3',
        name: '��С��',
        grade: '����',
        class: '����(3)��',
        email: 'wangxg@example.com',
        status: 'active',
        joinDate: '2024-09-01',
        completedExperiments: 3
      }
    ];

    const mockClasses: ClassInfo[] = [
      {
        id: '1',
        name: '����(3)��',
        grade: '����',
        studentCount: 32,
        teacher: '����ʦ'
      },
      {
        id: '2',
        name: '����(4)��',
        grade: '����',
        studentCount: 30,
        teacher: '����ʦ'
      }
    ];

    setTimeout(() => {
      setStudents(mockStudents);
      setClasses(mockClasses);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setOpenStudentDialog(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setOpenStudentDialog(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const handleSaveStudent = (studentData: Partial<Student>) => {
    if (editingStudent) {
      // �༭ѧ��
      setStudents(prev => prev.map(s => 
        s.id === editingStudent.id 
          ? { ...s, ...studentData }
          : s
      ));
    } else {
      // ������ѧ��
      const newStudent: Student = {
        id: Date.now().toString(),
        name: studentData.name || '',
        grade: studentData.grade || '',
        class: studentData.class || '',
        email: studentData.EmailIcon|| '',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        completedExperiments: 0
      };
      setStudents(prev => [...prev, newStudent]);
    }
    setOpenStudentDialog(false);
  };

  if (loading) {
    return (
      <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography>������...</Typography>
      </div>
    );
  }

  return (
    <div sx={{ padding: 3 }}>
      {/* ҳ����� */}
      <Typography variant="h4" gutterBottom>
        ��ʦ����̨
      </Typography>
      
      {/* ������Ƭ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                �����༶
              </Typography>
              <Typography variant="h5" component="div">
                {classes.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                ѧ������
              </Typography>
              <Typography variant="h5" component="div">
                {students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                ��Ծѧ��
              </Typography>
              <Typography variant="h5" component="div">
                {students.filter(s => s.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                ���ʵ��
              </Typography>
              <Typography variant="h5" component="div">
                {students.reduce((sum, s) => sum + s.completedExperiments, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ѧ���������� */}
      <Card>
        <CardContent>
          <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              ѧ������
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddStudent}
            >
              ����ѧ��
            </Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ѧ��</TableCell>
                  <TableCell>�༶</TableCell>
                  <TableCell>����</TableCell>
                  <TableCell>״̬</TableCell>
                  <TableCell>���ʵ��</TableCell>
                  <TableCell>����ʱ��</TableCell>
                  <TableCell>����</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {student.name.charAt(0)}
                        </Avatar>
                        <div>
                          <Typography variant="subtitle2">
                            {student.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {student.grade}
                          </Typography>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.EmailIcon}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.status === 'active' ? '��Ծ' : '����Ծ'}
                        color={student.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{student.completedExperiments}</TableCell>
                    <TableCell>{student.joinDate}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditStudent(student)}
                        sx={{ mr: 1 }}
                      >
                        �༭
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        ɾ��
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ѧ���༭�Ի��� */}
      <StudentDialog
        open={openStudentDialog}
        onClose={() => setOpenStudentDialog(false)}
        onSave={handleSaveStudent}
        student={editingStudent}
      />
    </div>
  );
};

// ѧ���༭�Ի������
interface StudentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: Partial<Student>) => void;
  student: Student | null;
}

const StudentDialog: React.FC<StudentDialogProps> = ({ open, onClose, onSave, student }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    class: '',
    email: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        grade: student.grade,
        class: student.class,
        email: student.EmailIcon});
    } else {
      setFormData({
        name: '',
        grade: '',
        class: '',
        email: ''
      });
    }
  }, [student, open]);

  const handleSubmit = () => {
    if (!formData.name || !formData.EmailIcon) {
      return;
    }
    onSave(formData);
  };
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="student-dialog-title"
      aria-describedby="student-dialog-description"
    >
      <DialogTitle id="student-dialog-title">
        {student ? '�༭ѧ��' : '����ѧ��'}
      </DialogTitle>
      <DialogContent id="student-dialog-description">
        <div sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="����"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>�꼶</InputLabel>
            <Select
              value={formData.grade}
              onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              label="�꼶"
            >
              <MenuItem value="��һ">��һ</MenuItem>
              <MenuItem value="����">����</MenuItem>
              <MenuItem value="����">����</MenuItem>
              <MenuItem value="��һ">��һ</MenuItem>
              <MenuItem value="�߶�">�߶�</MenuItem>
              <MenuItem value="����">����</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="�༶"
            value={formData.class}
            onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="����"
            type="email"
            value={formData.EmailIcon}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            margin="normal"
            required
          />
        </div>
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

export default TeacherDashboard;

