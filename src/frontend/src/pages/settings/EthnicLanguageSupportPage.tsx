import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Box, Typography, Grid, Paper, Divider, Button, Link } from '@mui/material';
import EthnicLanguageResources from '../../components/minority/EthnicLanguageResources';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

/**
 * 少数民族语言支持页面
 * 整合语言切换和少数民族语言教育资源
 */
const EthnicLanguageSupportPage: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          少数民族语言支持
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          为满足国家要求，平台提供了多种少数民族语言支持，便于不同民族的用户使用。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 语言切换部分 */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              语言设置
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              选择您偏好的语言，界面将立即切换到相应语言
            </Typography>
            <Divider sx={{ my: 2 }} />
            <LanguageSwitcher variant="detailed" />
          </Paper>
        </Grid>

        {/* 语言支持信息部分 */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              关于少数民族语言支持
            </Typography>
            <Typography variant="body2" paragraph>
              本平台支持以下少数民族语言：
            </Typography>
            <Box component="ul" sx={{ pl: 3 }}>
              <Typography component="li" variant="body2" gutterBottom>
                维吾尔语（ئۇيغۇرچە）- 新疆维吾尔自治区
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                蒙古语（ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ）- 内蒙古自治区（传统蒙古文）
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                蒙古语（Монгол хэл）- 内蒙古自治区（西里尔字母）
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                彝语（ꆈꌠꉙ）- 四川、云南、贵州、广西地区
              </Typography>
              <Typography component="li" variant="body2" gutterBottom>
                藏语（བོད་སྐད།）- 西藏自治区、青海、四川、甘肃、云南
              </Typography>
            </Box>
            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
              语言设置将保存在您的浏览器中，下次访问时会自动应用相同的语言设置。
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
              <Typography variant="body2">
                提示：如果您的设备没有安装相应的少数民族语言字体，可能会看到方框或乱码。请按照系统提示安装相应字体后重试。
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* 少数民族语言教育资源部分 */}
        <Grid item xs={12}>
          <EthnicLanguageResources />
        </Grid>
      </Grid>
    </Container>
  );
};

export default EthnicLanguageSupportPage;
