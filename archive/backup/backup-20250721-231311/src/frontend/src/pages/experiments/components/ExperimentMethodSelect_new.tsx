import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { ExperimentType } from '../../../types';

export interface ExperimentMethodOption {
  value: string;
  label: string;
  aiSupport: string;
}

// 实验实施方式选项
export const experimentMethodOptions: Record<string, ExperimentMethodOption[]> = {
  // K12 实验方法
  observation: [
    { value: 'direct_observation', label: '直接观察', aiSupport: '智能识别和自动记录' },
    { value: 'microscope_observation', label: '显微观察', aiSupport: '细胞结构自动识别' },
    { value: 'telescope_observation', label: '望远镜观察', aiSupport: '天体识别和追踪' },
    { value: 'behavior_observation', label: '行为观察', aiSupport: '行为模式分析' },
  ],
  measurement: [
    { value: 'length_measurement', label: '长度测量', aiSupport: '尺寸数据自动记录' },
    { value: 'weight_measurement', label: '重量测量', aiSupport: '称重统计分析' },
    { value: 'temperature_measurement', label: '温度测量', aiSupport: '温度变化趋势分析' },
    { value: 'time_measurement', label: '时间测量', aiSupport: '时间数据分析' },
    { value: 'volume_measurement', label: '体积测量', aiSupport: '体积计算辅助' },
  ],
  comparison: [
    { value: 'property_comparison', label: '性质对比', aiSupport: '属性差异识别' },
    { value: 'group_comparison', label: '分组对比', aiSupport: '对比结果统计' },
    { value: 'before_after_comparison', label: '前后对比', aiSupport: '变化过程分析' },
    { value: 'control_comparison', label: '对照实验', aiSupport: '变量控制检测' },
  ],
  exploration: [
    { value: 'hypothesis_testing', label: '假设验证', aiSupport: '实验设计建议' },
    { value: 'factor_exploration', label: '因素探究', aiSupport: '因果关系分析' },
    { value: 'pattern_exploration', label: '规律探究', aiSupport: '模式识别和预测' },
    { value: 'creative_exploration', label: '创新探究', aiSupport: '新思路方案建议' },
  ],
  design: [
    { value: 'model_design', label: '模型设计', aiSupport: '设计方案优化' },
    { value: 'device_design', label: '装置设计', aiSupport: '结构分析和改进' },
    { value: 'program_design', label: '程序设计', aiSupport: '代码结构优化' },
    { value: 'system_design', label: '系统设计', aiSupport: '系统架构建议' },
  ],
  analysis: [
    { value: 'data_analysis', label: '数据分析', aiSupport: '统计分析和可视化' },
    { value: 'result_analysis', label: '结果分析', aiSupport: '结论提取和总结' },
    { value: 'error_analysis', label: '误差分析', aiSupport: '误差来源识别' },
    { value: 'trend_analysis', label: '趋势分析', aiSupport: '趋势预测和建模' },
  ],
  synthesis: [
    { value: 'knowledge_synthesis', label: '知识综合', aiSupport: '知识点关联分析' },
    { value: 'method_synthesis', label: '方法综合', aiSupport: '方法组合优化' },
    { value: 'conclusion_synthesis', label: '结论综合', aiSupport: '多维结论整合验证' },
    { value: 'report_synthesis', label: '报告综合', aiSupport: '报告结构和内容生成' },
  ],

  // 兼容旧版实验类型
  physics_experiment: [
    { value: 'mechanics_lab', label: '力学实验', aiSupport: '力学数据采集和分析' },
    { value: 'thermodynamics_lab', label: '热学实验', aiSupport: '温度变化趋势分析' },
    { value: 'optics_lab', label: '光学实验', aiSupport: '光路自动识别和测量' },
    { value: 'electricity_lab', label: '电学实验', aiSupport: '电路参数分析和诊断' },
    { value: 'virtual_physics', label: '物理虚拟实验', aiSupport: '物理模拟和预测' },
  ],
  chemistry_experiment: [
    { value: 'titration_analysis', label: '滴定分析实验', aiSupport: '颜色变化检测和终点判断' },
    { value: 'organic_synthesis', label: '有机合成实验', aiSupport: '反应过程监控和优化' },
    { value: 'element_detection', label: '元素检测实验', aiSupport: '化学反应识别' },
    { value: 'virtual_chemistry', label: '化学虚拟实验', aiSupport: '反应模拟和预测' },
  ],
  biology_experiment: [
    { value: 'microscope_observation', label: '显微观察实验', aiSupport: '细胞自动识别和计数' },
    { value: 'physiological_measurement', label: '生理测量实验', aiSupport: '生理数据分析和异常预警' },
    { value: 'ecological_survey', label: '生态调查实验', aiSupport: '物种识别和数据统计' },
    { value: 'virtual_biology', label: '生物虚拟实验', aiSupport: '生物过程模拟' },
  ],
  integrated_science: [
    { value: 'environmental_monitoring', label: '环境监测实验', aiSupport: '环境数据分析和污染预警' },
    { value: 'renewable_energy', label: '可再生能源实验', aiSupport: '能源效率分析和优化' },
    { value: 'material_science', label: '材料科学实验', aiSupport: '材料性质测试和分析' },
    { value: 'cross_disciplinary', label: '跨学科探究项目', aiSupport: '多维数据关联分析' },
  ],
  info_technology: [
    { value: 'algorithm_analysis', label: '算法分析实验', aiSupport: '算法性能预测和优化' },
    { value: 'database_design', label: '数据库设计实验', aiSupport: '查询优化建议' },
    { value: 'network_simulation', label: '网络模拟实验', aiSupport: '网络异常监测' },
    { value: 'programming_project', label: '编程项目实验', aiSupport: '代码质量检查和优化' },
  ],

  // AI/ML实验方法
  image_classification: [
    { value: 'supervised_learning', label: '监督学习', aiSupport: '模型训练指导和参数调优' },
    { value: 'transfer_learning', label: '迁移学习', aiSupport: '预训练模型推荐' },
    { value: 'data_augmentation', label: '数据增强', aiSupport: '增强策略优化' },
    { value: 'model_evaluation', label: '模型评估', aiSupport: '性能指标分析和改进建议' },
  ],
  object_detection: [
    { value: 'yolo_detection', label: 'YOLO检测', aiSupport: 'YOLO模型配置优化' },
    { value: 'rcnn_detection', label: 'R-CNN检测', aiSupport: 'R-CNN架构调优' },
    { value: 'ssd_detection', label: 'SSD检测', aiSupport: 'SSD参数优化' },
    { value: 'custom_detection', label: '自定义检测', aiSupport: '检测模型设计建议' },
  ],
  nlp_classification: [
    { value: 'text_preprocessing', label: '文本预处理', aiSupport: '预处理流程优化' },
    { value: 'feature_extraction', label: '特征提取', aiSupport: '特征选择建议' },
    { value: 'model_training', label: '模型训练', aiSupport: '超参数调优建议' },
    { value: 'sentiment_analysis', label: '情感分析', aiSupport: '情感分类优化' },
  ],
  speech_recognition: [
    { value: 'audio_preprocessing', label: '音频预处理', aiSupport: '噪声去除和增强' },
    { value: 'feature_extraction', label: '特征提取', aiSupport: 'MFCC特征优化' },
    { value: 'sequence_modeling', label: '序列建模', aiSupport: 'RNN/LSTM架构建议' },
    { value: 'language_modeling', label: '语言建模', aiSupport: '语言模型集成' },
  ],
  time_series: [
    { value: 'data_preprocessing', label: '数据预处理', aiSupport: '时间序列清洗和插值' },
    { value: 'trend_analysis', label: '趋势分析', aiSupport: '趋势识别和分解' },
    { value: 'forecasting', label: '预测建模', aiSupport: '预测模型选择和调优' },
    { value: 'anomaly_detection', label: '异常检测', aiSupport: '异常模式识别' },
  ],
  custom: [
    { value: 'exploratory_analysis', label: '探索性分析', aiSupport: '数据探索指导' },
    { value: 'hypothesis_testing', label: '假设检验', aiSupport: '统计检验方法建议' },
    { value: 'model_comparison', label: '模型比较', aiSupport: '模型选择和评估' },
    { value: 'result_interpretation', label: '结果解释', aiSupport: '结果可视化和解释' },
  ]
};

interface ExperimentMethodSelectProps {
  experimentType: ExperimentType;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const ExperimentMethodSelect: React.FC<ExperimentMethodSelectProps> = ({
  experimentType,
  value,
  onChange,
  error
}) => {
  const options = experimentMethodOptions[experimentType] || [];
  const selectedOption = options.find(option => option.value === value);

  return (
    <Box>
      <FormControl fullWidth error={!!error}>
        <InputLabel>选择实验方法</InputLabel>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          label="选择实验方法"
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>

      {selectedOption && (
        <Card sx={{ mt: 2, bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedOption.label}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  AI辅助功能：
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOption.aiSupport}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ExperimentMethodSelect;
