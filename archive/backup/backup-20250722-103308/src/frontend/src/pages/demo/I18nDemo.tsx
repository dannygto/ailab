import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography, Box } from '@mui/material';
import InternationalizationDemo from '../../components/demos/InternationalizationDemo';

/**
 * 国际化功能演示页面
 * 用于展示国际化组件和功能
 */
const I18nDemo: React.FC = () => {
  const { t, i18n } = useTranslation();

  // 切换语言
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('settings.language')} {t('common.demo')}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button
          variant={i18n.language === 'zh-CN' ? 'contained' : 'outlined'}
          onClick={() => changeLanguage('zh-CN')}
        >
          🇨🇳 简体中文
        </Button>
        <Button
          variant={i18n.language === 'en-US' ? 'contained' : 'outlined'}
          onClick={() => changeLanguage('en-US')}
        >
          🇺🇸 English
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <InternationalizationDemo />
      </Box>
    </Box>
  );
};

export default I18nDemo;
