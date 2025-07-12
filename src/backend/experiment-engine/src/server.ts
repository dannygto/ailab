import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import experimentRoutes from './routes/experiment.routes';
import { logger } from './utils/logger';

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// 路由
app.use('/api/experiments', experimentRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('服务器错误', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  logger.info(`实验执行引擎服务已启动，端口: ${PORT}`);
});

export default app;
