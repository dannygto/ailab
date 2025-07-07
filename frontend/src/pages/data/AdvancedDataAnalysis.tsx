import React, { useState } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import { HelpOutlineIcon as HelpIconIcon, DownloadIcon as DownloadIcon, RefreshIcon as RefreshIcon } from '../../utils/icons';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';

// ���������������
interface AnalysisMethod {
  id: string;
  name: string;
  description: string;
  parameters: AnalysisParameter[];
  requiresMultipleVariables?: boolean;
}

// ������������
interface AnalysisParameter {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  required: boolean;
  default?: any;
  options?: { value: string; label: string }[];
  description?: string;
}

// �����������
interface AnalysisResult {
  type: 'text' | 'table' | 'chart';
  title: string;
  description?: string;
  data: any;
}

// ���õķ�������
const availableAnalysisMethods: AnalysisMethod[] = [
  {
    id: 'descriptive',
    name: '������ͳ��',
    description: '�������ݵĻ���ͳ����Ϣ��������ֵ����λ������׼����ֵ����Сֵ�ȡ�',
    parameters: [
      {
        id: 'variable',
        name: '����',
        type: 'string',
        required: true,
        description: 'Ҫ�����ı�����'
      },
      {
        id: 'includeExtremeValues',
        name: '������ֵ',
        type: 'boolean',
        required: false,
        default: true,
        description: '�Ƿ��ڷ����а�����ֵ'
      }
    ]
  },
  {
    id: 'correlation',
    name: '����Է���',
    description: '����������������֮�������ԣ��������ϵ�������ӻ���ϵ��',
    parameters: [
      {
        id: 'method',
        name: '����Է���',
        type: 'select',
        required: true,
        default: 'pearson',
        options: [
          { value: 'pearson', label: 'Ƥ��ѷ���ϵ��' },
          { value: 'spearman', label: '˹Ƥ�����ȼ����' },
          { value: 'kendall', label: '�ϵ¶��ȼ����' }
        ],
        description: '��������Եķ���'
      }
    ],
    requiresMultipleVariables: true
  },
  {
    id: 'outlier',
    name: '�쳣ֵ���',
    description: 'ʹ�ö��ַ�����������е��쳣ֵ�����Ա�ǻ��Ƴ���Щֵ��',
    parameters: [
      {
        id: 'variable',
        name: '����',
        type: 'string',
        required: true,
        description: 'Ҫ���ı�����'
      },
      {
        id: 'method',
        name: '��ⷽ��',
        type: 'select',
        required: true,
        default: 'zscore',
        options: [
          { value: 'zscore', label: 'Z-score����' },
          { value: 'iqr', label: '�ķ�λ��Χ��' },
          { value: 'isolation', label: '����ɭ��' }
        ],
        description: '�쳣ֵ��ⷽ��'
      },
      {
        id: 'threshold',
        name: '��ֵ',
        type: 'number',
        required: false,
        default: 3,
        description: '�����ж��쳣ֵ����ֵ'
      }
    ]
  },
  {
    id: 'regression',
    name: '�ع����',
    description: '������ݵĻع�ģ�ͣ�����������ĺ�����ϵ��',
    parameters: [
      {
        id: 'dependent',
        name: '�����',
        type: 'string',
        required: true,
        description: '�ع�ģ�͵������'
      },
      {
        id: 'independent',
        name: '�Ա���',
        type: 'string',
        required: true,
        description: '�ع�ģ�͵��Ա���'
      },
      {
        id: 'method',
        name: '�ع鷽��',
        type: 'select',
        required: true,
        default: 'linear',
        options: [
          { value: 'linear', label: '���Իع�' },
          { value: 'polynomial', label: '����ʽ�ع�' },
          { value: 'logistic', label: '�߼��ع�' }
        ],
        description: '�ع��������'
      }
    ]
  },
  {
    id: 'timeseries',
    name: 'ʱ�����з���',
    description: '����ʱ���������ݵ����ơ������Ժ������ԣ����ṩԤ�⡣',
    parameters: [
      {
        id: 'variable',
        name: 'ʱ�����б���',
        type: 'string',
        required: true,
        description: 'Ҫ������ʱ�����б���'
      },
      {
        id: 'timeVariable',
        name: 'ʱ�����',
        type: 'string',
        required: true,
        description: '��ʾʱ��ı���'
      },
      {
        id: 'method',
        name: '��������',
        type: 'select',
        required: true,
        default: 'decomposition',
        options: [
          { value: 'decomposition', label: 'ʱ�����зֽ�' },
          { value: 'acf', label: '����غ���' },          { value: 'pacf', label: 'ƫ����غ���' },
          { value: 'forecasting', label: 'ʱ������Ԥ��' }
        ],
        description: 'ʱ�����з�������'
      },
      {
        id: 'forecastPeriods',
        name: 'Ԥ��������',
        type: 'number',
        required: false,
        default: 5,
        description: 'Ԥ��δ��������������������Ԥ�⣩'
      }
    ]
  },  {
    id: 'clustering',
    name: '�������',
    description: '���������������������飬�������ݵ����ڽṹ��',
    parameters: [
      {
        id: 'variables',
        name: '����',
        type: 'string',
        required: true,
        description: '���ھ���ı������ö��ŷָ����������'
      },
      {
        id: 'method',
        name: '���෽��',
        type: 'select',
        required: true,
        default: 'kmeans',
        options: [
          { value: 'kmeans', label: 'K-means����' },
          { value: 'hierarchical', label: '��ξ���' },
          { value: 'dbscan', label: '�ܶȾ���' }
        ],
        description: '�����������'
      },
      {
        id: 'clusters',
        name: '��������',
        type: 'number',
        required: false,
        default: 3,
        description: 'Ԥ�ڵľ�����������K-means�Ͳ�ξ�����Ч��'
      }
    ]
  }
];

