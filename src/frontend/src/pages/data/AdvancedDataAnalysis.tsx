import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Alert, 
  Chip,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { DownloadIcon } from '../../utils/icons';
import { toast } from 'react-hot-toast';

// 分析方法接口
interface AnalysisMethod {
  id: string;
  name: string;
  description: string;
  parameters: AnalysisParameter[];
}

// 分析参数接口
interface AnalysisParameter {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  required: boolean;
  default?: any;
  options?: { value: string; label: string }[];
  description?: string;
}

// 分析结果接口
interface AnalysisResult {
  type: 'text' | 'table' | 'chart';
  title: string;
  description?: string;
  data: any;
}

// 预设分析方法
const availableAnalysisMethods: AnalysisMethod[] = [
  {
    id: 'descriptive',
    name: '描述性统计',
    description: '计算数据的基本统计信息，包括均值、中位数、标准差等。',
    parameters: [
      {
        id: 'confidence_level',
        name: '置信水平',
        type: 'select',
        required: true,
        default: '0.95',
        options: [
          { value: '0.90', label: '90%' },
          { value: '0.95', label: '95%' },
          { value: '0.99', label: '99%' }
        ]
      }
    ]
  },
  {
    id: 'correlation',
    name: '相关性分析',
    description: '分析变量之间的相关性强度。',
    parameters: [
      {
        id: 'method',
        name: '相关系数方法',
        type: 'select',
        required: true,
        default: 'pearson',
        options: [
          { value: 'pearson', label: 'Pearson相关系数' },
          { value: 'spearman', label: 'Spearman等级相关' }
        ]
      }
    ]
  }
];

const AdvancedDataAnalysis: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [analysisParameters, setAnalysisParameters] = useState<{ [key: string]: any }>({});
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);

  // 模拟数据集
  const mockDatasets = useMemo(() => [
    { id: 'temperature_data', name: '温度传感器数据', variables: ['temperature', 'humidity', 'pressure'] },
    { id: 'experiment_results', name: '实验结果数据', variables: ['ph_value', 'concentration', 'reaction_time'] }
  ], []);

  // 获取数据集变量
  useEffect(() => {
    if (selectedDataset) {
      const dataset = mockDatasets.find(d => d.id === selectedDataset);
      if (dataset) {
        setAvailableVariables(dataset.variables);
        setSelectedVariables([]);
      }
    }
  }, [selectedDataset, mockDatasets]);

  // 初始化分析参数
  useEffect(() => {
    if (selectedMethod) {
      const method = availableAnalysisMethods.find(m => m.id === selectedMethod);
      if (method) {
        const defaultParams: { [key: string]: any } = {};
        method.parameters.forEach(param => {
          defaultParams[param.id] = param.default;
        });
        setAnalysisParameters(defaultParams);
      }
    }
  }, [selectedMethod]);

  const handleParameterChange = (paramId: string, value: any) => {
    setAnalysisParameters(prev => ({
      ...prev,
      [paramId]: value
    }));
  };

  const handleRunAnalysis = async () => {
    if (!selectedDataset || !selectedMethod || selectedVariables.length === 0) {
      toast.error('请选择数据集、分析方法和变量');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟分析结果
      const mockResult: AnalysisResult = {
        type: 'text',
        title: `${availableAnalysisMethods.find(m => m.id === selectedMethod)?.name}结果`,
        description: '分析已完成',
        data: {
          summary: '分析结果摘要：数据显示了显著的相关性，R²值为0.85，表明模型拟合良好。',
          statistics: {
            mean: 25.4,
            median: 25.2,
            std: 2.1,
            min: 20.1,
            max: 30.8
          }
        }
      };

      setAnalysisResults([mockResult]);
      toast.success('分析完成！');
    } catch (error) {
      toast.error('分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportResults = () => {
    const dataStr = JSON.stringify(analysisResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analysis_results_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getCurrentMethod = () => {
    return availableAnalysisMethods.find(m => m.id === selectedMethod);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        高级数据分析
      </Typography>
      
      <Grid container spacing={3}>
        {/* 左侧：分析配置 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              分析配置
            </Typography>
            
            {/* 数据集选择 */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>选择数据集</InputLabel>
              <Select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
              >
                {mockDatasets.map(dataset => (
                  <MenuItem key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 分析方法选择 */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>选择分析方法</InputLabel>
              <Select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
              >
                {availableAnalysisMethods.map(method => (
                  <MenuItem key={method.id} value={method.id}>
                    {method.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 变量选择 */}
            {availableVariables.length > 0 && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>选择变量</InputLabel>
                <Select
                  multiple
                  value={selectedVariables}
                  onChange={(e) => setSelectedVariables(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availableVariables.map(variable => (
                    <MenuItem key={variable} value={variable}>
                      {variable}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* 分析方法描述 */}
            {getCurrentMethod() && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {getCurrentMethod()?.description}
              </Alert>
            )}

            {/* 参数配置 */}
            {getCurrentMethod() && getCurrentMethod()?.parameters.map(param => (
              <Box key={param.id} sx={{ mb: 2 }}>
                {param.type === 'select' ? (
                  <FormControl fullWidth>
                    <InputLabel>{param.name}</InputLabel>
                    <Select
                      value={analysisParameters[param.id] || param.default}
                      onChange={(e) => handleParameterChange(param.id, e.target.value)}
                    >
                      {param.options?.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label={param.name}
                    type={param.type === 'number' ? 'number' : 'text'}
                    value={analysisParameters[param.id] || param.default}
                    onChange={(e) => handleParameterChange(param.id, param.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                    helperText={param.description}
                  />
                )}
              </Box>
            ))}

            {/* 运行分析按钮 */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !selectedDataset || !selectedMethod || selectedVariables.length === 0}
              sx={{ mt: 2 }}
            >
              {isAnalyzing ? '分析中...' : '运行分析'}
            </Button>
          </Paper>
        </Grid>

        {/* 右侧：分析结果 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                分析结果
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportResults}
                disabled={analysisResults.length === 0}
              >
                导出结果
              </Button>
            </Box>

            {isAnalyzing && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  正在执行分析...
                </Typography>
                <LinearProgress />
              </Box>
            )}

            {analysisResults.length === 0 && !isAnalyzing && (
              <Alert severity="info">
                请配置分析参数并运行分析以查看结果
              </Alert>
            )}

            {analysisResults.map((result, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {result.title}
                  </Typography>
                  {result.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {result.description}
                    </Typography>
                  )}
                  
                  {result.type === 'text' && (
                    <Box>
                      <Typography variant="body1" paragraph>
                        {result.data.summary}
                      </Typography>
                      
                      {result.data.statistics && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            统计信息：
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2">
                                均值: {result.data.statistics.mean}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2">
                                中位数: {result.data.statistics.median}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2">
                                标准差: {result.data.statistics.std}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="body2">
                                范围: {result.data.statistics.min} - {result.data.statistics.max}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedDataAnalysis;
