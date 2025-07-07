import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  ButtonGroup, 
  Button, 
  Chip, 
  Divider,
  CircularProgress
} from '@mui/material';
import { useFeatureFlags, EditionType } from '../../features/featureFlags';
import { useLicensing } from '../../features/LicenseManager';

/**
 * �汾�л���� - �����ڿ��������в��Բ�ͬ�汾
 */
const EditionSwitcher: React.FC = () => {
  const { currentEdition, setEdition } = useFeatureFlags();
  const { licenseStatus, isLoading, changeLicenseEdition } = useLicensing();
  
  // �汾��Ϣ����
  const editions: Record<EditionType, {
    name: string;
    description: string;
    color: 'primary' | 'secondary' | 'success';
    chipColor: 'default' | 'primary' | 'secondary' | 'success';
  }> = {
    'basic': {
      name: '�ս̰�',
      description: '������K12������Сѧ�����С����У�',
      color: 'primary',
      chipColor: 'default'
    },
    'ai-enhanced': {
      name: '�ս�AI��',
      description: '������ע��AIӦ�õ�K12��������',
      color: 'secondary',
      chipColor: 'secondary'
    },
    'professional': {
      name: '�߽̰�',
      description: '�����ڸ�ְԺУ����ѧ���о���Ժ����ʿԺУ',
      color: 'success',
      chipColor: 'success'
    }
  };
  
  // �����汾�л�
  const handleEditionChange = async (edition: EditionType) => {
    // �ȸ�������֤
    await changeLicenseEdition(edition);
    // �ٸ������Կ���
    setEdition(edition);
  };
  
  // ������ǿ�������������ʾ�����
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <div sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            �汾�л� <Chip 
              size="small" 
              label="����������" 
              color="warning" 
              sx={{ ml: 1 }} 
            />
          </Typography>
          
          {licenseStatus && (
            <Chip 
              size="small" 
              label={`��ǰ: ${editions[currentEdition].name}`}
              color={editions[currentEdition].chipColor}
            />
          )}
        </div>
        
        <Divider sx={{ mb: 2 }} />
        
        {isLoading ? (
          <div sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </div>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ѡ��ͬ�汾�Բ��Թ��ܲ��졣�˹��ܽ��ڿ����������á�
            </Typography>
            
            <ButtonGroup variant="outlined" fullWidth>
              {(Object.keys(editions) as EditionType[]).map((edition) => (
                <Button
                  key={edition}
                  color={editions[edition].color}
                  variant={currentEdition === edition ? 'contained' : 'outlined'}
                  onClick={() => handleEditionChange(edition)}
                  disabled={isLoading}
                >
                  {editions[edition].name}
                </Button>
              ))}
            </ButtonGroup>
            
            {licenseStatus && (
              <div sx={{ mt: 2 }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  ��֯: {licenseStatus.organizationName} | 
                  ��Ч��: {new Date(licenseStatus.expirationDate).toLocaleDateString()} | 
                  �û����: {licenseStatus.currentUsers}/{licenseStatus.maxUsers}
                </Typography>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EditionSwitcher;

