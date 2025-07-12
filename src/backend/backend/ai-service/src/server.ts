import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { DatabaseManager } from '@/config/database';
import { logger, logMiddleware } from '@/utils/logger';
import aiAssistantRoutes from '@/routes/ai-assistant.routes';
import resourceRoutes from '@/routes/resource.routes';

// 加载环境变量
dotenv.config();

class AIAssistantServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private port: number;

  constructor() {
    this.port = parseInt(process.env['PORT'] || '8001', 10);
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeWebSocket();
    this.initializeErrorHandling();
  }

  /**
   * 初始化中间件
   */
  private initializeMiddleware(): void {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS配置
    this.app.use(cors({
      origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-API-Key'],
    }));

    // 请求日志
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.http(message.trim()),
      },
    }));

    // 自定义日志中间件
    this.app.use(logMiddleware);

    // 解析JSON请求体
    this.app.use(express.json({ limit: '10mb' }));
    
    // 解析URL编码请求体
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 静态文件服务
    this.app.use('/static', express.static('public'));    // 健康检查端点
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'healthy',
        service: 'ai-assistant',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0',
      });
    });
    
    // 添加一个API健康检查端点，匹配前端的请求路径
    this.app.get('/api/health', (_req, res) => {
      res.status(200).json({
        status: 'healthy',
        service: 'ai-assistant',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0',
      });
    });
  }
  /**
   * 初始化路由
   */
  private initializeRoutes(): void {
    // API路由前缀
    const apiPrefix = '/api/ai';
    
    // AI助手路由
    this.app.use(apiPrefix, aiAssistantRoutes);
    
    // 资源管理路由
    this.app.use('/api', resourceRoutes);

    // 根路径重定向到健康检查
    this.app.get('/', (_req, res) => {
      res.redirect('/health');
    });

    // 404处理
    this.app.use('*', (_req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 404,
          message: '请求的资源不存在',
          type: 'NOT_FOUND',
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * 初始化WebSocket
   */
  private initializeWebSocket(): void {
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);

      // 身份验证
      socket.on('authenticate', (data) => {
        try {
          // 这里应该验证用户身份
          const { userId, token } = data;
          if (userId && token) {
            socket.data.userId = userId;
            socket.join(`user:${userId}`);
            logger.info(`WebSocket client authenticated: ${userId}`);
            socket.emit('authenticated', { success: true });
          } else {
            socket.emit('error', { message: '认证失败' });
          }
        } catch (error) {
          logger.error('WebSocket authentication error:', error);
          socket.emit('error', { message: '认证服务错误' });
        }
      });

      // 实时聊天
      socket.on('chat_message', async (data) => {
        try {
          const { message } = data;
          logger.info(`Real-time chat message from ${socket.data.userId}: ${message.substring(0, 50)}...`);

          // 这里可以处理实时聊天逻辑
          // 目前只是回显消息
          socket.emit('chat_response', {
            messageId: `msg_${Date.now()}`,
            response: `收到您的消息: ${message}`,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          logger.error('WebSocket chat error:', error);
          socket.emit('error', { message: '聊天服务错误' });
        }
      });

      // 断开连接
      socket.on('disconnect', (reason) => {
        logger.info(`WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
      });

      // 错误处理
      socket.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });
    });

    logger.info('WebSocket server initialized');
  }

  /**
   * 初始化错误处理
   */
  private initializeErrorHandling(): void {
    // 全局错误处理中间件
    this.app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      logger.error('Unhandled error:', error);

      // 根据错误类型返回不同的响应
      if (error.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '请求参数验证失败',
            type: 'VALIDATION_ERROR',
            details: error.details,
          },
          timestamp: new Date().toISOString(),
        });
      } else if (error.name === 'UnauthorizedError') {
        res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: '未授权访问',
            type: 'UNAUTHORIZED_ERROR',
          },
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: {
            code: 500,
            message: '服务器内部错误',
            type: 'INTERNAL_ERROR',
          },
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * 启动服务器
   */
  public async start(): Promise<void> {
    try {
      // 初始化数据库连接
      await DatabaseManager.getInstance().initialize();
      logger.info('Database connections initialized');

      // 启动HTTP服务器
      this.server.listen(this.port, () => {
        logger.info(`AI Assistant Server running on port ${this.port}`);
        logger.info(`Health check: http://localhost:${this.port}/health`);
        logger.info(`API documentation: http://localhost:${this.port}/api/ai/health`);
      });

      // 优雅关闭处理
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * 设置优雅关闭
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      // 关闭HTTP服务器
      this.server.close(() => {
        logger.info('HTTP server closed');
      });

      // 关闭WebSocket服务器
      this.io.close(() => {
        logger.info('WebSocket server closed');
      });

      // 关闭数据库连接
      try {
        await DatabaseManager.getInstance().close();
        logger.info('Database connections closed');
      } catch (error) {
        logger.error('Error closing database connections:', error);
      }

      logger.info('Graceful shutdown completed');
      process.exit(0);
    };

    // 监听进程信号
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }

  /**
   * 获取服务器实例
   */
  public getApp(): express.Application {
    return this.app;
  }

  /**
   * 获取WebSocket实例
   */
  public getIO(): SocketIOServer {
    return this.io;
  }
}

// 创建并启动服务器
const server = new AIAssistantServer();
server.start().catch((error) => {
  logger.error('Failed to start AI Assistant Server:', error);
  process.exit(1);
});

export default server; 