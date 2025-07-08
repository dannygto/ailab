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

export interface ExperimentResourceOption {
  value: string;
  label: string;
  equipment?: string;
  software?: string;
  size?: string;
  classes?: number | null;
}

// ʵ����Դѡ��
export const experimentResourceOptions: Record<string, ExperimentResourceOption[]> = {
  // K12ʵ��������Դ
  observation: [
    { value: 'microscope_basic', label: '������΢��', equipment: 'ѧ����΢�����ز�Ƭ���ǲ�Ƭ', software: '��΢�۲��¼����' },
    { value: 'magnifying_glass', label: '�Ŵ���װ', equipment: '�ֳַŴ󾵡�̨ʽ�Ŵ�', software: '�۲��¼Ӧ��' },
    { value: 'telescope_basic', label: '������Զ��', equipment: 'ѧ����Զ������ͼ', software: '����۲�Ӧ��' },
    { value: 'observation_tools', label: '�۲칤�߰�', equipment: '��¼���������ߡ���ʱ��', software: '���ݼ�¼����' },
    { value: 'virtual_observation', label: '����۲�ʵ��', equipment: '����ʵ���豸', software: '�۲�ģ��ϵͳ' },
  ],
  measurement: [
    { value: 'measurement_basic', label: '������������', equipment: 'ֱ�ߡ����ߡ�����������ƽ', software: '�������ݼ�¼����' },
    { value: 'digital_measurement', label: '���ֲ����豸', equipment: '������ƽ�������¶ȼơ��������ñ�', software: '���ݲɼ�����' },
    { value: 'precision_tools', label: '���ܲ�������', equipment: '�α꿨�ߡ�������΢�������ӳ�', software: '���ȷ�������' },
    { value: 'sensor_kit', label: '��������װ', equipment: '�¶ȴ�������ʪ�ȴ���������ǿ������', software: '���������ݷ�������' },
    { value: 'virtual_measurement', label: '�������ʵ��', equipment: '����ʵ���豸', software: '����ģ��ϵͳ' },
  ],
  comparison: [
    { value: 'sample_preparation', label: '��Ʒ�Ʊ�����', equipment: '�Թܡ��ձ��������󡢱�ǩ', software: '�Ա�ʵ���¼����' },
    { value: 'control_group_kit', label: '������ʵ����װ', equipment: '��ͬ������ġ�������', software: '����ʵ���������' },
    { value: 'property_test_kit', label: '���ʲ��Թ���', equipment: '����������ֽ���������', software: '���ʶԱȷ�������' },
    { value: 'data_collection', label: '�����ռ�����', equipment: '��¼������������ͳ�ƹ���', software: 'ͳ�Ʒ�������' },
    { value: 'virtual_comparison', label: '����Ա�ʵ��', equipment: '����ʵ���豸', software: '�Ա�ģ��ϵͳ' },
  ],
  exploration: [
    { value: 'hypothesis_kit', label: '������֤���߰�', equipment: 'ʵ�����ģ�塢�������ƹ���', software: 'ʵ���������' },
    { value: 'investigation_tools', label: '̽��ʵ�鹤��', equipment: '�๦��ʵ�����ġ�̽�롢�����', software: '̽�����̼�¼����' },
    { value: 'creative_materials', label: '����ʵ�����', equipment: '������ʵ�����ġ���������', software: '�����������' },
    { value: 'analysis_equipment', label: '��������豸', equipment: '���׷�������������Լ�', software: '�����������' },
    { value: 'virtual_exploration', label: '����̽��ʵ��', equipment: '����ʵ���豸', software: '̽��ģ��ϵͳ' },
  ],
  design: [
    { value: 'construction_kit', label: '���������װ', equipment: '��ľ�����Ӽ�����������', software: '3D�������' },
    { value: 'electronics_basic', label: '���������׼�', equipment: '����塢LED�����衢����', software: '��·�������' },
    { value: 'mechanical_parts', label: '��е�����', equipment: '���֡��ܸˡ����֡����', software: '��е�������' },
    { value: 'programming_tools', label: '��̹���', equipment: '΢��������������ģ��', software: 'ͼ�λ���̻���' },
    { value: 'virtual_design', label: '�������ʵ��', equipment: '����ʵ���豸', software: '���ģ��ϵͳ' },
  ],
  analysis: [
    { value: 'data_analysis_tools', label: '���ݷ�������', equipment: '��������ͼ�����ߡ�ͳ������', software: '���ݷ���������' },
    { value: 'sample_analysis', label: '��Ʒ�����豸', equipment: '���׷����ǡ����Կ����Աȱ�׼', software: '��Ʒ��������' },
    { value: 'result_documentation', label: '�����¼����', equipment: 'ʵ�鱨��ģ�塢ͼ������', software: '������������' },
    { value: 'error_analysis_kit', label: '���������߰�', equipment: '���Ȳ��Թ��ߡ�У׼��׼', software: '����������' },
    { value: 'virtual_analysis', label: '�������ʵ��', equipment: '����ʵ���豸', software: '����ģ��ϵͳ' },
  ],
  synthesis: [
    { value: 'integration_tools', label: '�ۺ�ʵ�鹤��', equipment: '��ѧ��ʵ���������', software: '�ۺϷ�������' },
    { value: 'project_kit', label: '��Ŀʵ����װ', equipment: '������Ŀ����ȫ������', software: '��Ŀ��������' },
    { value: 'collaboration_tools', label: 'Э��ʵ�鹤��', equipment: '�Ŷ�ʵ�����ġ��ֹ���ʶ', software: 'Э��ƽ̨����' },
    { value: 'presentation_kit', label: 'չʾ���߰�', equipment: 'չʾ�塢ģ�Ͳ��ϡ���ʾ�豸', software: '��ʾ�ĸ�����' },
    { value: 'virtual_synthesis', label: '�����ۺ�ʵ��', equipment: '����ʵ���豸', software: '�ۺ�ģ��ϵͳ' },
  ],

  // ���ݾɰ�ʵ�����ͣ������Է������ط�ʹ�ã�
  physics_experiment: [
    { value: 'basic_mechanics_kit', label: '������ѧʵ���׼�', equipment: '��ѧ�������������ơ���ʱ��', software: '���ݲɼ�����' },
    { value: 'advanced_optics_set', label: '�߼���ѧʵ���׼�', equipment: '����������ѧԪ�������̽����', software: '��·��������' },
    { value: 'electricity_lab_kit', label: '��ѧʵ���׼�', equipment: '��·ʵ��塢���ñ���ʾ����', software: '��·ģ������' },
    { value: 'physics_virtual_lab', label: '��������ʵ����', equipment: '����ʵ���豸', software: '����ʵ��ģ��ϵͳ' },
    { value: 'custom', label: '�Զ�����Դ', equipment: '�û��Զ���', software: '�û��Զ���' },
  ],
  // ��ѧʵ����Դ
  chemistry_experiment: [
    { value: 'chemistry_basic_kit', label: '������ѧʵ���׼�', equipment: '�Թܡ��ձ����ƾ��ơ�pH��', software: '��ѧ��Ӧģ������' },
    { value: 'titration_analysis_kit', label: '�ζ�����ʵ���׼�', equipment: '�ζ��ܡ�����ƿ����ƽ', software: '�ζ����߷�������' },
    { value: 'organic_chemistry_set', label: '�л���ѧʵ���׼�', equipment: '����װ�á���������������', software: '���ӽṹģ������' },
    { value: 'chemistry_virtual_lab', label: '��ѧ����ʵ����', equipment: '����ʵ���豸', software: '��ѧʵ��ģ��ϵͳ' },
    { value: 'custom', label: '�Զ�����Դ', equipment: '�û��Զ���', software: '�û��Զ���' },
  ],
  
  // ����ʵ����Դ
  biology_experiment: [
    { value: 'microscope_set', label: '��΢�۲��׼�', equipment: '��΢������Ƭ���ߡ�Ⱦɫ��', software: 'ϸ��ʶ������' },
    { value: 'physiology_kit', label: '����ʵ���׼�', equipment: '�ĵ�ͼ�ǡ�Ѫѹ�ơ��λ�����', software: '�������ݷ�������' },
    { value: 'ecology_survey_kit', label: '��̬���鹤�߰�', equipment: '�������ߡ�GPS��λ�ǡ����������', software: '��̬���ݴ�������' },
    { value: 'biology_virtual_lab', label: '��������ʵ����', equipment: '����ʵ���豸', software: '����ѧģ��ϵͳ' },
    { value: 'custom', label: '�Զ�����Դ', equipment: '�û��Զ���', software: '�û��Զ���' },
  ],
  
  // �ۺϿ�ѧʵ����Դ
  integrated_ScienceIcon: [
    { value: 'environment_monitor_kit', label: '������⹤�߰�', equipment: '�����ˮ�ʷ����ǡ�����վ�����������', software: '�������ݷ���ƽ̨' },
    { value: 'renewable_energy_kit', label: '��������Դʵ���׼�', equipment: '̫���ܵ�ذ塢���������������ת����', software: '��Դϵͳģ������' },
    { value: 'smart_home_kit', label: '���ܼҾ�ʵ���׼�', equipment: '��������װ��Arduino��������ִ�������', software: '���ܼҾӿ���ϵͳ' },
    { value: 'integrated_virtual_lab', label: '�ۺ�����ʵ����', equipment: '����ʵ���豸', software: '��ѧ��ģ��ƽ̨' },
    { value: 'custom', label: '�Զ�����Դ', equipment: '�û��Զ���', software: '�û��Զ���' },
  ],
  
  // ��Ϣ����ʵ����Դ
  info_technology: [
    { value: 'programming_station', label: '���ʵ�鹤��վ', equipment: '�����ܼ�����������塢�������׼�', software: '���ɿ����������汾����ϵͳ' },
    { value: 'network_lab_kit', label: '����ʵ���׼�', equipment: '·�����������������������', software: '����ģ��������������������' },
    { value: 'database_server', label: '���ݿ�ʵ�������', equipment: '������Ӳ��', software: '���ݿ����ϵͳ�����ܷ�������' },
    { value: 'virtual_it_lab', label: '����ITʵ����', equipment: '����ʵ���豸', software: '�ƶ˿����������������Ⱥ' },
    { value: 'custom', label: '�Զ�����Դ', equipment: '�û��Զ���', software: '�û��Զ���' },
  ],
  
  // �߽̹���ʵ����Դ
  EngineeringIcon_lab: [
    { value: 'material_testing_equipment', label: '���ϲ����豸', equipment: '�����������Ӳ�ȼơ�ƣ�������', software: '�������ܷ�������' },
    { value: 'circuit_design_station', label: '��·��ƹ���վ', equipment: 'ʾ�������źŷ���������·������', software: '��·������������' },
    { value: 'structural_analysis_kit', label: '�ṹ�����׼�', equipment: 'Ӧ���ǡ��񶯲����ǡ�ģ�͹����׼�', software: '����Ԫ��������' },
    { value: 'custom', label: '�Զ�����Դ', equipment: '�û��Զ���', software: '�û��Զ���' },
  ],
  
  // AIʵ�������Դ������ԭ�й��ܣ�
  image_classification: [
    { value: 'imagenet_mini', label: 'ImageNet (�Ӽ�)', size: '1.3GB', classes: 100 },
    { value: 'cifar10', label: 'CIFAR-10', size: '170MB', classes: 10 },
    { value: 'cifar100', label: 'CIFAR-100', size: '170MB', classes: 100 },
    { value: 'custom', label: '�Զ������ݼ�', size: '�û��ϴ�', classes: null },
  ],
  object_detection: [
    { value: 'coco_mini', label: 'COCO (�Ӽ�)', size: '2.1GB', classes: 80 },
    { value: 'pascal_voc', label: 'Pascal VOC', size: '2GB', classes: 20 },
    { value: 'custom', label: '�Զ������ݼ�', size: '�û��ϴ�', classes: null },
  ],
  nlp_experiment: [
    { value: 'imdb_reviews', label: 'IMDBӰ��', size: '80MB', classes: 2 },
    { value: 'ag_news', label: 'AG News', size: '120MB', classes: 4 },
    { value: 'custom', label: '�Զ������ݼ�', size: '�û��ϴ�', classes: null },
  ],
  custom: [
    { value: 'custom', label: '�Զ�����Դ', equipment: '�û��Զ���', software: '�û��Զ���' },
  ],
};

