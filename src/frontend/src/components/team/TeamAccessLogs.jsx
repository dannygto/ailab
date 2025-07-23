/**
 * 团队访问日志组件
 * 用于显示团队内成员的资源访问记录，支持多种筛选条件和分页
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Pagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { useTeamService } from '../../hooks/useTeamService';
import { formatDate } from '../../utils/dateUtils';
import LoadingIndicator from '../common/LoadingIndicator';
import EmptyState from '../common/EmptyState';
import DetailDialog from '../common/DetailDialog';

// 操作类型选项
const ACTION_TYPES = [
  { value: 'view', label: '查看' },
  { value: 'edit', label: '编辑' },
  { value: 'download', label: '下载' },
  { value: 'share', label: '共享' },
  { value: 'delete', label: '删除' },
  { value: 'view_access_logs', label: '查看访问日志' }
];

// 资源类型选项
const RESOURCE_TYPES = [
  { value: 'experiment', label: '实验' },
  { value: 'report', label: '报告' },
  { value: 'device', label: '设备' },
  { value: 'dataset', label: '数据集' },
  { value: 'template', label: '模板' },
  { value: 'documentation', label: '文档' }
];

/**
 * 团队访问日志组件
 */
const TeamAccessLogs = ({ teamId }) => {
  const { getTeamAccessLogs, getTeamMembers } = useTeamService();

  // 状态定义
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // 过滤条件
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    actions: [],
    resourceTypes: [],
    users: []
  });

  // 加载团队成员
  const loadTeamMembers = async () => {
    if (!teamId) return;

    setLoadingMembers(true);

    try {
      const response = await getTeamMembers(teamId);
      setTeamMembers(response.data || []);
    } catch (err) {
      console.error('加载团队成员失败:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  // 加载日志数据
  const loadLogs = async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      // 构建查询参数
      const params = {
        page,
        limit: pageSize
      };

      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
      }

      if (filters.endDate) {
        params.endDate = filters.endDate.toISOString();
      }

      if (filters.actions && filters.actions.length > 0) {
        params.actions = filters.actions.join(',');
      }

      if (filters.resourceTypes && filters.resourceTypes.length > 0) {
        params.resourceTypes = filters.resourceTypes.join(',');
      }

      if (filters.users && filters.users.length > 0) {
        params.users = filters.users.join(',');
      }

      // 调用API获取日志
      const response = await getTeamAccessLogs(teamId, params);

      // 更新状态
      setLogs(response.data.logs);
      setTotalPages(response.data.pagination.totalPages);
      setTotalRecords(response.data.pagination.totalRecords);

    } catch (err) {
      console.error('加载团队访问日志失败:', err);
      setError('加载日志时出错，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 首次加载及团队ID变化时加载团队成员
  useEffect(() => {
    if (teamId) {
      loadTeamMembers();
    }
  }, [teamId]);

  // 首次加载及过滤条件或分页变化时重新加载数据
  useEffect(() => {
    if (teamId) {
      loadLogs();
    }
  }, [teamId, page, pageSize, filters]);

  // 处理分页变化
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // 处理每页数量变化
  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1); // 重置到第一页
  };

  // 应用过滤条件
  const applyFilters = () => {
    setPage(1); // 重置到第一页
    setFilterOpen(false);
    loadLogs();
  };

  // 重置过滤条件
  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      actions: [],
      resourceTypes: [],
      users: []
    });
    setPage(1);
  };

  // 查看日志详情
  const viewLogDetail = (log) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  // 获取操作类型的显示文本
  const getActionLabel = (action) => {
    const actionType = ACTION_TYPES.find(type => type.value === action);
    return actionType ? actionType.label : action;
  };

  // 获取资源类型的显示文本
  const getResourceTypeLabel = (type) => {
    const resourceType = RESOURCE_TYPES.find(rt => rt.value === type);
    return resourceType ? resourceType.label : type;
  };

  // 获取操作类型的颜色
  const getActionColor = (action) => {
    switch (action) {
      case 'view':
        return 'info';
      case 'edit':
        return 'warning';
      case 'download':
        return 'success';
      case 'share':
        return 'primary';
      case 'delete':
        return 'error';
      case 'view_access_logs':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // 渲染表格行
  const renderTableRows = () => {
    if (logs.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} align="center">
            <EmptyState message="暂无访问日志记录" />
          </TableCell>
        </TableRow>
      );
    }

    return logs.map((log) => (
      <TableRow key={log._id} hover onClick={() => viewLogDetail(log)}>
        <TableCell>
          <Chip
            label={getActionLabel(log.action)}
            color={getActionColor(log.action)}
            size="small"
          />
        </TableCell>
        <TableCell>{log.userName || '未知用户'}</TableCell>
        <TableCell>{log.resourceName || '未知资源'}</TableCell>
        <TableCell>
          <Chip
            label={getResourceTypeLabel(log.resourceType)}
            variant="outlined"
            size="small"
          />
        </TableCell>
        <TableCell>{formatDate(log.timestamp)}</TableCell>
        <TableCell>{log.ipAddress}</TableCell>
        <TableCell>
          <Tooltip title="查看详情">
            <IconButton size="small" onClick={(e) => {
              e.stopPropagation();
              viewLogDetail(log);
            }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    ));
  };

  // 渲染过滤器对话框
  const renderFilterDialog = () => (
    <Dialog
      open={filterOpen}
      onClose={() => setFilterOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>过滤团队访问日志</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="开始日期"
              value={filters.startDate}
              onChange={(date) => setFilters({...filters, startDate: date})}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="结束日期"
              value={filters.endDate}
              onChange={(date) => setFilters({...filters, endDate: date})}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="actions-label">操作类型</InputLabel>
              <Select
                labelId="actions-label"
                multiple
                value={filters.actions}
                onChange={(e) => setFilters({...filters, actions: e.target.value})}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={getActionLabel(value)}
                        color={getActionColor(value)}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {ACTION_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="resource-types-label">资源类型</InputLabel>
              <Select
                labelId="resource-types-label"
                multiple
                value={filters.resourceTypes}
                onChange={(e) => setFilters({...filters, resourceTypes: e.target.value})}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={getResourceTypeLabel(value)}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {RESOURCE_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              loading={loadingMembers}
              options={teamMembers}
              getOptionLabel={(option) => option.name || option.email || option.id}
              value={teamMembers.filter(member => filters.users.includes(member.id))}
              onChange={(event, newValue) => {
                setFilters({
                  ...filters,
                  users: newValue.map(v => v.id)
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="团队成员"
                  placeholder="选择团队成员"
                  fullWidth
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name || option.email || option.id}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={resetFilters}>重置</Button>
        <Button onClick={() => setFilterOpen(false)}>取消</Button>
        <Button onClick={applyFilters} variant="contained">应用</Button>
      </DialogActions>
    </Dialog>
  );

  // 渲染日志详情对话框
  const renderDetailDialog = () => {
    if (!selectedLog) return null;

    const details = [
      { label: '操作类型', value: getActionLabel(selectedLog.action) },
      { label: '操作用户', value: selectedLog.userName },
      { label: '用户ID', value: selectedLog.userId },
      { label: '资源名称', value: selectedLog.resourceName },
      { label: '资源类型', value: getResourceTypeLabel(selectedLog.resourceType) },
      { label: '资源ID', value: selectedLog.resourceId },
      { label: '操作时间', value: formatDate(selectedLog.timestamp) },
      { label: 'IP地址', value: selectedLog.ipAddress },
      { label: '浏览器信息', value: selectedLog.userAgent },
      { label: '操作详情', value: JSON.stringify(selectedLog.details, null, 2) }
    ];

    return (
      <DetailDialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        title="访问日志详情"
        details={details}
      />
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          团队访问日志
        </Typography>
        <Box>
          <Tooltip title="过滤">
            <IconButton onClick={() => setFilterOpen(true)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="刷新">
            <IconButton onClick={loadLogs}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading ? (
        <LoadingIndicator />
      ) : error ? (
        <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>操作类型</TableCell>
                  <TableCell>操作用户</TableCell>
                  <TableCell>资源名称</TableCell>
                  <TableCell>资源类型</TableCell>
                  <TableCell>操作时间</TableCell>
                  <TableCell>IP地址</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderTableRows()}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                每页显示:
              </Typography>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                size="small"
                sx={{ mr: 2 }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
              <Typography variant="body2">
                共 {totalRecords} 条记录
              </Typography>
            </Box>

            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="small"
            />
          </Box>
        </>
      )}

      {renderFilterDialog()}
      {renderDetailDialog()}
    </Box>
  );
};

export default TeamAccessLogs;
