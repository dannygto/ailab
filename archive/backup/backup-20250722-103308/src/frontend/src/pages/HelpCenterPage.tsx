import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  ExpandMoreIcon,
  SearchIcon,
  HelpOutlineIcon as HelpIcon,
  SchoolIcon,
  ScienceIcon,
  VideoLibraryIcon as VideoIcon,
  BookIcon as DocumentIcon,
  ForumIcon,
  ChatIcon as FeedbackIcon,
  DownloadIcon,
  SmartToyIcon as AIIcon
} from '../utils/icons';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';

// 假设的 API 服务
const helpCenterService = {
  getGuides: async () => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      data: [
        {
          id: 1,
          title: '实验步骤详细说明',
          category: 'guide',
          content: '本指南详细介绍了如何进行各类实验的标准步骤和流程...',
          imageUrl: '/images/help/experiment-steps.jpg',
          tags: ['实验步骤', '初学者']
        },
        {
          id: 2,
          title: '操作要点与注意事项',
          category: 'guide',
          content: '在实验过程中，有一些关键的操作要点和注意事项需要特别留意...',
          imageUrl: '/images/help/operation-notes.jpg',
          tags: ['操作要点', '安全事项']
        },
        {
          id: 3,
          title: '实验结果分析方法',
          category: 'guide',
          content: '本文档介绍了如何系统地分析实验结果，包括数据处理方法和结论推导...',
          imageUrl: '/images/help/result-analysis.jpg',
          tags: ['结果分析', '数据处理']
        }
      ]
    };
  },
  getResources: async () => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      data: [
        {
          id: 1,
          title: '高中物理实验教学资源包',
          category: 'resource',
          description: '包含高中物理全部实验的教学资源、实验指导和数据分析模板',
          type: 'document',
          fileSize: '25MB',
          downloadCount: 1250
        },
        {
          id: 2,
          title: '实验数据分析软件使用指南',
          category: 'resource',
          description: '详细介绍平台内置的数据分析工具的使用方法和技巧',
          type: 'video',
          duration: '45分钟',
          viewCount: 3680
        },
        {
          id: 3,
          title: '学生实验报告范例集',
          category: 'resource',
          description: '收集了各学科优秀实验报告样例，可作为报告撰写参考',
          type: 'document',
          fileSize: '18MB',
          downloadCount: 2730
        }
      ]
    };
  },
  getFAQs: async () => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      data: [
        {
          id: 1,
          question: '如何创建我的第一个实验？',
          answer: '进入实验管理页面，点击"创建实验"按钮，按照向导填写实验基本信息，配置实验参数和资源，最后点击"保存并创建"按钮完成创建。',
          category: 'experiment'
        },
        {
          id: 2,
          question: '如何连接和配置实验设备？',
          answer: '在设备管理页面，点击"添加设备"，选择设备类型并按照提示进行连接配置。确保设备驱动已正确安装，并且设备处于开启状态。',
          category: 'device'
        },
        {
          id: 3,
          question: '如何分析实验数据并生成图表？',
          answer: '在实验详情页面，进入"数据分析"标签，上传或输入实验数据，然后选择分析方法，系统将自动处理数据并生成相应的图表和统计结果。',
          category: 'data'
        },
        {
          id: 4,
          question: '如何共享我的实验结果？',
          answer: '在实验详情页面，点击"分享"按钮，选择分享方式（链接、二维码或导出PDF），设置访问权限，然后确认分享。',
          category: 'sharing'
        },
        {
          id: 5,
          question: '如何提交实验报告？',
          answer: '在实验详情页面，点击"报告"标签，填写报告各部分内容，或上传已编辑好的报告文件，然后点击"提交"按钮完成提交。',
          category: 'report'
        }
      ]
    };
  },
  searchHelp: async (query: string) => {
    // 模拟搜索 API 调用
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: [
        {
          id: 1,
          title: '实验步骤详细说明',
          content: '本指南详细介绍了如何进行各类实验的标准步骤和流程...',
          type: 'guide',
          relevance: 0.95
        },
        {
          id: 2,
          question: '如何创建我的第一个实验？',
          answer: '进入实验管理页面，点击"创建实验"按钮...',
          type: 'faq',
          relevance: 0.88
        },
        {
          id: 3,
          title: '高中物理实验教学资源包',
          description: '包含高中物理全部实验的教学资源、实验指导和数据分析模板',
          type: 'resource',
          relevance: 0.75
        }
      ]
    };
  }
};

