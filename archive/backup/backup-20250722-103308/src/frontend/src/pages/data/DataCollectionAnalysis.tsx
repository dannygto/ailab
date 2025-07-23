import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Alert,
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

import { PlayArrowIcon as PlayIcon, RefreshIcon, DataUsageIcon, AnalyticsIcon, CloudIcon as AccountCircleIcon, ErrorIcon, WarningIcon, CloudUploadIcon, SettingsIcon } from '../../utils/icons';

import { ExperimentType } from '../../types';

// ����Դ�ӿ�
interface DataSource {
  id: string;
  name: string;
  type: 'sensor' | 'camera' | 'microphone' | 'file' | 'api';
  experimentType: ExperimentType;
  status: 'active' | 'inactive' | 'error';
  lastCollection: string;
  interval: number;
  description: string;
  parameters?: Record<string, any>;
}

// �����ռ�����ӿ�
interface DataCollectionTask {
  id: string;
  name: string;
  dataSourceType: string;
  experimentType: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  progress?: number;
}

// ���ݷ����ӿ�
interface DataAnalysis {
  id: string;
  name: string;
  analysisType: string;
  dataSource: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  progress?: number;
  results?: any;
}

// Tab������
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// ģ������Դ
const mockDataSources: DataSource[] = [
  {
    id: 'ds-001',
    name: '����ʵ�鴫����',
    type: 'sensor',
    experimentType: 'observation',
    status: 'active',
    lastCollection: '2025-06-21T10:30:00Z',
    interval: 5,
    description: '����ʵ�����е���ѧ���������ݲɼ�'
  },
  {
    id: 'ds-002',
    name: '��ѧpH������',
    type: 'sensor',
    experimentType: 'measurement',
    status: 'active',
    lastCollection: '2025-06-21T10:25:00Z',
    interval: 10,
    description: '��ѧʵ���е�pHֵ�Զ��ɼ�'
  }
];

