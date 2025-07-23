import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Container, Grid, Card, CardContent, Button, Divider, Paper, Chip } from '@mui/material';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { LANGUAGES } from '../../i18n';

/**
 * 国际化设置页面
 * 用于管理系统的语言和本地化设置
 */
const InternationalizationPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  // 少数民族语言列表
  const minorityLanguages = [
    { code: LANGUAGES.UG_CN, name: 'ئۇيغۇرچە', displayName: '维吾尔语', description: '使用阿拉伯字母的突厥语族语言，主要在新疆地区使用' },
    { code: LANGUAGES.MN_CN, name: 'ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ', displayName: '蒙古语（传统蒙古文）', description: '使用传统蒙古文字的蒙古语，主要在内蒙古自治区使用' },
    { code: LANGUAGES.MN_MN, name: 'Монгол хэл', displayName: '蒙古语（西里尔字母）', description: '使用西里尔字母的蒙古语，主要在蒙古国使用' },
    { code: LANGUAGES.II_CN, name: 'ꆈꌠꉙ', displayName: '彝语（凉山方言）', description: '使用彝文的彝语，主要在四川、云南、贵州和广西地区使用' },
    { code: LANGUAGES.YI_CN, name: 'ꆈꌠꁱꂷ', displayName: '彝语（其他方言）', description: '使用彝文的彝语其他方言变体' },
    { code: LANGUAGES.BO_CN, name: 'བོད་སྐད།', displayName: '藏语', description: '使用藏文的藏语，主要在西藏、青海、四川、甘肃和云南地区使用' }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('settings.language')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('settings.defaultLanguage')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <LanguageSwitcher variant="detailed" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('common.preview')}
              </Typography>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {t('app.name')}
                </Typography>
                <Typography variant="body1" paragraph>
                  {t('app.description')}
                </Typography>
                <Button variant="contained" color="primary">
                  {t('common.save')}
                </Button>
                <Button variant="outlined" sx={{ ml: 1 }}>
                  {t('common.cancel')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 少数民族语言支持部分 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                少数民族语言支持
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                为满足国家要求，我们的平台提供了多种少数民族语言支持，便于不同民族的用户使用。
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                {minorityLanguages.map(lang => (
                  <Grid item xs={12} sm={6} key={lang.code}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        borderLeft: i18n.language === lang.code ? '4px solid #1976d2' : 'none',
                        bgcolor: i18n.language === lang.code ? 'rgba(25, 118, 210, 0.05)' : 'background.paper'
                      }}
                    >
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {lang.displayName}
                        </Typography>
                        <Chip
                          label={i18n.language === lang.code ? "当前选择" : "可选择"}
                          color={i18n.language === lang.code ? "primary" : "default"}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" paragraph sx={{ mb: 2 }}>
                        {lang.description}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 1, fontFamily: 'inherit' }}>
                        {lang.name}
                      </Typography>
                      <Box sx={{ mt: 'auto' }}>
                        <Button
                          variant={i18n.language === lang.code ? "contained" : "outlined"}
                          size="small"
                          onClick={() => i18n.changeLanguage(lang.code)}
                          fullWidth
                        >
                          {i18n.language === lang.code ? "当前使用中" : "切换到此语言"}
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('settings.dateFormat')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('settings.defaultTimezone')}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ justifyContent: 'flex-start', py: 1 }}
                  >
                    Asia/Shanghai (UTC+8)
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ justifyContent: 'flex-start', py: 1 }}
                  >
                    America/New_York (UTC-5)
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ justifyContent: 'flex-start', py: 1 }}
                  >
                    Europe/London (UTC+0)
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InternationalizationPage;
