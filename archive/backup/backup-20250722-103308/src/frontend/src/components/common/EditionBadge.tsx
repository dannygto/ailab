import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { useFeatureFlags } from '../../features/featureFlags';

// 版本标签映射
const editionLabels: Record<string, {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning';
  tooltip: string;
}> = {
  'basic': {
    label: '教学版',
    color: 'primary',
    tooltip: '适用于K12教育的基础版本'
  },
  'ai-enhanced': {
    label: '教学AI版',
    color: 'secondary',
    tooltip: '增强AI功能的教学版本'
  },
  'professional': {
    label: '高教版',
    color: 'success',
    tooltip: '适用于高等教育的专业版本'
  }
};

/**
 * 版本信息显示组件 - 在界面中显示当前应用版本
 */
const EditionBadge: React.FC<{
  position?: 'topRight' | 'bottomRight' | 'topLeft' | 'bottomLeft';
  showOnlyInDev?: boolean;
}> = ({ 
  position = 'bottomRight',
  showOnlyInDev = true
}) => {
  const { currentEdition } = useFeatureFlags();
  
  // 如果设置了仅在开发环境显示，且当前不是开发环境，则不显示
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
    <Box
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
    </Box>
  );
};

export default EditionBadge;

