// 演示用的通知脚本
// 该脚本用于测试实时通知功能

import { notificationService } from '../services/notificationService';

/**
 * 生成随机通知
 */
export const demoNotifications = () => {
  // 模拟系统通知
  setTimeout(() => {
    notificationService.sendSystemNotification(
      '系统通知',
      '系统已成功更新到最新版本。'
    );
  }, 5000);

  // 模拟实验通知
  setTimeout(() => {
    notificationService.sendNotification({
      id: `exp-${Date.now()}`,
      title: '实验完成',
      content: '你的实验"深度学习图像分类"已成功完成，请查看结果。',
      sender: {
        id: 'system',
        name: '实验系统',
        avatar: '/assets/avatars/lab.png'
      },
      type: 'experiment',
      priority: 'high',
      read: false,
      starred: false,
      createdAt: new Date().toISOString(),
      relatedExperiment: {
        id: 'exp-123',
        name: '深度学习图像分类'
      }
    });
  }, 10000);

  // 模拟个人消息
  setTimeout(() => {
    notificationService.sendNotification({
      id: `personal-${Date.now()}`,
      title: '新消息',
      content: '张教授: 请查看我给你发的实验反馈',
      sender: {
        id: 'user-456',
        name: '张教授',
        avatar: '/assets/avatars/professor.png'
      },
      type: 'personal',
      priority: 'medium',
      read: false,
      starred: false,
      createdAt: new Date().toISOString()
    });
  }, 15000);
};

export default demoNotifications;