// ģ������
const mockDatasets = [
  {
    id: 'ds1',
    name: '����ʵ����ѧ����',
    variables: ['time', 'force', 'displacement', 'velocity', 'acceleration']
  },
  {
    id: 'ds2',
    name: '��ѧʵ�鷴Ӧ����',
    variables: ['time', 'temperature', 'pH', 'concentration', 'pressure']
  },
  {
    id: 'ds3',
    name: '����������������',
    variables: ['sample_id', 'height', 'weight', 'growth_rate', 'temperature']
  }
];

// ģ�����ִ�к���
const performAnalysis = async (
  datasetId: string, 
  methodId: string, 
  parameters: Record<string, any>,
  variables: string[]
): Promise<AnalysisResult[]> => {
  // ģ��api�ӳ�
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // ���ݲ�ͬ�ķ����������ز�ͬ�Ľ��
  switch (methodId) {
    case 'descriptive': {
      // ����������ͳ�ƽ��
      const stats = {
        count: 50,
        mean: 25.3 + Math.random() * 5,
        median: 24.8 + Math.random() * 5,
        std: 5.2 + Math.random() * 2,
        min: 10.5 + Math.random() * 3,
        max: 45.2 + Math.random() * 5,
        q1: 17.3 + Math.random() * 4,
        q3: 32.6 + Math.random() * 4
      };
      
      return [
        {
          type: 'table',
          title: '������ͳ�ƽ��',
          description: `${parameters.variable} �Ļ���ͳ����Ϣ`,
          data: [
            { metric: '������', value: stats.count },
            { metric: 'ƽ��ֵ', value: stats.mean.toFixed(2) },
            { metric: '��λ��', value: stats.median.toFixed(2) },
            { metric: '��׼��', value: stats.std.toFixed(2) },
            { metric: '��Сֵ', value: stats.min.toFixed(2) },
            { metric: '���ֵ', value: stats.max.toFixed(2) },
            { metric: '��һ�ķ�λ��', value: stats.q1.toFixed(2) },
            { metric: '�����ķ�λ��', value: stats.q3.toFixed(2) }
          ]
        },
        {
          type: 'chart',
          title: '��ֵ�ֲ�',
          description: `${parameters.variable} ��ֱ��ͼ`,
          data: {
            type: 'histogram',
            values: Array(10).fill(0).map((_, i) => ({
              bin: stats.min + i * ((stats.max - stats.min) / 10),
              count: Math.floor(Math.random() * 15) + 1
            }))
          }
        }
      ];
    }
      case 'correlation': {
      // ��������Է������
      const correlationMatrix: number[][] = [];
      for (let i = 0; i < variables.length; i++) {
        const row: number[] = [];
        for (let j = 0; j < variables.length; j++) {
          if (i === j) {
            row.push(1); // �����Ϊ1
          } else if (j < i) {
            row.push(correlationMatrix[j][i]); // �Գƾ���
          } else {
            row.push(Math.random() * 2 - 1); // ������ϵ��
          }
        }
        correlationMatrix.push(row);
      }
      
      return [
        {
          type: 'table',
          title: '����Ծ���',
          description: `ʹ�� ${parameters.method} ������������ϵ��`,
          data: variables.map((v1, i) => {
            const row: Record<string, any> = { variable: v1 };
            variables.forEach((v2, j) => {
              row[v2] = correlationMatrix[i][j].toFixed(2);
            });
            return row;
          })
        },
        {
          type: 'chart',
          title: '�������ͼ',
          description: '����������ԵĿ��ӻ���ʾ',
          data: {
            type: 'heatmap',
            xLabels: variables,
            yLabels: variables,
            values: correlationMatrix
          }
        }
      ];
    }
      case 'outlier': {
      // �����쳣ֵ�����
      const dataSize = 50;
      const outlierIndices: number[] = [];
      const values: number[] = [];
      
      // ����ģ�����ݺ��쳣ֵ
      for (let i = 0; i < dataSize; i++) {
        const isOutlier = Math.random() > 0.9;
        if (isOutlier) {
          outlierIndices.push(i);
          values.push(Math.random() * 100 + 50); // �쳣ֵ
        } else {
          values.push(Math.random() * 20 + 10); // ����ֵ
        }
      }
      
      return [
        {
          type: 'text',
          title: '�쳣ֵ�����',
          description: `ʹ�� ${parameters.method} ������� ${parameters.variable} ���쳣ֵ`,
          data: `��⵽ ${outlierIndices.length} ���쳣ֵ��ռ�������� ${(outlierIndices.length / dataSize * 100).toFixed(1)}%��\n�쳣ֵ������λ��: ${outlierIndices.join(', ')}`
        },
        {
          type: 'chart',
          title: '�쳣ֵ���ӻ�',
          description: 'ͻ����ʾ���쳣ֵ��',
          data: {
            type: 'scatter',
            values: values.map((value, index) => ({
              index,
              value,
              isOutlier: outlierIndices.includes(index)
            }))
          }
        }
      ];
    }
      case 'regression': {
      // ���ɻع�������
      const dataPoints = 30;
      const data: {x: number, y: number}[] = [];
      const x: number[] = [];
      const y: number[] = [];
      
      // ���ɻع����ݵ�
      for (let i = 0; i < dataPoints; i++) {
        const xVal = i + Math.random() * 2 - 1;
        let yVal;
        
        switch (parameters.model) {
          case 'linear':
            yVal = 2 * xVal + 5 + Math.random() * 4 - 2;
            break;
          case 'polynomial':
            yVal = 0.5 * Math.pow(xVal, 2) - 2 * xVal + 10 + Math.random() * 5 - 2.5;
            break;
          case 'exponential':
            yVal = 5 * Math.exp(0.2 * xVal) + Math.random() * 3 - 1.5;
            break;
          default:
            yVal = 2 * xVal + 5 + Math.random() * 4 - 2;
        }
        
        data.push({ x: xVal, y: yVal });
        x.push(xVal);
        y.push(yVal);
      }
      
      // �������ϵ��
      const xMean = x.reduce((sum, val) => sum + val, 0) / x.length;
      const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
      const ssxx = x.reduce((sum, val) => sum + Math.pow(val - xMean, 2), 0);
      const ssyy = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
      const ssxy = x.reduce((sum, val, i) => sum + (val - xMean) * (y[i] - yMean), 0);
      const r = ssxy / Math.sqrt(ssxx * ssyy);
      const r2 = Math.pow(r, 2);
      
      return [
        {
          type: 'text',
          title: '�ع�������',
          description: `${parameters.dependent} vs ${parameters.independent} ��${parameters.model === 'linear' ? '����' : parameters.model === 'polynomial' ? '����ʽ' : 'ָ��'}�ع�`,
          data: `�ع�ģ��: ${parameters.model === 'linear' ? 'y = 2x + 5' : parameters.model === 'polynomial' ? 'y = 0.5x2 - 2x + 10' : 'y = 5e^(0.2x)'}\n���ϵ��(r): ${r.toFixed(4)}\n����ϵ��(R2): ${r2.toFixed(4)}`
        },
        {
          type: 'chart',
          title: '�ع����ͼ',
          description: '���ݵ���������',
          data: {
            type: 'scatter',
            dataPoints: data,
            model: parameters.model,
            equation: parameters.model === 'linear' ? 'y = 2x + 5' : parameters.model === 'polynomial' ? 'y = 0.5x2 - 2x + 10' : 'y = 5e^(0.2x)'
          }
        }
      ];
    }
    
    case 'timeseries': {
      // ����ʱ�����з������
      const periods = 24; // ������Сʱ����
      const timePoints = [];
      const values = [];
      const trend = [];
      const seasonal = [];
      const residual = [];
      
      // ����ʱ����������
      for (let i = 0; i < periods; i++) {
        const time = new Date(2025, 5, 22, i).toISOString();
        
        // ������� (��������)
        const trendValue = 10 + i * 0.5;
        
        // ��������� (���Ҳ�)
        const seasonalValue = 5 * Math.sin(i * Math.PI / 6);
        
        // �в� (�������)
        const residualValue = Math.random() * 3 - 1.5;
        
        // ���ֵ
        const value = trendValue + seasonalValue + residualValue;
        
        timePoints.push(time);
        values.push(value);
        trend.push(trendValue);
        seasonal.push(seasonalValue);
        residual.push(residualValue);
      }
      
      return [
        {
          type: 'chart',
          title: 'ʱ�����зֽ�',
          description: `${parameters.variable} ��ʱ�����зֽ�`,
          data: {
            type: 'timeseries',
            times: timePoints,
            components: {
              original: values,
              trend: trend,
              seasonal: seasonal,
              residual: residual
            },
            showComponents: parameters.components === 'all' ? ['trend', 'seasonal', 'residual'] :
                           [parameters.components]
          }
        },
        {
          type: 'text',
          title: 'ʱ�����з���ժҪ',
          description: 'ʱ�����е���Ҫ����',
          data: `���ݵ�����: ${periods}\n����: ${Math.random() > 0.5 ? '����' : '�½�'}\n����������: 12Сʱ\n�����ϵ��: ${(Math.random() * 0.5 + 0.5).toFixed(4)}`
        }
      ];
    }
    
    default:
      return [
        {
          type: 'text',
          title: 'δ֪��������',
          description: '��ѡ����Ч�ķ�������',
          data: 'δ��ʶ����ѡ������������ѡ���б����ṩ�ķ���������'
        }
      ];
  }
};

