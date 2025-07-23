import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Pagination
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useActivityService } from '../../hooks/useActivityService';
import { Activity, ActivityType, ResourceType, TeamActivityFilter } from '../../types/activity';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 活动类型图标映射
const getActivityIcon = (activityType: ActivityType) => {
  const iconMap: Record<string, React.ReactElement> = {
    team_create: <PersonIcon />,
    team_update: <PersonIcon />,
    team_delete: <PersonIcon />,
    member_add: <PersonIcon />,
    member_remove: <PersonIcon />,
    member_role_change: <PersonIcon />,
    resource_add: <InfoIcon />,
    resource_remove: <InfoIcon />,
    resource_share: <InfoIcon />,
    resource_update: <InfoIcon />,
    comment: <InfoIcon />,
    other: <InfoIcon />
  };

  return iconMap[activityType] || <InfoIcon />;
};

// 活动项组件
const ActivityItem: React.FC<{ activity: Activity; onResourceClick?: (resourceType: ResourceType, resourceId: string) => void }> = ({
  activity,
  onResourceClick
}) => {
  const theme = useTheme();
  const { getActivityTypeName, getResourceTypeName } = useActivityService();

  // 格式化时间
  const formattedDate = format(new Date(activity.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });

  // 活动描述
  const primaryText = (
    <Box>
      <Typography component="span" variant="body1" fontWeight="bold">
        {activity.user.name}
      </Typography>
      <Typography component="span" variant="body2">
        {' '}执行了{getActivityTypeName(activity.activityType)}操作
      </Typography>
      {activity.resourceType && activity.resourceId && (
        <Typography component="span" variant="body2">
          {' '}在
          <Tooltip title="点击查看详情">
            <Typography
              component="span"
              color="primary"
              sx={{
                cursor: 'pointer',
                textDecoration: 'underline',
                '&:hover': { color: theme.palette.primary.dark }
              }}
              onClick={() => onResourceClick && onResourceClick(activity.resourceType!, activity.resourceId!)}
            >
              {getResourceTypeName(activity.resourceType)}{activity.metadata?.resourceName ? `: ${activity.metadata.resourceName}` : ''}
            </Typography>
          </Tooltip>
        </Typography>
      )}
    </Box>
  );

  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar src={activity.user.avatar}>
          {!activity.user.avatar && activity.user.name.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={primaryText}
        secondary={
          <React.Fragment>
            <Typography component="span" variant="body2" color="text.secondary">
              {activity.description}
            </Typography>
            <Box display="flex" alignItems="center" mt={1}>
              <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem', color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formattedDate}
              </Typography>
            </Box>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

// 活动过滤组件
const ActivityFilter: React.FC<{
  filter: TeamActivityFilter;
  onChange: (filter: TeamActivityFilter) => void;
  onReset: () => void;
}> = ({ filter, onChange, onReset }) => {
  const [localFilter, setLocalFilter] = useState<TeamActivityFilter>(filter);

  const handleChange = (field: keyof TeamActivityFilter, value: any) => {
    const newFilter = { ...localFilter, [field]: value };
    setLocalFilter(newFilter);
  };

  const handleApply = () => {
    onChange(localFilter);
  };

  const handleReset = () => {
    setLocalFilter({});
    onReset();
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        筛选活动
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="activity-type-label">活动类型</InputLabel>
            <Select
              labelId="activity-type-label"
              multiple
              value={localFilter.activityType || []}
              onChange={(e) => handleChange('activityType', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as ActivityType[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="活动类型"
            >
              {Object.values(ActivityType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="resource-type-label">资源类型</InputLabel>
            <Select
              labelId="resource-type-label"
              multiple
              value={localFilter.resourceType || []}
              onChange={(e) => handleChange('resourceType', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as ResourceType[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="资源类型"
            >
              {Object.values(ResourceType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="开始日期"
            type="date"
            size="small"
            value={localFilter.startDate ? new Date(localFilter.startDate).toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="结束日期"
            type="date"
            size="small"
            value={localFilter.endDate ? new Date(localFilter.endDate).toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Tooltip title="重置筛选条件">
              <IconButton color="default" onClick={handleReset}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <IconButton color="primary" onClick={handleApply}>
              <FilterListIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

// 团队活动记录组件
interface TeamActivityLogProps {
  teamId: string;
  onResourceClick?: (resourceType: ResourceType, resourceId: string) => void;
  showFilter?: boolean;
}

const TeamActivityLog: React.FC<TeamActivityLogProps> = ({
  teamId,
  onResourceClick,
  showFilter = true
}) => {
  const { isLoading, error, getTeamActivities } = useActivityService();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<TeamActivityFilter>({});

  const fetchActivities = async () => {
    try {
      const response = await getTeamActivities(teamId, currentPage, 10, filter);
      setActivities(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('获取活动记录失败:', error);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchActivities();
    }
  }, [teamId, currentPage, filter]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilter: TeamActivityFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setFilter({});
    setCurrentPage(1);
  };

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        团队活动记录
      </Typography>

      {showFilter && (
        <ActivityFilter
          filter={filter}
          onChange={handleFilterChange}
          onReset={handleFilterReset}
        />
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" p={2}>
          {error}
        </Typography>
      ) : activities.length === 0 ? (
        <Typography align="center" color="text.secondary" p={4}>
          暂无活动记录
        </Typography>
      ) : (
        <>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {activities.map((activity, index) => (
              <React.Fragment key={activity._id}>
                <ActivityItem
                  activity={activity}
                  onResourceClick={onResourceClick}
                />
                {index < activities.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default TeamActivityLog;
