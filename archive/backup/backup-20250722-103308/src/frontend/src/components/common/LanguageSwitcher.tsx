import React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, Select, FormControl, InputLabel, Box, Typography, Card, CardContent, CardHeader, Button } from '@mui/material';

interface LanguageSwitcherProps {
  containerStyle?: React.CSSProperties;
  variant?: 'simple' | 'detailed';
}

/**
 * 语言切换组件
 * 支持简单选择器和详细模式
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  containerStyle,
  variant = 'simple'
}) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('ailab_language', language);
  };

  // 简单选择器模式
  if (variant === 'simple') {
    return (
      <Box sx={{ minWidth: 120, ...containerStyle }}>
        <FormControl fullWidth size="small">
          <Select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value)}
            sx={{
              '& .MuiSelect-select': {
                py: 0.5,
                display: 'flex',
                alignItems: 'center'
              }
            }}
          >
            <MenuItem value="zh-CN">🇨🇳 简体中文</MenuItem>
            <MenuItem value="en-US">🇺🇸 English</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  }

  // 详细模式
  return (
    <Card sx={{ ...containerStyle }}>
      <CardHeader title={t('settings.language')} />
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('settings.defaultLanguage')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
          <Button
            variant={i18n.language === 'zh-CN' ? 'contained' : 'outlined'}
            onClick={() => changeLanguage('zh-CN')}
            fullWidth
            sx={{ justifyContent: 'flex-start', py: 1 }}
          >
            🇨🇳 简体中文
          </Button>

          <Button
            variant={i18n.language === 'en-US' ? 'contained' : 'outlined'}
            onClick={() => changeLanguage('en-US')}
            fullWidth
            sx={{ justifyContent: 'flex-start', py: 1 }}
          >
            🇺🇸 English
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LanguageSwitcher;
