import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Chip, Avatar, Button, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import VirtualDataTable, { Column } from '../common/VirtualDataTable';
import { useComponentPerformance } from '../../utils/performanceMonitoring';

// 示例数据接口
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
}

/**
 * 虚拟数据表格演示组件
 *
 * 展示虚拟数据表格的使用方法和性能优势
 */
const VirtualDataTableDemo: React.FC = () => {
  // 使用性能监控
  useComponentPerformance('VirtualDataTableDemo');

  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // 生成随机用户数据
  const generateMockUsers = (count: number, startIndex: number): User[] => {
    const roles = ['管理员', '教师', '学生', '实验员', '研究员'];
    const departments = ['计算机科学', '电子工程', '人工智能', '机械工程', '物理', '生物科学'];
    const statuses: Array<'active' | 'inactive' | 'pending'> = ['active', 'inactive', 'pending'];

    return Array.from({ length: count }, (_, i) => {
      const index = startIndex + i;
      const now = new Date();
      const randomDays = Math.floor(Math.random() * 30);
      const lastLogin = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
      const createdAt = new Date(now.getTime() - (randomDays + 30) * 24 * 60 * 60 * 1000);

      return {
        id: `user-${index}`,
        name: `用户 ${index}`,
        email: `user${index}@example.com`,
        role: roles[Math.floor(Math.random() * roles.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastLogin: lastLogin.toISOString(),
        createdAt: createdAt.toISOString()
      };
    });
  };

  // 加载用户数据
  const loadUsers = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      const pageSize = 100;
      const newUsers = generateMockUsers(pageSize, page * pageSize);

      setUsers(prev => [...prev, ...newUsers]);
      setHasMore(page < 9); // 限制最多1000条数据
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, page]);

  // 初始加载和分页
  useEffect(() => {
    loadUsers();
  }, [loadUsers, page]);

  // 加载更多
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    setUsers([]);
    setPage(0);
    setHasMore(true);
  };

  // 处理用户点击
  const handleUserClick = (user: User) => {
    console.log('用户点击:', user);
  };

  // 渲染状态标签
  const renderStatus = (status: 'active' | 'inactive' | 'pending') => {
    const statusConfig = {
      active: { label: '活跃', color: 'success' as const },
      inactive: { label: '不活跃', color: 'error' as const },
      pending: { label: '待激活', color: 'warning' as const }
    };

    const config = statusConfig[status];

    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  // 渲染操作按钮
  const renderActions = (user: User) => (
    <Box>
      <IconButton size="small" color="primary" onClick={(e) => {
        e.stopPropagation();
        console.log('查看用户:', user);
      }}>
        <VisibilityIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" color="primary" onClick={(e) => {
        e.stopPropagation();
        console.log('编辑用户:', user);
      }}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" color="error" onClick={(e) => {
        e.stopPropagation();
        console.log('删除用户:', user);
      }}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  // 列定义
  const columns: Column<User>[] = [
    {
      id: 'name',
      label: '用户名',
      accessor: (user) => (
        <Box display="flex" alignItems="center">
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {user.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" noWrap fontWeight="medium">
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        </Box>
      ),
      width: '25%',
      sortable: true,
      filterable: true
    },
    {
      id: 'role',
      label: '角色',
      accessor: (user) => user.role,
      width: '15%',
      sortable: true,
      filterable: true
    },
    {
      id: 'department',
      label: '部门',
      accessor: (user) => user.department,
      width: '15%',
      sortable: true,
      filterable: true
    },
    {
      id: 'status',
      label: '状态',
      accessor: (user) => renderStatus(user.status),
      width: '10%',
      sortable: true,
      filterable: true
    },
    {
      id: 'lastLogin',
      label: '最后登录',
      accessor: (user) => new Date(user.lastLogin).toLocaleString('zh-CN'),
      width: '15%',
      sortable: true,
      filterable: false
    },
    {
      id: 'actions',
      label: '操作',
      accessor: renderActions,
      width: '15%',
      sortable: false,
      filterable: false,
      align: 'center'
    }
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">虚拟数据表格演示</Typography>

        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            添加用户
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            刷新
          </Button>
        </Box>
      </Box>

      <Paper sx={{ flex: 1, overflow: 'hidden' }}>
        <VirtualDataTable
          data={users}
          columns={columns}
          height={600}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onRowClick={handleUserClick}
          title="用户列表"
          showToolbar={true}
          onRefresh={handleRefresh}
          onExport={() => console.log('导出数据')}
          getRowKey={(user) => user.id}
          initialSort={{ field: 'name', direction: 'asc' }}
        />
      </Paper>

      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          虚拟数据表格能够高效处理大量数据，通过只渲染可见区域的行来提高性能。这个示例表格可以轻松处理数千条记录而不影响用户体验。
        </Typography>
      </Box>
    </Box>
  );
};

export default VirtualDataTableDemo;
