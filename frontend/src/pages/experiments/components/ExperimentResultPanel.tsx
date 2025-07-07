import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography,
  CircularProgress,
  Box,
  Paper,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { Experiment } from '../../../types';
import ConfusionMatrix from '../../../components/visualizations/ConfusionMatrix';
import TrainingHistoryChart from '../../../components/visualizations/TrainingHistoryChart';
import MetricsCard from '../../../components/visualizations/MetricsCard';

export interface ExperimentResultPanelProps {
  experiment: Experiment;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * ��ǩҳ������
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
      {...other}
      style={{ paddingTop: 20 }}
    >
      {value === index && children}
    </div>
  );
}

const ExperimentResultPanel: React.FC<ExperimentResultPanelProps> = ({
  experiment
}) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_Event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ʵ����
        </Typography>
        
        {experiment.status === 'completed' && experiment.results ? (
          <div sx={{ width: '100%' }}>
            <Paper elevation={3} sx={{ mb: 3, p: 2 }}>
              <Typography variant="h6" gutterBottom>ʵ��ָ�����</Typography>
              <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {experiment.results.accuracy !== undefined && (
                  <MetricsCard 
                    title="׼ȷ��" 
                    value={experiment.results.accuracy} 
                    format="percent" 
                  />
                )}
                
                {experiment.results.precision !== undefined && (
                  <MetricsCard 
                    title="��ȷ��" 
                    value={experiment.results.precision} 
                    format="percent" 
                  />
                )}
                
                {experiment.results.recall !== undefined && (
                  <MetricsCard 
                    title="�ٻ���" 
                    value={experiment.results.recall} 
                    format="percent" 
                  />
                )}
                
                {experiment.results.f1Score !== undefined && (
                  <MetricsCard 
                    title="F1����" 
                    value={experiment.results.f1Score} 
                    format="percent" 
                  />
                )}
              </div>
            </Paper>

            <Paper elevation={0}>
              <div sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="ʵ������ǩҳ">
                  <Tab label="ѵ����ʷ" />
                  {experiment.results.confusionMatrix && <Tab label="��������" />}
                  {experiment.results.report && <Tab label="��������" />}
                </Tabs>
              </div>
              
              <TabPanel value={tabIndex} index={0}>
                <div sx={{ p: 2 }}>
                  {experiment.results.trainingHistory ? (
                    <TrainingHistoryChart 
                      history={experiment.results.trainingHistory} 
                      height={400} 
                    />
                  ) : (
                    <Alert severity="info">��ѵ����ʷ����</Alert>
                  )}
                </div>
              </TabPanel>
              
              {experiment.results.confusionMatrix && (
                <TabPanel value={tabIndex} index={1}>
                  <div sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>��������</Typography>
                    <ConfusionMatrix 
                      matrix={experiment.results.confusionMatrix} 
                      size={experiment.results.confusionMatrix.length} 
                    />
                  </div>
                </TabPanel>
              )}
              
              {experiment.results.report && (
                <TabPanel value={tabIndex} index={experiment.results.confusionMatrix ? 2 : 1}>
                  <div sx={{ p: 2 }}>
                    <Paper elevation={1} sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>ʵ�鱨��</Typography>
                      
                      {experiment.results.report.summary && (
                        <Typography paragraph>{experiment.results.report.summary}</Typography>
                      )}
                      
                      {experiment.results.report.keyFindings && experiment.results.report.keyFindings.length > 0 && (
                        <>
                          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>�ؼ�����</Typography>
                          <ul>
                            {experiment.results.report.keyFindings.map((finding: string, index: number) => (
                              <li key={index}>
                                <Typography>{finding}</Typography>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      {experiment.results.report.recommendations && experiment.results.report.recommendations.length > 0 && (
                        <>
                          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>�Ľ�����</Typography>
                          <ul>
                            {experiment.results.report.recommendations.map((rec: string, index: number) => (
                              <li key={index}>
                                <Typography>{rec}</Typography>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </Paper>
                  </div>
                </TabPanel>
              )}
            </Paper>
          </div>
        ) : (
          <div sx={{ p: 3, textAlign: 'center' }}>
            {experiment.status === 'running' ? (
              <>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography>ʵ�����������У����������ɺ���ʾ</Typography>
              </>
            ) : (
              <Alert severity="info">
                {experiment.status === 'failed' ? 'ʵ��ʧ�ܣ��޷���ȡ���' :
                 experiment.status === 'stopped' ? 'ʵ����ֹͣ��������ܲ�����' :
                 '����ʵ��������'}
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperimentResultPanel;

