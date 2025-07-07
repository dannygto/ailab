import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { useFeatureFlags } from '../../features/featureFlags';

// �汾��ǩӳ��
const editionLabels: Record<string, {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
  tooltip: string;
}> = {
  'basic': {
    label: '�ս̰�',
    color: 'primary',
    tooltip: '������K12�����Ļ����汾'
  },
  'ai-enhanced': {
    label: '�ս�AI��',
    color: 'secondary',
    tooltip: '��ǿAI���ܵ��ս̰汾'
  },
  'professional': {
    label: '�߽̰�',
    color: 'success',
    tooltip: '�����ڸߵȽ�����רҵ�汾'
  }
};

/**
 * �汾��Ϣ��ʾ��� - �ڽ�������ʾ��ǰӦ�ð汾
 */
const EditionBadge: React.FC<{
  position?: 'topRight' | 'bottomRight' | 'topLeft' | 'bottomLeft';
  showOnlyInDev?: boolean;
}> = ({ 
  position = 'bottomRight',
  showOnlyInDev = true
}) => {
  const { currentEdition } = useFeatureFlags();
  
  // ��������˽��ڿ���������ʾ���ҵ�ǰ���ǿ�������������ʾ
  if (showOnlyInDev && process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  // ����λ��������ʽ
  const positionStyles: Record<string, React.CSSProperties> = {
    'topRight': { top: 12, right: 12 },
    'bottomRight': { bottom: 12, right: 12 },
    'topLeft': { top: 12, left: 12 },
    'bottomLeft': { bottom: 12, left: 12 }
  };
  
  const editionInfo = editionLabels[currentEdition] || editionLabels.basic;
  
  return (
    <div
      sx={{
        position: 'fixed',
        zIndex: 1100,
        ...positionStyles[position]
      }}
    >
      <Tooltip title={editionInfo.tooltip} arrow placement="left">
        <Chip
          size="small"
          label={editionInfo.label}
          color={editionInfo.color}
          variant="outlined"
          sx={{ 
            fontWeight: 'bold',
            opacity: 0.8,
            '&:hover': { opacity: 1 }
          }}
        />
      </Tooltip>
    </div>
  );
};

export default EditionBadge;

