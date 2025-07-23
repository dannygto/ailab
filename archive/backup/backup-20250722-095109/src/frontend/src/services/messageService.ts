import { Message, MessageFilter } from '../types';

/**
 * 消息服务
 * 提供与消息相关的API调用
 */
class MessageService {
  /**
   * 获取用户消息列表
   * @param filters 消息过滤条件
   * @returns 消息列表
   */
  async getMessages(filters?: MessageFilter): Promise<Message[]> {
    try {
      // 实际实现中应该调用API
      // const response = await api.get('/api/messages', { params: filters });
      // return response.data;

      // 现在使用模拟数据
      return this.getMockMessages();
    } catch (error) {
      console.error('获取消息失败', error);
      throw error;
    }
  }

  /**
   * 获取消息详情
   * @param messageId 消息ID
   * @returns 消息详情
   */
  async getMessage(messageId: string): Promise<Message> {
    try {
      // 实际实现中应该调用API
      // const response = await api.get(`/api/messages/${messageId}`);
      // return response.data;

      // 现在使用模拟数据
      const messages = this.getMockMessages();
      const message = messages.find(msg => msg.id === messageId);
      if (!message) {
        throw new Error('消息不存在');
      }
      return message;
    } catch (error) {
      console.error('获取消息详情失败', error);
      throw error;
    }
  }

  /**
   * 标记消息为已读
   * @param messageIds 消息ID列表
   * @returns 操作结果
   */
  async markAsRead(messageIds: string[]): Promise<{ success: boolean; messageIds: string[] }> {
    try {
      // 实际实现中应该调用API
      // const response = await api.put('/api/messages/mark-read', { messageIds });
      // return response.data;

      // 现在使用模拟响应
      return {
        success: true,
        messageIds
      };
    } catch (error) {
      console.error('标记消息已读失败', error);
      throw error;
    }
  }

  /**
   * 标记消息为星标/取消星标
   * @param messageId 消息ID
   * @param starred 是否星标
   * @returns 操作结果
   */
  async toggleStar(messageId: string, starred: boolean): Promise<{ success: boolean; messageId: string; starred: boolean }> {
    try {
      // 实际实现中应该调用API
      // const response = await api.put(`/api/messages/${messageId}/star`, { starred });
      // return response.data;

      // 现在使用模拟响应
      return {
        success: true,
        messageId,
        starred
      };
    } catch (error) {
      console.error('标记星标失败', error);
      throw error;
    }
  }

  /**
   * 删除消息
   * @param messageIds 消息ID列表
   * @returns 操作结果
   */
  async deleteMessages(messageIds: string[]): Promise<{ success: boolean; messageIds: string[] }> {
    try {
      // 实际实现中应该调用API
      // const response = await api.delete('/api/messages', { data: { messageIds } });
      // return response.data;

      // 现在使用模拟响应
      return {
        success: true,
        messageIds
      };
    } catch (error) {
      console.error('删除消息失败', error);
      throw error;
    }
  }

  /**
   * 获取未读消息数量
   * @returns 未读消息数量
   */
  async getUnreadCount(): Promise<number> {
    try {
      // 实际实现中应该调用API
      // const response = await api.get('/api/messages/unread-count');
      // return response.data.count;

      // 现在使用模拟数据
      const messages = this.getMockMessages();
      return messages.filter(msg => !msg.read).length;
    } catch (error) {
      console.error('获取未读消息数量失败', error);
      throw error;
    }
  }

