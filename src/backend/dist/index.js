import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: '请求过于频繁，请稍后再试' }
});
app.use('/api/', limiter);
app.get('/', (req, res) => {
    res.json({
        message: '人工智能辅助实验平台后端API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/experiments', (req, res) => {
    res.json({
        experiments: [
            { id: 1, title: '物理实验示例', type: 'physics' },
            { id: 2, title: '化学实验示例', type: 'chemistry' }
        ]
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
});
app.use('*', (req, res) => {
    res.status(404).json({ error: '未找到请求的资源' });
});
app.listen(PORT, () => {
    console.log(`🚀 后端服务器启动成功！`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`🕐 时间: ${new Date().toLocaleString()}`);
});
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: '请求过于频繁，请稍后再试'
});
app.use('/api/', limiter);
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});
app.use('/api/auth', authRoutes);
app.use('/api/devices', authMiddleware, deviceRoutes);
app.use('/api/cameras', authMiddleware, cameraRoutes);
app.use('/api/data', authMiddleware, dataRoutes);
app.use('/api/analysis', authMiddleware, analysisRoutes);
app.use('/api/config', authMiddleware, configRoutes);
io.on('connection', (socket) => {
    logger.info(`用户连接: ${socket.id}`);
    socket.on('join-device', (deviceId) => {
        socket.join(`device-${deviceId}`);
        logger.info(`用户 ${socket.id} 加入设备房间: ${deviceId}`);
    });
    socket.on('leave-device', (deviceId) => {
        socket.leave(`device-${deviceId}`);
        logger.info(`用户 ${socket.id} 离开设备房间: ${deviceId}`);
    });
    socket.on('camera-control', (data) => {
        socket.broadcast.to(`device-${data.deviceId}`).emit('camera-control', data);
    });
    socket.on('disconnect', () => {
        logger.info(`用户断开连接: ${socket.id}`);
    });
});
app.use(errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在',
        path: req.originalUrl
    });
});
async function startServer() {
    try {
        await connectDatabase();
        logger.info('数据库连接成功');
        await connectRedis();
        logger.info('Redis连接成功');
        server.listen(PORT, () => {
            logger.info(`服务器运行在端口 ${PORT}`);
            logger.info(`环境: ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
        logger.error('服务器启动失败:', error);
        process.exit(1);
    }
}
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
startServer();
export { app, io };
//# sourceMappingURL=index.js.map