import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tooltip,
  IconButton,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Chip,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DownloadIcon } from '../../../utils/icons';
import { RefreshIcon } from '../../../utils/icons';
import { settings } from '../../../utils/icons';
import { InsertChartIcon } from '../../../utils/icons';
import { BarChartIcon } from '../../../utils/icons';
import { ShowChartIcon } from '../../../utils/icons';
import { PieChartIcon } from '../../../utils/icons';
import { BubbleChartIcon } from '../../../utils/icons';
import { FilterListIcon } from '../../../utils/icons';
import { DownloadForCloudOffIcon } from '../../../utils/icons';
import { AddIcon } from '../../../utils/icons';
import { DeleteIcon } from '../../../utils/icons';

// ģ��ʵ�����ݷ���
const experimentDataService = {
  getExperimentData: async (experimentId: number, variables: string[], timeRange: string) => {
    // ģ��api����
    return new Promise((resolve) => {
      setTimeout(() => {
        // ����ģ������
        const dataPoints = timeRange === 'complete' ? 50 : 
                          timeRange === 'last30' ? 30 : 
                          timeRange === 'last7' ? 7 : 15;
                          
        const generateTimestamps = () => {
          const now = new Date();
          const timestamps = [];
          for (let i = dataPoints - 1; i >= 0; i--) {
            timestamps.push(new Date(now.getTime() - i * 3600000));
          }
          return timestamps;
        };
        
        const timestamps = generateTimestamps();
        
        const generateDataSeries = (variable: string) => {
          const baseValue = variable === 'heartRate' ? 75 : 
                          variable === 'bloodPressure' ? 120 : 
                          variable === 'bodyTemperature' ? 37 : 
                          variable === 'respirationRate' ? 16 : 
                          variable === 'oxygenSaturation' ? 98 : 50;
                          
          const variance = variable === 'heartRate' ? 10 : 
                          variable === 'bloodPressure' ? 15 : 
                          variable === 'bodyTemperature' ? 0.5 : 
                          variable === 'respirationRate' ? 3 : 
                          variable === 'oxygenSaturation' ? 2 : 10;
                          
          return timestamps.map(() => {
            return baseValue + (Math.random() * variance * 2) - variance;
          });
        };
        
        const result = {
          experimentId,
          timeRange,
          timestamps,
          series: variables.map(variable => ({
            name: variable,
            data: generateDataSeries(variable)
          }))
        };
        
        resolve(result);
      }, 1000);
    });
  },
  
  getAvailableVariables: async (experimentId: number) => {
    // ģ��api����
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'heartRate', name: '����', unit: 'bpm', category: 'physiological' },
          { id: 'bloodPressure', name: 'Ѫѹ', unit: 'mmHg', category: 'physiological' },
          { id: 'bodyTemperature', name: '����', unit: '��C', category: 'physiological' },
          { id: 'respirationRate', name: '������', unit: 'breaths/min', category: 'physiological' },
          { id: 'oxygenSaturation', name: 'Ѫ�����Ͷ�', unit: '%', category: 'physiological' },
          { id: 'stressLevel', name: 'ѹ��ˮƽ', unit: 'score', category: 'psychological' },
          { id: 'attentionScore', name: 'ע��������', unit: 'score', category: 'cognitive' },
          { id: 'reactionTime', name: '��Ӧʱ��', unit: 'ms', category: 'cognitive' },
          { id: 'MemoryIconScore', name: '��������', unit: 'score', category: 'cognitive' },
          { id: 'decisionTime', name: '����ʱ��', unit: 'ms', category: 'cognitive' }
        ]);
      }, 800);
    });
  }
};

// ����ͼ������
type ChartType = 'line' | 'bar' | 'pie' | 'scatter';

// �����������
interface Variable {
  id: string;
  name: string;
  unit: string;
  category: string;
}

