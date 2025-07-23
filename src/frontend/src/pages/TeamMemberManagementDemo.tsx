import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { UserSelector, TeamMemberSelector } from '../components/User/UserSelector';
import { User } from '../types';

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: '1',
    username: 'teacher1',
    email: 'teacher1@example.com',
    name: '张老师',
    role: 'teacher',
    createdAt: new Date('2025-01-01'),
    isActive: true,
  },
  {
    id: '2',
    username: 'student1',
    email: 'student1@example.com',
    name: '李同学',
    role: 'student',
    createdAt: new Date('2025-01-02'),
    isActive: true,
  },
  {
    id: '3',
    username: 'admin1',
    email: 'admin1@example.com',
    name: '王管理员',
    role: 'admin',
    createdAt: new Date('2025-01-03'),
    isActive: true,
  }
];

// 角色显示名称映射
const roleDisplayMap: Record<string, string> = {
  'owner': '团队所有者',
  'admin': '管理员',
  'editor': '编辑者',
  'member': '成员',
  'guest': '访客'
};

const TeamMemberManagementDemo: React.FC = () => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});

  // 处理团队成员选择
  const handleTeamMemberChange = (users: User[], roles: Record<string, string>) => {
    setTeamMembers(users);
    setMemberRoles(roles);
  };

  // 处理普通用户选择
  const handleUserChange = (users: User[]) => {
    setSelectedUsers(users);
  };

  // 添加用户到团队
  const handleAddToTeam = () => {
    if (selectedUsers.length === 0) return;

    // 合并用户，避免重复
    const newTeamMembers = [...teamMembers];
    const newMemberRoles = {...memberRoles};

    selectedUsers.forEach(user => {
      if (!teamMembers.some(member => member.id === user.id)) {
        newTeamMembers.push(user);
        newMemberRoles[user.id] = 'member'; // 默认角色
      }
    });

    setTeamMembers(newTeamMembers);
    setMemberRoles(newMemberRoles);
    setSelectedUsers([]); // 清空选择
  };

  // 从团队中移除用户
  const handleRemoveFromTeam = (userId: string) => {
    setTeamMembers(teamMembers.filter(user => user.id !== userId));

    // 更新角色
    const updatedRoles = {...memberRoles};
    delete updatedRoles[userId];
    setMemberRoles(updatedRoles);
  };

  // 更改用户角色
  const handleChangeRole = (userId: string, newRole: string) => {
    setMemberRoles({
      ...memberRoles,
      [userId]: newRole
    });
  };

  // 保存团队
  const handleSaveTeam = () => {
    console.log('保存团队成员:', teamMembers);
    console.log('成员角色:', memberRoles);
    // 这里可以调用API保存团队成员和角色
    alert('团队保存成功！');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          团队成员管理示例
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          此页面展示了如何使用用户选择器组件进行团队成员管理。
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={4}>
          {/* 左侧：用户选择 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="选择用户"
                subheader="搜索并选择要添加到团队的用户"
              />
              <CardContent>
                <UserSelector
                  selectedUsers={selectedUsers}
                  onChange={handleUserChange}
                  label="选择用户"
                  placeholder="搜索用户名或邮箱..."
                  excludeUserIds={teamMembers.map(user => user.id)}
                  showSelectedList={true}
                />

                {/* 模拟API调用，直接显示模拟用户数据 */}
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    可选用户 (模拟数据)
                  </Typography>
                  <List>
                    {mockUsers
                      .filter(user =>
                        !teamMembers.some(member => member.id === user.id) &&
                        !selectedUsers.some(selected => selected.id === user.id)
                      )
                      .map(user => (
                        <ListItem
                          key={user.id}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => setSelectedUsers([...selectedUsers, user])}
                            >
                              <PersonAddIcon />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>{user.name?.[0] || user.username[0]}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.name || user.username}
                            secondary={`${user.email} (${user.role === 'teacher' ? '教师' :
                              user.role === 'student' ? '学生' : '管理员'})`}
                          />
                        </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PersonAddIcon />}
                  onClick={handleAddToTeam}
                  disabled={selectedUsers.length === 0}
                >
                  添加到团队 ({selectedUsers.length})
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* 右侧：团队成员管理 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="团队成员"
                subheader={`当前成员数: ${teamMembers.length}`}
                action={
                  <IconButton aria-label="团队信息">
                    <InfoIcon />
                  </IconButton>
                }
              />
              <CardContent>
                {teamMembers.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    团队中还没有成员，请从左侧选择用户添加
                  </Alert>
                ) : (
                  <List>
                    {teamMembers.map(member => (
                      <ListItem key={member.id}>
                        <ListItemAvatar>
                          <Avatar>{member.name?.[0] || member.username[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={member.name || member.username}
                          secondary={
                            <>
                              {member.email}
                              <Chip
                                size="small"
                                label={roleDisplayMap[memberRoles[member.id]] || '成员'}
                                color={memberRoles[member.id] === 'owner' ? 'primary' : 'default'}
                                sx={{ ml: 1 }}
                              />
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => {
                              // 循环切换角色
                              const roles = ['member', 'editor', 'admin', 'owner'];
                              const currentRoleIndex = roles.indexOf(memberRoles[member.id] || 'member');
                              const nextRoleIndex = (currentRoleIndex + 1) % roles.length;
                              handleChangeRole(member.id, roles[nextRoleIndex]);
                            }}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveFromTeam(member.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

                <Box mt={4}>
                  <Typography variant="h6" gutterBottom>
                    完整的团队成员选择器
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    下面是集成了角色选择的完整团队成员选择器组件：
                  </Typography>

                  <TeamMemberSelector
                    selectedUsers={teamMembers}
                    onChange={handleTeamMemberChange}
                    initialRoles={memberRoles}
                    label="选择团队成员"
                    placeholder="搜索用户添加到团队..."
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveTeam}
                  disabled={teamMembers.length === 0}
                >
                  保存团队成员设置
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TeamMemberManagementDemo;
