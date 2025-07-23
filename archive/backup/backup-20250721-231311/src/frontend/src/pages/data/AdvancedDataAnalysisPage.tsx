import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import AdvancedDataAnalysis from '../../components/visualizations/AdvancedDataAnalysis';

// 模拟数据类型 - 与组件接口匹配
interface DataPoint {
  timestamp: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

const AdvancedDataAnalysisPage: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // 生成模拟数据
    const mockData: DataPoint[] = Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: Math.random() * 100 + Math.sin(i * 0.1) * 20,
      category: ['实验数据', '模拟数据', '传感器数据'][i % 3],
      metadata: {
        source: `source-${Math.floor(i / 10)}`,
        quality: Math.random() > 0.8 ? 'high' : 'medium'
      }
    }));
    setData(mockData);
  }, []);

  const handleExportReport = (reportData: any) => {
    // console.log removed
    // 这里可以实现实际的导出逻辑
  };

  return (
    <>
      <Helmet>
        <title>高级数据分析 - AI实验平台</title>
        <meta name="description" content="高级数据分析功能，提供深度学习模型的数据分析工具" />
      </Helmet>
      
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            高级数据分析
          </Typography>
          <Typography variant="body1" color="text.secondary">
            使用高级算法和可视化工具进行深度数据分析
          </Typography>
        </Box>
        
        <AdvancedDataAnalysis 
          data={data}
          title="实验数据分析"
          enableRealTimeUpdate={true}
          onExportReport={handleExportReport}
        />
      </Container>
    </>
  );
};

export default AdvancedDataAnalysisPage;

