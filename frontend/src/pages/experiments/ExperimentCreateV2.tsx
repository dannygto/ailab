import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Stepper, Step, StepLabel } from '@mui/material';
import { toast } from 'react-hot-toast';

// �������������������
import { Button, ButtonType } from '../../components/core/atoms/Button';
import { BasicInfoForm, ExperimentTypeSelect } from '../../components/domain/experiments';
import ResourceRecommendations from '../../components/resources/ResourceRecommendations';

// �������
import { experimentService } from '../../services';

// ʵ��״̬�ӿ�
interface ExperimentStateV2 {
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  selectedType: string;
  selectedMethod: string;
  selectedResources: string[];
  selectedAIAssistance: string[];
}

/**
 * ��֤ʵ������
 */
const validateExperimentData = (data: ExperimentStateV2): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.name.trim()) {
    errors.name = '������ʵ������';
  }
  
  if (!data.description.trim()) {
    errors.description = '������ʵ������';
  }
  
  if (!data.difficulty) {
    errors.difficulty = '��ѡ��ʵ���Ѷ�';
  }
  
  if (!data.duration) {
    errors.duration = '��ѡ��ʵ��ʱ��';
  }
  
  if (!data.selectedType) {
    errors.selectedType = '��ѡ��ʵ������';
  }
  
  return errors;
};

/**
 * ʵ�鴴��ҳ�� - �ع���V2
 * 
 * ʹ���µ������ʵ�ֵ�ʵ�鴴��ҳ�棬���öಽ��������
 */
