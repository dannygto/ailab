import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// 安全中间件
app.use(helmet());

// CORS配置 - 允许外部访问
app.use(cors({
  origin: true, // 允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求日志
app.use(morgan('combined'));

// 压缩中间件
app.use(compression());

// JSON解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 增加限制以便测试
  message: { error: '请求过于频繁，请稍后再试' }
});
app.use('/api/', limiter);

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: '人工智能辅助实验平台后端API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    server: 'ailab-backend'
  });
});

// 健康检查路由
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API健康检查路由
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ailab-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API路由示例
app.get('/api/experiments', (req, res) => {
  res.json({
    success: true,
    experiments: [
      { id: 1, title: '物理实验示例', type: 'physics' },
      { id: 2, title: '化学实验示例', type: 'chemistry' },
      { id: 3, title: '生物实验示例', type: 'biology' }
    ]
  });
});

// 学校管理API示例
app.get('/api/schools', (req, res) => {
  res.json({
    success: true,
    schools: [
      { id: 1, name: '示例学校1', address: '北京市' },
      { id: 2, name: '示例学校2', address: '上海市' }
    ]
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: err.message
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '未找到请求的资源',
    path: req.originalUrl
  });
});

// 启动服务器 - 监听所有接口(0.0.0.0)而不仅仅是localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AILAB后端服务器启动成功！`);
  console.log(`📍 地址: http://0.0.0.0:${PORT}`);
  console.log(`🌐 外部访问: http://[您的服务器IP]:${PORT}`);
  console.log(`🕐 时间: ${new Date().toLocaleString()}`);
  console.log(`📊 健康检查: http://0.0.0.0:${PORT}/api/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，开始优雅关闭...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，开始优雅关闭...');
  process.exit(0);
});

export { app };
