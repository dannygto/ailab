import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormGroup,
  Card,
  CardContent,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';

interface AIAssistanceOption {
  id: string;
  name: string;
  description: string;
  features: string[];
}

interface AIAssistanceSelectProps {
  selectedAssistance?: string;
  onSelectionChange?: (assistanceId: string) => void;
}

// AI助手选项配置
const assistanceOptions: AIAssistanceOption[] = [
  {
    id: 'basic',
    name: '基础AI助手',
    description: '提供基本的实验指导和问题解答',
    features: ['实验步骤指导', '常见问题解答', '基础数据分析']
  },
  {
    id: 'advanced',
    name: '高级AI助手',
    description: '提供深度分析和智能建议',
    features: ['深度数据分析', '智能参数优化', '实验结果预测', '异常检测']
  },
  {
    id: 'expert',
    name: '专家级AI助手',
    description: '提供专业级实验支持和研究建议',
    features: ['专业研究建议', '论文写作支持', '实验设计优化', '跨学科知识整合']
  }
];

// 导出选项数组以供其他组件使用
export const aiAssistOptions = assistanceOptions;

const AIAssistanceSelect: React.FC<AIAssistanceSelectProps> = ({
  selectedAssistance = '',
  onSelectionChange
}) => {
  const [selectedValue, setSelectedValue] = useState(selectedAssistance);

  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    onSelectionChange?.(value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        选择AI助手类型
      </Typography>
      
      <FormControl component="fieldset" fullWidth>
        <FormGroup>
          <RadioGroup 
            value={selectedValue} 
            onChange={handleSelectionChange}
          >
            <Grid container spacing={2}>
              {assistanceOptions.map((option) => (
                <Grid item xs={12} md={4} key={option.id}>
                  <Card 
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      border: selectedValue === option.id ? 2 : 1,
                      borderColor: selectedValue === option.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => {
                      setSelectedValue(option.id);
                      onSelectionChange?.(option.id);
                    }}
                  >
                    <CardContent>
                      <FormControlLabel
                        value={option.id}
                        control={<Radio />}
                        label=""
                        sx={{ display: 'none' }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {option.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {option.description}
                        </Typography>
                        <Typography variant="caption" component="div">
                          <strong>功能特点:</strong>
                          <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                            {option.features.map((feature, index) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </FormGroup>
      </FormControl>
    </Box>
  );
};

export default AIAssistanceSelect;
