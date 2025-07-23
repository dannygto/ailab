// 实时通知服务
import { Message } from '../types';
import { Subject } from 'rxjs';

/**
 * 实时通知服务
 * 使用RxJS实现实时通知的发布/订阅机制
 */
class NotificationService {
  private notificationSubject = new Subject<Message>();

  /**
   * 获取通知流
   * @returns 通知Observable
   */
  getNotifications() {
    return this.notificationSubject.asObservable();
  }

  /**
   * 发送新通知
   * @param message 消息对象
   */
  sendNotification(message: Message) {
    this.notificationSubject.next(message);
  }

  /**
   * 模拟发送系统通知
   * @param title 标题
   * @param content 内容
   */
  sendSystemNotification(title: string, content: string) {
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      title,
      content,
      sender: {
        id: 'system',
        name: '系统',
        avatar: '/assets/avatars/system.png'
      },
      type: 'system',
      priority: 'medium',
      read: false,
      starred: false,
      createdAt: new Date().toISOString()
    };

    this.sendNotification(systemMessage);

    // 如果浏览器支持，同时显示一个本地通知
    this.showBrowserNotification(title, content);
  }

  /**
   * 显示浏览器通知
   * @param title 标题
   * @param body 内容
   */
  private showBrowserNotification(title: string, body: string) {
    if (!('Notification' in window)) {
      console.log('此浏览器不支持桌面通知');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }

  /**
   * 请求通知权限
   * @returns 是否已授权
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('此浏览器不支持桌面通知');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
}

export const notificationService = new NotificationService();
export default notificationService;
