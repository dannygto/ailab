import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Experiment } from '../../types';
import { toast } from 'react-hot-toast';
import ExperimentMonitor from '../../components/monitoring/ExperimentMonitor';

// �����ֺ�����
import ExperimentStatusPanel from './components/ExperimentStatusPanel';
import ExperimentInfoPanel from './components/ExperimentInfoPanel';
import ExperimentTabPanel from './components/ExperimentTabPanel';
import ExperimentHeader from './components/ExperimentHeader';
import ExperimentDataPanel from 'ExperimentDataPanel';
import ExperimentResultPanel from './components/ExperimentResultPanel';
import ExperimentLogPanel from './components/ExperimentLogPanel';

// ����ͳ�ƺͿ��ӻ����
import ExperimentStatistics from '../../components/domain/experiments/ExperimentStatistics';
import ExperimentDataVisualization from '../../components/domain/experiments/ExperimentDataVisualization';

const ExperimentDetail: React.FC = () => {  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // ��ȡʵ������
  useEffect(() => {
    fetchExperiment();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const fetchExperiment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    
    try {
      // ʵ����Ŀ��Ӧ��api��ȡ����
      // const response = await apiService.get(`/experiments/${id}`);
      // setExperiment(response.data);
      
      // ģ������
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setExperiment({
        id: id,
        name: 'ͼ�����ʵ�� #' + id.substring(0, 5),
        description: 'ʹ��CNN��MNIST���ݼ�����ͼ������ʵ��',
        type: 'measurement',
        status: Math.random() > 0.7 ? 'running' : 'completed',
        userId: 'user123',
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
          confusionMatrix: [
            [980, 0, 1, 0, 0, 3, 1, 2, 1, 1],
            [0, 1130, 3, 0, 0, 1, 0, 1, 0, 0],
            [0, 0, 1026, 1, 0, 0, 0, 5, 0, 0],
            [0, 0, 0, 1001, 0, 3, 0, 3, 3, 0],
            [0, 0, 0, 0, 978, 0, 1, 0, 0, 3],
            [1, 0, 0, 5, 0, 883, 2, 0, 1, 0],
            [3, 1, 0, 0, 1, 5, 947, 0, 1, 0],
            [0, 2, 6, 0, 0, 0, 0, 1019, 0, 1],
            [0, 0, 0, 1, 0, 2, 0, 0, 972, 0],
            [0, 1, 0, 2, 5, 3, 0, 4, 3, 991]
          ],
          trainingHistory: {
            loss: [2.3, 1.9, 1.5, 1.1, 0.9, 0.7, 0.5, 0.3, 0.2, 0.11],
            accuracy: [0.1, 0.3, 0.5, 0.7, 0.8, 0.85, 0.9, 0.92, 0.94, 0.95],
            valLoss: [2.4, 2.0, 1.6, 1.2, 1.0, 0.8, 0.6, 0.4, 0.3, 0.2],
            valAccuracy: [0.1, 0.25, 0.45, 0.65, 0.75, 0.8, 0.85, 0.9, 0.92, 0.93],
            epochs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          },
          report: {
            summary: "���ʵ����MNIST���ݼ���ȡ���˺ܺõĽ��������׼ȷ�ʴﵽ95%��ģ���ڴ������������ϱ������ã�ֻ������5������8������������ࡣ",
            keyFindings: [
              "ģ�Ͷ�����1������7��ʶ��Ч����ã�׼ȷ�ʳ���99%",
              "����5��ʶ������ͣ���Ҫ������3������8����",
              "������ԣ�ģ�ͷ����������ã���֤��׼ȷ�ʽӽ�ѵ����"
            ],
            recommendations: [
              "���Գ�������������ǿ����߶�����5��ʶ������",
              "ģ�ʹ�С���Խ�һ���Ż������ٲ�����",
              "����ʹ��ѧϰ�ʵ��Ȳ��Կ��ܻ�ø��õ�����Ч��"
            ]
          }
        },
        metadata: {
          progress: Math.random(),
          device: 'GPU',
          framework: 'TensorFlow',
          tags: ['classification', 'CNN', 'MNIST'],
          logs: Array.from({ length: 20 }, (_, i) => ({
            timestamp: new Date(Date.now() - (20 - i) * 60000),
            level: ['info', 'warning', 'error', 'debug'][Math.floor(Math.random() * 3)] as 'info' | 'warning' | 'error' | 'debug',
            message: `Epoch ${Math.floor(i/2) + 1}: training loss: ${(2.0 - i*0.1).toFixed(2)}, accuracy: ${(0.5 + i*0.025).toFixed(2)}`
          }))
        },
        createdAt: new Date(Date.now() - 7200000), // 2Сʱǰ
        updatedAt: new Date(Date.now() - 3600000), // 1Сʱǰ
        startedAt: new Date(Date.now() - 3600000) // 1Сʱǰ
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ������ǩҳ�л�
  const handleTabChange = (_Event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // ����ʵ�����
  const handleAction = async (action: 'start' | 'pause' | 'stop' | 'delete' | 'edit' | 'refresh' | 'share' | 'report') => {
    if (!experiment || !id) return;
    setActionLoading(action);
    
    try {
      switch (action) {
        case 'start':
          // ʵ����Ŀ��Ӧ����api
          // await apiService.post(`/experiments/${id}/start`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setExperiment({
            ...experiment,
            status: 'running',
            startedAt: new Date(),
            updatedAt: new Date()
          });
          
          toast.success('ʵ��������');
          break;
          
        case 'pause':
          // ʵ����Ŀ��Ӧ����api
          // await apiService.post(`/experiments/${id}/pause`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setExperiment({
            ...experiment,
            status: 'paused',
            updatedAt: new Date()
          });
          
          toast.success('ʵ������ͣ');
          break;
          
        case 'stop':
          // ʵ����Ŀ��Ӧ����api
          // await apiService.post(`/experiments/${id}/stop`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setExperiment({
            ...experiment,
            status: 'stopped',
            updatedAt: new Date()
          });
          
          toast.success('ʵ����ֹͣ');
          break;
          
        case 'delete':
          // ʵ����Ŀ��Ӧ����api
          // await apiService.delete(`/experiments/${id}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          toast.success('ʵ����ɾ��');
          navigate('/experiments');
          return; // ��������actionLoading
          
        case 'edit':
          navigate(`/experiments/edit/${id}`);
          break;
          
        case 'refresh':
          await fetchExperiment();
          toast.success('ʵ��������ˢ��');
          break;
          
        case 'share':
          toast.success('�������ܿ�����');
          break;
          
        case 'report':
          toast.success('���湦�ܿ�����');
          break;
      }
    } catch (error) {
      toast.error(`${action === 'start' ? '����' : 
                  action === 'pause' ? '��ͣ' : 
                  action === 'stop' ? 'ֹͣ' : 
                  action === 'delete' ? 'ɾ��' : 
                  action === 'refresh' ? 'ˢ��' : 
                  action === 'share' ? '����' : 
                  action === 'report' ? '��������' : 
                  '����'}ʧ��`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!experiment) {
    return (
      <div sx={{ p: 3 }}>
        <Alert severity="error">
          δ�ҵ�ʵ������
        </Alert>
      </div>
    );
  }

  return (
    <div sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, pb: 5 }}>
      {/* ʵ������ͷ����Ϣ */}
      <ExperimentHeader experiment={experiment} />
      
      {/* ʵ��״̬�Ͳ�����ť */}
      <ExperimentStatusPanel 
        experiment={experiment}
        onAction={handleAction}
        actionLoading={actionLoading}
      />
        {/* ʵ�����������������״̬��ʾ�� */}
      {experiment.status === 'running' && (
        <ExperimentMonitor 
          experiment={experiment}
        />
      )}
      
      {/* ʵ����ϸ��Ϣ��� */}
      <ExperimentInfoPanel experiment={experiment} />
      
      {/* ��ǩҳ���� */}
      <Paper sx={{ mb: 4 }}>
        <div sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="����" />
            <Tab label="���ݼ�" />
            <Tab label="���ݷ���" />
            <Tab label="���" />
            <Tab label="ͳ��" />
            <Tab label="��־" />
          </Tabs>
        </div>
        
        <ExperimentTabPanel value={tabValue} index={0}>
          <div>
            {/* �������� - ��������Է���ʵ��Ļ�����Ϣ�������� */}
          </div>
        </ExperimentTabPanel>
        
        <ExperimentTabPanel value={tabValue} index={1}>
          <ExperimentDataPanel experiment={experiment} />
        </ExperimentTabPanel>
        
        <ExperimentTabPanel value={tabValue} index={2}>
          <div sx={{ py: 2 }}>
            <ExperimentDataVisualization 
              experimentId={parseInt(experiment.id) || 0}
              defaultChartType="line"
              allowExport={true}
            />
          </div>
        </ExperimentTabPanel>
        
        <ExperimentTabPanel value={tabValue} index={3}>
          <ExperimentResultPanel experiment={experiment} />
        </ExperimentTabPanel>
        
        <ExperimentTabPanel value={tabValue} index={4}>
          <div sx={{ py: 2 }}>
            <ExperimentStatistics 
              experimentId={Number(experiment.id)}
              experimentType={experiment.type}
              defaultTimeRange="90d"
            />
          </div>
        </ExperimentTabPanel>
        
        <ExperimentTabPanel value={tabValue} index={5}>
          <ExperimentLogPanel experiment={experiment} loading={loading} />
        </ExperimentTabPanel>
      </Paper>
    </div>
  );
};

export default ExperimentDetail;