const DataCollectionAnalysis: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dataSources] = useState<DataSource[]>(mockDataSources);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isNewAnalysisDialogOpen, setIsNewAnalysisDialogOpen] = useState(false);
  
  // ����ͷ����б�״̬
  const [dataCollectionTasks, setDataCollectionTasks] = useState<DataCollectionTask[]>([]);
  const [dataAnalyses, setDataAnalyses] = useState<DataAnalysis[]>([]);
  
  // �½��������״̬
  const [taskForm, setTaskForm] = useState({
    name: '',
    dataSourceType: '',
    experimentType: '',
    description: ''
  });
  
  // �½���������״̬
  const [analysisForm, setAnalysisForm] = useState({
    name: '',
    analysisType: '',
    dataSource: '',
    description: ''
  });

  const handleTabChange = (Event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNewTask = () => {
    setIsNewTaskDialogOpen(true);
  };

  const handleNewAnalysis = () => {
    setIsNewAnalysisDialogOpen(true);
  };
  const handleCloseTaskDialog = () => {
    setIsNewTaskDialogOpen(false);
    // ���ñ���
    setTaskForm({
      name: '',
      dataSourceType: '',
      experimentType: '',
      description: ''
    });
  };

  const handleCloseAnalysisDialog = () => {
    setIsNewAnalysisDialogOpen(false);
    // ���ñ���
    setAnalysisForm({
      name: '',
      analysisType: '',
      dataSource: '',
      description: ''
    });
  };
  const handleCreateTask = () => {
    // ����������
    const newTask: DataCollectionTask = {
      id: `task-${Date.now()}`,
      name: taskForm.name,
      dataSourceType: taskForm.dataSourceType,
      experimentType: taskForm.experimentType,
      description: taskForm.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      progress: 0
    };
    
    // ���ӵ������б�
    setDataCollectionTasks(prev => [...prev, newTask]);
    // console.log removed
    handleCloseTaskDialog();
  };

  const handleCreateAnalysis = () => {
    // �����·���
    const newAnalysis: DataAnalysis = {
      id: `analysis-${Date.now()}`,
      name: analysisForm.name,
      analysisType: analysisForm.analysisType,
      dataSource: analysisForm.dataSource,
      description: analysisForm.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      progress: 0
    };
    
    // ���ӵ������б�
    setDataAnalyses(prev => [...prev, newAnalysis]);
    // console.log removed
    handleCloseAnalysisDialog();
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        �����ռ������
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="����Դ����" icon={<DataUsageIcon />} />
          <Tab label="�����ռ�" icon={<CloudUploadIcon />} />
          <Tab label="���ݷ���" icon={<AnalyticsIcon />} />
        </Tabs>
        
        {/* ����Դ���� */}
        <TabPanel value={tabValue} index={0}>
          <div>
            <div>
              <Typography variant="h6">����Դ�б�</Typography>
              <Button variant="contained" startIcon={<RefreshIcon />}>
                ˢ��״̬
              </Button>
            </div>
            
            <Grid container spacing={2}>
              {dataSources.map((source) => (
                <Grid item xs={12} md={6} lg={4} key={source.id}>
                  <Card>
                    <CardContent>
                      <div>
                        <Typography variant="h6" component="div">
                          {source.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={source.status === 'active' ? '��Ծ' : source.status === 'inactive' ? '�ǻ�Ծ' : '����'}
                          color={source.status === 'active' ? 'success' : source.status === 'inactive' ? 'default' : 'error'}
                          icon={source.status === 'active' ? <AccountCircleIcon /> : source.status === 'error' ? <ErrorIcon /> : <WarningIcon />}
                        />
                      </div>
                      
                      <Typography variant="body2" color="text.secondary">
                        {source.description}
                      </Typography>
                      
                      <Typography variant="body2">
                        ����: {source.type} | ʵ������: {source.experimentType}
                      </Typography>
                      
                      <Typography variant="body2">
                        �ɼ����: {source.interval}��
                      </Typography>
                      
                      <div>
                        <Button size="small" startIcon={<SettingsIcon />}>
                          ����
                        </Button>
                        <Button size="small" startIcon={<PlayIcon />}>
                          ����
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </TabPanel>
          {/* �����ռ� */}
        <TabPanel value={tabValue} index={1}>
          <div>
            <div>
              <Typography variant="h6">�����ռ�����</Typography>
              <Button variant="contained" startIcon={<PlayIcon />} onClick={handleNewTask}>
                �½�����
              </Button>
            </div>
            
            {dataCollectionTasks.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                ��ǰû�������ռ������봴��������ʼ�����ռ���
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {dataCollectionTasks.map((task) => (
                  <Grid item xs={12} md={6} lg={4} key={task.id}>
                    <Card>
                      <CardContent>
                        <div>
                          <Typography variant="h6" component="div">
                            {task.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={task.status === 'pending' ? '�ȴ���' : 
                                   task.status === 'running' ? '������' : 
                                   task.status === 'completed' ? '�����' : 'ʧ��'}
                            color={task.status === 'completed' ? 'success' : 
                                   task.status === 'running' ? 'primary' : 
                                   task.status === 'failed' ? 'error' : 'default'}
                          />
                        </div>
                        
                        <Typography variant="body2" color="text.secondary">
                          {task.description}
                        </Typography>
                        
                        <Typography variant="body2">
                          ����Դ: {task.dataSourceType} | ʵ������: {task.experimentType}
                        </Typography>
                        
                        <Typography variant="body2">
                          ����ʱ��: {new Date(task.createdAt).toLocaleString()}
                        </Typography>
                        
                        <div>
                          <Button size="small" startIcon={<PlayIcon />}>
                            ��ʼ�ռ�
                          </Button>
                          <Button size="small" startIcon={<SettingsIcon />}>
                            ����
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </div>
        </TabPanel>
          {/* ���ݷ��� */}
        <TabPanel value={tabValue} index={2}>
          <div>
            <div>
              <Typography variant="h6">���ݷ���</Typography>
              <Button variant="contained" startIcon={<AnalyticsIcon />} onClick={handleNewAnalysis}>
                �½�����
              </Button>
            </div>
            
            {dataAnalyses.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                ��ǰû�����ݷ��������봴���µķ�������
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {dataAnalyses.map((analysis) => (
                  <Grid item xs={12} md={6} lg={4} key={analysis.id}>
                    <Card>
                      <CardContent>
                        <div>
                          <Typography variant="h6" component="div">
                            {analysis.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={analysis.status === 'pending' ? '�ȴ���' : 
                                   analysis.status === 'running' ? '������' : 
                                   analysis.status === 'completed' ? '�����' : 'ʧ��'}
                            color={analysis.status === 'completed' ? 'success' : 
                                   analysis.status === 'running' ? 'primary' : 
                                   analysis.status === 'failed' ? 'error' : 'default'}
                          />
                        </div>
                        
                        <Typography variant="body2" color="text.secondary">
                          {analysis.description}
                        </Typography>
                        
                        <Typography variant="body2">
                          ��������: {analysis.analysisType} | ������Դ: {analysis.dataSource}
                        </Typography>
                        
                        <Typography variant="body2">
                          ����ʱ��: {new Date(analysis.createdAt).toLocaleString()}
                        </Typography>
                        
                        <div>
                          <Button size="small" startIcon={<AnalyticsIcon />}>
                            ��ʼ����
                          </Button>
                          <Button size="small" startIcon={<SettingsIcon />}>
                            �鿴���
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </div>
        </TabPanel>
      </Paper>      {/* �½�����Ի��� */}
      <Dialog 
        open={isNewTaskDialogOpen} 
        onClose={handleCloseTaskDialog} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown={false}
        disableAutoFocus={true}
        disableEnforceFocus={false}
        disableRestoreFocus={false}
        keepMounted={false}
        aria-labelledby="task-dialog-title"
        aria-describedby="task-dialog-description"
        PaperProps={{
          'aria-modal': true,
          role: 'dialog'
        }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
        }}
      >
        <DialogTitle id="task-dialog-title">�����µ������ռ�����</DialogTitle>
        <DialogContent id="task-dialog-description">
          <Grid container spacing={3} sx={{ mt: 1 }}>            <Grid item xs={12}>
              <TextField
                label="��������"
                fullWidth
                placeholder="�����������ռ����������"
                value={taskForm.name}
                onChange={(e) => setTaskForm({...taskForm, name: e.target.value})}
                inputProps={{
                  'aria-describedby': 'task-name-HelpIcon'
                }}
                helperText="Ϊ���������ռ�������һ������ʶ�������"
                id="task-name-HelpIcon"
              />
            </Grid><Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="task-data-source-LabelIcon">����Դ����</InputLabel>
                <Select 
                  labelId="task-data-source-LabelIcon"
                  label="����Դ����"
                  value={taskForm.dataSourceType}
                  onChange={(e) => setTaskForm({...taskForm, dataSourceType: e.target.value})}
                  inputProps={{
                    'aria-describedby': 'task-data-source-HelpIcon'
                  }}
                >
                  <MenuItem value="sensor">������</MenuItem>
                  <MenuItem value="camera">����ͷ</MenuItem>
                  <MenuItem value="microphone">��˷�</MenuItem>
                  <MenuItem value="file">�ļ��ϴ�</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="task-experiment-type-LabelIcon">ʵ������</InputLabel>
                <Select 
                  labelId="task-experiment-type-LabelIcon"
                  label="ʵ������"
                  value={taskForm.experimentType}
                  onChange={(e) => setTaskForm({...taskForm, experimentType: e.target.value})}
                  inputProps={{
                    'aria-describedby': 'task-experiment-type-HelpIcon'
                  }}
                >
                  <MenuItem value="observation">�۲�ʵ��</MenuItem>
                  <MenuItem value="measurement">����ʵ��</MenuItem>
                  <MenuItem value="comparison">�Ա�ʵ��</MenuItem>
                  <MenuItem value="exploration">̽��ʵ��</MenuItem>
                </Select>
              </FormControl>
            </Grid>            <Grid item xs={12}>
              <TextField
                label="��������"
                multiline
                rows={3}
                fullWidth
                placeholder="�����������ռ������Ŀ���Ҫ��"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                inputProps={{
                  'aria-describedby': 'task-description-HelpIcon'
                }}
                helperText="��ϸ���������Ŀ�ꡢ�ռ����������ͺ�Ԥ����;"
                id="task-description-HelpIcon"
              />
            </Grid>
          </Grid>
        </DialogContent>        <DialogActions>
          <Button 
            onClick={handleCloseTaskDialog}
            aria-label="ȡ���������񲢹رնԻ���"
          >
            ȡ��
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTask}
            aria-label="ȷ�ϴ��������ռ�����"
          >
            ��������
          </Button>
        </DialogActions>
      </Dialog>      {/* �½������Ի��� */}
      <Dialog 
        open={isNewAnalysisDialogOpen} 
        onClose={handleCloseAnalysisDialog} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown={false}
        disableAutoFocus={true}
        disableEnforceFocus={false}
        disableRestoreFocus={false}
        keepMounted={false}
        aria-labelledby="analysis-dialog-title"
        aria-describedby="analysis-dialog-description"
        PaperProps={{
          'aria-modal': true,
          role: 'dialog'
        }}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
        }}
      >
        <DialogTitle id="analysis-dialog-title">�����µ����ݷ���</DialogTitle>
        <DialogContent id="analysis-dialog-description">
          <Grid container spacing={3} sx={{ mt: 1 }}>            <Grid item xs={12}>
              <TextField
                label="��������"
                fullWidth
                placeholder="���������ݷ���������"
                value={analysisForm.name}
                onChange={(e) => setAnalysisForm({...analysisForm, name: e.target.value})}
                inputProps={{
                  'aria-describedby': 'analysis-name-HelpIcon'
                }}
                helperText="Ϊ�������ݷ�����һ������ʶ�������"
                id="analysis-name-HelpIcon"
              />
            </Grid><Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="analysis-type-LabelIcon">��������</InputLabel>
                <Select 
                  labelId="analysis-type-LabelIcon"
                  label="��������"
                  value={analysisForm.analysisType}
                  onChange={(e) => setAnalysisForm({...analysisForm, analysisType: e.target.value})}
                  inputProps={{
                    'aria-describedby': 'analysis-type-HelpIcon'
                  }}
                >
                  <MenuItem value="statistical">ͳ�Ʒ���</MenuItem>
                  <MenuItem value="trend">���Ʒ���</MenuItem>
                  <MenuItem value="correlation">����Է���</MenuItem>
                  <MenuItem value="pattern">ģʽʶ��</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="data-source-LabelIcon">������Դ</InputLabel>
                <Select 
                  labelId="data-source-LabelIcon"
                  label="������Դ"
                  value={analysisForm.dataSource}
                  onChange={(e) => setAnalysisForm({...analysisForm, dataSource: e.target.value})}
                  inputProps={{
                    'aria-describedby': 'data-source-HelpIcon'
                  }}
                >
                  <MenuItem value="current">��ǰ�ռ�����</MenuItem>
                  <MenuItem value="historical">��ʷ����</MenuItem>
                  <MenuItem value="uploaded">�ϴ��ļ�</MenuItem>
                </Select>
              </FormControl>
            </Grid>            <Grid item xs={12}>
              <TextField
                label="����˵��"
                multiline
                rows={3}
                fullWidth
                placeholder="������������Ŀ���Ԥ�ڽ��"
                value={analysisForm.description}
                onChange={(e) => setAnalysisForm({...analysisForm, description: e.target.value})}
                inputProps={{
                  'aria-describedby': 'analysis-description-HelpIcon'
                }}
                helperText="��ϸ����������Ŀ�ꡢ������Ԥ��������"
                id="analysis-description-HelpIcon"
              />
            </Grid>
          </Grid>
        </DialogContent>        <DialogActions>
          <Button 
            onClick={handleCloseAnalysisDialog}
            aria-label="ȡ�������������رնԻ���"
          >
            ȡ��
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateAnalysis}
            aria-label="ȷ�Ͽ�ʼ���ݷ���"
          >
            ��ʼ����
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DataCollectionAnalysis;



