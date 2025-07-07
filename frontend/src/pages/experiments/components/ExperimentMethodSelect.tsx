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

// ʵ��ʵʩ��ʽѡ��
export const experimentMethodOptions: Record<string, ExperimentMethodOption[]> = {
  // K12 ʵ������
  observation: [
    { value: 'direct_observation', label: 'ֱ�ӹ۲�', aiSupport: '����ʶ�����¼����' },
    { value: 'microscope_observation', label: '��΢�۲�', aiSupport: 'ϸ���ṹ�Զ�ʶ��' },
    { value: 'telescope_observation', label: '��Զ���۲�', aiSupport: '����ʶ����׷��' },
    { value: 'behavior_observation', label: '��Ϊ�۲�', aiSupport: '��Ϊģʽ����' },
  ],
  measurement: [
    { value: 'length_measurement', label: '���Ȳ���', aiSupport: '��������Զ���¼' },
    { value: 'weight_measurement', label: '��������', aiSupport: '����ͳ�������' },
    { value: 'temperature_measurement', label: '�¶Ȳ���', aiSupport: '�¶ȱ仯���߻���' },
    { value: 'time_measurement', label: 'ʱ�����', aiSupport: 'ʱ�����з���' },
    { value: 'volume_measurement', label: '�������', aiSupport: '������㸨��' },
  ],
  comparison: [
    { value: 'property_comparison', label: '���ʶԱ�', aiSupport: '��������ʶ��' },
    { value: 'group_comparison', label: '����Ա�', aiSupport: '�ԱȽ��ͳ��' },
    { value: 'before_after_comparison', label: 'ǰ��Ա�', aiSupport: '�仯���̷���' },
    { value: 'control_comparison', label: '����ʵ��', aiSupport: '�������Ƽ��' },
  ],
  exploration: [
    { value: 'hypothesis_testing', label: '������֤', aiSupport: 'ʵ����ƽ���' },
    { value: 'factor_exploration', label: '����̽��', aiSupport: '������ϵ����' },
    { value: 'pattern_exploration', label: '����̽��', aiSupport: 'ģʽʶ����Ԥ��' },
    { value: 'creative_exploration', label: '����̽��', aiSupport: '���·�������' },
  ],
  design: [
    { value: 'model_design', label: 'ģ�����', aiSupport: '��Ʒ����Ż�' },
    { value: 'device_design', label: 'װ�����', aiSupport: '�ṹ������Ľ�' },
    { value: 'program_design', label: '�������', aiSupport: '����������Ż�' },
    { value: 'system_design', label: 'ϵͳ���', aiSupport: 'ϵͳ��������' },
  ],
  analysis: [
    { value: 'data_analysis', label: '���ݷ���', aiSupport: 'ͳ�Ʒ�������ӻ�' },
    { value: 'result_analysis', label: '�������', aiSupport: '����������ܽ�' },
    { value: 'error_analysis', label: '������', aiSupport: '�����Դʶ��' },
    { value: 'trend_analysis', label: '���Ʒ���', aiSupport: '����Ԥ���뽨ģ' },
  ],
  synthesis: [
    { value: 'knowledge_synthesis', label: '֪ʶ�ۺ�', aiSupport: '֪ʶ��������' },
    { value: 'method_synthesis', label: '�����ۺ�', aiSupport: '��������Ż�' },
    { value: 'conclusion_synthesis', label: '�����ۺ�', aiSupport: '������������֤' },
    { value: 'report_synthesis', label: '�����ۺ�', aiSupport: '��������������' },
  ],

  // ���ݾɰ�ʵ������
  physics_experiment: [
    { value: 'mechanics_lab', label: '��ѧʵ��', aiSupport: '�������ݲɼ������' },
    { value: 'thermodynamics_lab', label: '��ѧʵ��', aiSupport: '�¶ȱ仯���߷���' },
    { value: 'optics_lab', label: '��ѧʵ��', aiSupport: '��·�Զ�ʶ�������' },
    { value: 'electricity_lab', label: '��ѧʵ��', aiSupport: '��·���Ϸ��������' },
    { value: 'virtual_physics', label: '��������ʵ��', aiSupport: '����ģ����Ԥ��' },
  ],
  chemistry_experiment: [
    { value: 'titration_analysis', label: '�ζ�����ʵ��', aiSupport: '��ɫ�仯������յ��ж�' },
    { value: 'organic_synthesis', label: '�л��ϳ�ʵ��', aiSupport: '��Ӧ���̼�������' },
    { value: 'element_detection', label: 'Ԫ�ؼ��ʵ��', aiSupport: '��ѧ��Ӧʶ��' },
    { value: 'virtual_chemistry', label: '��ѧ����ʵ��', aiSupport: '��Ӧģ����Ԥ��' },
  ],
  biology_experiment: [
    { value: 'microscope_observation', label: '��΢�۲�ʵ��', aiSupport: 'ϸ���Զ�ʶ�������' },
    { value: 'physiological_measurement', label: '��������ʵ��', aiSupport: '�������ݷ������쳣Ԥ��' },
    { value: 'ecological_survey', label: '��̬����ʵ��', aiSupport: '����ʶ��������ͳ��' },
    { value: 'virtual_biology', label: '��������ʵ��', aiSupport: '�������ģ��' },
  ],
  integrated_ScienceIcon: [
    { value: 'environmental_monitoring', label: '�������ʵ��', aiSupport: '��������ݷ���������Ԥ��' },
    { value: 'renewable_energy', label: '��������Դʵ��', aiSupport: '��ԴЧ�ʷ������Ż�' },
    { value: 'material_ScienceIcon', label: '���Ͽ�ѧʵ��', aiSupport: '�������Բ��������' },
    { value: 'cross_disciplinary', label: '��ѧ��̽����Ŀ', aiSupport: '��ά���ݹ�������' },
  ],
  info_technology: [
    { value: 'algorithm_analysis', label: '�㷨����ʵ��', aiSupport: '�㷨����Ԥ������ӻ�' },
    { value: 'database_design', label: '���ݿ����ʵ��', aiSupport: '��ѯ�Ż�����' },
    { value: 'network_simulation', label: '����ģ��ʵ��', aiSupport: '�����쳣���' },
    { value: 'programming_project', label: '�����Ŀʵ��', aiSupport: '���������������Ż�' },
  ],
  
  // �߽�ʵ��
  EngineeringIcon_lab: [
    { value: 'material_testing', label: '���ϲ���ʵ��', aiSupport: '�������ܷ�����Ԥ��' },
    { value: 'circuit_design', label: '��·���ʵ��', aiSupport: '��·����ģ�������' },
    { value: 'structural_analysis', label: '�ṹ����ʵ��', aiSupport: 'Ӧ���ֲ����ӻ�' },
    { value: 'control_systems', label: '����ϵͳʵ��', aiSupport: 'ϵͳ��Ӧ�������Ż�' },
  ],
  medical_lab: [
    { value: 'specimen_analysis', label: '��������ʵ��', aiSupport: 'ҽѧ����ͼ��ʶ��' },
    { value: 'medical_imaging', label: 'ҽѧ����ʵ��', aiSupport: '�����쳣�������ϸ���' },
    { value: 'physiological_recording', label: '������¼ʵ��', aiSupport: '�����ź�ģʽʶ��' },
    { value: 'drug_testing', label: 'ҩ��ʵ��', aiSupport: 'ҩЧ���ݷ�����Ԥ��' },
  ],
  environmental_ScienceIcon: [
    { value: 'water_quality', label: 'ˮ�ʷ���ʵ��', aiSupport: 'ˮ�ʲ�����������' },
    { value: 'air_pollution', label: '������Ⱦʵ��', aiSupport: '��Ⱦ����ɢģ��' },
    { value: 'soil_analysis', label: '��������ʵ��', aiSupport: '�����ɷ�����ʶ��' },
    { value: 'ecosystem_modeling', label: '��̬ϵͳ��ģ', aiSupport: '��̬ϵͳ��̬Ԥ��' },
  ],
  computer_ScienceIcon_lab: [
    { value: 'distributed_systems', label: '�ֲ�ʽϵͳʵ��', aiSupport: 'ϵͳ���ܼ�����쳣Ԥ��' },
    { value: 'database_performance', label: '���ݿ�����ʵ��', aiSupport: '����ƿ��ʶ�����Ż�' },
    { value: 'network_security', label: '���簲ȫʵ��', aiSupport: '��ȫ��в������������' },
    { value: 'ai_systems', label: 'AIϵͳʵ��', aiSupport: 'ģ�������������Ż�' },
  ],
  
  // AIģ��ʵ�飨����ԭ�й��ܣ�
  image_classification: [
    { value: 'resnet18', label: 'ResNet18', aiSupport: 'ģ��ѵ��������' },
    { value: 'resnet50', label: 'ResNet50', aiSupport: 'ģ��ѵ��������' },
    { value: 'mobilenet_v2', label: 'MobileNet v2', aiSupport: 'ģ��ѵ��������' },
    { value: 'efficientnet_b0', label: 'EfficientNet B0', aiSupport: 'ģ��ѵ��������' },
    { value: 'vit_base', label: 'Vision Transformer (ViT)', aiSupport: 'ģ��ѵ��������' },
  ],
  object_detection: [
    { value: 'yolov5s', label: 'YOLOv5s', aiSupport: 'ģ��ѵ��������' },
    { value: 'yolov8n', label: 'YOLOv8n', aiSupport: 'ģ��ѵ��������' },
    { value: 'faster_rcnn', label: 'Faster R-CNN', aiSupport: 'ģ��ѵ��������' },
    { value: 'ssd300', label: 'SSD300', aiSupport: 'ģ��ѵ��������' },
    { value: 'retinanet', label: 'RetinaNet', aiSupport: 'ģ��ѵ��������' },
  ],
  nlp_experiment: [
    { value: 'bert_base', label: 'BERT Base', aiSupport: 'ģ��ѵ��������' },
    { value: 'roberta_base', label: 'RoBERTa Base', aiSupport: 'ģ��ѵ��������' },
    { value: 'lstm', label: 'LSTM', aiSupport: 'ģ��ѵ��������' },
    { value: 'transformer', label: 'Transformer', aiSupport: 'ģ��ѵ��������' },
  ],
  
  // �Զ���ʵ��
  custom: [
    { value: 'custom_method', label: '�Զ���ʵ�鷽��', aiSupport: '����������' },
  ],
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
  const methods = experimentMethodOptions[experimentType] || [];
  
  return (
    <div sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        ѡ��ʵ�鷽��
      </Typography>
      
      <FormControl fullWidth error={!!error} sx={{ mb: 3 }}>
        <InputLabel>ʵ�鷽��</InputLabel>
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          label="ʵ�鷽��"
        >
          {methods.map(method => (
            <MenuItem key={method.value} value={method.value}>
              {method.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
      
      {value && methods.length > 0 && (
        <Grid container spacing={2}>
          {methods
            .filter(method => method.value === value)
            .map(method => (
              <Grid item xs={12} key={method.value}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {method.label}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      AI��������: {method.aiSupport}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </div>
  );
};

export default ExperimentMethodSelect;

