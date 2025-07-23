import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface WSMessage {
  type: string;
  payload: any;
}

/**
 * WebSocket服务类
 * 负责管理WebSocket连接、消息发送和接收
 */
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<WSMessage>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: any = null;
  private baseReconnectDelay = 1000; // 基础重连延迟，单位毫秒
  private keepAliveInterval: any = null;
  private socketUrl: string;
  private initialized = false;
  private connectionId: string | null = null;

  /**
   * 构造函数
   * @param url WebSocket服务器URL
   */
  constructor(url: string) {
    this.socketUrl = url;
  }

  /**
   * 初始化WebSocket连接
   * @param authToken 可选的认证令牌
   */
  public init(authToken?: string): void {
    if (this.initialized) return;

    // 构建URL，可能带上认证令牌
    let url = this.socketUrl;
    if (authToken) {
      url += `?token=${authToken}`;
    }

    this.connect(url);
    this.initialized = true;

    // 添加页面卸载事件监听器，确保在用户离开页面时关闭连接
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  /**
   * 建立WebSocket连接
   * @param url WebSocket服务器URL
   */
  private connect(url: string): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      console.log('正在连接WebSocket服务器...');
      this.socket = new WebSocket(url);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('WebSocket连接错误:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * 处理WebSocket连接成功事件
   */
  private handleOpen(event: Event): void {
    console.log('WebSocket连接已建立');
    this.reconnectAttempts = 0;

    // 发送握手消息，获取连接ID
    this.sendMessage({
      type: 'HANDSHAKE',
      payload: {
        clientInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      }
    });

    // 设置保活机制，每30秒发送一次心跳
    this.keepAliveInterval = setInterval(() => {
      this.sendMessage({
        type: 'PING',
        payload: {
          timestamp: new Date().toISOString()
        }
      });
    }, 30000);

    // 通知订阅者连接已建立
    this.messagesSubject.next({
      type: 'CONNECTION_ESTABLISHED',
      payload: {
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * 处理接收到的WebSocket消息
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      // 处理握手响应，保存连接ID
      if (data.type === 'HANDSHAKE_RESPONSE' && data.payload?.connectionId) {
        this.connectionId = data.payload.connectionId;
        console.log(`获取到WebSocket连接ID: ${this.connectionId}`);
      }

      // 处理心跳响应
      if (data.type === 'PONG') {
        console.debug('收到心跳响应');
        return;
      }

      // 广播消息给所有订阅者
      this.messagesSubject.next(data);
    } catch (error) {
      console.error('处理WebSocket消息时出错:', error);
    }
  }

  /**
   * 处理WebSocket连接关闭事件
   */
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket连接已关闭: 代码=${event.code}, 原因=${event.reason}`);

    // 清除保活定时器
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    // 通知订阅者连接已关闭
    this.messagesSubject.next({
      type: 'CONNECTION_CLOSED',
      payload: {
        code: event.code,
        reason: event.reason,
        timestamp: new Date().toISOString()
      }
    });

    this.connectionId = null;

    // 如果不是正常关闭，尝试重连
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  /**
   * 处理WebSocket错误事件
   */
  private handleError(event: Event): void {
    console.error('WebSocket错误:', event);

    // 通知订阅者发生错误
    this.messagesSubject.next({
      type: 'CONNECTION_ERROR',
      payload: {
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`已达到最大重连尝试次数(${this.maxReconnectAttempts})，停止重连`);

      // 通知订阅者重连失败
      this.messagesSubject.next({
        type: 'RECONNECT_FAILED',
        payload: {
          attempts: this.reconnectAttempts,
          timestamp: new Date().toISOString()
        }
      });

      return;
    }

    // 计算指数退避重连延迟
    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);

    console.log(`计划在${delay}毫秒后进行第${this.reconnectAttempts + 1}次重连尝试`);

    // 清除之前的重连计时器
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // 设置新的重连计时器
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;

      // 通知订阅者正在尝试重连
      this.messagesSubject.next({
        type: 'RECONNECTING',
        payload: {
          attempt: this.reconnectAttempts,
          timestamp: new Date().toISOString()
        }
      });

      this.connect(this.socketUrl);
    }, delay);
  }

  /**
   * 发送消息到WebSocket服务器
   * @param message 要发送的消息对象
   * @returns 发送是否成功
   */
  public sendMessage(message: WSMessage): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket未连接，无法发送消息');
      return false;
    }

    try {
      const messageWithConnectionId = {
        ...message,
        connectionId: this.connectionId
      };

      this.socket.send(JSON.stringify(messageWithConnectionId));
      return true;
    } catch (error) {
      console.error('发送WebSocket消息时出错:', error);
      return false;
    }
  }

  /**
   * 订阅特定类型的消息
   * @param messageType 消息类型
   * @returns 特定类型消息的Observable
   */
  public onMessage<T = any>(messageType: string): Observable<T> {
    return this.messagesSubject.asObservable().pipe(
      filter(message => message.type === messageType),
      map(message => message.payload as T)
    );
  }

  /**
   * 订阅所有消息
   * @returns 所有消息的Observable
   */
  public onAnyMessage(): Observable<WSMessage> {
    return this.messagesSubject.asObservable();
  }

  /**
   * 主动断开WebSocket连接
   */
  public disconnect(): void {
    if (this.socket) {
      // 发送关闭消息
      this.sendMessage({
        type: 'CLIENT_DISCONNECT',
        payload: {
          timestamp: new Date().toISOString()
        }
      });

      // 关闭连接
      this.socket.close(1000, '客户端主动断开连接');
      this.socket = null;
    }

    // 清除重连计时器
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // 清除保活定时器
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }

    this.initialized = false;
    this.connectionId = null;
  }

  /**
   * 检查WebSocket连接是否已建立
   * @returns 连接是否已建立
   */
  public isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * 获取当前连接状态
   * @returns 连接状态描述
   */
  public getConnectionState(): string {
    if (!this.socket) return 'CLOSED';

    const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    return states[this.socket.readyState];
  }
}

// 创建WebSocket服务单例
export const webSocketService = new WebSocketService(
  process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws'
);

export default webSocketService;