// 主要帮助中心页面组件
const HelpCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | false>(false);

  // 获取指南数据
  const {
    data: guidesData,
    isLoading: isLoadingGuides,
    error: guidesError
  } = useQuery('help-guides', helpCenterService.getGuides);

  // 获取资源数据
  const {
    data: resourcesData,
    isLoading: isLoadingResources,
    error: resourcesError
  } = useQuery('help-resources', helpCenterService.getResources);

  // 获取常见问题数据
  const {
    data: faqsData,
    isLoading: isLoadingFAQs,
    error: faqsError
  } = useQuery('help-faqs', helpCenterService.getFAQs);

  // 处理标签切换
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 处理搜索
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const response = await helpCenterService.searchHelp(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error('搜索失败:', error);
      toast.error('搜索请求失败，请稍后重试');
    } finally {
      setIsSearching(false);
    }
  };

  // 处理 FAQ 展开/折叠
  const handleFAQChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  // 渲染指南列表
  const renderGuides = () => {
    if (isLoadingGuides) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (guidesError) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          加载指南失败，请刷新页面重试
        </Alert>
      );
    }

    return (
      <Grid container spacing={3}>
        {guidesData?.data.map((guide: any) => (
          <Grid item xs={12} md={6} lg={4} key={guide.id}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {guide.title}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {guide.tags.map((tag: string) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {guide.content}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">查看详情</Button>
                <Button size="small" startIcon={<VideoIcon />}>视频教程</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // 渲染资源列表
  const renderResources = () => {
    if (isLoadingResources) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (resourcesError) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          加载资源失败，请刷新页面重试
        </Alert>
      );
    }

    return (
      <Grid container spacing={3}>
        {resourcesData?.data.map((resource: any) => (
          <Grid item xs={12} md={6} key={resource.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {resource.type === 'document' ? (
                    <DocumentIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                  ) : (
                    <VideoIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                  )}
                  <Typography variant="h6">
                    {resource.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {resource.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    {resource.type === 'document'
                      ? `文件大小：${resource.fileSize} · 下载次数：${resource.downloadCount}`
                      : `时长：${resource.duration} · 观看次数：${resource.viewCount}`
                    }
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={resource.type === 'document' ? <DownloadIcon /> : <VideoIcon />}
                >
                  {resource.type === 'document' ? '下载' : '观看'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // 渲染常见问题
  const renderFAQs = () => {
    if (isLoadingFAQs) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (faqsError) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          加载常见问题失败，请刷新页面重试
        </Alert>
      );
    }

    const faqsByCategory: Record<string, any[]> = {};
    faqsData?.data.forEach((faq: any) => {
      if (!faqsByCategory[faq.category]) {
        faqsByCategory[faq.category] = [];
      }
      faqsByCategory[faq.category].push(faq);
    });

    return (
      <Box>
        {Object.entries(faqsByCategory).map(([category, faqs]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
              {category === 'experiment' ? '实验相关' :
               category === 'device' ? '设备相关' :
               category === 'data' ? '数据分析相关' :
               category === 'sharing' ? '共享与协作相关' :
               category === 'report' ? '报告相关' : category}
            </Typography>
            {faqs.map((faq: any) => (
              <Accordion
                key={faq.id}
                expanded={expandedFAQ === `faq-${faq.id}`}
                onChange={handleFAQChange(`faq-${faq.id}`)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: expandedFAQ === `faq-${faq.id}` ? 'bold' : 'normal' }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        ))}
      </Box>
    );
  };

  // 渲染社区与互动
  const renderCommunity = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          用户交流社区
        </Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            提问与解答
          </Typography>
          <Typography variant="body2" paragraph>
            在社区中提出您的问题，获取其他用户和专家的解答。共同探讨实验过程中遇到的问题和挑战。
          </Typography>
          <Button variant="contained" startIcon={<ForumIcon />}>
            进入问答社区
          </Button>
        </Paper>

        <Typography variant="h6" gutterBottom>
          反馈系统
        </Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            提交改进建议
          </Typography>
          <Typography variant="body2" paragraph>
            帮助我们改进平台！提交您的建议、报告问题或分享您的使用体验。
          </Typography>
          <Button variant="outlined" startIcon={<FeedbackIcon />}>
            提交反馈
          </Button>
        </Paper>

        <Typography variant="h6" gutterBottom>
          专家在线
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            预约专家咨询
          </Typography>
          <Typography variant="body2" paragraph>
            针对复杂问题，您可以预约专业领域专家进行一对一咨询。
          </Typography>
          <Button variant="outlined" color="secondary">
            查看可预约时段
          </Button>
        </Paper>
      </Box>
    );
  };

  // 渲染培训与课程
  const renderTraining = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          在线课程
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  平台使用基础课程
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  适合初次使用平台的用户，全面介绍平台功能和基本操作。
                </Typography>
                <Chip label="初级" color="primary" size="small" sx={{ mr: 1 }} />
                <Chip label="3小时" size="small" />
              </CardContent>
              <CardActions>
                <Button size="small">开始学习</Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  实验设计与分析
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  学习如何设计高质量实验方案、采集有效数据和进行深入分析。
                </Typography>
                <Chip label="中级" color="secondary" size="small" sx={{ mr: 1 }} />
                <Chip label="5小时" size="small" />
              </CardContent>
              <CardActions>
                <Button size="small">开始学习</Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI辅助教学技巧
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  掌握如何利用平台AI功能辅助教学，提升学习效果。
                </Typography>
                <Chip label="高级" color="error" size="small" sx={{ mr: 1 }} />
                <Chip label="4小时" size="small" />
              </CardContent>
              <CardActions>
                <Button size="small">开始学习</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          培训日历
        </Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            即将开始的培训
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText
                primary="数据可视化工具使用培训"
                secondary="2025年7月25日 14:00-16:00 · 讲师：王教授"
              />
              <Button variant="outlined" size="small">
                报名参加
              </Button>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText
                primary="实验报告撰写专题讲座"
                secondary="2025年7月28日 10:00-11:30 · 讲师：李博士"
              />
              <Button variant="outlined" size="small">
                报名参加
              </Button>
            </ListItem>
          </List>
        </Paper>

        <Typography variant="h6" gutterBottom>
          学习证书
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            我的学习成果
          </Typography>
          <Typography variant="body2" paragraph>
            完成课程和培训后，您可以获得相应的学习证书，记录您的学习成果。
          </Typography>
          <Button variant="outlined">
            查看我的证书
          </Button>
        </Paper>
      </Box>
    );
  };

  // 渲染智能辅助
  const renderAIAssistant = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          AI助手集成
        </Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AIIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="subtitle1">
              智能问答助手
            </Typography>
          </Box>
          <Typography variant="body2" paragraph>
            使用AI助手快速获取问题解答，无需浏览大量文档。助手可以理解您的实验环境和背景。
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="输入您的问题，如：如何分析波形数据？"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <Button variant="contained" sx={{ ml: 1 }}>
                  提问
                </Button>
              ),
            }}
          />
        </Paper>

        <Typography variant="h6" gutterBottom>
          学习诊断
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            个性化学习路径
          </Typography>
          <Typography variant="body2" paragraph>
            AI分析您的学习行为和实验操作，识别知识盲点和学习障碍，提供个性化学习建议。
          </Typography>
          <Button variant="contained" color="secondary">
            开始学习诊断
          </Button>
        </Paper>
      </Box>
    );
  };

  // 渲染搜索结果
  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (searchResults.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          没有找到与"{searchQuery}"相关的内容，请尝试其他关键词。
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          搜索结果 ({searchResults.length})
        </Typography>
        <List>
          {searchResults.map((result) => (
            <Paper key={result.id} sx={{ mb: 2, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {result.title || result.question}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {result.content || result.answer || result.description}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={
                    result.type === 'guide' ? '实验指南' :
                    result.type === 'faq' ? '常见问题' :
                    '学习资源'
                  }
                  size="small"
                  color={
                    result.type === 'guide' ? 'primary' :
                    result.type === 'faq' ? 'secondary' :
                    'default'
                  }
                />
                <Button size="small">查看详情</Button>
              </Box>
            </Paper>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <HelpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          实验指导与帮助中心
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          全面的学习支持系统，提供实验指导、使用帮助、知识库和学习资源
        </Typography>

        {/* 搜索框 */}
        <Paper sx={{ p: 2, mt: 3 }}>
          <TextField
            fullWidth
            placeholder="搜索帮助内容、指南、教程..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                >
                  搜索
                </Button>
              )
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </Paper>

        {/* 搜索结果 */}
        {searchResults.length > 0 && renderSearchResults()}

        {/* 如果没有搜索结果，显示标签页内容 */}
        {searchResults.length === 0 && (
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="实验指南" icon={<ScienceIcon />} iconPosition="start" />
                <Tab label="资源下载" icon={<DownloadIcon />} iconPosition="start" />
                <Tab label="常见问题" icon={<HelpIcon />} iconPosition="start" />
                <Tab label="互动支持" icon={<ForumIcon />} iconPosition="start" />
                <Tab label="培训与课程" icon={<SchoolIcon />} iconPosition="start" />
                <Tab label="智能辅助" icon={<AIIcon />} iconPosition="start" />
              </Tabs>
            </Paper>

            <Box sx={{ p: 1 }}>
              {activeTab === 0 && renderGuides()}
              {activeTab === 1 && renderResources()}
              {activeTab === 2 && renderFAQs()}
              {activeTab === 3 && renderCommunity()}
              {activeTab === 4 && renderTraining()}
              {activeTab === 5 && renderAIAssistant()}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default HelpCenterPage;