interface ExperimentDataVisualizationProps {
  /** ʵ��ID */
  experimentId: number;
  /** ��ѡ���Զ������ */
  title?: string;
  /** Ĭ��ѡ���ͼ������ */
  defaultChartType?: ChartType;
  /** Ĭ��ѡ��ı��� */
  defaultVariables?: string[];
  /** Ĭ��ʱ�䷶Χ */
  defaultTimeRange?: 'complete' | 'last30' | 'last7' | 'custom';
  /** �߶� */
  height?: number | string;
  /** �Ƿ������������� */
  allowExport?: boolean;
  /** �Ƿ����ø߼����� */
  enableAdvancedsettings?: boolean;
  /** ��ѡ���Զ���CSS�� */
  className?: string;
}

/**
 * ʵ�����ݿ��ӻ����
 * 
 * �ṩ����ͼ������չʾʵ�����ݣ�֧�ֱ���ѡ��ʱ�䷶Χ���ˡ�
 * ͼ�������л��ȹ��ܡ����ṩ���ݵ����͸߼�ͼ������ѡ�
 */
const ExperimentDataVisualization: React.FC<ExperimentDataVisualizationProps> = ({
  experimentId,
  title = 'ʵ�����ݿ��ӻ�',
  defaultChartType = 'line',
  defaultVariables = ['heartRate'],
  defaultTimeRange = 'complete',
  height = 500,
  allowExport = true,
  enableAdvancedsettings = true,
  className
}) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [timeRange, setTimeRange] = useState<string>(defaultTimeRange);
  const [selectedVariables, setSelectedVariables] = useState<string[]>(defaultVariables);
  const [availableVariables, setAvailableVariables] = useState<Variable[]>([]);
  const [experimentData, setExperimentData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [RefreshIconing, setRefreshIconing] = useState<boolean>(false);
  const [showsettings, setShowsettings] = useState<boolean>(false);
  const [showVariableSelector, setShowVariableSelector] = useState<boolean>(false);
  
  // �߼�����
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [enableAnimation, setEnableAnimation] = useState<boolean>(true);
  const [enableDataLabels, setEnableDataLabels] = useState<boolean>(false);
  const [autoRefreshIcon, setAutoRefreshIcon] = useState<boolean>(false);

  // ��ȡ���ñ���
  useEffect(() => {
    const fetchAvailableVariables = async () => {
      try {
        const variables = await experimentDataService.getAvailableVariables(experimentId);
        setAvailableVariables(variables as Variable[]);
      } catch (err) {
        setError('�޷����ؿ��ñ����б�');
      }
    };

    fetchAvailableVariables();
  }, [experimentId]);

  // ��ȡʵ������
  useEffect(() => {
    const fetchExperimentData = async () => {
      if (selectedVariables.length === 0) return;
      
      try {
        setLoading(true);
        const data = await experimentDataService.getExperimentData(
          experimentId, 
          selectedVariables, 
          timeRange
        );
        setExperimentData(data);
        setLoading(false);
      } catch (err) {
        setError('�޷�����ʵ�����ݣ����Ժ�����');
        setLoading(false);
      }
    };

    fetchExperimentData();
    
    // ����������Զ�ˢ�£����ö�ʱ��
    let RefreshIconInterval: NodeJS.Timeout | null = null;
    if (autoRefreshIcon) {
      RefreshIconInterval = setInterval(fetchExperimentData, 30000); // ÿ30��ˢ��һ��
    }
    
    return () => {
      if (RefreshIconInterval) clearInterval(RefreshIconInterval);
    };
  }, [experimentId, selectedVariables, timeRange, autoRefreshIcon]);

  // ����ͼ�����ͱ��
  const handleChartTypeChange = (
    Event: React.MouseEvent<HTMLElement>,
    newChartType: ChartType,
  ) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  // ����ʱ�䷶Χ���
  const handleTimeRangeChange = (Event: SelectChangeEvent<string>) => {
    setTimeRange(Event.target.value);
  };

  // ��������ѡ��
  const handleVariableSelect = (variableId: string) => {
    if (selectedVariables.includes(variableId)) {
      setSelectedVariables(selectedVariables.filter(v => v !== variableId));
    } else {
      setSelectedVariables([...selectedVariables, variableId]);
    }
  };

  // ˢ������
  const handleRefreshIcon = async () => {
    if (RefreshIconing) return;
    
    setRefreshIconing(true);
    try {
      const data = await experimentDataService.getExperimentData(
        experimentId, 
        selectedVariables, 
        timeRange
      );
      setExperimentData(data);
    } catch (err) {
      setError('ˢ������ʧ�ܣ����Ժ�����');
    } finally {
      setRefreshIconing(false);
    }
  };

  // ��������
  const handleExportData = () => {
    if (!experimentData) return;
    
    try {
      // ����CSV����
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // ���ӱ�����
      const headers = ["Timestamp", ...selectedVariables];
      csvContent += headers.join(",") + "\r\n";
      
      // ����������
      for (let i = 0; i < experimentData.timestamps.length; i++) {
        const row = [new Date(experimentData.timestamps[i]).toISOString()];
        for (const series of experimentData.series) {
          row.push(series.data[i]);
        }
        csvContent += row.join(",") + "\r\n";
      }
      
      // ������������
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `experiment_${experimentId}_data.csv`);
      document.body.appendChild(link);
      
      // ��������
      link.click();
      
      // ����
      document.body.removeChild(link);
    } catch (err) {
      setError('��������ʧ��');
    }
  };

  // ���ݱ���ID��ȡ������Ϣ
  const getVariableById = (id: string): Variable | undefined => {
    return availableVariables.find(v => v.id === id);
  };

  // ������������ñ���
  const variablesByCategory = useMemo(() => {
    const categories: Record<string, Variable[]> = {};
    
    availableVariables.forEach(variable => {
      if (!categories[variable.category]) {
        categories[variable.category] = [];
      }
      categories[variable.category].push(variable);
    });
    
    return categories;
  }, [availableVariables]);

  // ����Ƿ�Ϊ������
  const isEmptyData = !experimentData || 
                     !experimentData.series || 
                     experimentData.series.length === 0 || 
                     !experimentData.timestamps || 
                     experimentData.timestamps.length === 0;

  if (loading && !experimentData) {
    return (
      <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height }}>
        <CircularProgress />
      </div>
    );
  }

  if (error && !experimentData) {
    return (
      <div sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className={className}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <div sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="ˢ������">
              <IconButton onClick={handleRefreshIcon} disabled={RefreshIconing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {allowExport && (
              <Tooltip title="��������">
                <IconButton onClick={handleExportData} disabled={isEmptyData}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            {enableAdvancedsettings && (
              <Tooltip title="ͼ������">
                <IconButton onClick={() => setShowsettings(!showsettings)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* ͼ�������� */}
        <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartTypeChange}
            size="small"
          >
            <ToggleButton value="line">
              <Tooltip title="����ͼ">
                <ShowChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="bar">
              <Tooltip title="��״ͼ">
                <BarChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="pie">
              <Tooltip title="��ͼ">
                <PieChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="scatter">
              <Tooltip title="ɢ��ͼ">
                <BubbleChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>ʱ�䷶Χ</InputLabel>
            <Select
              value={timeRange}
              label="ʱ�䷶Χ"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="complete">ȫ������</MenuItem>
              <MenuItem value="last30">���30�����ݵ�</MenuItem>
              <MenuItem value="last7">���7�����ݵ�</MenuItem>
              <MenuItem value="custom">�Զ��巶Χ</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            size="small"
            onClick={() => setShowVariableSelector(!showVariableSelector)}
          >
            ���� ({selectedVariables.length})
          </Button>
          
          {RefreshIconing && <CircularProgress size={24} />}
        </div>
        
        {/* ����ѡ���� */}
        {showVariableSelector && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">ѡ�����</Typography>
              <div>
                <Button 
                  size="small" 
                  startIcon={<AddIcon />}
                  onClick={() => setSelectedVariables(availableVariables.map(v => v.id))}
                >
                  ȫѡ
                </Button>
                <Button 
                  size="small" 
                  startIcon={<DeleteIcon />}
                  onClick={() => setSelectedVariables([])}
                >
                  ���
                </Button>
              </div>
            </div>
            
            {Object.entries(variablesByCategory).map(([category, variables]) => (
              <div key={category} sx={{ mb: 2 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    textTransform: 'capitalize', 
                    mb: 1,
                    color: 'text.secondary'
                  }}
                >
                  {category}
                </Typography>
                <div sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {variables.map(variable => (
                    <Chip
                      key={variable.id}
                      label={`${variable.name} (${variable.unit})`}
                      onClick={() => handleVariableSelect(variable.id)}
                      color={selectedVariables.includes(variable.id) ? 'primary' : 'default'}
                      variant={selectedVariables.includes(variable.id) ? 'filled' : 'outlined'}
                    />
                  ))}
                </div>
              </div>
            ))}
          </Paper>
        )}
        
        {/* �߼����� */}
        {showsettings && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" gutterBottom>
              ͼ������
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={<Switch checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} />}
                  label="��ʾͼ��"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={<Switch checked={showGridLines} onChange={(e) => setShowGridLines(e.target.checked)} />}
                  label="��ʾ������"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={<Switch checked={enableAnimation} onChange={(e) => setEnableAnimation(e.target.checked)} />}
                  label="���ö���"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={<Switch checked={enableDataLabels} onChange={(e) => setEnableDataLabels(e.target.checked)} />}
                  label="��ʾ���ݱ�ǩ"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={<Switch checked={autoRefreshIcon} onChange={(e) => setAutoRefreshIcon(e.target.checked)} />}
                  label="�Զ�ˢ��"
                />
              </Grid>
            </Grid>
          </Paper>
        )}
        
        {/* ͼ����ʾ���� */}
        <div 
          sx={{ 
            height: typeof height === 'number' ? `${height}px` : height,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 2,
            bgcolor: 'background.paper'
          }}
        >
          {loading && (
            <CircularProgress />
          )}
          
          {!loading && error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
          
          {!loading && !error && isEmptyData && (
            <div sx={{ textAlign: 'center' }}>
              <InsertChartIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                û�п��õ�����
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ��ѡ������һ�����������ʱ�䷶Χ
              </Typography>
            </div>
          )}
          
          {!loading && !error && !isEmptyData && (
            <div sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* ͼ������ */}
              <div sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedVariables.map(variableId => {
                  const variable = getVariableById(variableId);
                  return variable ? (
                    <Chip
                      key={variableId}
                      label={`${variable.name} (${variable.unit})`}
                      color="primary"
                      size="small"
                    />
                  ) : null;
                })}
              </div>
              
              {/* ͼ������ - ��ʵ��ʵ����Ӧ�ü���ͼ���� */}
              <div sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {chartType === 'line' && '���ｫ��ʾ����ͼ'}
                  {chartType === 'bar' && '���ｫ��ʾ��״ͼ'}
                  {chartType === 'pie' && '���ｫ��ʾ��ͼ'}
                  {chartType === 'scatter' && '���ｫ��ʾɢ��ͼ'}
                </Typography>
              </div>
              
              {/* ͼ���ײ���Ϣ */}
              <div sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  ʵ��ID: {experimentId}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ���ݵ�: {experimentData.timestamps.length} | 
                  ��Χ: {new Date(experimentData.timestamps[0]).toLocaleDateString()} - 
                  {new Date(experimentData.timestamps[experimentData.timestamps.length - 1]).toLocaleDateString()}
                </Typography>
              </div>
            </div>
          )}
        </div>
        
        {/* ���ݵ�����ť */}
        {allowExport && !isEmptyData && (
          <div sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadForCloudOffIcon />}
              onClick={handleExportData}
              size="small"
            >
              ��������
            </Button>
          </div>
        )}
      </Paper>
    </div>
  );
};

export default ExperimentDataVisualization;


