import { Request, Response } from 'express';
import { AIAssistantService } from '@/services/ai-assistant.service';
import { logger, logApiRequest } from '@/utils/logger';
import { ChatRequest, ApiError } from '@/types';

export class AIAssistantController {
  private aiService: AIAssistantService;

  constructor() {
    this.aiService = new AIAssistantService();
  }

  /**
   * 处理聊天请求
   */
  async chat(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { message, mode, context, options } = req.body as ChatRequest;
      
      // 验证请求参数
      if (!message || !context) {
        this.sendErrorResponse(res, 400, '缺少必要参数', 'VALIDATION_ERROR');
        return;
      }

      // 验证用户身份
      if (!context.userId) {
        this.sendErrorResponse(res, 401, '用户未认证', 'AUTHENTICATION_ERROR');
        return;
      }

      logger.info(`Chat request from user ${context.userId}: ${message.substring(0, 50)}...`);

      // 处理聊天请求
      const response = await this.aiService.processChat({
        message,
        mode,
        context,
        options: options || {},
      });

      const duration = Date.now() - startTime;
      
      // 记录API请求
      logApiRequest('POST', '/api/ai/chat', 200, duration, context.userId);

      // 返回响应
      res.status(200).json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const userId = req.body?.context?.userId || 'unknown';
      
      logger.error('Chat API error:', error);
      logApiRequest('POST', '/api/ai/chat', 500, duration, userId);

      this.sendErrorResponse(
        res,
        500,
        error instanceof Error ? error.message : '服务器内部错误',
        'INTERNAL_ERROR'
      );
    }
  }

  /**
   * 处理语音聊天请求
   */
  async voiceChat(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { audio, format, context } = req.body;
      
      // 验证请求参数
      if (!audio || !format || !context) {
        this.sendErrorResponse(res, 400, '缺少必要参数', 'VALIDATION_ERROR');
        return;
      }

      // 验证用户身份
      if (!context.userId) {
        this.sendErrorResponse(res, 401, '用户未认证', 'AUTHENTICATION_ERROR');
        return;
      }

      logger.info(`Voice chat request from user ${context.userId}`);

      // 处理语音聊天请求
      const response = await this.aiService.processVoiceChat(audio, context);

      const duration = Date.now() - startTime;
      logApiRequest('POST', '/api/ai/voice-chat', 200, duration, context.userId);

      res.status(200).json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const userId = req.body?.context?.userId || 'unknown';
      
      logger.error('Voice chat API error:', error);
      logApiRequest('POST', '/api/ai/voice-chat', 500, duration, userId);

      this.sendErrorResponse(
        res,
        500,
        error instanceof Error ? error.message : '语音处理失败',
        'VOICE_PROCESSING_ERROR'
      );
    }
  }

  /**
   * 分析实验数据
   */
  async analyzeExperiment(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { experimentId, data } = req.body;
      
      // 验证请求参数
      if (!experimentId || !data) {
        this.sendErrorResponse(res, 400, '缺少必要参数', 'VALIDATION_ERROR');
        return;
      }

      // 验证用户身份
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        this.sendErrorResponse(res, 401, '用户未认证', 'AUTHENTICATION_ERROR');
        return;
      }

      logger.info(`Experiment analysis request for experiment ${experimentId} from user ${userId}`);

      // 分析实验数据
      const analysis = { message: '实验分析功能暂未实现' };

      const duration = Date.now() - startTime;
      logApiRequest('POST', '/api/ai/analyze-experiment', 200, duration, userId);

      res.status(200).json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const userId = req.headers['x-user-id'] as string || 'unknown';
      
      logger.error('Experiment analysis API error:', error);
      logApiRequest('POST', '/api/ai/analyze-experiment', 500, duration, userId);

      this.sendErrorResponse(
        res,
        500,
        error instanceof Error ? error.message : '实验分析失败',
        'ANALYSIS_ERROR'
      );
    }
  }

  /**
   * 获取对话历史
   */
  async getConversationHistory(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { userId } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      
      // 验证用户身份
      const currentUserId = req.headers['x-user-id'] as string;
      if (!currentUserId || currentUserId !== userId) {
        this.sendErrorResponse(res, 403, '无权访问此对话历史', 'AUTHORIZATION_ERROR');
        return;
      }

      logger.info(`Getting conversation history for user ${userId}`);

      // 这里应该从数据库获取对话历史
      // 目前返回模拟数据
      const history = [
        {
          id: 'msg_1',
          type: 'user',
          content: '如何调整学习率参数？',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: 'msg_2',
          type: 'assistant',
          content: '学习率是深度学习中的重要超参数，建议从0.001开始调整...',
          timestamp: new Date(Date.now() - 3500000),
        },
      ];

      const duration = Date.now() - startTime;
      logApiRequest('GET', `/api/ai/conversation-history/${userId}`, 200, duration, userId);

      res.status(200).json({
        success: true,
        data: {
          history,
          total: history.length,
          limit: Number(limit),
          offset: Number(offset),
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const userId = req.params['userId'] || 'unknown';
      
      logger.error('Get conversation history API error:', error);
      logApiRequest('GET', `/api/ai/conversation-history/${userId}`, 500, duration, userId);

      this.sendErrorResponse(
        res,
        500,
        error instanceof Error ? error.message : '获取对话历史失败',
        'HISTORY_ERROR'
      );
    }
  }

  /**
   * 清除对话历史
   */
  async clearConversationHistory(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { userId } = req.params;
      
      // 验证用户身份
      const currentUserId = req.headers['x-user-id'] as string;
      if (!currentUserId || currentUserId !== userId) {
        this.sendErrorResponse(res, 403, '无权执行此操作', 'AUTHORIZATION_ERROR');
        return;
      }

      logger.info(`Clearing conversation history for user ${userId}`);

      // 这里应该清除数据库中的对话历史
      // 目前只是记录日志

      const duration = Date.now() - startTime;
      logApiRequest('DELETE', `/api/ai/conversation-history/${userId}`, 200, duration, userId);

      res.status(200).json({
        success: true,
        message: '对话历史已清除',
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const userId = req.params['userId'] || 'unknown';
      
      logger.error('Clear conversation history API error:', error);
      logApiRequest('DELETE', `/api/ai/conversation-history/${userId}`, 500, duration, userId);

      this.sendErrorResponse(
        res,
        500,
        error instanceof Error ? error.message : '清除对话历史失败',
        'CLEAR_ERROR'
      );
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          ai: 'operational',
          database: 'operational',
          redis: 'operational',
        },
        version: process.env['npm_package_version'] || '1.0.0',
      };

      res.status(200).json(health);
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  /**
   * 测试AI模型连接
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const { model, config, specificParams } = req.body;

      if (!model || !config) {
        this.sendErrorResponse(res, 400, '缺少必要参数', 'VALIDATION_ERROR');
        return;
      }

      logger.info(`Testing connection for model: ${model}`);
      
      const result = await this.aiService.testModelConnection(model, config, specificParams);
      
      if (result.success) {
        logger.info(`Connection test successful for model: ${model}`);
        res.status(200).json({
          success: true,
          message: result.message,
          modelInfo: result.modelInfo || {}, // 返回模型信息
          tokenLimits: {
            contextWindow: result.modelInfo?.contextWindow || 4096,
            outputTokenLimit: result.modelInfo?.outputTokenLimit || 4096,
            inputTokenLimit: result.modelInfo?.inputTokenLimit || 4096
          }
        });
      } else {
        logger.warn(`Connection test failed for model ${model}: ${result.message}`);
        res.status(200).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      logger.error('Error in test connection:', error);
      this.sendErrorResponse(res, 500, `测试连接失败: ${error.message}`, 'AI_CONNECTION_ERROR');
    }
  }

  /**
   * 发送错误响应
   */
  private sendErrorResponse(
    res: Response,
    statusCode: number,
    message: string,
    type: string,
    details?: Array<{ field: string; message: string }>
  ): void {
    const error: ApiError = {
      code: statusCode,
      message,
      type,
      details: details || [],
    };

    res.status(statusCode).json({
      success: false,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}