// �߼����ݷ������
const AdvancedDataAnalysis: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('descriptive');
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState(0);
    // ��ȡ���ݼ��б�
  const { data: datasets = mockDatasets } = useQuery<typeof mockDatasets, Error>(
    ['datasets'],
    async () => {
      // ģ��api����
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockDatasets;
    }
  );
  
  // ��ȡѡ�����ݼ�������
  const { data: selectedDatasetDetails } = useQuery(
    ['dataset', selectedDataset],
    async () => {
      if (!selectedDataset) return null;
      
      // ģ��api����
      await new Promise(resolve => setTimeout(resolve, 300));
      return datasets.find(ds => ds.id === selectedDataset);
    },
    {
      enabled: !!selectedDataset
    }
  );
  
  // ��ȡѡ�еķ�������
  const selectedMethodDetails = availableAnalysisMethods.find(m => m.id === selectedMethod);
    // �������ݼ�ѡ����
  const handleDatasetChange = (Event: SelectChangeEvent<string>) => {
    const value = Event.target.value as string;
    setSelectedDataset(value);
    // ���ñ���ѡ��Ͳ���
    setSelectedVariables([]);
    setParameterValues({});
    setAnalysisResults([]);
  };
  
  // ���������������
  const handleMethodChange = (Event: SelectChangeEvent<string>) => {
    const value = Event.target.value as string;
    setSelectedMethod(value);
    // ���ò���ֵ
    setParameterValues({});
    setAnalysisResults([]);
  };
  
  // ��������ѡ����
  const handleVariableChange = (Event: SelectChangeEvent<string[]>) => {
    const value = Event.target.value as string[];
    setSelectedVariables(value);
    // ���²����еı���
    if (value.length > 0 && selectedMethodDetails) {
      const variableParam = selectedMethodDetails.parameters.find(p => p.id === 'variable');
      if (variableParam) {
        setParameterValues(prev => ({
          ...prev,
          variable: value[0]
        }));
      }
    }
  };
  
  // ��������ֵ���
  const handleParameterChange = (parameterId: string, value: any) => {
    setParameterValues(prev => ({
      ...prev,
      [parameterId]: value
    }));
  };
  
  // ���з���
  const handleRunAnalysis = async () => {
    if (!selectedDataset || !selectedMethod) {
      toast.error('��ѡ�����ݼ��ͷ�������');
      return;
    }
    
    if (selectedMethodDetails?.requiresMultipleVariables && selectedVariables.length < 2) {
      toast.error('�˷���������Ҫѡ��������������');
      return;
    }
    
    // ��֤�������
    const missingParams = selectedMethodDetails?.parameters
      .filter(p => p.required && !parameterValues[p.id])
      .map(p => p.name);
    
    if (missingParams && missingParams.length > 0) {
      toast.error(`ȱ�ٱ������: ${missingParams.join(', ')}`);
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResults([]);
    
    try {
      const results = await performAnalysis(
        selectedDataset,
        selectedMethod,
        parameterValues,
        selectedVariables
      );
      
      setAnalysisResults(results);
      setActiveResultTab(0);
      toast.success('�������');
    } catch (error) {
      console.error('����ʧ��:', error);
      toast.error('���������г��ִ���');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // �����������
  const handleExportResults = () => {
    if (!analysisResults.length) {
      toast.error('û�пɵ����ķ������');
      return;
    }
    
    const dataset = datasets.find(ds => ds.id === selectedDataset)?.name || 'unknown';
    const method = availableAnalysisMethods.find(m => m.id === selectedMethod)?.name || 'unknown';
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    
    // �����ת��ΪJSON
    const resultsJson = JSON.stringify(analysisResults, null, 2);
    const blob = new Blob([resultsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // ������������
    const link = document.createElement('a');
    link.href = url;
    link.download = `�������_${dataset}_${method}_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('��������ѵ���');
  };
  
  // ��Ⱦ��������
  const renderParameterInputs = () => {
    if (!selectedMethodDetails) return null;
    
    return (
      <Grid container spacing={2}>
        {selectedMethodDetails.parameters.map(param => {
          // ���ڱ���������ʹ�ñ���ѡ����
          if (param.id === 'variable' && selectedVariables.length > 0) {
            return null; // ���ڱ���ѡ���д���
          }
          
          // �����������Ա�����ʹ�ñ���ѡ��
          if ((param.id === 'dependent' || param.id === 'independent') && selectedDatasetDetails) {
            return (
              <Grid item xs={12} sm={6} key={param.id}>
                <FormControl fullWidth>
                  <InputLabel>{param.name}</InputLabel>
                  <Select
                    value={parameterValues[param.id] || ''}
                    onChange={(e) => handleParameterChange(param.id, e.target.value)}
                    label={param.name}
                  >
                    {selectedDatasetDetails.variables.map(variable => (
                      <MenuItem key={variable} value={variable}>
                        {variable}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            );
          }
          
          // ��Ⱦ������������
          switch (param.type) {
            case 'number':
              return (
                <Grid item xs={12} sm={6} key={param.id}>
                  <TextField
                    fullWidth
                    label={param.name}
                    type="number"
                    value={parameterValues[param.id] !== undefined ? parameterValues[param.id] : (param.default || '')}
                    onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value))}
                    helperText={param.description}
                  />
                </Grid>
              );
              
            case 'string':
              return (
                <Grid item xs={12} sm={6} key={param.id}>
                  <TextField
                    fullWidth
                    label={param.name}
                    value={parameterValues[param.id] || param.default || ''}
                    onChange={(e) => handleParameterChange(param.id, e.target.value)}
                    helperText={param.description}
                  />
                </Grid>
              );
              
            case 'boolean':
              return (
                <Grid item xs={12} sm={6} key={param.id}>
                  <FormControl fullWidth>
                    <InputLabel>{param.name}</InputLabel>
                    <Select
                      value={parameterValues[param.id] !== undefined ? parameterValues[param.id] : (param.default || false)}
                      onChange={(e) => handleParameterChange(param.id, e.target.value === 'true')}
                      label={param.name}
                    >
                      <MenuItem value="true">��</MenuItem>
                      <MenuItem value="false">��</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              );
              
            case 'select':
              return (
                <Grid item xs={12} sm={6} key={param.id}>
                  <FormControl fullWidth>
                    <InputLabel>{param.name}</InputLabel>
                    <Select
                      value={parameterValues[param.id] || param.default || ''}
                      onChange={(e) => handleParameterChange(param.id, e.target.value)}
                      label={param.name}
                    >
                      {param.options?.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              );
              
            default:
              return null;
          }
        })}
      </Grid>
    );
  };
  
  // ��Ⱦ�������
  const renderAnalysisResults = () => {
    if (isAnalyzing) {
      return (
        <div sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            ����ִ�з���...
          </Typography>
        </div>
      );
    }
    
    if (!analysisResults.length) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          �����÷������������"���з���"��ť���鿴�����
        </Alert>
      );
    }
    
    return (
      <div sx={{ mt: 2 }}>
        <div sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={activeResultTab} 
            onChange={(_, newValue) => setActiveResultTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {analysisResults.map((result, index) => (
              <Tab key={index} label={result.title} />
            ))}
          </Tabs>
        </div>
        
        {analysisResults.map((result, index) => (
          <div 
            key={index}
            sx={{ 
              display: activeResultTab === index ? 'block' : 'none',
              minHeight: 300
            }}
          >
            {/* ������������ */}
            <div sx={{ mb: 2 }}>
              <Typography variant="h6">{result.title}</Typography>
              {result.description && (
                <Typography variant="body2" color="text.secondary">
                  {result.description}
                </Typography>
              )}
            </div>
            
            {/* ��Ⱦ��ͬ���͵Ľ�� */}
            {result.type === 'text' && (
              <Paper elevation={0} variant="outlined" sx={{ p: 2, whiteSpace: 'pre-line' }}>
                <Typography variant="body1">{result.data}</Typography>
              </Paper>
            )}
            
            {result.type === 'table' && (
              <Paper elevation={0} variant="outlined" sx={{ p: 2, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {Object.keys(result.data[0]).map(key => (
                        <th key={key} style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>                    {(result.data as Record<string, any>[]).map((row, rowIndex: number) => (
                      <tr key={rowIndex}>
                        {Object.values(row).map((cell: any, cellIndex: number) => (
                          <td key={cellIndex} style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Paper>
            )}
            
            {result.type === 'chart' && (
              <Paper elevation={0} variant="outlined" sx={{ p: 2, height: 300 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  ͼ������������ʾ����ʵ��Ӧ���У�������������������Ⱦ��Ӧ��ͼ����
                </Typography>
                <div sx={{ 
                  height: '80%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  borderRadius: 1
                }}>
                  <Typography>
                    {result.data.type === 'histogram' && 'ֱ��ͼ'}
                    {result.data.type === 'heatmap' && '��ͼ'}
                    {result.data.type === 'scatter' && 'ɢ��ͼ'}
                    {result.data.type === 'timeseries' && 'ʱ������ͼ'}
                  </Typography>
                </div>
              </Paper>
            )}
          </div>
        ))}
        
        <div sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            onClick={handleExportResults}
          >
            �������
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        �߼����ݷ���
      </Typography>
      
      <div sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          ʹ�ø���ͳ�ƺͻ���ѧϰ������ʵ�����ݽ������������ѡ�����ݼ����������������������ϵͳ���Զ�ִ�з��������ɿ��ӻ������
        </Typography>
      </div>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              ��������
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* ���ݼ�ѡ�� */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>���ݼ�</InputLabel>
              <Select
                value={selectedDataset}
                onChange={handleDatasetChange}
                label="���ݼ�"
                disabled={isAnalyzing}
              >
                {datasets.map(dataset => (
                  <MenuItem key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* ��������ѡ�� */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>��������</InputLabel>
              <Select
                value={selectedMethod}
                onChange={handleMethodChange}
                label="��������"
                disabled={isAnalyzing}
              >
                {availableAnalysisMethods.map(method => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* �������� */}
            {selectedMethodDetails && (
              <div sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedMethodDetails.description}
                </Typography>
              </div>
            )}
            
            {/* ����ѡ�� */}
            {selectedDatasetDetails && (
              <FormControl 
                fullWidth 
                sx={{ mb: 2 }}
                disabled={isAnalyzing}
              >
                <InputLabel>��������</InputLabel>
                <Select
                  multiple
                  value={selectedVariables}
                  onChange={handleVariableChange}
                  label="��������"
                >
                  {selectedDatasetDetails.variables.map(variable => (
                    <MenuItem key={variable} value={variable}>
                      {variable}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            {/* �������� */}
            <div sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                ��������
                <Tooltip title="���÷�����������Ĳ���">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <HelpIconIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              
              {renderParameterInputs()}
            </div>
            
            {/* ���а�ť */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !selectedDataset || !selectedMethod}
              startIcon={isAnalyzing ? <CircularProgress size={20} /> : <RefreshIcon />}
            >
              {isAnalyzing ? '������...' : '���з���'}
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                �������
              </Typography>
            </div>
            <Divider sx={{ mb: 2 }} />
            
            {renderAnalysisResults()}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default AdvancedDataAnalysis;


