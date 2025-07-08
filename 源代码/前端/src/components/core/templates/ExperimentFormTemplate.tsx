import('@mui/material');
import React from 'react';
import { Form, FormItemConfig } from '../molecules/Form';
import { Input } from '../atoms/Input';
import { Select, SelectOption } from '../atoms/Select';
import { Card } from '../atoms/Card';
// import { useLocalStorageIcon } from '../hooks';

/**
 * ʵ������ѡ��
 */
const experimentTypeOptions: SelectOption[] = [
  { value: 'physics', label: '����ʵ��' },
  { value: 'chemistry', label: '��ѧʵ��' },
  { value: 'biology', label: '����ʵ��' },
  { value: 'comprehensive', label: '�ۺ�ʵ��' },
];

/**
 * ʵ���Ѷ�ѡ��
 */
const difficultyLevelOptions: SelectOption[] = [
  { value: 'elementary', label: '����' },
  { value: 'intermediate', label: '�м�' },
  { value: 'advanced', label: '�߼�' },
];

/**
 * ʵ��������ݽӿ�
 */
export interface ExperimentFormData {
  /** ʵ������ */
  name: string;
  /** ʵ������ */
  type: string;
  /** ʵ���Ѷ� */
  difficulty: string;
  /** ʵ��ʱ��(����) */
  duration: number;
  /** ʵ������ */
  description: string;
  /** ʵ��Ŀ�� */
  objectives: string;
  /** ʵ����� */
  materials: string;
}

/**
 * ʵ�����ģ�����Խӿ�
 */
export interface ExperimentFormTemplateProps {
  /** ��ʼ���� */
  initialData?: Partial<ExperimentFormData>;
  /** �ύ�¼� */
  onSubmit?: (data: ExperimentFormData) => void;
  /** ȡ���¼� */
  onCancelIcon?: () => void;
  /** �Ƿ������ */
  loading?: boolean;
  /** �Ƿ�ɱ༭ */
  editable?: boolean;
  /** �Զ�������� */
  customFormItems?: FormItemConfig[];
  /** �Զ������� */
  className?: string;
  /** �Զ�����ʽ */
  style?: React.CSSProperties;
}

/**
 * ʵ�����ģ��
 * 
 * ���ڴ����ͱ༭ʵ��ı���ģ��
 * 
 * @example
 * ```tsx
 * <ExperimentFormTemplate
 *   initialData={{ name: '�������ʵ��', type: 'physics' }}
 *   onSubmit={handleSubmit}
 *   onCancelIcon={handleCancelIcon}
 * />
 * ```
 */
export const ExperimentFormTemplate: React.FC<ExperimentFormTemplateProps> = ({
  initialData = {},
  onSubmit,
  onCancelIcon,
  loading = false,
  editable = true,
  customFormItems = [],
  className,
  style,
}) => {
  // const [formData, setFormData] = useLocalStorageIcon<Partial<ExperimentFormData>>(
  //   'experiment-form-draft',
  //   initialData
  // );
  const [formData, setFormData] = React.useState<Partial<ExperimentFormData>>(initialData);

  // ����������仯
  const handleChange = (field: keyof ExperimentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ���������ύ
  const handleSubmit = () => {
    if (onSubmit && isValidForm()) {
      onSubmit(formData as ExperimentFormData);
    }
  };

  // �������Ƿ���Ч
  const isValidForm = (): boolean => {
    return !!(
      formData.name &&
      formData.type &&
      formData.difficulty &&
      formData.duration
    );
  };

  // ��������������
  const formItems: FormItemConfig[] = [
    {
      name: 'name',
      label: 'ʵ������',
      required: true,
      component: (
        <Input
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="������ʵ������"
          disabled={!editable || loading}
          fullWidth
        />
      ),
      col: 12,
    },
    {
      name: 'type',
      label: 'ʵ������',
      required: true,
      component: (
        <Select
          value={formData.type || ''}
          onChange={(e) => handleChange('type', e.target.value)}
          options={experimentTypeOptions}
          placeholder="��ѡ��ʵ������"
          disabled={!editable || loading}
          fullWidth
        />
      ),
      col: 6,
    },
    {
      name: 'difficulty',
      label: '�Ѷȵȼ�',
      required: true,
      component: (
        <Select
          value={formData.difficulty || ''}
          onChange={(e) => handleChange('difficulty', e.target.value)}
          options={difficultyLevelOptions}
          placeholder="��ѡ���Ѷȵȼ�"
          disabled={!editable || loading}
          fullWidth
        />
      ),
      col: 6,
    },
    {
      name: 'duration',
      label: 'ʵ��ʱ��(����)',
      required: true,
      component: (
        <Input
          type="number"
          value={formData.duration?.toString() || ''}
          onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
          placeholder="������ʵ��ʱ��"
          disabled={!editable || loading}
          fullWidth
        />
      ),
      col: 6,
    },
    {
      name: 'description',
      label: 'ʵ������',
      component: (
        <Input
          multiline
          rows={4}
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="������ʵ������"
          disabled={!editable || loading}
          fullWidth
        />
      ),
      col: 12,
    },
    {
      name: 'objectives',
      label: 'ʵ��Ŀ��',
      component: (
        <Input
          multiline
          rows={3}
          value={formData.objectives || ''}
          onChange={(e) => handleChange('objectives', e.target.value)}
          placeholder="������ʵ��Ŀ��"
          disabled={!editable || loading}
          fullWidth
        />
      ),
      col: 12,
    },
    {
      name: 'materials',
      label: 'ʵ�����',
      component: (
        <Input
          multiline
          rows={3}
          value={formData.materials || ''}
          onChange={(e) => handleChange('materials', e.target.value)}
          placeholder="������ʵ�����"
          disabled={!editable || loading}
          fullWidth
        />
      ),
      col: 12,
    },
    ...customFormItems,
  ];

  return (
    <Card title="ʵ�������Ϣ" className={className} style={style}>
      <Form
        items={formItems}
        onSubmit={handleSubmit}
        onCancelIcon={onCancelIcon}
        loading={loading}
        showSubmit={editable}
        showCancelIcon={editable}
        submitText="����ʵ��"
        CancelIconText="ȡ��"
      />
    </Card>
  );
};

export default ExperimentFormTemplate;
