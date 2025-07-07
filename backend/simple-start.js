const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server: WebSocketServer } = require('ws');

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors());
app.use(express.json());

// 创建HTTP服务器
const server = createServer(app);

// 创建WebSocket服务器
const wss = new WebSocketServer({ server, path: '/ws' });

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: '人工智能实验平台后端服务',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 模拟API端点
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    experimentsTotal: 156,
    experimentsToday: 23,
    activeDevices: 42,
    completionRate: 87.5,
    recentExperiments: [
      { id: '1', name: '图像分类实验', status: 'completed', progress: 100 },
      { id: '2', name: '深度学习训练', status: 'running', progress: 65 },
      { id: '3', name: '数据预处理', status: 'pending', progress: 0 }
    ]
  });
});

app.get('/api/devices', (req, res) => {
  res.json([
    { id: '1', name: '摄像头-01', type: 'camera', status: 'online', location: '实验室A' },
    { id: '2', name: '传感器-01', type: 'sensor', status: 'online', location: '实验室B' },
    { id: '3', name: 'GPU服务器', type: 'compute', status: 'busy', location: '机房C' }
  ]);
});

app.get('/api/experiments', (req, res) => {
  res.json([
    { id: '1', name: '图像识别实验', type: 'computer-vision', status: 'completed' },
    { id: '2', name: '自然语言处理', type: 'nlp', status: 'running' },
    { id: '3', name: '推荐系统训练', type: 'recommendation', status: 'pending' }
  ]);
});

app.post('/api/experiments', (req, res) => {
  const experiment = req.body;
  res.status(201).json({
    id: Date.now().toString(),
    ...experiment,
    status: 'created',
    createdAt: new Date().toISOString()
  });
});

// AI聊天端点
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  
  // 模拟AI响应
  const responses = [
    '您好！我是AI助手，很高兴为您提供实验指导。',
    '基于您的实验参数，建议调整学习率到0.001以获得更好的收敛效果。',
    '实验进展看起来不错！当前准确率已经达到85%，建议继续训练。',
    '检测到数据质量问题，建议先进行数据清洗和预处理。',
    '实验完成！总体效果良好，建议保存当前模型权重。'
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  res.json({
    success: true,
    response: randomResponse,
    timestamp: new Date().toISOString()
  });
});

// WebSocket连接处理
wss.on('connection', (ws) => {
  console.log('🔗 WebSocket客户端已连接');
  
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    message: 'WebSocket连接已建立',
    timestamp: new Date().toISOString()
  }));
  
  // 定期发送设备状态更新
  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'device-update',
        data: {
          deviceId: 'device-' + Math.floor(Math.random() * 10),
          status: Math.random() > 0.5 ? 'online' : 'busy',
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          timestamp: new Date().toISOString()
        }
      }));
    }
  }, 5000);
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📨 收到WebSocket消息:', data);
      
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('WebSocket消息处理错误:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('🔒 WebSocket客户端已断开');
    clearInterval(interval);
  });
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`🚀 人工智能实验平台后端服务启动成功`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🩺 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🔗 WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 收到关闭信号，正在优雅关闭服务器...');
  server.close(() => {
    console.log('✅ 服务器已关闭');
    process.exit(0);
  });
});
