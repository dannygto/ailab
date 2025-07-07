import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { useSettingsStore } from '../../store';

/**
 * 版权信息组件 - 显示在应用底部
 */
const CopyrightInfo: React.FC = () => {
  const { settings } = useSettingsStore();
  const currentYear = new Date().getFullYear();
  
  // 默认公司名称，如果存储中没有则使用默认值
  const companyName = settings?.branding?.companyName || '未来科技教育有限公司';
  
  return (
    <div 
      sx={{ 
        width: '100%',
        textAlign: 'center',
        py: 2,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        opacity: 0.8
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {currentYear} {companyName}. 保留所有权利。
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Powered by <Link href="#" underline="hover">AICAM平台</Link> v2.4.0
      </Typography>
    </div>
  );
};

export default CopyrightInfo;
