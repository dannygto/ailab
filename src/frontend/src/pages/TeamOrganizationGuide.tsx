import React from 'react';
import { Box, Typography, Link, Paper, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessIcon from '@mui/icons-material/Business';

/**
 * 创建团队和组织引导页面组件
 * 作为团队和组织管理的入口页面
 */
const TeamOrganizationGuide: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        团队与组织管理
      </Typography>
      <Typography variant="body1" paragraph>
        在此平台中，您可以创建和管理团队与组织，以便更好地组织您的用户、实验和资源。
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 4 }}>
        {/* 团队管理卡片 */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            flex: '1 0 300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 300,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GroupsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Typography variant="h5">团队管理</Typography>
            </Box>
            <Typography variant="body1" paragraph>
              团队是为特定项目或任务而组建的小型灵活工作组。创建团队可以：
            </Typography>
            <ul>
              <li>为实验项目组建临时协作小组</li>
              <li>分配不同角色和权限给团队成员</li>
              <li>共享实验资源和数据</li>
              <li>跟踪团队进度和成果</li>
            </ul>
          </Box>
          <Button
            component={RouterLink}
            to="/teams"
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{ mt: 2, alignSelf: 'flex-start' }}
          >
            进入团队管理
          </Button>
        </Paper>

        {/* 组织管理卡片 */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            flex: '1 0 300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 300,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Typography variant="h5">组织管理</Typography>
            </Box>
            <Typography variant="body1" paragraph>
              组织是长期稳定的机构结构，如学校、院系、部门等。组织管理可以：
            </Typography>
            <ul>
              <li>创建层级式的组织架构</li>
              <li>管理组织内的用户和资源权限</li>
              <li>为组织成员提供统一的资源访问</li>
              <li>跟踪组织整体的实验和教学情况</li>
            </ul>
          </Box>
          <Button
            component={RouterLink}
            to="/admin/organizations"
            variant="contained"
            color="secondary"
            startIcon={<BusinessIcon />}
            sx={{ mt: 2, alignSelf: 'flex-start' }}
          >
            进入组织管理
          </Button>
        </Paper>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>
          选择哪种管理方式？
        </Typography>
        <Typography variant="body1">
          <strong>团队</strong>适合临时性、项目导向的小组协作，<strong>组织</strong>适合长期稳定的机构结构。
          您可以根据自己的需求选择合适的管理方式，也可以同时使用两种方式来满足不同场景的需求。
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          需要帮助？请查看
          <Link component={RouterLink} to="/help/teams-organizations" sx={{ mx: 0.5 }}>
            团队与组织管理指南
          </Link>
          获取更多信息。
        </Typography>
      </Box>
    </Box>
  );
};

export default TeamOrganizationGuide;
