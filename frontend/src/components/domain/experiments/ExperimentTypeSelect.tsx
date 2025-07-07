import React from 'react';
import { Card } from '../../core/atoms/Card';
import { Box, Grid, Typography, Radio } from '@mui/material';
import { ScienceIcon } from '../../../utils/icons';
import { PsychologyIcon } from '../../../utils/icons';
import { ExperimentIcon } from '../../../utils/icons';
import { MemoryIcon } from '../../../utils/icons';

/**
 * ʵ�����ͽӿ�
 */
export interface ExperimentTypeOption {
  /** ����ID */
  id: string;
  /** �������� */
  name: string;
  /** �������� */
  description: string;
  /** ����ͼ�� */
  icon: React.ReactNode;
  /** ���ͱ�ǩ */
  LabelIcon?: string;
}

/**
 * ʵ������ѡ��������Խӿ�
 */
export interface ExperimentTypeSelectProps {
  /** ѡ�е����� */
  selectedType: string;
  /** ���ͱ���¼� */
  onTypeChange: (type: string) => void;
  /** ����ѡ�� */
  types?: ExperimentTypeOption[];
  /** �Ƿ���� */
  disabled?: boolean;
  /** ������Ϣ */
  error?: string;
}

/**
 * Ĭ��ʵ������ѡ��
 */
const DEFAULT_TYPES: ExperimentTypeOption[] = [
  {
    id: 'physics',
    name: '����ʵ��',
    description: 'ͨ���۲�Ͳ����о���������͹���',
    icon: <MemoryIcon fontSize="large" />,
    label: '����'
  },
  {
    id: 'chemistry',
    name: '��ѧʵ��',
    description: '�о����ʵ���ɡ����ʡ��ṹ���仯����',
    icon: <ScienceIcon fontSize="large" />,
    label: '����'
  },
  {
    id: 'biology',
    name: '����ʵ��',
    description: '�о�������������������',
    icon: <ExperimentIcon fontSize="large" />,
    label: '����'
  },
  {
    id: 'integrated',
    name: '�ۺ�ʵ��',
    description: '��϶�ѧ��֪ʶ�Ľ����ں�ʵ��',
    icon: <PsychologyIcon fontSize="large" />,
    label: '�߼�'
  }
];

/**
 * ʵ������ѡ����� - �ع���
 * 
 * ʹ�ú��������ʵ�ֵ�ʵ������ѡ�����
 * 
 * @example
 * ```tsx
 * <ExperimentTypeSelect
 *   selectedType={selectedType}
 *   onTypeChange={setSelectedType}
 * />
 * ```
 */
export const ExperimentTypeSelect: React.FC<ExperimentTypeSelectProps> = ({
  selectedType,
  onTypeChange,
  types = DEFAULT_TYPES,
  disabled = false,
  error
}) => {
  return (
    <div>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Grid container spacing={2}>
        {types.map((type) => (
          <Grid item xs={12} sm={6} key={type.id}>
            <Card
              onClick={() => !disabled && onTypeChange(type.id)}
              sx={{
                cursor: disabled ? 'not-allowed' : 'pointer',
                borderColor: selectedType === type.id ? 'primary.main' : 'divider',
                borderWidth: selectedType === type.id ? 2 : 1,
                opacity: disabled ? 0.7 : 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                p: 2
              }}
            >
              <div sx={{ position: 'absolute', top: 12, right: 12 }}>
                <Radio
                  checked={selectedType === type.id}
                  disabled={disabled}
                  color="primary"
                />
              </div>
              
              {type.label && (
                <div
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 16,
                    bgcolor: type.label === '�߼�' ? 'warning.main' : 'info.main',
                    color: 'white',
                    px: 1,
                    py: 0.2,
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                    fontSize: '0.75rem',
                  }}
                >
                  {type.label}
                </div>
              )}
              
              <div sx={{ display: 'flex', mb: 2, mt: 1, color: 'primary.main' }}>
                {type.icon}
              </div>
              
              <Typography variant="h6" component="h3" gutterBottom>
                {type.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {type.description}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default ExperimentTypeSelect;
