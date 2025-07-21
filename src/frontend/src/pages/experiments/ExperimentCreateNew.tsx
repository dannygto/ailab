import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import experimentService from '../../services/experimentService';

const ExperimentCreateNew: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('custom');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await experimentService.createExperiment({ title, description, type });
      if (res.success && res.data) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/experiments/${res.data.id}`);
        }, 800);
      } else {
        setError(res.message || '实验创建失败');
      }
    } catch (err: any) {
      setError('实验创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        创建新实验
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="实验名称"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="实验描述"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            required
            margin="normal"
            multiline
            minRows={3}
          />
          <TextField
            label="实验类型"
            value={type}
            onChange={e => setType(e.target.value)}
            fullWidth
            margin="normal"
            helperText="如 custom, physics, chemistry, biology 等"
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : '创建实验'}
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>实验创建成功，正在跳转...</Alert>}
        </form>
      </Paper>
    </Box>
  );
};

export default ExperimentCreateNew;
