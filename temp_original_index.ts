// 閲嶆柊瀵煎悜鍒?server.ts
// 涓轰簡淇濇寔 package.json 涓?main 瀛楁鐨勪竴鑷存€э紝杩欎釜鏂囦欢绠€鍗曞湴閲嶆柊瀵煎嚭 server.ts

export * from './server';

// 鍔犺浇鐜鍙橀噺
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// 瀹夊叏涓棿浠?app.use(helmet());

// CORS閰嶇疆
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true
}));

// 璇锋眰鏃ュ織
app.use(morgan('combined'));

// JSON瑙ｆ瀽
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 鍩虹璺敱
app.get('/', (req, res) => {
  res.json({ 
    message: '浜哄伐鏅鸿兘杈呭姪瀹為獙骞冲彴鍚庣API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 鍋ュ悍妫€鏌?app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API璺敱绀轰緥
app.get('/api/experiments', (req, res) => {
  res.json({ 
    experiments: [
      { id: 1, title: '鐗╃悊瀹為獙绀轰緥', type: 'physics' },
      { id: 2, title: '鍖栧瀹為獙绀轰緥', type: 'chemistry' }
    ]
  });
});

// 閿欒澶勭悊涓棿浠?app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊璇? });
});

// 404澶勭悊
app.use('*', (req, res) => {
  res.status(404).json({ error: '鏈壘鍒拌姹傜殑璧勬簮' });
});

// 鍚姩鏈嶅姟鍣?app.listen(PORT, () => {
  console.log(`馃殌 鍚庣鏈嶅姟鍣ㄥ惎鍔ㄦ垚鍔燂紒`);
  console.log(`馃搷 鍦板潃: http://localhost:${PORT}`);
  console.log(`馃晲 鏃堕棿: ${new Date().toLocaleString()}`);
});

// 璇锋眰闄愬埗
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15鍒嗛挓
  max: 100, // 闄愬埗姣忎釜IP 15鍒嗛挓鍐呮渶澶?00涓姹?  message: '璇锋眰杩囦簬棰戠箒锛岃绋嶅悗鍐嶈瘯'
});
app.use('/api/', limiter);

// 鏃ュ織涓棿浠?app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// 鍘嬬缉涓棿浠?app.use(compression());

// 瑙ｆ瀽JSON鍜孶RL缂栫爜
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 闈欐€佹枃浠舵湇鍔?app.use('/uploads', express.static('uploads'));

// 鍋ュ悍妫€鏌?app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API璺敱
app.use('/api/auth', authRoutes);
app.use('/api/devices', authMiddleware, deviceRoutes);
app.use('/api/cameras', authMiddleware, cameraRoutes);
app.use('/api/data', authMiddleware, dataRoutes);
app.use('/api/analysis', authMiddleware, analysisRoutes);
app.use('/api/config', authMiddleware, configRoutes);

// Socket.IO杩炴帴澶勭悊
io.on('connection', (socket) => {
  logger.info(`鐢ㄦ埛杩炴帴: ${socket.id}`);

  // 鍔犲叆璁惧鎴块棿
  socket.on('join-device', (deviceId: string) => {
    socket.join(`device-${deviceId}`);
    logger.info(`鐢ㄦ埛 ${socket.id} 鍔犲叆璁惧鎴块棿: ${deviceId}`);
  });

  // 绂诲紑璁惧鎴块棿
  socket.on('leave-device', (deviceId: string) => {
    socket.leave(`device-${deviceId}`);
    logger.info(`鐢ㄦ埛 ${socket.id} 绂诲紑璁惧鎴块棿: ${deviceId}`);
  });

  // 鎽勫儚澶存帶鍒?  socket.on('camera-control', (data) => {
    // 骞挎挱鎽勫儚澶存帶鍒跺懡浠?    socket.broadcast.to(`device-${data.deviceId}`).emit('camera-control', data);
  });

  // 鏂紑杩炴帴
  socket.on('disconnect', () => {
    logger.info(`鐢ㄦ埛鏂紑杩炴帴: ${socket.id}`);
  });
});

// 閿欒澶勭悊涓棿浠?app.use(errorHandler);

// 404澶勭悊
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '鎺ュ彛涓嶅瓨鍦?,
    path: req.originalUrl
  });
});

// 鍚姩鏈嶅姟鍣?async function startServer() {
  try {
    // 杩炴帴鏁版嵁搴?    await connectDatabase();
    logger.info('鏁版嵁搴撹繛鎺ユ垚鍔?);

    // 杩炴帴Redis
    await connectRedis();
    logger.info('Redis杩炴帴鎴愬姛');

    // 鍚姩HTTP鏈嶅姟鍣?    server.listen(PORT, () => {
      logger.info(`鏈嶅姟鍣ㄨ繍琛屽湪绔彛 ${PORT}`);
      logger.info(`鐜: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('鏈嶅姟鍣ㄥ惎鍔ㄥけ璐?', error);
    process.exit(1);
  }
}

// 浼橀泤鍏抽棴
process.on('SIGTERM', () => {
  logger.info('鏀跺埌SIGTERM淇″彿锛屽紑濮嬩紭闆呭叧闂?..');
  server.close(() => {
    logger.info('鏈嶅姟鍣ㄥ凡鍏抽棴');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('鏀跺埌SIGINT淇″彿锛屽紑濮嬩紭闆呭叧闂?..');
  server.close(() => {
    logger.info('鏈嶅姟鍣ㄥ凡鍏抽棴');
    process.exit(0);
  });
});

// 鍚姩鏈嶅姟鍣?startServer();

export { app, io }; 
