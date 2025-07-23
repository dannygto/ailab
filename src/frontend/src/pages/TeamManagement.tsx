// 团队管理页面
import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Card, Table, Tag, Space, Modal, Form,
  Input, Select, Avatar, Row, Col, Spin, message, Tooltip
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined,
  TeamOutlined, SettingOutlined, InfoCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { TeamMemberSelector } from '../components/User/UserSelector';
import { User } from '../types';
import teamService from '../services/team.service';
import { Team, TeamMember, TeamMemberRole } from '../types/teams';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

/**
 * 团队管理页面组件
 */
const TeamManagement: React.FC = () => {
  const { t } = useTranslation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamModalVisible, setIsTeamModalVisible] = useState<boolean>(false);
  const [isTeamMemberModalVisible, setIsTeamMemberModalVisible] = useState<boolean>(false);
  const [teamForm] = Form.useForm();
  const [memberForm] = Form.useForm();
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  // 新增状态，用于用户选择器
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});

  // 加载团队数据
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await teamService.getUserTeams();
      setTeams(data);
    } catch (error) {
      console.error('获取团队失败:', error);
      message.error('获取团队列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchTeams();
  }, []);

  // 处理创建团队
  const handleCreateTeam = () => {
    setModalMode('create');
    setSelectedTeam(null);
    teamForm.resetFields();
    setIsTeamModalVisible(true);
  };

  // 处理编辑团队
  const handleEditTeam = (team: Team) => {
    setModalMode('edit');
    setSelectedTeam(team);
    teamForm.setFieldsValue({
      name: team.name,
      description: team.description,
      allowMemberInvite: team.settings?.allowMemberInvite,
      visibilityLevel: team.settings?.visibilityLevel,
      defaultRole: team.settings?.defaultRole
    });
    setIsTeamModalVisible(true);
  };

  // 处理保存团队
  const handleSaveTeam = async () => {
    try {
      const values = await teamForm.validateFields();

      const teamData = {
        name: values.name,
        description: values.description,
        settings: {
          allowMemberInvite: values.allowMemberInvite,
          visibilityLevel: values.visibilityLevel,
          defaultRole: values.defaultRole
        }
      };

      if (modalMode === 'create') {
        await teamService.createTeam(teamData);
        message.success('团队创建成功');
      } else {
        if (selectedTeam?._id) {
          await teamService.updateTeam(selectedTeam._id, teamData);
          message.success('团队更新成功');
        }
      }

      setIsTeamModalVisible(false);
      fetchTeams();
    } catch (error) {
      console.error('保存团队失败:', error);
    }
  };

  // 处理归档团队
  const handleArchiveTeam = (team: Team) => {
    confirm({
      title: '确定要归档此团队吗?',
      icon: <ExclamationCircleOutlined />,
      content: '归档后，团队将不再可用，但数据将被保留。此操作不可逆。',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          if (team._id) {
            await teamService.archiveTeam(team._id);
            message.success('团队已归档');
            fetchTeams();
          }
        } catch (error) {
          console.error('归档团队失败:', error);
          message.error('归档团队失败，请重试');
        }
      },
    });
  };

  // 处理添加团队成员
  const handleAddMember = (team: Team) => {
    setSelectedTeam(team);
    setSelectedUsers([]);
    setMemberRoles({});
    setIsTeamMemberModalVisible(true);
  };

  // 处理保存团队成员
  const handleSaveMember = async () => {
    try {
      if (selectedTeam?._id && selectedUsers.length > 0) {
        // 批量添加成员
        const promises = selectedUsers.map(user =>
          teamService.addTeamMember(selectedTeam._id as string, {
            userId: user.id,
            role: memberRoles[user.id] || TeamMemberRole.MEMBER
          })
        );

        await Promise.all(promises);
        message.success('成员添加成功');
        setIsTeamMemberModalVisible(false);
        fetchTeams();
      }
    } catch (error) {
      console.error('添加成员失败:', error);
      message.error('添加成员失败，请重试');
    }
  };

  // 处理团队成员选择变更
  const handleTeamMemberChange = (users: User[], roles: Record<string, string>) => {
    setSelectedUsers(users);
    setMemberRoles(roles);
  };
          role: values.role
        });
        message.success('成员添加成功');
        setIsTeamMemberModalVisible(false);
        fetchTeams();
      }
    } catch (error) {
      console.error('添加成员失败:', error);
    }
  };

  // 处理更改成员角色
  const handleChangeRole = async (team: Team, member: TeamMember, newRole: TeamMemberRole) => {
    try {
      if (team._id && member.user._id) {
        await teamService.updateMemberRole(team._id, member.user._id, { role: newRole });
        message.success('成员角色已更新');
        fetchTeams();
      }
    } catch (error) {
      console.error('更新角色失败:', error);
      message.error('更新成员角色失败，请重试');
    }
  };

  // 处理移除成员
  const handleRemoveMember = (team: Team, member: TeamMember) => {
    confirm({
      title: '确定要移除此成员吗?',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将从团队中移除该成员，但不会删除用户帐户。',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          if (team._id && member.user._id) {
            await teamService.removeMember(team._id, member.user._id);
            message.success('成员已移除');
            fetchTeams();
          }
        } catch (error) {
          console.error('移除成员失败:', error);
          message.error('移除成员失败，请重试');
        }
      },
    });
  };

  // 团队表格列定义
  const teamColumns = [
    {
      title: '团队名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Team) => (
        <Space>
          <Avatar
            icon={<TeamOutlined />}
            src={record.avatar}
            style={{ backgroundColor: record.avatar ? 'transparent' : '#1890ff' }}
          />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '成员数',
      key: 'memberCount',
      render: (_, record: Team) => record.members.length,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Team) => (
        <Space size="middle">
          <Tooltip title="添加成员">
            <Button
              type="text"
              icon={<UserAddOutlined />}
              onClick={() => handleAddMember(record)}
            />
          </Tooltip>
          <Tooltip title="编辑团队">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTeam(record)}
            />
          </Tooltip>
          <Tooltip title="归档团队">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleArchiveTeam(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 成员表格列定义
  const memberColumns = [
    {
      title: '姓名',
      key: 'name',
      render: (_, record: TeamMember) => (
        <Space>
          <Avatar src={record.user.avatar} />
          <Text>{record.user.name}</Text>
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: ['user', 'email'],
      key: 'email',
    },
    {
      title: '角色',
      key: 'role',
      render: (_, record: TeamMember) => {
        const colors = {
          [TeamMemberRole.OWNER]: 'gold',
          [TeamMemberRole.ADMIN]: 'red',
          [TeamMemberRole.MEMBER]: 'blue',
          [TeamMemberRole.GUEST]: 'green',
        };
        return (
          <Tag color={colors[record.role]}>
            {record.role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: '加入时间',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      render: (date: Date) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: TeamMember, index: number, team: Team) => (
        <Space size="middle">
          <Select
            value={record.role}
            style={{ width: 120 }}
            onChange={(value) => handleChangeRole(selectedTeam as Team, record, value as TeamMemberRole)}
            disabled={record.role === TeamMemberRole.OWNER}
          >
            <Option value={TeamMemberRole.ADMIN}>管理员</Option>
            <Option value={TeamMemberRole.MEMBER}>成员</Option>
            <Option value={TeamMemberRole.GUEST}>访客</Option>
          </Select>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveMember(selectedTeam as Team, record)}
            disabled={record.role === TeamMemberRole.OWNER}
          />
        </Space>
      ),
    },
  ];

  // 渲染团队管理页面
  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Title level={2}>
            <TeamOutlined /> 团队管理
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateTeam}
          >
            创建团队
          </Button>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Card>
          <Table
            columns={teamColumns}
            dataSource={teams}
            rowKey="_id"
            expandable={{
              expandedRowRender: (record) => (
                <Card title="团队成员" extra={
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => handleAddMember(record)}
                  >
                    添加成员
                  </Button>
                }>
                  <Table
                    columns={memberColumns}
                    dataSource={record.members}
                    rowKey={(record) => record.user._id}
                    pagination={false}
                  />
                </Card>
              ),
            }}
          />
        </Card>
      </Spin>

      {/* 团队表单模态框 */}
      <Modal
        title={modalMode === 'create' ? '创建新团队' : '编辑团队'}
        visible={isTeamModalVisible}
        onOk={handleSaveTeam}
        onCancel={() => setIsTeamModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form
          form={teamForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="团队名称"
            rules={[{ required: true, message: '请输入团队名称' }]}
          >
            <Input placeholder="请输入团队名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="团队描述"
          >
            <Input.TextArea placeholder="请输入团队描述" rows={4} />
          </Form.Item>

          <Title level={5}>团队设置</Title>

          <Form.Item
            name="visibilityLevel"
            label="可见性"
            initialValue="private"
          >
            <Select>
              <Option value="private">私有 (仅团队成员可见)</Option>
              <Option value="organization">组织内 (仅本组织用户可见)</Option>
              <Option value="public">公开 (所有用户可见)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="allowMemberInvite"
            label="成员邀请权限"
            initialValue={true}
          >
            <Select>
              <Option value={true}>允许团队成员邀请新成员</Option>
              <Option value={false}>仅管理员可邀请新成员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="defaultRole"
            label="默认成员角色"
            initialValue={TeamMemberRole.MEMBER}
          >
            <Select>
              <Option value={TeamMemberRole.MEMBER}>成员</Option>
              <Option value={TeamMemberRole.GUEST}>访客</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加成员模态框 */}
      <Modal
        title="添加团队成员"
        visible={isTeamMemberModalVisible}
        onOk={handleSaveMember}
        onCancel={() => setIsTeamMemberModalVisible(false)}
        okText="添加"
        cancelText="取消"
      >
        <Form
          form={memberForm}
          layout="vertical"
        >
          <Form.Item
            name="userId"
            label="用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select placeholder="请选择用户">
              {/* 实际应用中，这里应该从API获取用户列表 */}
              <Option value="user1">用户1</Option>
              <Option value="user2">用户2</Option>
              <Option value="user3">用户3</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            initialValue={TeamMemberRole.MEMBER}
          >
            <Select>
              <Option value={TeamMemberRole.ADMIN}>管理员</Option>
              <Option value={TeamMemberRole.MEMBER}>成员</Option>
              <Option value={TeamMemberRole.GUEST}>访客</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeamManagement;