interface ExperimentResourceSelectProps {
  experimentType: ExperimentType;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const ExperimentResourceSelect: React.FC<ExperimentResourceSelectProps> = ({
  experimentType,
  value,
  onChange,
  error
}) => {
  const resources = experimentResourceOptions[experimentType] || [];
  
  // ȷ����Դ���ͣ����ݼ������豸��
  const isDataset = ['image_classification', 'object_detection', 'nlp_experiment'].includes(experimentType);
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {isDataset ? 'ѡ�����ݼ�' : 'ѡ��ʵ����Դ'}
      </Typography>
      
      <FormControl fullWidth error={!!error} sx={{ mb: 3 }}>
        <InputLabel>{isDataset ? '���ݼ�' : 'ʵ����Դ'}</InputLabel>
        <Select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          label={isDataset ? '���ݼ�' : 'ʵ����Դ'}
        >
          {resources.map(resource => (
            <MenuItem key={resource.value} value={resource.value}>
              {resource.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
      
      {value && resources.length > 0 && (
        <Grid container spacing={2}>
          {resources
            .filter(resource => resource.value === value)
            .map(resource => (
              <Grid item xs={12} key={resource.value}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {resource.label}
                    </Typography>
                    {isDataset ? (
                      <>
                        <Typography variant="body2">
                          ��С: {resource.size}
                        </Typography>
                        {resource.classes && (
                          <Typography variant="body2">
                            �����: {resource.classes}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <>
                        <Typography variant="body2">
                          �豸: {resource.equipment}
                        </Typography>
                        <Typography variant="body2">
                          ����: {resource.software}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  );
};

export default ExperimentResourceSelect;

