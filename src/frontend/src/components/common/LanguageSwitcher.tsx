import React from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, Select, FormControl, InputLabel, Box, Typography, Card, CardContent, CardHeader, Button, Grid } from '@mui/material';
import { LANGUAGES } from '../../i18n';

interface LanguageSwitcherProps {
  containerStyle?: React.CSSProperties;
  variant?: 'simple' | 'detailed';
}

/**
 * 语言切换组件
 * 支持简单选择器和详细模式
 * 新增支持少数民族语言
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

  // 所有支持的语言
  const languageOptions = [
    { code: LANGUAGES.ZH_CN, name: '简体中文', flag: '🇨🇳' },
    { code: LANGUAGES.EN_US, name: 'English', flag: '🇺🇸' },
    { code: LANGUAGES.UG_CN, name: 'ئۇيغۇرچە', flag: '🇨🇳' },
    { code: LANGUAGES.MN_CN, name: 'ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ', flag: '🇨🇳' },
    { code: LANGUAGES.MN_MN, name: 'Монгол хэл', flag: '🇲🇳' },
    { code: LANGUAGES.II_CN, name: 'ꆈꌠꉙ', flag: '🇨🇳' },
    { code: LANGUAGES.YI_CN, name: 'ꆈꌠꁱꂷ', flag: '🇨🇳' },
    { code: LANGUAGES.BO_CN, name: 'བོད་སྐད།', flag: '🇨🇳' }
  ];

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
            {languageOptions.map(lang => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </MenuItem>
            ))}
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

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          常用语言
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Button
            variant={i18n.language === LANGUAGES.ZH_CN ? 'contained' : 'outlined'}
            onClick={() => changeLanguage(LANGUAGES.ZH_CN)}
            fullWidth
            sx={{ justifyContent: 'flex-start', py: 1 }}
          >
            🇨🇳 简体中文
          </Button>

          <Button
            variant={i18n.language === LANGUAGES.EN_US ? 'contained' : 'outlined'}
            onClick={() => changeLanguage(LANGUAGES.EN_US)}
            fullWidth
            sx={{ justifyContent: 'flex-start', py: 1 }}
          >
            🇺🇸 English
          </Button>
        </Box>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          少数民族语言
        </Typography>
        <Grid container spacing={1}>
          {languageOptions.slice(2).map(lang => (
            <Grid item xs={12} sm={6} key={lang.code}>
              <Button
                variant={i18n.language === lang.code ? 'contained' : 'outlined'}
                onClick={() => changeLanguage(lang.code)}
                fullWidth
                sx={{ justifyContent: 'flex-start', py: 1 }}
              >
                {lang.flag} {lang.name}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default LanguageSwitcher;
