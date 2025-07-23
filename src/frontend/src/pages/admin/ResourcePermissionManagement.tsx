import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Settings as SettingsIcon,
  VpnKey as KeyIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Description as DescriptionIcon,
  Storage as StorageIcon,
  Business as BusinessIcon,
  Rule as RuleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ResourcePermissionControl from '../components/Permission/ResourcePermissionControl';
import { ResourceType } from '../types/permission';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * 选项卡面板组件
 */
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`permission-tabpanel-${index}`}
      aria-labelledby={`permission-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * 资源权限管理页面
 * 用于集中管理系统中各类资源的权限
 */
const ResourcePermissionManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | ''>('');
  const [resourceQuery, setResourceQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Array<{ id: string; name: string; type: ResourceType }>>([]);
  const [selectedResource, setSelectedResource] = useState<{ id: string; name: string; type: ResourceType } | null>(null);

  // 模拟资源搜索
  const handleResourceSearch = () => {
    if (!selectedResourceType) return;

    setLoading(true);

    // 模拟API调用
    setTimeout(() => {
      // 根据资源类型生成不同的模拟数据
      const mockResources = [
        { id: '1', name: '物理实验 - 力学基础', type: selectedResourceType },
        { id: '2', name: '数据分析实践', type: selectedResourceType },
        { id: '3', name: '人工智能入门', type: selectedResourceType },
      ];

      setResources(mockResources);
      setLoading(false);
    }, 1000);
  };

  // 处理选项卡变化
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 处理资源类型变化
  const handleResourceTypeChange = (event: SelectChangeEvent) => {
    setSelectedResourceType(event.target.value as ResourceType);
    setResources([]);
    setSelectedResource(null);
  };

  // 处理资源查询变化
  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResourceQuery(event.target.value);
  };

  // 处理资源选择
  const handleResourceSelect = (resource: { id: string; name: string; type: ResourceType }) => {
    setSelectedResource(resource);
  };

  // 获取资源类型名称
  const getResourceTypeName = (type: ResourceType): string => {
    const typeMap: Record<ResourceType, string> = {
      [ResourceType.EXPERIMENT]: '实验',
      [ResourceType.TEMPLATE]: '模板',
      [ResourceType.DEVICE]: '设备',
      [ResourceType.RESOURCE]: '资源',
      [ResourceType.TEAM]: '团队',
      [ResourceType.REPORT]: '报告',
      [ResourceType.SETTING]: '设置',
      [ResourceType.USER]: '用户',
      [ResourceType.ORGANIZATION]: '组织',
    };

    return typeMap[type] || type;
  };

  // 获取资源类型图标
  const getResourceTypeIcon = (type: ResourceType) => {
    const iconMap: Record<ResourceType, React.ReactNode> = {
      [ResourceType.EXPERIMENT]: <DescriptionIcon />,
      [ResourceType.TEMPLATE]: <DescriptionIcon />,
      [ResourceType.DEVICE]: <StorageIcon />,
      [ResourceType.RESOURCE]: <DescriptionIcon />,
      [ResourceType.TEAM]: <GroupIcon />,
      [ResourceType.REPORT]: <DescriptionIcon />,
      [ResourceType.SETTING]: <SettingsIcon />,
      [ResourceType.USER]: <PersonAddIcon />,
      [ResourceType.ORGANIZATION]: <BusinessIcon />,
    };

    return iconMap[type] || <DescriptionIcon />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SecurityIcon sx={{ fontSize: 28, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4">资源权限管理</Typography>
        </Box>

        <Typography variant="body1" paragraph>
          在此页面，您可以管理系统中各类资源的访问权限，包括实验、模板、设备、团队等。
          您可以为每个资源设置细粒度的访问控制，指定哪些用户、团队或组织可以查看、编辑或删除特定资源。
        </Typography>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="permission management tabs">
          <Tab icon={<DescriptionIcon />} label="资源权限" id="permission-tab-0" />
          <Tab icon={<RuleIcon />} label="权限规则" id="permission-tab-1" />
          <Tab icon={<KeyIcon />} label="权限策略" id="permission-tab-2" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                资源搜索
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>资源类型</InputLabel>
                <Select
                  value={selectedResourceType}
                  label="资源类型"
                  onChange={handleResourceTypeChange}
                >
                  <MenuItem value="">
                    <em>请选择资源类型</em>
                  </MenuItem>
                  {Object.values(ResourceType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {getResourceTypeName(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                  fullWidth
                  label="搜索资源"
                  variant="outlined"
                  size="small"
                  value={resourceQuery}
                  onChange={handleQueryChange}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={handleResourceSearch}
                  disabled={!selectedResourceType}
                >
                  搜索
                </Button>
              </Box>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                搜索结果
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List dense>
                  {resources.length > 0 ? (
                    resources.map((resource) => (
                      <ListItem
                        key={resource.id}
                        button
                        selected={selectedResource?.id === resource.id}
                        onClick={() => handleResourceSelect(resource)}
                      >
                        <ListItemIcon>
                          {getResourceTypeIcon(resource.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={resource.name}
                          secondary={getResourceTypeName(resource.type)}
                        />
                      </ListItem>
                    ))
                  ) : (
                    selectedResourceType ? (
                      <ListItem>
                        <ListItemText primary="没有找到匹配的资源" />
                      </ListItem>
                    ) : (
                      <ListItem>
                        <ListItemText primary="请选择资源类型并搜索" />
                      </ListItem>
                    )
                  )}
                </List>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            {selectedResource ? (
              <ResourcePermissionControl
                resourceType={selectedResource.type}
                resourceId={selectedResource.id}
                resourceName={selectedResource.name}
              />
            ) : (
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <SecurityIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  选择资源查看权限设置
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  从左侧选择一个资源来查看和管理其权限设置。
                  <br />
                  您可以控制谁可以查看、编辑或删除该资源。
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>权限规则</AlertTitle>
          在此页面您可以创建和管理权限规则模板，这些模板可以应用于多个资源，方便批量设置权限。
        </Alert>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            创建权限规则
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          权限规则功能正在开发中，将在下一版本中提供。
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>权限策略</AlertTitle>
          权限策略允许您设置全局权限控制规则，定义默认的访问控制行为。
        </Alert>

        <Typography variant="body1" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          权限策略功能正在开发中，将在下一版本中提供。
        </Typography>
      </TabPanel>
    </Container>
  );
};

export default ResourcePermissionManagement;
