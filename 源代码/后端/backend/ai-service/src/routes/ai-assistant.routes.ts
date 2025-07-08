import { Router } from 'express';
import { AIAssistantController } from '@/controllers/ai-assistant.controller';
import { validateRequest } from '@/middleware/validation';
import { authenticateUser } from '@/middleware/auth';
import { rateLimit } from '@/middleware/rate-limit';

const router = Router();
const controller = new AIAssistantController();

// 聊天相关路由
router.post(
  '/chat',
  authenticateUser,
  rateLimit({ windowMs: 60000, max: 30 }), // 每分钟最多30次请求
  validateRequest({
    body: {
      message: { type: 'string', required: true, maxLength: 1000 },
      mode: { type: 'string', enum: ['text', 'voice', 'image'], default: 'text' },
      context: {
        type: 'object',
        required: true,
        properties: {
          userId: { type: 'string', required: true },
          experimentId: { type: 'string' },
          role: { type: 'string', enum: ['student', 'teacher', 'admin'], required: true },
          sessionId: { type: 'string', required: true },
          currentPage: { type: 'string' },
          deviceStatus: { type: 'object' },
          userProfile: { type: 'object' },
        },
      },
      options: {
        type: 'object',
        properties: {
          stream: { type: 'boolean' },
          includeSuggestions: { type: 'boolean' },
          includeActions: { type: 'boolean' },
        },
      },
    },
  }),
  controller.chat.bind(controller)
);

// 语音聊天路由
router.post(
  '/voice-chat',
  authenticateUser,
  rateLimit({ windowMs: 60000, max: 10 }), // 每分钟最多10次语音请求
  validateRequest({
    body: {
      audio: { type: 'string', required: true }, // base64编码的音频数据
      format: { type: 'string', enum: ['wav', 'mp3', 'm4a'], required: true },
      context: {
        type: 'object',
        required: true,
        properties: {
          userId: { type: 'string', required: true },
          experimentId: { type: 'string' },
          role: { type: 'string', enum: ['student', 'teacher', 'admin'], required: true },
          sessionId: { type: 'string', required: true },
        },
      },
    },
  }),
  controller.voiceChat.bind(controller)
);

// 实验分析路由
router.post(
  '/analyze-experiment',
  authenticateUser,
  rateLimit({ windowMs: 300000, max: 20 }), // 每5分钟最多20次分析请求
  validateRequest({
    body: {
      experimentId: { type: 'string', required: true },
      data: { type: 'object', required: true },
    },
  }),
  controller.analyzeExperiment.bind(controller)
);

// 多学科实验相关路由
router.post(
  '/analyze-discipline-experiment',
  authenticateUser,
  rateLimit({ windowMs: 300000, max: 20 }), // 每5分钟最多20次分析请求
  validateRequest({
    body: {
      experimentId: { type: 'string', required: true },
      disciplineType: {
        type: 'string',
        enum: [
          'physics_experiment',
          'chemistry_experiment',
          'biology_experiment',
          'computer_science_experiment',
          'robotics_experiment',
        ],
        required: true,
      },
      data: { type: 'object', required: true },
    },
  }),
  controller.analyzeExperiment.bind(controller)
);

// 对话历史路由
router.get(
  '/conversation-history/:userId',
  authenticateUser,
  rateLimit({ windowMs: 60000, max: 10 }), // 每分钟最多10次请求
  validateRequest({
    params: {
      userId: { type: 'string', required: true },
    },
    query: {
      limit: { type: 'number', min: 1, max: 100, default: 20 },
      offset: { type: 'number', min: 0, default: 0 },
    },
  }),
  controller.getConversationHistory.bind(controller)
);

// 清除对话历史路由
router.delete(
  '/conversation-history/:userId',
  authenticateUser,
  rateLimit({ windowMs: 300000, max: 5 }), // 每5分钟最多5次清除请求
  validateRequest({
    params: {
      userId: { type: 'string', required: true },
    },
  }),
  controller.clearConversationHistory.bind(controller)
);

// 健康检查路由
router.get('/health', controller.healthCheck.bind(controller));

// 测试模型连接路由
router.post(
  '/test-connection',
  authenticateUser,
  rateLimit({ windowMs: 60000, max: 10 }), // 每分钟最多10次测试请求
  validateRequest({
    body: {
      model: { type: 'string', required: true },
      config: {
        type: 'object',
        required: true,
        properties: {
          apiKey: { type: 'string', required: true },
          temperature: { type: 'number' },
          maxTokens: { type: 'number' },
          systemPrompt: { type: 'string' },
          customEndpoint: { type: 'string' },
        },
      },
      specificParams: { type: 'object' },
    },
  }),
  controller.testConnection.bind(controller)
);

export default router;