const ExperimentCreateV2: React.FC = () => {
  const navigate = useNavigate();
  
  // ״̬����
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ʵ��״̬
  const [experimentState, setExperimentState] = useState<ExperimentStateV2>({
    name: '',
    description: '',
    duration: '',
    difficulty: '',
    selectedType: '',
    selectedMethod: '',
    selectedResources: [],
    selectedAIAssistance: []
  });
  
  // ����״̬
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // ����ʵ�������Ϣ���
  const handleNameChange = (value: string) => {
    setExperimentState((prev: ExperimentStateV2) => ({ ...prev, name: value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: '' }));
    }
  };
  
  const handleDescriptionChange = (value: string) => {
    setExperimentState((prev: ExperimentStateV2) => ({ ...prev, description: value }));
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: '' }));
    }
  };
  
  const handleDifficultyChange = (value: string) => {
    setExperimentState((prev: ExperimentStateV2) => ({ ...prev, difficulty: value }));
    if (errors.difficulty) {
      setErrors(prev => ({ ...prev, difficulty: '' }));
    }
  };
  
  const handleDurationChange = (value: string) => {
    setExperimentState((prev: ExperimentStateV2) => ({ ...prev, duration: value }));
    if (errors.duration) {
      setErrors(prev => ({ ...prev, duration: '' }));
    }
  };
  
  const handleTypeChange = (value: string) => {
    setExperimentState((prev: ExperimentStateV2) => ({ ...prev, selectedType: value }));
    if (errors.selectedType) {
      setErrors(prev => ({ ...prev, selectedType: '' }));
    }
  };
  
  // ������֤
  const validateStep = (stepIndex: number): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    switch (stepIndex) {
      case 0: // ������Ϣ
        if (!experimentState.name.trim()) {
          newErrors.name = '������ʵ������';
          isValid = false;
        }
        if (!experimentState.description.trim()) {
          newErrors.description = '������ʵ������';
          isValid = false;
        }
        if (!experimentState.difficulty) {
          newErrors.difficulty = '��ѡ��ʵ���Ѷ�';
          isValid = false;
        }
        if (!experimentState.duration) {
          newErrors.duration = '��ѡ��ʵ��ʱ��';
          isValid = false;
        }
        break;
      case 1: // ʵ������
        if (!experimentState.selectedType) {
          newErrors.selectedType = '��ѡ��ʵ������';
          isValid = false;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // ������һ��
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  // ������һ��
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // ����ȡ��
  const handleCancelIcon = () => {
    if (window.confirm('ȷ��Ҫȡ������ʵ����δ��������ݽ���ʧ��')) {
      navigate('/experiments');
    }
  };
  
  // �����ύ
  const handleSubmit = async () => {
    try {
      // ��֤���в���
      const validationErrors = validateExperimentData(experimentState);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // ��ת����������ĵ�һ������
        if (validationErrors.name || validationErrors.description || validationErrors.difficulty || validationErrors.duration) {
          setActiveStep(0);
        } else if (validationErrors.selectedType) {
          setActiveStep(1);
        }
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // �ύʵ������
      await experimentService.createExperiment({
        title: experimentState.name,
        description: experimentState.description,
        type: experimentState.selectedType,
        config: {
          difficulty: experimentState.difficulty,
          duration: experimentState.duration,
          method: experimentState.selectedMethod,
          resources: experimentState.selectedResources,
          aiAssistance: experimentState.selectedAIAssistance
        }
      });
      
      toast.success('ʵ�鴴���ɹ���');
      navigate('/experiments');
    } catch (err) {
      console.error('����ʵ��ʧ��:', err);
      setError(err instanceof Error ? err.message : '����ʵ��ʧ�ܣ����Ժ�����');
      toast.error('����ʵ��ʧ�ܣ�');
    } finally {
      setIsLoading(false);
    }
  };
  
  // �������ã������ڽṹ����������ʹ�ã�
  /*
  const steps = [
    {
      label: '������Ϣ',
      description: '��дʵ�������Ϣ',
      component: (
        <BasicInfoForm
          name={experimentState.name}
          description={experimentState.description}
          type={experimentState.selectedType}
          difficulty={experimentState.difficulty}
          duration={experimentState.duration}
          onNameChange={handleNameChange}
          onDescriptionChange={handleDescriptionChange}
          onTypeChange={handleTypeChange}
          onDifficultyChange={handleDifficultyChange}
          onDurationChange={handleDurationChange}
          errors={{
            name: errors.name,
            description: errors.description,
            type: errors.selectedType,
            difficulty: errors.difficulty,
            duration: errors.duration
          }}
        />
      )
    },
    {
      label: 'ʵ������',
      description: 'ѡ��ʵ������',
      component: (
        <ExperimentTypeSelect
          selectedType={experimentState.selectedType}
          onTypeChange={handleTypeChange}
          error={errors.selectedType}
        />
      )
    },
    {
      label: 'ȷ����Ϣ',
      description: 'ȷ��ʵ����Ϣ���ύ',
      component: (
        <div sx={{ p: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            ��ȷ������ʵ����Ϣ��ȷ���������"�ύ"��ť����ʵ�顣
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            ʵ�������Ϣ
          </Typography>
          
          <div sx={{ mb: 3 }}>
            <Typography variant="subtitle1">ʵ������</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.name || 'δ����'}
            </Typography>
            
            <Typography variant="subtitle1">ʵ������</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.description || 'δ����'}
            </Typography>
            
            <Typography variant="subtitle1">ʵ���Ѷ�</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.difficulty === 'easy' ? '��' : 
               experimentState.difficulty === 'medium' ? '�е�' : 
               experimentState.difficulty === 'hard' ? '����' : 'δ����'}
            </Typography>
            
            <Typography variant="subtitle1">ʵ��ʱ��</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.duration ? `${experimentState.duration}����` : 'δ����'}
            </Typography>
            
            <Typography variant="subtitle1">ʵ������</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.selectedType === 'physics' ? '����ʵ��' :
               experimentState.selectedType === 'chemistry' ? '��ѧʵ��' :
               experimentState.selectedType === 'biology' ? '����ʵ��' :
               experimentState.selectedType === 'integrated' ? '�ۺ�ʵ��' : 'δ����'}
            </Typography>
          </div>
        </div>
      )
    }
  ];
  */
  
  return (
    <div sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        ������ʵ��
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        �밴�����²��贴��ʵ��
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        <Step>
          <StepLabel>������Ϣ</StepLabel>
        </Step>
        <Step>
          <StepLabel>ʵ������</StepLabel>
        </Step>
        <Step>
          <StepLabel>��Դ�Ƽ�</StepLabel>
        </Step>
        <Step>
          <StepLabel>ȷ����Ϣ</StepLabel>
        </Step>
      </Stepper>
      
      {activeStep === 0 && (
        <BasicInfoForm
          name={experimentState.name}
          description={experimentState.description}
          type={experimentState.selectedType}
          difficulty={experimentState.difficulty}
          duration={experimentState.duration}
          onNameChange={handleNameChange}
          onDescriptionChange={handleDescriptionChange}
          onTypeChange={handleTypeChange}
          onDifficultyChange={handleDifficultyChange}
          onDurationChange={handleDurationChange}
          errors={{
            name: errors.name,
            description: errors.description,
            type: errors.selectedType,
            difficulty: errors.difficulty,
            duration: errors.duration
          }}
        />
      )}
      
      {activeStep === 1 && (
        <ExperimentTypeSelect
          selectedType={experimentState.selectedType}
          onTypeChange={handleTypeChange}
          error={errors.selectedType}
        />
      )}
      
      {activeStep === 2 && (
        <ResourceRecommendations
          experimentType={experimentState.selectedType}
          subject={experimentState.selectedType === 'physics' ? 'physics' : 
                  experimentState.selectedType === 'chemistry' ? 'chemistry' : 
                  experimentState.selectedType === 'biology' ? 'biology' : undefined}
          limit={8}
          showFilters={true}
          onResourceSelect={(resource) => {
            setExperimentState((prev) => ({
              ...prev,
              selectedResources: [...prev.selectedResources, resource.id]
            }));
          }}
        />
      )}
      
      {activeStep === 3 && (
        <div sx={{ p: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            ��ȷ������ʵ����Ϣ��ȷ���������"�ύ"��ť����ʵ�顣
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            ʵ�������Ϣ
          </Typography>
          
          <div sx={{ mb: 3 }}>
            <Typography variant="subtitle1">ʵ������</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.name || 'δ����'}
            </Typography>
            
            <Typography variant="subtitle1">ʵ������</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.description || 'δ����'}
            </Typography>
            
            <Typography variant="subtitle1">ʵ���Ѷ�</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.difficulty === 'easy' ? '��' : 
               experimentState.difficulty === 'medium' ? '�е�' : 
               experimentState.difficulty === 'hard' ? '����' : 'δ����'}
            </Typography>
            
            <Typography variant="subtitle1">ʵ��ʱ��</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.duration ? `${experimentState.duration}����` : 'δ����'}
            </Typography>
            
            <Typography variant="subtitle1">ʵ������</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.selectedType === 'physics' ? '����ʵ��' :
               experimentState.selectedType === 'chemistry' ? '��ѧʵ��' :
               experimentState.selectedType === 'biology' ? '����ʵ��' :
               experimentState.selectedType === 'integrated' ? '�ۺ�ʵ��' : 'δ����'}
            </Typography>
            
            <Typography variant="subtitle1">ѡ�����Դ</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {experimentState.selectedResources.length > 0 ? (
                experimentState.selectedResources.join(', ')
              ) : 'δѡ���κ���Դ'}
            </Typography>
          </div>
        </div>
      )}
      
      <div sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <div>
          <Button
            buttonType={ButtonType.SECONDARY}
            onClick={handleCancelIcon}
            disabled={isLoading}
          >
            ȡ��
          </Button>
        </div>
        <div>
          <Button
            buttonType={ButtonType.SECONDARY}
            onClick={handleBack}
            disabled={activeStep === 0 || isLoading}
            sx={{ mr: 1 }}
          >
            ��һ��
          </Button>
          {activeStep < 3 ? (
            <Button
              buttonType={ButtonType.PRIMARY}
              onClick={handleNext}
              disabled={isLoading}
            >
              ��һ��
            </Button>
          ) : (
            <Button
              buttonType={ButtonType.PRIMARY}
              onClick={handleSubmit}
              loading={isLoading}
            >
              �ύ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentCreateV2;
