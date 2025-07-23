import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography } from '@mui/material';

/**
 * 用于在应用中展示如何使用国际化的示例组件
 */
const InternationalizationDemo: React.FC = () => {
  const { t, i18n } = useTranslation();

  // 切换语言方法
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('app.name')}
      </Typography>

      <Typography variant="body1" paragraph>
        {t('app.description')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('navigation.dashboard')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained">{t('common.save')}</Button>
          <Button variant="outlined">{t('common.cancel')}</Button>
          <Button color="error" variant="outlined">{t('common.delete')}</Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('experiments.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="success">
            {t('experiments.create')}
          </Button>
          <Button variant="outlined">
            {t('experiments.view')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('aiAssistant.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="info">
            {t('aiAssistant.startConversation')}
          </Button>
          <Button variant="outlined">
            {t('aiAssistant.help')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('settings.language')}:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
      </Box>
    </Box>
  );
};

export default InternationalizationDemo;
