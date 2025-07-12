// 重新导向到 server.ts
// 为了保持 package.json 中 main 字段的一致性，这个文件简单地重新导出 server.ts

export * from './server';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true
}));

// 请求日志
app.use(morgan('combined'));

// JSON解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础路由
app.get('/', (req, res) => {
  res.json({ 
    message: '人工智能辅助实验平台后端API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API路由示例
app.get('/api/experiments', (req, res) => {
  res.json({ 
    experiments: [
      { id: 1, title: '物理实验示例', type: 'physics' },
      { id: 2, title: '化学实验示例', type: 'chemistry' }
    ]
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '未找到请求的资源' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 后端服务器启动成功！`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🕐 时间: ${new Date().toLocaleString()}`);
});

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);

// 日志中间件
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// 压缩中间件
app.use(compression());

// 解析JSON和URL编码
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/devices', authMiddleware, deviceRoutes);
app.use('/api/cameras', authMiddleware, cameraRoutes);
app.use('/api/data', authMiddleware, dataRoutes);
app.use('/api/analysis', authMiddleware, analysisRoutes);
app.use('/api/config', authMiddleware, configRoutes);

// Socket.IO连接处理
io.on('connection', (socket) => {
  logger.info(`用户连接: ${socket.id}`);

  // 加入设备房间
  socket.on('join-device', (deviceId: string) => {
    socket.join(`device-${deviceId}`);
    logger.info(`用户 ${socket.id} 加入设备房间: ${deviceId}`);
  });

  // 离开设备房间
  socket.on('leave-device', (deviceId: string) => {
    socket.leave(`device-${deviceId}`);
    logger.info(`用户 ${socket.id} 离开设备房间: ${deviceId}`);
  });

  // 摄像头控制
  socket.on('camera-control', (data) => {
    // 广播摄像头控制命令
    socket.broadcast.to(`device-${data.deviceId}`).emit('camera-control', data);
  });

  // 断开连接
  socket.on('disconnect', () => {
    logger.info(`用户断开连接: ${socket.id}`);
  });
});

// 错误处理中间件
app.use(errorHandler);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl
  });
});

// 启动服务器
async function startServer() {
  try {
    // 连接数据库
    await connectDatabase();
    logger.info('数据库连接成功');

    // 连接Redis
    await connectRedis();
    logger.info('Redis连接成功');

    // 启动HTTP服务器
    server.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
      logger.info(`环境: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，开始优雅关闭...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，开始优雅关闭...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
});

// 启动服务器
startServer();

export { app, io }; 