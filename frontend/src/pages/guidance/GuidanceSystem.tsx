import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Container, 
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useQuery } from 'react-query';
import { AutoGraphIcon } from '../../utils/icons';
import { LightbulbIcon } from '../../utils/icons';
import { SchoolIcon } from '../../utils/icons';

import GuidanceSuggestionList from '../../components/guidance/GuidanceSuggestionList';
import GuidanceGenerator from '../../components/guidance/GuidanceGenerator';
import SessionHistory from '../../components/guidance/SessionHistory';
import api from '../../services/api';
import { GuidanceSuggestion } from '../../types/guidance';

// 标签面板内容
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`guidance-tabpanel-${index}`}
      aria-labelledby={`guidance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div sx={{ p: 3 }}>
          {children}
        </div>
      )}
    </div>
  );
}

const GuidanceSystem: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedSuggestion, setSelectedSuggestion] = useState<GuidanceSuggestion | null>(null);

  // 获取指导建议列表
  const { 
    data: suggestionsData, 
    isLoading: isLoadingSuggestions, 
    error: suggestionsError,
    refetch: refetchSuggestions
  } = useQuery('guidanceSuggestions', async () => {
    const response = await api.getGuidanceSuggestions();
    return response.data;
  });

  // 获取会话历史
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: sessionsError
  } = useQuery('guidanceSessions', async () => {    const activeSessionId = localStorage.getItem('activeGuidanceSessionId') || 'sample-session';
    const response = await api.getGuidanceSessionHistory(activeSessionId);
    return response.data;
  });

  const handleTabChange = (Event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSuggestionSelect = (suggestion: GuidanceSuggestion) => {
    setSelectedSuggestion(suggestion);
  };

  const handleCreateSuggestion = async (newSuggestion: Partial<GuidanceSuggestion>) => {
    try {
      await api.createGuidanceSuggestion(newSuggestion);
      refetchSuggestions();
    } catch (error) {
      console.error('创建指导建议失败:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      <div sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <LightbulbIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          智能指导系统
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          提供个性化学习指导、智能辅助建议和实时学习反馈，助力学生实验学习全过程。
        </Typography>
        <Divider sx={{ my: 2 }} />
      </div>

      <Paper sx={{ width: '100%', borderRadius: 2 }}>
        <div sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="智能指导系统标签页"
            variant="fullWidth"
          >
            <Tab icon={<LightbulbIcon />} label="指导建议" />
            <Tab icon={<AutoGraphIcon />} label="AI指导生成" />
            <Tab icon={<SchoolIcon />} label="会话历史" />
          </Tabs>
        </div>

        <TabPanel value={tabValue} index={0}>
          {isLoadingSuggestions ? (
            <div sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </div>
          ) : suggestionsError ? (
            <Alert severity="error">加载指导建议失败</Alert>
          ) : (
            <GuidanceSuggestionList 
              suggestions={suggestionsData || []} 
              onSelect={handleSuggestionSelect}
              onCreate={handleCreateSuggestion}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <GuidanceGenerator />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {isLoadingSessions ? (
            <div sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </div>
          ) : sessionsError ? (
            <Alert severity="error">加载会话历史失败</Alert>
          ) : (
            <SessionHistory session={sessionsData?.data} />
          )}
        </TabPanel>
      </Paper>

      {selectedSuggestion && (
        <Paper sx={{ mt: 4, p: 3, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            {selectedSuggestion.title}
          </Typography>
          <div sx={{ mb: 2 }}>
            <Typography variant="caption" component="span" sx={{ mr: 2 }}>
              类型: {selectedSuggestion.type}
            </Typography>
            <Typography variant="caption" component="span" sx={{ mr: 2 }}>
              重要性: {selectedSuggestion.importance}/5
            </Typography>
            <Typography variant="caption" component="span">
              创建时间: {new Date(selectedSuggestion.createdAt).toLocaleString()}
            </Typography>
          </div>
          <Typography variant="body1" paragraph>
            {selectedSuggestion.content}
          </Typography>

          {selectedSuggestion.relatedResources && selectedSuggestion.relatedResources.length > 0 && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                相关资源
              </Typography>
              <Grid container spacing={2}>
                {selectedSuggestion.relatedResources.map(resource => (
                  <Grid item xs={12} sm={6} md={4} key={resource.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2">{resource.title}</Typography>
                      <Typography variant="caption" display="block" gutterBottom>
                        {resource.type === 'video' ? '视频' : 
                         resource.type === 'document' ? '文档' : 
                         resource.type === 'template' ? '模板' : '外部链接'}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        href={resource.url} 
                        target="_blank"
                        sx={{ mt: 1 }}
                      >
                        查看资源
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default GuidanceSystem;