  /**
   * 模拟消息数据
   * @returns 模拟消息列表
   */
  private getMockMessages(): Message[] {
    return [
      {
        id: '1',
        title: '系统维护通知',
        content: '亲爱的用户，我们将于2025年7月22日凌晨2点至5点进行系统维护，期间部分功能可能暂时不可用，请提前做好准备。给您带来的不便，敬请谅解。',
        sender: {
          id: 'system',
          name: '系统管理员',
          avatar: '/assets/avatars/system.png'
        },
        type: 'system',
        priority: 'high',
        read: false,
        starred: false,
        createdAt: new Date(2025, 6, 20, 10, 0, 0).toISOString()
      },
      {
        id: '2',
        title: '实验结果已生成',
        content: '您的实验"深度学习在图像识别中的应用"已完成，结果分析已生成，请及时查看。',
        sender: {
          id: 'exp-system',
          name: '实验系统',
          avatar: '/assets/avatars/lab.png'
        },
        type: 'experiment',
        priority: 'medium',
        read: true,
        starred: true,
        createdAt: new Date(2025, 6, 19, 14, 30, 0).toISOString(),
        relatedExperiment: {
          id: 'exp-123',
          name: '深度学习在图像识别中的应用'
        }
      },
      {
        id: '3',
        title: '欢迎使用AI实验室平台',
        content: '感谢您选择我们的AI实验室平台，这里有一些快速入门的指南和技巧，帮助您更快地熟悉平台功能。',
        sender: {
          id: 'welcome',
          name: '平台团队',
          avatar: '/assets/avatars/team.png'
        },
        type: 'announcement',
        priority: 'low',
        read: true,
        starred: false,
        createdAt: new Date(2025, 6, 15, 9, 15, 0).toISOString()
      },
      {
        id: '4',
        title: '关于您的实验资源申请',
        content: '您申请的额外GPU资源已审批通过，现在可以在实验中使用高性能计算资源了。',
        sender: {
          id: 'admin1',
          name: '资源管理员',
          avatar: '/assets/avatars/admin.png'
        },
        type: 'personal',
        priority: 'medium',
        read: false,
        starred: true,
        createdAt: new Date(2025, 6, 18, 16, 45, 0).toISOString()
      },
      {
        id: '5',
        title: '新功能发布：数据可视化工具',
        content: '我们新发布的数据可视化工具现已上线，支持更多图表类型和更灵活的数据展示方式，欢迎体验和反馈。',
        sender: {
          id: 'feature-team',
          name: '产品团队',
          avatar: '/assets/avatars/product.png'
        },
        type: 'announcement',
        priority: 'medium',
        read: false,
        starred: false,
        createdAt: new Date(2025, 6, 17, 11, 20, 0).toISOString()
      },
      {
        id: '6',
        title: '实验数据异常提醒',
        content: '您的实验"神经网络参数优化"中存在潜在的数据异常，可能会影响最终结果，建议您检查并处理。',
        sender: {
          id: 'monitor',
          name: '监控系统',
          avatar: '/assets/avatars/monitor.png'
        },
        type: 'experiment',
        priority: 'high',
        read: false,
        starred: false,
        createdAt: new Date(2025, 6, 16, 13, 10, 0).toISOString(),
        relatedExperiment: {
          id: 'exp-456',
          name: '神经网络参数优化'
        }
      },
      {
        id: '7',
        title: '您的账户安全提醒',
        content: '我们检测到您的账户有不寻常的登录活动，请确认是否为您本人操作，如有疑问，请及时修改密码并联系管理员。',
        sender: {
          id: 'security',
          name: '安全团队',
          avatar: '/assets/avatars/security.png'
        },
        type: 'system',
        priority: 'high',
        read: true,
        starred: true,
        createdAt: new Date(2025, 6, 14, 8, 5, 0).toISOString()
      },
      {
        id: '8',
        title: '实验协作邀请',
        content: '张教授邀请您参与实验项目"人工智能在医疗诊断中的应用"，请查看详情并确认是否接受邀请。',
        sender: {
          id: 'user-1001',
          name: '张教授',
          avatar: '/assets/avatars/professor.png'
        },
        type: 'personal',
        priority: 'medium',
        read: true,
        starred: false,
        createdAt: new Date(2025, 6, 13, 15, 35, 0).toISOString()
      },
      {
        id: '9',
        title: '平台使用反馈调查',
        content: '为了不断改进我们的平台，希望您能抽出几分钟时间完成一份简短的使用体验调查问卷。',
        sender: {
          id: 'feedback',
          name: '用户体验团队',
          avatar: '/assets/avatars/feedback.png'
        },
        type: 'announcement',
        priority: 'low',
        read: false,
        starred: false,
        createdAt: new Date(2025, 6, 12, 10, 45, 0).toISOString()
      },
      {
        id: '10',
        title: '实验模板推荐',
        content: '基于您近期的研究方向，我们推荐您尝试"深度强化学习"实验模板，它可能对您的研究有所帮助。',
        sender: {
          id: 'recommend',
          name: '智能推荐',
          avatar: '/assets/avatars/ai.png'
        },
        type: 'system',
        priority: 'low',
        read: true,
        starred: false,
        createdAt: new Date(2025, 6, 11, 12, 30, 0).toISOString()
      }
    ];
  }
}

export const messageService = new MessageService();
export default messageService;
