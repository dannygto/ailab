import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  Divider,
  Chip,
  Skeleton,
  IconButton,
  Tooltip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshIcon } from '../../utils/icons';
import { EditIcon } from '../../utils/icons';
import { PlayArrowIcon } from '../../utils/icons';
import { PauseIcon } from '../../utils/icons';
import { StopIcon } from '../../utils/icons';
import { DeleteIcon } from '../../utils/icons';
import { ArrowBackIcon } from '../../utils/icons';
import { toast } from 'react-hot-toast';

// ����������
import { Button, ButtonType } from '../../components/core/atoms/Button';
import { Card } from '../../components/core/atoms/Card';
import ExperimentMonitor from '../../components/monitoring/ExperimentMonitor'; // ����ʵ�������

// ������������
import { experimentService } from '../../services';
import { Experiment, ExperimentType, ExperimentStatus } from '../../types';

// ���볣��
import { experimentStatusMap } from '../../constants/experimentStatus';

/**
 * ʵ������ҳ�� - �ع���V2
 * 
 * ʹ���µ������ʵ�ֵ�ʵ������ҳ�棬���и��õ����Ͱ�ȫ�Ժ������Ż�
 */
const ExperimentDetailV2: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // ״̬����
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // ��ȡʵ������
  const fetchExperiment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await experimentService.getExperiment(id);
      
      if (response.success && response.data) {
        // ����ת��ȷ�����ݷ���Experiment�ӿ�
        const expData = response.data;
        const convertedExperiment: Experiment = {
          id: expData.id,
          name: expData.title || expData.name || '',
          type: expData.type as ExperimentType,
          status: expData.status as ExperimentStatus,
          description: expData.description || '',
          userId: expData.createdBy || expData.userId || '',
          createdAt: new Date(expData.createdAt),
          updatedAt: new Date(expData.updatedAt),
          parameters: expData.parameters || {},
          data: expData.data || {},
          results: expData.results || {},
          metadata: expData.metadata || {}
        };
        
        setExperiment(convertedExperiment);
      } else {
        throw new Error(response.error || '��ȡʵ������ʧ��');
      }
    } catch (err) {
      console.error('��ȡʵ������ʧ��:', err);
      setError('��ȡʵ������ʧ�ܣ����Ժ�����');
      toast.error('��ȡʵ������ʧ�ܣ����Ժ�����');
      
      // ����ģ�������Ա�չʾUI
      const mockExperiment: Experiment = {
        id: id || '1',
        name: 'ͼ�����ʵ�� #' + (id || '12345').substring(0, 5),
        description: 'ʹ��CNN��MNIST���ݼ�����ͼ������ʵ��',
        type: 'measurement',
        status: 'completed',
        userId: 'user123',
        createdAt: new Date(),
        updatedAt: new Date(),
        parameters: {
          modelType: 'CNN',
          batchSize: 64,
          learningRate: 0.001,
          epochs: 10,
          optimizer: 'Adam',
          lossFunction: 'categorical_crossentropy',
          metrics: ['accuracy']
        },
        data: {
          datasetId: 'mnist',
          datasetSize: 70000,
          trainSplit: 0.8,
          valSplit: 0.1,
          testSplit: 0.1,
          inputShape: [28, 28, 1],
          numClasses: 10
        },
        results: {
          accuracy: 0.95,
          loss: 0.11,
          precision: 0.94,
          recall: 0.93,
          f1Score: 0.935,
        },
        metadata: {
          tags: ['ͼ�����', 'CNN', 'MNIST'],
          author: '�Ž���',
          framework: 'TensorFlow',
          hardware: 'GPU',
          environment: 'Python 3.8, TensorFlow 2.4'
        }
      };
      
      setExperiment(mockExperiment);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ��ʼ����
  useEffect(() => {
    fetchExperiment();
  }, [fetchExperiment]);
  
  // ������ǩҳ�仯
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // ����ˢ��
  const handleRefreshIcon = () => {
    fetchExperiment();
  };
  
  // �����༭
  const handleEdit = () => {
    if (experiment) {
      navigate(`/experiments/edit/${experiment.id}`);
    }
  };
  
  // ��������ʵ��
  const handleStart = async () => {
    if (!experiment) return;
    
    setActionLoading('start');
    try {
      // ����api����ʵ��
      const response = await experimentService.startExperiment(experiment.id);
      
      if (response.success) {
        // ���±���״̬
        setExperiment(prev => {
          if (!prev) return null;
          return { ...prev, status: 'running' as ExperimentStatus };
        });
        
        toast.success('ʵ���ѳɹ�����');
        // ˢ��ʵ�������Ի�ȡ����״̬
        fetchExperiment();
      } else {
        throw new Error(response.error || '����ʵ��ʧ��');
      }
    } catch (error: any) {
      console.error('����ʵ��ʧ��:', error);
      toast.error(`����ʵ��ʧ��: ${error?.message || 'δ֪����'}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  // ������ͣʵ��
  const handlePauseIcon = async () => {
    if (!experiment) return;
    
    setActionLoading('pause');
    try {
      // ����api��û��ֱ�ӵ���ͣ����������ͨ������ʵ��״̬ʵ��
      const response = await experimentService.updateExperiment(experiment.id, {
        status: 'paused'
      });
      
      if (response.success) {
        // ���±���״̬
        setExperiment(prev => {
          if (!prev) return null;
          return { ...prev, status: 'paused' as ExperimentStatus };
        });
        
        toast.success('ʵ���ѳɹ���ͣ');
        // ˢ��ʵ�������Ի�ȡ����״̬
        fetchExperiment();
      } else {
        throw new Error(response.error || '��ͣʵ��ʧ��');
      }
    } catch (error: any) {
      console.error('��ͣʵ��ʧ��:', error);
      toast.error(`��ͣʵ��ʧ��: ${error?.message || 'δ֪����'}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  // ����ֹͣʵ��
  const handleStopIcon = async () => {
    if (!experiment) return;
    
    setActionLoading('stop');
    try {
      // ����apiֹͣʵ��
      const response = await experimentService.stopExperiment(experiment.id);
      
      if (response.success) {
        // ���±���״̬
        setExperiment(prev => {
          if (!prev) return null;
          return { ...prev, status: 'StopIconped' as ExperimentStatus };
        });
        
        toast.success('ʵ���ѳɹ�ֹͣ');
        // ˢ��ʵ�������Ի�ȡ����״̬
        fetchExperiment();
      } else {
        throw new Error(response.error || 'ֹͣʵ��ʧ��');
      }
    } catch (error: any) {
      console.error('ֹͣʵ��ʧ��:', error);
      toast.error(`ֹͣʵ��ʧ��: ${error?.message || 'δ֪����'}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  // ����ɾ��ʵ��
  const handleDelete = async () => {
    if (!experiment) return;
    
    if (!window.confirm('ȷ��Ҫɾ����ʵ���𣿴˲������ɻָ���')) {
      return;
    }
    
    setActionLoading('delete');
    try {
      // ����apiɾ��ʵ��
      const response = await experimentService.deleteExperiment(experiment.id);
      
      if (response.success) {
        toast.success('ʵ���ѳɹ�ɾ��');
        navigate('/experiments');
      } else {
        throw new Error(response.error || 'ɾ��ʵ��ʧ��');
      }
    } catch (error: any) {
      console.error('ɾ��ʵ��ʧ��:', error);
      toast.error(`ɾ��ʵ��ʧ��: ${error?.message || 'δ֪����'}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  // ��������
  const handleBack = () => {
    navigate('/experiments');
  };
  
  // ����ʵ�����
  const handleExperimentControl = async (action: 'start' | 'pause' | 'stop', experimentId: string) => {
    setActionLoading(action);
    try {
      let response;
      
      switch (action) {
        case 'start':
          response = await experimentService.startExperiment(experimentId);
          break;
        case 'pause':
          response = await experimentService.updateExperiment(experimentId, { status: 'paused' });
          break;
        case 'stop':
          response = await experimentService.stopExperiment(experimentId);
          break;
      }
      
      if (response && response.success) {
        // ���±���״̬
        setExperiment(prev => {
          if (!prev) return null;
          
          const newStatus = action === 'start' ? 'running' : 
                          action === 'pause' ? 'paused' : 
                          'StopIconped';
          
          return { ...prev, status: newStatus as ExperimentStatus };
        });
        
        toast.success(`ʵ���ѳɹ�${action === 'start' ? '����' : action === 'pause' ? '��ͣ' : 'ֹͣ'}`);
        // ˢ��ʵ�������Ի�ȡ����״̬
        fetchExperiment();
      } else {
        throw new Error(response?.error || `${action}ʵ��ʧ��`);
      }
    } catch (error: any) {
      console.error(`${action}ʵ��ʧ��:`, error);
      toast.error(`${action === 'start' ? '����' : action === 'pause' ? '��ͣ' : 'ֹͣ'}ʵ��ʧ��: ${error?.message || 'δ֪����'}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  // ��ȡ״̬��ɫ�ͱ�ǩ
  const getStatusInfo = (status: ExperimentStatus) => {
    // ���״̬�Ƿ���experimentStatusMap�У���������򷵻�Ĭ��ֵ
    return experimentStatusMap[status as keyof typeof experimentStatusMap] || { label: status, color: 'default' };
  };
  
  // ��Ⱦ����״̬
  if (loading) {
    return (
      <div sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </div>
    );
  }
  
  // ��Ⱦ����״̬
  if (error && !experiment) {
    return (
      <div sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          buttonType={ButtonType.PRIMARY}
          onClick={handleRefreshIcon}
          startIcon={<RefreshIcon />}
        >
          ����
        </Button>
      </div>
    );
  }
  
  // ʵ�鲻����
  if (!experiment) {
    return (
      <div sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          ʵ�鲻���ڻ��ѱ�ɾ��
        </Alert>
        <Button 
          buttonType={ButtonType.PRIMARY}
          onClick={handleBack}
          startIcon={<ArrowBackIcon />}
        >
          ����ʵ���б�
        </Button>
      </div>
    );
  }

  // ��Ⱦʵ������
  return (
    <div sx={{ p: 3 }}>
      {/* ʵ��ͷ����Ϣ */}
      <Card sx={{ mb: 3 }}>
        <div sx={{ p: 2 }}>
          <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <div sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handleBack}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4">{experiment.name}</Typography>
              <Chip 
                label={getStatusInfo(experiment.status).label} 
                color={getStatusInfo(experiment.status).color as any} 
                size="medium"
              />
            </div>
            <div sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="ˢ��">
                <IconButton onClick={handleRefreshIcon} disabled={!!actionLoading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button 
                buttonType={ButtonType.SECONDARY}
                onClick={handleEdit}
                startIcon={<EditIcon />}
                disabled={!!actionLoading}
              >
                �༭
              </Button>
              {experiment.status === 'draft' || experiment.status === 'ready' || experiment.status === 'paused' ? (
                <Button 
                  buttonType={ButtonType.PRIMARY}
                  onClick={handleStart}
                  startIcon={actionLoading === 'start' ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'start' ? '������...' : '����'}
                </Button>
              ) : null}
              {experiment.status === 'running' ? (
                <Button 
                  buttonType={ButtonType.WARNING}
                  onClick={handlePauseIcon}
                  startIcon={actionLoading === 'pause' ? <CircularProgress size={16} color="inherit" /> : <PauseIcon />}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'pause' ? '��ͣ��...' : '��ͣ'}
                </Button>
              ) : null}
              {experiment.status === 'running' || experiment.status === 'paused' ? (
                <Button 
                  buttonType={ButtonType.DANGER}
                  onClick={handleStopIcon}
                  startIcon={actionLoading === 'stop' ? <CircularProgress size={16} color="inherit" /> : <StopIcon />}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'stop' ? 'ֹͣ��...' : 'ֹͣ'}
                </Button>
              ) : null}
              <Button 
                buttonType={ButtonType.DANGER}
                onClick={handleDelete}
                startIcon={actionLoading === 'delete' ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                disabled={!!actionLoading}
              >
                {actionLoading === 'delete' ? 'ɾ����...' : 'ɾ��'}
              </Button>
            </div>
          </div>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1"><strong>������</strong> {experiment.description}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body1"><strong>���ͣ�</strong> {experiment.type}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body1"><strong>����ʱ�䣺</strong> {experiment.createdAt.toLocaleString('zh-CN')}</Typography>
            </Grid>
          </Grid>
        </div>
      </Card>
      
      {/* ʵ��ִ�м����� */}
      {(experiment.status === 'running' || experiment.status === 'paused') && (
        <ExperimentMonitor 
          experiment={experiment}
          onControl={handleExperimentControl}
          RefreshIconInterval={5000}
          autoRefreshIcon={experiment.status === 'running'}
        />
      )}
      
      {/* ʵ�����ݱ�ǩҳ */}
      <Card>
        <div sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="ʵ�������ǩҳ">
            <Tab label="������Ϣ" id="tab-0" aria-controls="tabpanel-0" />
            <Tab label="��������" id="tab-1" aria-controls="tabpanel-1" />
            <Tab label="���ݷ���" id="tab-2" aria-controls="tabpanel-2" />
            <Tab label="ʵ����" id="tab-3" aria-controls="tabpanel-3" />
            <Tab label="��־��¼" id="tab-4" aria-controls="tabpanel-4" />
          </Tabs>
        </div>
        
        {/* ������Ϣ��� */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>������Ϣ</Typography>
              <div sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1"><strong>ʵ��ID��</strong> {experiment.id}</Typography>
                <Typography variant="body1"><strong>ʵ�����ƣ�</strong> {experiment.name}</Typography>
                <Typography variant="body1"><strong>ʵ�����ͣ�</strong> {experiment.type}</Typography>
                <Typography variant="body1"><strong>ʵ��״̬��</strong> {getStatusInfo(experiment.status).label}</Typography>
                <Typography variant="body1"><strong>�����ˣ�</strong> {experiment.userId}</Typography>
                <Typography variant="body1"><strong>����ʱ�䣺</strong> {experiment.createdAt.toLocaleString('zh-CN')}</Typography>
                <Typography variant="body1"><strong>����ʱ�䣺</strong> {experiment.updatedAt.toLocaleString('zh-CN')}</Typography>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Ԫ����</Typography>
              {experiment.metadata && Object.keys(experiment.metadata).length > 0 ? (
                <div sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(experiment.metadata).map(([key, value]) => (
                    <Typography key={key} variant="body1">
                      <strong>{key}��</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
                    </Typography>
                  ))}
                </div>
              ) : (
                <Typography variant="body1">��Ԫ����</Typography>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* ����������� */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>��������</Typography>
          {experiment.parameters && Object.keys(experiment.parameters).length > 0 ? (
            <div sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(experiment.parameters).map(([key, value]) => (
                <Typography key={key} variant="body1">
                  <strong>{key}��</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
                </Typography>
              ))}
            </div>
          ) : (
            <Typography variant="body1">�޲�������</Typography>
          )}
        </TabPanel>
        
        {/* ���ݷ������ */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>���ݷ���</Typography>
          {experiment.data && Object.keys(experiment.data).length > 0 ? (
            <div sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(experiment.data).map(([key, value]) => (
                <Typography key={key} variant="body1">
                  <strong>{key}��</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
                </Typography>
              ))}
            </div>
          ) : (
            <Typography variant="body1">�����ݷ���</Typography>
          )}
        </TabPanel>
        
        {/* ʵ������� */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>ʵ����</Typography>
          {experiment.results && Object.keys(experiment.results).length > 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <div sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(experiment.results).map(([key, value]) => (
                    <Typography key={key} variant="body1">
                      <strong>{key}��</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
                    </Typography>
                  ))}
                </div>
              </Grid>
              <Grid item xs={12} md={6}>
                {/* �򵥵Ľ�����ӻ� */}
                <div sx={{ 
                  border: '1px solid #eee', 
                  borderRadius: 1, 
                  p: 2, 
                  bgcolor: '#f9f9f9',
                  height: '250px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="subtitle1" align="center">ʵ�������ӻ�</Typography>
                  <div sx={{ display: 'flex', height: '200px', alignItems: 'flex-end' }}>
                    {Object.entries(experiment.results)
                      .filter(([key, value]) => typeof value === 'number' && !isNaN(Number(value)))
                      .slice(0, 5)
                      .map(([key, value], index) => {
                        const numValue = Number(value);
                        // ��ֵ��һ����0-100֮��������ʾ
                        const normalizedHeight = Math.min(Math.max(numValue * 100, 10), 200);
                        return (
                          <div 
                            key={key}
                            sx={{
                              flex: 1,
                              mx: 1,
                              height: `${normalizedHeight}px`,
                              bgcolor: `${['primary.main', 'secondary.main', 'success.main', 'info.main', 'warning.main'][index % 5]}`,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              color: 'white',
                              fontSize: '0.75rem',
                              p: 1,
                              borderRadius: '4px 4px 0 0'
                            }}
                          >
                            <Typography variant="caption" color="white" noWrap title={String(numValue)}>
                              {numValue.toFixed(2)}
                            </Typography>
                          </div>
                        );
                      })}
                  </div>
                  <div sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    {Object.entries(experiment.results)
                      .filter(([key, value]) => typeof value === 'number' && !isNaN(Number(value)))
                      .slice(0, 5)
                      .map(([key]) => (
                        <Typography key={key} variant="caption" sx={{ flex: 1, textAlign: 'center', fontSize: '0.7rem' }} noWrap title={key}>
                          {key}
                        </Typography>
                      ))}
                  </div>
                </div>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body1">��ʵ����</Typography>
          )}
        </TabPanel>
        
        {/* ��־��¼��� */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>��־��¼</Typography>
          {experiment.status === 'running' || experiment.status === 'paused' || experiment.status === 'completed' ? (
            <div sx={{ mt: 2 }}>
              <ExperimentMonitor 
                experiment={experiment}
                onControl={handleExperimentControl}
                RefreshIconInterval={10000}
                autoRefreshIcon={experiment.status === 'running'}
              />
            </div>
          ) : (
            <Typography variant="body1">��ǰʵ��δ������û�п��õ���־��¼</Typography>
          )}
        </TabPanel>
      </Card>
    </div>
  );
};

// ��ǩҳ������
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ padding: '16px' }}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

export default ExperimentDetailV2;


