import * as net from 'net';

// 简化的TCP客户端适配器接口
export class SimpleTCPAdapter {
  private socket: net.Socket | null = null;
  private buffer: string = '';
  private delimiter: string = '\r\n';
  private connected: boolean = false;

  constructor(private config: {
    host: string;
    port: number;
    delimiter?: string;
    connectionTimeout?: number;
  }) {
    if (config.delimiter) {
      this.delimiter = config.delimiter;
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 清除之前的连接
      if (this.socket) {
        this.socket.destroy();
        this.socket = null;
      }

      this.socket = new net.Socket();
      const timeout = this.config.connectionTimeout || 5000;

      // 设置连接超时
      const connectTimeout = setTimeout(() => {
        if (this.socket) {
          this.socket.destroy();
          reject(new Error(`连接超时 (${timeout}ms)`));
        }
      }, timeout);

      // 连接事件处理
      this.socket.on('connect', () => {
        clearTimeout(connectTimeout);
        this.connected = true;
        resolve();
      });

      this.socket.on('error', (err) => {
        clearTimeout(connectTimeout);
        this.connected = false;
        reject(err);
      });

      this.socket.on('close', () => {
        this.connected = false;
      });

      // 数据接收处理
      this.socket.on('data', (data) => {
        this.buffer += data.toString();
      });

      // 连接到服务器
      this.socket.connect({
        host: this.config.host,
        port: this.config.port
      });
    });
  }

  async sendCommand(command: string, timeout: number = 5000): Promise<string> {
    if (!this.socket || !this.connected) {
      throw new Error('未连接到设备');
    }

    return new Promise((resolve, reject) => {
      // 清除之前的缓冲区
      this.buffer = '';

      // 设置命令超时
      const commandTimeout = setTimeout(() => {
        reject(new Error(`命令超时 (${timeout}ms)`));
      }, timeout);

      // 设置响应处理器
      const responseHandler = () => {
        // 检查是否包含命令分隔符
        if (this.buffer.includes(this.delimiter)) {
          clearTimeout(commandTimeout);
          const response = this.buffer.split(this.delimiter)[0].trim();
          this.buffer = this.buffer.substring(response.length + this.delimiter.length);
          resolve(response);
        } else {
          setTimeout(responseHandler, 10);
        }
      };

      // 开始监听响应
      responseHandler();

      // 发送命令
      if (this.socket) {
        this.socket.write(command + this.delimiter, (err) => {
          if (err) {
            clearTimeout(commandTimeout);
            reject(err);
            return;
          }

          // 开始处理响应
          responseHandler();
        });
      } else {
        clearTimeout(commandTimeout);
        reject(new Error('Socket不可用'));
      }
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.end(() => {
          this.socket = null;
          this.connected = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
