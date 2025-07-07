import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Link, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ������֤
    if (formData.password !== formData.confirmPassword) {
      setError('������������벻һ��');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('���볤�Ȳ�������6���ַ�');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // ����ģʽ��ģ��ע��ɹ�
      // ʵ����������Ӧ�õ��� api �������ע��
      
      // �ӳ�ģ��ע�����
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ģ��ע��ɹ�
      localStorage.setItem('tempRegisteredemail', formData.EmailIcon);
      
      // ��ʾ�ɹ���Ϣ����ת����¼ҳ��
      toast.success('ע��ɹ������¼');
      navigate('/login');
    } catch (error: any) {
      setError(error.message || 'ע��ʧ�ܣ����Ժ�����');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >        <div sx={{ textAlign: 'center', mb: 3 }}>          <img 
            src="/logo18060.png?v=1" 
            alt="SSLAB-AI����ʵ��ƽ̨"
            style={{ maxWidth: '180px', marginBottom: '16px' }}
          />
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            �˻�ע��
          </Typography>
        </div>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="����"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="����"
            type="email"
            value={formData.EmailIcon}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="����"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="ȷ������"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            margin="normal"
            required
          />          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'ע��'}
          </Button>
        </form>
        
        <Typography align="center">
          �����˺ţ�{' '}
          <Link href="/login" underline="hover">
            ������¼
          </Link>
        </Typography>
      </Paper>
    </div>
  );
};

export default Register; 
