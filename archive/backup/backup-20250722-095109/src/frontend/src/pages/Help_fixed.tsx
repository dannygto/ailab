import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Link
} from '@mui/material';

import {
  ExpandMoreIcon,
  HelpOutlineIcon as HelpIconIcon,
  SchoolIcon,
  ScienceIcon,
  SmartToyIcon as AIIcon,
  StorageIcon as DataIcon,
  SecurityIcon,
  PhoneIcon as ContactIcon,
  EmailIcon,
  LanguageIcon as WebIcon,
  VideoLibraryIcon as VideoIcon
} from '../utils/icons';

const Help: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | false>(false);

  const handleFAQChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  const faqs = [
    {
      id: 'faq1',
      question: '如何开始我的第一个实验？',
      answer: '点击左侧菜单中的"实验管理"，然后选择"创建实验"。选择合适实际实验类型（观察、测量、对比等），填写实验基本信息，配置实验方案和资源，最后保存创建。系统将为您生成实验模板。'
    },
    {
      id: 'faq2',
      question: '如何配置AI助手？',
      answer: '进入"设置" > "AI模型"页面，选择合适实际AI服务提供商（如DeepSeek、智谱AI等），输入您的API密钥并测试连接。配置成功后即可在实验过程中使用AI助手功能。'
    },
    {
      id: 'faq3',
      question: '支持哪些实验类型？',
      answer: '平台支持K12教育阶段的多种实验类型：观察实验（observation）、测量实验（measurement）、对比实验（comparison）、探索实验（exploration）、设计实验（design）、分析实验（analysis）、综合实验（synthesis）等。'
    },
    {
      id: 'faq4',
      question: '如何采集和分析实验数据？',
      answer: '在"数据采集和分析"页面，您可以连接传感器设备采集实时数据，上传实验文件，或手动输入数据。数据收集完成后，可以进行统计分析、图表生成、趋势分析等多种方式的数据分析。'
    },
    {
      id: 'faq5',
      question: '教师如何管理学生实验？',
      answer: '教师可以通过"教师控制台"查看所有学生的实验进度，批阅实验报告，提供指导意见。同时可以通过"资源管理"为学生分配实验器材和材料。'
    },
    {
      id: 'faq6',
      question: '平台的安全性如何保证？',
      answer: '平台采用多层安全措施：API密钥加密存储、数据传输加密、用户权限控制、数据安全审计。AI服务特别针对K12学生优化，确保交互内容的适宜性和安全性。'
    },
    {
      id: 'faq7',
      question: '支持哪些学科？',
      answer: '平台支持K12阶段的多个学科：物理、化学、生物、地理、信息技术等。每个学科都有专门的实验模板和资源库，适合不同年级段的学生使用。'
    },
    {
      id: 'faq8',
      question: '如何获得技术支持？',
      answer: '您可以通过以下方式获得技术支持：1) 查看本帮助页面的常见问题；2) 发送邮件至support@sslab.edu.cn；3) 拨打支持热线400-888-9999；4) 观看视频教程了解详细操作。'
    }
  ];

  const quickActions = [
    {
      title: '创建第一个实验',
      description: '跟随引导创建您的第一个科学实验',
      icon: <ScienceIcon />,
      action: () => window.location.href = '/experiments/create'
    },
    {
      title: '配置AI助手',
      description: '设置AI模型对话和智能功能',
      icon: <AIIcon />,
      action: () => window.location.href = '/settings'
    },
    {
      title: '查看视频教程',
      description: '观看详细的操作指导视频',
      icon: <VideoIcon />,
      action: () => window.open('/help/videos', '_blank')
    },
    {
      title: '联系技术支持',
      description: '获得专业的技术支持服务',
      icon: <ContactIcon />,
      action: () => window.open('mailto:support@sslab.edu.cn', '_blank')
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HelpIconIcon />
        帮助中心
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        欢迎使用AI实验平台！这里有您需要的所有帮助信息。如果您是新用户，建议先查看快速开始指南。
      </Alert>

      {/* 快速操作 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          快速开始
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={action.action}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 常见问题 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          常见问题
        </Typography>
        {faqs.map((faq) => (
          <Accordion
            key={faq.id}
            expanded={expandedFAQ === faq.id}
            onChange={handleFAQChange(faq.id)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* 功能模块说明 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          功能模块说明
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <ScienceIcon />
                </ListItemIcon>
                <ListItemText
                  primary="实验管理"
                  secondary="创建、执行、管理科学实验，支持多种实验类型和模板"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText
                  primary="模板库"
                  secondary="丰富的实验模板库，涵盖K12各学科实验"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DataIcon />
                </ListItemIcon>
                <ListItemText
                  primary="数据分析"
                  secondary="实时数据采集、统计分析、可视化图表生成"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AIIcon />
                </ListItemIcon>
                <ListItemText
                  primary="AI助手"
                  secondary="智能对话、实验指导、问题解答等AI功能"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary="系统设置"
                  secondary="用户配置、安全设置、AI模型管理等"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ContactIcon />
                </ListItemIcon>
                <ListItemText
                  primary="技术支持"
                  secondary="在线帮助、技术支持、用户反馈等服务"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>

      {/* 联系信息 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          联系我们
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h6">邮箱支持</Typography>
                <Link href="mailto:support@aiexp.edu">support@aiexp.edu</Link>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ContactIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h6">电话支持</Typography>
                <Typography>400-123-4567</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WebIcon sx={{ mr: 1 }} />
              <Box>
                <Typography variant="h6">在线文档</Typography>
                <Link href="https://docs.aiexp.edu" target="_blank">docs.aiexp.edu</Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Help;
