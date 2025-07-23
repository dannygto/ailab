import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Container, Grid, Card, CardContent, Button } from '@mui/material';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

/**
 * 国际化设置页面
 * 用于管理系统的语言和本地化设置
 */
const InternationalizationPage: React.FC = () => {
  const { t } = useTranslation();

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
