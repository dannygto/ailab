import { Box } from '@mui/material';
import React from 'react';
import { Form, FormItemConfig } from '../../core/molecules/Form';
import { Input } from '../../core/atoms/Input';
import { Select } from '../../core/atoms/Select';

/**
 * ʵ�������Ϣ����������Խӿ�
 */
export interface BasicInfoFormProps {
  /** ʵ������ */
  name: string;
  /** ʵ������ */
  description: string;
  /** ʵ������ */
  type: string;
  /** ʵ���Ѷ� */
  difficulty: string;
  /** ʵ��ʱ�� */
  duration: string;
  /** ���Ʊ���¼� */
  onNameChange: (value: string) => void;
  /** ��������¼� */
  onDescriptionChange: (value: string) => void;
  /** ���ͱ���¼� */
  onTypeChange: (value: string) => void;
  /** �Ѷȱ���¼� */
  onDifficultyChange: (value: string) => void;
  /** ʱ������¼� */
  onDurationChange: (value: string) => void;
  /** ��֤���� */
  errors?: {
    name?: string;
    description?: string;
    type?: string;
    difficulty?: string;
    duration?: string;
  };
  /** �����ı� */
  helperText?: {
    name?: string;
    description?: string;
    type?: string;
    difficulty?: string;
    duration?: string;
  };
  /** �Ƿ���� */
  disabled?: boolean;
}

/**
 * ʵ���Ѷ�ѡ��
 */
const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: '��' },
  { value: 'medium', label: '�е�' },
  { value: 'hard', label: '����' },
];

/**
 * ʵ������ѡ��
 */
const TYPE_OPTIONS = [
  { value: 'physics', label: '����ʵ��' },
  { value: 'chemistry', label: '��ѧʵ��' },
  { value: 'biology', label: '����ʵ��' },
  { value: 'integrated', label: '�ۺ�ʵ��' },
];

/**
 * ʵ��ʱ��ѡ��
 */
const DURATION_OPTIONS = [
  { value: '30', label: '30����' },
  { value: '45', label: '45����' },
  { value: '60', label: '60����' },
  { value: '90', label: '90����' },
  { value: '120', label: '120����' },
];

/**
 * ʵ�������Ϣ������� - �ع���
 * 
 * ʹ�ú��������ʵ�ֵ�ʵ�������Ϣ�������
 * 
 * @example
 * ```tsx
 * <BasicInfoForm
 *   name={name}
 *   description={description}
 *   type={type}
 *   difficulty={difficulty}
 *   duration={duration}
 *   onNameChange={setName}
 *   onDescriptionChange={setDescription}
 *   onTypeChange={setType}
 *   onDifficultyChange={setDifficulty}
 *   onDurationChange={setDuration}
 *   errors={errors}
 * />
 * ```
 */
export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  name,
  description,
  type,
  difficulty,
  duration,
  onNameChange,
  onDescriptionChange,
  onTypeChange,
  onDifficultyChange,
  onDurationChange,
  errors = {},
  helperText = {},
  disabled = false,
}) => {
  // ��������������
  const formItems: FormItemConfig[] = [
    {
      name: 'name',
      label: 'ʵ������',
      required: true,
      component: (
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="������ʵ������"
          fullWidth
          disabled={disabled}
          error={!!errors.name}
        />
      ),
      helperText: errors.name || helperText.name,
      status: errors.name ? 'error' : 'default',
      col: 12,
    },
    {
      name: 'description',
      label: 'ʵ������',
      required: true,
      component: (
        <Input
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="������ʵ������"
          fullWidth
          multiline
          rows={4}
          disabled={disabled}
          error={!!errors.description}
        />
      ),
      helperText: errors.description || helperText.description,
      status: errors.description ? 'error' : 'default',
      col: 12,
    },
    {
      name: 'type',
      label: 'ʵ������',
      required: true,
      component: (
        <Select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as string)}
          options={TYPE_OPTIONS}
          placeholder="��ѡ��ʵ������"
          fullWidth
          disabled={disabled}
          error={!!errors.type}
        />
      ),
      helperText: errors.type || helperText.type,
      status: errors.type ? 'error' : 'default',
      col: 4,
    },
    {
      name: 'difficulty',
      label: 'ʵ���Ѷ�',
      required: true,
      component: (
        <Select
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value as string)}
          options={DIFFICULTY_OPTIONS}
          placeholder="��ѡ��ʵ���Ѷ�"
          fullWidth
          disabled={disabled}
          error={!!errors.difficulty}
        />
      ),
      helperText: errors.difficulty || helperText.difficulty,
      status: errors.difficulty ? 'error' : 'default',
      col: 4,
    },
    {
      name: 'duration',
      label: 'ʵ��ʱ��',
      required: true,
      component: (
        <Select
          value={duration}
          onChange={(e) => onDurationChange(e.target.value as string)}
          options={DURATION_OPTIONS}
          placeholder="��ѡ��ʵ��ʱ��"
          fullWidth
          disabled={disabled}
          error={!!errors.duration}
        />
      ),
      helperText: errors.duration || helperText.duration,
      status: errors.duration ? 'error' : 'default',
      col: 4,
    },
  ];

  return (
    <Form
      items={formItems}
      showSubmit={false}
      showCancelIcon={false}
      layout="vertical"
      withBorder={false}
      padding={0}
    />
  );
};

export default BasicInfoForm;
