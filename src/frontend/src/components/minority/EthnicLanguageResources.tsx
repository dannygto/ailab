import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import {
  MenuBook as MenuBookIcon,
  School as SchoolIcon,
  Translate as TranslateIcon,
  Language as LanguageIcon,
  LocalLibrary as LocalLibraryIcon,
  OndemandVideo as OndemandVideoIcon,
  Audiotrack as AudiotrackIcon
} from '@mui/icons-material';
import { LANGUAGES } from '../../i18n';

/**
 * 少数民族语言教育资源组件
 * 用于展示和提供少数民族语言相关的教育资源
 */
const EthnicLanguageResources: React.FC = () => {
  const { i18n } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // 检测当前语言是否为少数民族语言
  useEffect(() => {
    const minorityLanguages = [
      LANGUAGES.UG_CN,
      LANGUAGES.MN_CN,
      LANGUAGES.MN_MN,
      LANGUAGES.II_CN,
      LANGUAGES.YI_CN,
      LANGUAGES.BO_CN
    ];

    if (minorityLanguages.includes(i18n.language)) {
      setSelectedLanguage(i18n.language);
    } else {
      setSelectedLanguage(null);
    }
  }, [i18n.language]);

  // 少数民族语言列表
  const ethnicLanguages = [
    {
      code: LANGUAGES.UG_CN,
      name: 'ئۇيغۇرچە',
      displayName: '维吾尔语',
      resources: [
        { title: '维吾尔语实验教材', type: 'book', link: '#' },
        { title: '维吾尔语音频教程', type: 'audio', link: '#' },
        { title: '维吾尔语科技术语词典', type: 'dictionary', link: '#' }
      ]
    },
    {
      code: LANGUAGES.MN_CN,
      name: 'ᠮᠣᠩᠭᠣᠯ ᠬᠡᠯᠡ',
      displayName: '蒙古语（传统蒙古文）',
      resources: [
        { title: '蒙古语实验教材', type: 'book', link: '#' },
        { title: '蒙古语视频教程', type: 'video', link: '#' },
        { title: '蒙古语科技术语词典', type: 'dictionary', link: '#' }
      ]
    },
    {
      code: LANGUAGES.MN_MN,
      name: 'Монгол хэл',
      displayName: '蒙古语（西里尔字母）',
      resources: [
        { title: '蒙古语实验教材', type: 'book', link: '#' },
        { title: '蒙古语视频教程', type: 'video', link: '#' },
        { title: '蒙古语科技术语词典', type: 'dictionary', link: '#' }
      ]
    },
    {
      code: LANGUAGES.II_CN,
      name: 'ꆈꌠꉙ',
      displayName: '彝语（凉山方言）',
      resources: [
        { title: '彝语实验教材', type: 'book', link: '#' },
        { title: '彝语视频教程', type: 'video', link: '#' },
        { title: '彝语科技术语词典', type: 'dictionary', link: '#' }
      ]
    },
    {
      code: LANGUAGES.YI_CN,
      name: 'ꆈꌠꁱꂷ',
      displayName: '彝语（其他方言）',
      resources: [
        { title: '彝语实验教材', type: 'book', link: '#' },
        { title: '彝语音频教程', type: 'audio', link: '#' },
        { title: '彝语科技术语词典', type: 'dictionary', link: '#' }
      ]
    },
    {
      code: LANGUAGES.BO_CN,
      name: 'བོད་སྐད།',
      displayName: '藏语',
      resources: [
        { title: '藏语实验教材', type: 'book', link: '#' },
        { title: '藏语视频教程', type: 'video', link: '#' },
        { title: '藏语科技术语词典', type: 'dictionary', link: '#' }
      ]
    }
  ];

  // 选择的语言资源
  const selectedResources = ethnicLanguages.find(lang => lang.code === selectedLanguage)?.resources || [];

  // 处理标签页变更
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 切换语言
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setSelectedLanguage(langCode);
  };

  // 资源图标映射
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <MenuBookIcon />;
      case 'video':
        return <OndemandVideoIcon />;
      case 'audio':
        return <AudiotrackIcon />;
      case 'dictionary':
        return <LocalLibraryIcon />;
      default:
        return <SchoolIcon />;
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title="少数民族语言教育资源"
        titleTypographyProps={{ variant: 'h5' }}
        action={
          selectedLanguage && (
            <Chip
              label={`当前: ${ethnicLanguages.find(lang => lang.code === selectedLanguage)?.displayName}`}
              color="primary"
              variant="outlined"
            />
          )
        }
      />
      <CardContent>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="语言选择" icon={<TranslateIcon />} iconPosition="start" />
          <Tab
            label="教育资源"
            icon={<SchoolIcon />}
            iconPosition="start"
            disabled={!selectedLanguage}
          />
          <Tab
            label="在线课程"
            icon={<OndemandVideoIcon />}
            iconPosition="start"
            disabled={!selectedLanguage}
          />
        </Tabs>

        {/* 语言选择页面 */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              请选择一种少数民族语言查看相关教育资源：
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {ethnicLanguages.map((lang) => (
                <Grid item xs={12} sm={6} md={4} key={lang.code}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderLeft: selectedLanguage === lang.code ? '4px solid #1976d2' : 'none',
                      bgcolor: selectedLanguage === lang.code ? 'rgba(25, 118, 210, 0.05)' : 'background.paper',
                      '&:hover': {
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">{lang.displayName}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {lang.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        size="small"
                        label={`${lang.resources.length} 个资源`}
                        color="secondary"
                      />
                      <Button
                        size="small"
                        variant={selectedLanguage === lang.code ? "contained" : "outlined"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLanguageChange(lang.code);
                          setTabValue(1);
                        }}
                      >
                        查看资源
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* 教育资源页面 */}
        {tabValue === 1 && selectedLanguage && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {ethnicLanguages.find(lang => lang.code === selectedLanguage)?.displayName} 教育资源
            </Typography>

            <List>
              {selectedResources.map((resource, index) => (
                <React.Fragment key={index}>
                  <ListItem button component="a" href={resource.link}>
                    <ListItemIcon>
                      {getResourceIcon(resource.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={resource.title}
                      secondary={
                        resource.type === 'book' ? '教材' :
                        resource.type === 'video' ? '视频' :
                        resource.type === 'audio' ? '音频' :
                        resource.type === 'dictionary' ? '词典' : '资源'
                      }
                    />
                  </ListItem>
                  {index < selectedResources.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {selectedResources.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                暂无可用资源
              </Typography>
            )}
          </Box>
        )}

        {/* 在线课程页面 */}
        {tabValue === 2 && selectedLanguage && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {ethnicLanguages.find(lang => lang.code === selectedLanguage)?.displayName} 在线课程
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              在线课程功能正在开发中，敬请期待...
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EthnicLanguageResources;
