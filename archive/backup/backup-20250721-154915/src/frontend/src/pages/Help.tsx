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

import { ExpandMoreIcon, HelpOutlineIcon as HelpIconIcon, SchoolIcon, ScienceIcon, SmartToyIcon as AIIcon, StorageIcon as DataIcon, SecurityIcon, PhoneIcon as ContactIcon, EmailIcon, LanguageIcon as WebIcon, VideoLibraryIcon as VideoIcon } from '../utils/icons';

const HelpIcon: React.FC = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | false>(false);

  const handleFAQChange = (panel: string) => (Event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFAQ(isExpanded ? panel : false);
  };

  const faqs = [
    {
      id: 'faq1',
      question: '��ο�ʼ�ҵĵ�һ��ʵ�飿',
      answer: '����������е�"ʵ�����"��Ȼ��ѡ��"����ʵ��"��ѡ����ʵ�ʵ�����ͣ��۲졢�������Աȵȣ�����дʵ����Ϣ������ʵ�鷽������Դ����󱣴漴�ɡ�ϵͳ��Ϊ������ʵ��ģ�塣'
    },
    {
      id: 'faq2',
      question: '�������AI���֣�',
      answer: '����"����" > "AIģ��"ҳ�棬ѡ����ʵ�AI�����ṩ�̣���DeepSeek������AI�ȣ�����������api��Կ��������ز�����������ӡ����óɹ��󼴿���ʵ�������ʹ��AI���ֹ��ܡ�'
    },
    {
      id: 'faq3',
      question: '֧����Щʵ�����ͣ�',
      answer: 'ƽ̨֧��K12�����׶εĶ���ʵ�����ͣ��۲�ʵ�飨observation��������ʵ�飨measurement�����Ա�ʵ�飨comparison����̽��ʵ�飨exploration�������ʵ�飨design��������ʵ�飨analysis�����ۺ�ʵ�飨synthesis����'
    },
    {
      id: 'faq4',
      question: '����ռ��ͷ���ʵ�����ݣ�',
      answer: '��"�����ռ������"ҳ�棬�����Դ��������ռ�������������Դ��������������ͷ����˷�ȣ������òɼ��������ռ������ݿ��Խ���ͳ�Ʒ��������Ʒ���������Է����ȶ��ַ���������'
    },
    {
      id: 'faq5',
      question: '��ʦ��ι���ѧ��ʵ�飿',
      answer: '��ʦ����ͨ��"��ʦ����̨"�鿴����ѧ����ʵ����ȣ����ʵ�鱨�棬�ṩָ�����顣������ͨ��"��Դ����"Ϊѧ������ʵ�����ĺͲ��ϡ�'
    },
    {
      id: 'faq6',
      question: 'ƽ̨�İ�ȫ����α��ϣ�',
      answer: 'ƽ̨���ö�㰲ȫ��ʩ��api��Կ���ش洢�����ݴ�����ܡ��û�Ȩ�޿��ơ����ݰ�ȫ���ˡ�AI�����ر����K12ѧ���Ż���ȷ���ش����ݵ������ԺͰ�ȫ�ԡ�'
    },
    {
      id: 'faq7',
      question: '֧����Щѧ�ƣ�',
      answer: 'ƽ̨֧��K12�׶εĶ��ѧ�ƣ���������ѧ�������������ѧ����Ϣ�����ȡ�ÿ��ѧ�ƶ���ר�ŵ�ʵ��ģ�����Դ�⣬�ʺϲ�ͬ�꼶�ε�ѧ��ʹ�á�'
    },
    {
      id: 'faq8',
      question: '��λ�ü���֧�֣�',
      answer: '������ͨ�����·�ʽ��ü���֧�֣�1) �鿴������ҳ��ĳ������⣻2) �����ʼ���support@aiexp.edu��3) ������֧������400-123-4567��4) �ۿ���Ƶ�̳��˽���ϸ������'
    }
  ];

  const quickActions = [
    {
      title: '������һ��ʵ��',
      description: '�����򵼴������ĵ�һ����ѧʵ��',
      icon: <ScienceIcon />,
      action: () => window.location.href = '/experiments/create'
    },
    {
      title: '����AI����',
      description: '����AIģ���Ի�����ܸ���',
      icon: <AIIcon />,
      action: () => window.location.href = '/settings'
    },
    {
      title: '�鿴��Ƶ�̳�',
      description: '�ۿ���ϸ�Ĳ���ָ����Ƶ',
      icon: <VideoIcon />,
      action: () => window.open('https://HelpIcon.aiexp.edu/videos', '_blank')
    },
    {
      title: '��ϵ����֧��',
      description: '���רҵ�ļ���֧�ַ���',
      icon: <ContactIcon />,
      action: () => window.open('mailto:support@aiexp.edu', '_blank')
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HelpIconIcon />
        ��������
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        ��ӭʹ���˹����ܸ���ʵ��ƽ̨������Ϊ���ṩ��ϸ��ʹ��ָ�Ϻͳ���������
      </Alert>

      <Grid container spacing={3}>
        {/* ���ٲ��� */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              ���ٿ�ʼ
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { elevation: 4 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={action.action}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
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
        </Grid>

        {/* �������� */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              ��������
            </Typography>
            
            {faqs.map((faq) => (
              <Accordion 
                key={faq.id}
                expanded={expandedFAQ === faq.id} 
                onChange={handleFAQChange(faq.id)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        {/* ��ϵ��Ϣ����Դ */}
        <Grid item xs={12} lg={4}>
          {/* ��ϵ���� */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContactIcon />
                ��ϵ����
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="����֧��"
                    secondary={
                      <Link href="mailto:support@aiexp.edu" color="primary">
                        support@aiexp.edu
                      </Link>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ContactIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="��������"
                    secondary="400-123-4567"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WebIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="�ٷ���վ"
                    secondary={
                      <Link href="https://www.aiexp.edu" target="_blank" color="primary">
                        www.aiexp.edu
                      </Link>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* �������� */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ƽ̨����
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip 
                  icon={<SchoolIcon />} 
                  label="K12����ר��" 
                  variant="outlined" 
                  size="small" 
                />
                <Chip 
                  icon={<AIIcon />} 
                  label="AI���ܸ���" 
                  variant="outlined" 
                  size="small" 
                />
                <Chip 
                  icon={<ScienceIcon />} 
                  label="��ѧ��ʵ��" 
                  variant="outlined" 
                  size="small" 
                />
                <Chip 
                  icon={<DataIcon />} 
                  label="���ݷ���" 
                  variant="outlined" 
                  size="small" 
                />
                <Chip 
                  icon={<SecurityIcon />} 
                  label="��ȫ�ɿ�" 
                  variant="outlined" 
                  size="small" 
                />
              </Box>
            </CardContent>
          </Card>

          {/* �汾��Ϣ */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                �汾��Ϣ
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                ��ǰ�汾��v1.0.0
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                ����ʱ�䣺2025��6��23��
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ������K12�����׶εĿ�ѧʵ���ѧƽ̨
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HelpIcon;


