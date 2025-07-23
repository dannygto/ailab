import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Science as ScienceIcon,
  Class as ClassIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  SupervisorAccount as ManagerIcon,
  Person as MemberIcon,
} from '@mui/icons-material';
import { Organization, OrganizationType } from '../../types/organization';
import { organizationService } from '../../services';
import { useSnackbar } from 'notistack';
import OrganizationTree from './OrganizationTree';

/**
 * 组织管理组件
 * 用于管理组织结构、创建新组织、管理组织成员等
 */
const OrganizationManager: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  // 创建组织对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState<OrganizationType>(OrganizationType.DEPARTMENT);
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [parentOrgId, setParentOrgId] = useState<string | ''>('');

  // 菜单状态
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuOrganization, setMenuOrganization] = useState<Organization | null>(null);

  // 删除确认对话框状态
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // 初始加载组织数据
  useEffect(() => {
    loadOrganizations();
  }, []);

  // 加载组织数据
  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const orgHierarchy = await organizationService.getOrganizationHierarchy();
      setOrganizations(orgHierarchy);
    } catch (error) {
      console.error('Failed to load organizations', error);
      enqueueSnackbar('加载组织数据失败', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 打开组织菜单
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, org: Organization) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuOrganization(org);
  };

  // 关闭组织菜单
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuOrganization(null);
  };

  // 打开创建组织对话框
  const handleOpenCreateDialog = (parentId?: string) => {
    setParentOrgId(parentId || '');
    setCreateDialogOpen(true);
    handleCloseMenu();
  };

  // 关闭创建组织对话框
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewOrgName('');
    setNewOrgType(OrganizationType.DEPARTMENT);
    setNewOrgDescription('');
    setParentOrgId('');
  };

  // 处理创建新组织
  const handleCreateOrganization = async () => {
    try {
      const newOrg = await organizationService.createOrganization({
        name: newOrgName,
        type: newOrgType,
        description: newOrgDescription,
        parent: parentOrgId || undefined,
        settings: {
          allowMemberJoin: true,
          visibilityLevel: 'public',
          resourceSharing: 'members'
        }
      });

      enqueueSnackbar('组织创建成功', { variant: 'success' });
      handleCloseCreateDialog();
      await loadOrganizations();
    } catch (error) {
      console.error('Failed to create organization', error);
      enqueueSnackbar('组织创建失败', { variant: 'error' });
    }
  };

  // 处理删除组织
  const handleDeleteOrganization = async () => {
    if (!menuOrganization) return;

    try {
      await organizationService.deleteOrganization(menuOrganization._id as string);
      enqueueSnackbar('组织删除成功', { variant: 'success' });
      await loadOrganizations();
    } catch (error) {
      console.error('Failed to delete organization', error);
      enqueueSnackbar('组织删除失败', { variant: 'error' });
    } finally {
      setDeleteConfirmOpen(false);
      handleCloseMenu();
    }
  };

  // 处理选择组织
  const handleSelectOrganization = async (org: Organization) => {
    try {
      const orgDetails = await organizationService.getOrganizationById(org._id as string);
      setSelectedOrganization(orgDetails);
    } catch (error) {
      console.error('Failed to load organization details', error);
      enqueueSnackbar('加载组织详情失败', { variant: 'error' });
    }
  };

  // 渲染组织类型图标
  const getOrganizationIcon = (type: OrganizationType) => {
    switch (type) {
      case OrganizationType.SCHOOL:
        return <SchoolIcon />;
      case OrganizationType.COLLEGE:
        return <BusinessIcon />;
      case OrganizationType.DEPARTMENT:
        return <BusinessIcon fontSize="small" />;
      case OrganizationType.LABORATORY:
        return <ScienceIcon />;
      case OrganizationType.RESEARCH_GROUP:
        return <GroupIcon />;
      case OrganizationType.CLASS:
        return <ClassIcon />;
      default:
        return <BusinessIcon />;
    }
  };

  // 渲染组织类型选择器选项
  const renderOrganizationTypeOptions = () => {
    return Object.values(OrganizationType).map((type) => (
      <MenuItem key={type} value={type}>
        {getOrganizationTypeName(type)}
      </MenuItem>
    ));
  };

  // 获取组织类型中文名称
  const getOrganizationTypeName = (type: OrganizationType): string => {
    const typeNames: Record<OrganizationType, string> = {
      [OrganizationType.SCHOOL]: '学校',
      [OrganizationType.COLLEGE]: '学院',
      [OrganizationType.DEPARTMENT]: '系/部门',
      [OrganizationType.LABORATORY]: '实验室',
      [OrganizationType.RESEARCH_GROUP]: '研究组',
      [OrganizationType.CLASS]: '班级',
      [OrganizationType.OTHER]: '其他'
    };
    return typeNames[type] || '未知类型';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h4" gutterBottom>
        组织管理
      </Typography>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* 左侧组织树 */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              minHeight: 400,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">组织结构</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => handleOpenCreateDialog()}
              >
                新建组织
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <OrganizationTree
                organizations={organizations}
                onSelect={handleSelectOrganization}
                onMenuOpen={handleOpenMenu}
              />
            )}
          </Paper>
        </Grid>

        {/* 右侧详情 */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              minHeight: 400,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {selectedOrganization ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2 }}>
                    {getOrganizationIcon(selectedOrganization.type)}
                  </Box>
                  <Typography variant="h6">{selectedOrganization.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    ({getOrganizationTypeName(selectedOrganization.type)})
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="body1" paragraph>
                  {selectedOrganization.description || '暂无描述'}
                </Typography>

                {/* 成员管理 */}
                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  组织管理员
                </Typography>
                <List dense>
                  {selectedOrganization.managers && selectedOrganization.managers.length > 0 ? (
                    selectedOrganization.managers.map(manager => (
                      <ListItem key={manager.id}>
                        <ListItemIcon>
                          <ManagerIcon />
                        </ListItemIcon>
                        <ListItemText primary={manager.name || manager.username} secondary={manager.email} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="暂无管理员" />
                    </ListItem>
                  )}
                </List>

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                  组织成员
                </Typography>
                <List dense>
                  {selectedOrganization.members && selectedOrganization.members.length > 0 ? (
                    selectedOrganization.members.map(member => (
                      <ListItem key={member.id}>
                        <ListItemIcon>
                          <MemberIcon />
                        </ListItemIcon>
                        <ListItemText primary={member.name || member.username} secondary={member.email} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="暂无成员" />
                    </ListItem>
                  )}
                </List>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{ mr: 1 }}
                  >
                    添加成员
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                  >
                    编辑组织
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  请从左侧选择一个组织查看详细信息
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 组织操作菜单 */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleOpenCreateDialog(menuOrganization?._id)}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="添加子组织" />
        </MenuItem>
        <MenuItem onClick={() => { handleCloseMenu(); menuOrganization && handleSelectOrganization(menuOrganization); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="编辑组织" />
        </MenuItem>
        <MenuItem onClick={() => { setDeleteConfirmOpen(true); }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="删除组织" />
        </MenuItem>
      </Menu>

      {/* 创建组织对话框 */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog}>
        <DialogTitle>
          {parentOrgId ? '创建子组织' : '创建新组织'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="组织名称"
            fullWidth
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>组织类型</InputLabel>
            <Select
              value={newOrgType}
              label="组织类型"
              onChange={(e: SelectChangeEvent) => setNewOrgType(e.target.value as OrganizationType)}
            >
              {renderOrganizationTypeOptions()}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            label="组织描述"
            fullWidth
            multiline
            rows={3}
            value={newOrgDescription}
            onChange={(e) => setNewOrgDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>取消</Button>
          <Button
            onClick={handleCreateOrganization}
            disabled={!newOrgName.trim()}
            variant="contained"
          >
            创建
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要删除组织"{menuOrganization?.name}"吗？此操作不可逆，删除后该组织下的所有子组织也将被删除。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button onClick={handleDeleteOrganization} color="error" variant="contained">
            确认删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationManager;
