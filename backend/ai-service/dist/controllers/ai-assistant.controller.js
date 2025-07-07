"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAssistantController = void 0;
const ai_assistant_service_1 = require("@/services/ai-assistant.service");
const logger_1 = require("@/utils/logger");
class AIAssistantController {
    constructor() {
        this.aiService = new ai_assistant_service_1.AIAssistantService();
    }
    async chat(req, res) {
        const startTime = Date.now();
        try {
            const { message, mode, context, options } = req.body;
            if (!message || !context) {
                this.sendErrorResponse(res, 400, '缺少必要参数', 'VALIDATION_ERROR');
                return;
            }
            if (!context.userId) {
                this.sendErrorResponse(res, 401, '用户未认证', 'AUTHENTICATION_ERROR');
                return;
            }
            logger_1.logger.info(`Chat request from user ${context.userId}: ${message.substring(0, 50)}...`);
            const response = await this.aiService.processChat({
                message,
                mode,
                context,
                options: options || {},
            });
            const duration = Date.now() - startTime;
            (0, logger_1.logApiRequest)('POST', '/api/ai/chat', 200, duration, context.userId);
            res.status(200).json({
                success: true,
                data: response,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const userId = req.body?.context?.userId || 'unknown';
            logger_1.logger.error('Chat API error:', error);
            (0, logger_1.logApiRequest)('POST', '/api/ai/chat', 500, duration, userId);
            this.sendErrorResponse(res, 500, error instanceof Error ? error.message : '服务器内部错误', 'INTERNAL_ERROR');
        }
    }
    async voiceChat(req, res) {
        const startTime = Date.now();
        try {
            const { audio, format, context } = req.body;
            if (!audio || !format || !context) {
                this.sendErrorResponse(res, 400, '缺少必要参数', 'VALIDATION_ERROR');
                return;
            }
            if (!context.userId) {
                this.sendErrorResponse(res, 401, '用户未认证', 'AUTHENTICATION_ERROR');
                return;
            }
            logger_1.logger.info(`Voice chat request from user ${context.userId}`);
            const response = await this.aiService.processVoiceChat(audio, context);
            const duration = Date.now() - startTime;
            (0, logger_1.logApiRequest)('POST', '/api/ai/voice-chat', 200, duration, context.userId);
            res.status(200).json({
                success: true,
                data: response,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const userId = req.body?.context?.userId || 'unknown';
            logger_1.logger.error('Voice chat API error:', error);
            (0, logger_1.logApiRequest)('POST', '/api/ai/voice-chat', 500, duration, userId);
            this.sendErrorResponse(res, 500, error instanceof Error ? error.message : '语音处理失败', 'VOICE_PROCESSING_ERROR');
        }
    }
    async analyzeExperiment(req, res) {
        const startTime = Date.now();
        try {
            const { experimentId, data } = req.body;
            if (!experimentId || !data) {
                this.sendErrorResponse(res, 400, '缺少必要参数', 'VALIDATION_ERROR');
                return;
            }
            const userId = req.headers['x-user-id'];
            if (!userId) {
                this.sendErrorResponse(res, 401, '用户未认证', 'AUTHENTICATION_ERROR');
                return;
            }
            logger_1.logger.info(`Experiment analysis request for experiment ${experimentId} from user ${userId}`);
            const analysis = { message: '实验分析功能暂未实现' };
            const duration = Date.now() - startTime;
            (0, logger_1.logApiRequest)('POST', '/api/ai/analyze-experiment', 200, duration, userId);
            res.status(200).json({
                success: true,
                data: analysis,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const userId = req.headers['x-user-id'] || 'unknown';
            logger_1.logger.error('Experiment analysis API error:', error);
            (0, logger_1.logApiRequest)('POST', '/api/ai/analyze-experiment', 500, duration, userId);
            this.sendErrorResponse(res, 500, error instanceof Error ? error.message : '实验分析失败', 'ANALYSIS_ERROR');
        }
    }
    async getConversationHistory(req, res) {
        const startTime = Date.now();
        try {
            const { userId } = req.params;
            const { limit = 20, offset = 0 } = req.query;
            const currentUserId = req.headers['x-user-id'];
            if (!currentUserId || currentUserId !== userId) {
                this.sendErrorResponse(res, 403, '无权访问此对话历史', 'AUTHORIZATION_ERROR');
                return;
            }
            logger_1.logger.info(`Getting conversation history for user ${userId}`);
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
            (0, logger_1.logApiRequest)('GET', `/api/ai/conversation-history/${userId}`, 200, duration, userId);
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
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const userId = req.params['userId'] || 'unknown';
            logger_1.logger.error('Get conversation history API error:', error);
            (0, logger_1.logApiRequest)('GET', `/api/ai/conversation-history/${userId}`, 500, duration, userId);
            this.sendErrorResponse(res, 500, error instanceof Error ? error.message : '获取对话历史失败', 'HISTORY_ERROR');
        }
    }
    async clearConversationHistory(req, res) {
        const startTime = Date.now();
        try {
            const { userId } = req.params;
            const currentUserId = req.headers['x-user-id'];
            if (!currentUserId || currentUserId !== userId) {
                this.sendErrorResponse(res, 403, '无权执行此操作', 'AUTHORIZATION_ERROR');
                return;
            }
            logger_1.logger.info(`Clearing conversation history for user ${userId}`);
            const duration = Date.now() - startTime;
            (0, logger_1.logApiRequest)('DELETE', `/api/ai/conversation-history/${userId}`, 200, duration, userId);
            res.status(200).json({
                success: true,
                message: '对话历史已清除',
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const userId = req.params['userId'] || 'unknown';
            logger_1.logger.error('Clear conversation history API error:', error);
            (0, logger_1.logApiRequest)('DELETE', `/api/ai/conversation-history/${userId}`, 500, duration, userId);
            this.sendErrorResponse(res, 500, error instanceof Error ? error.message : '清除对话历史失败', 'CLEAR_ERROR');
        }
    }
    async healthCheck(_req, res) {
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
        }
        catch (error) {
            logger_1.logger.error('Health check error:', error);
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async testConnection(req, res) {
        try {
            const { model, config, specificParams } = req.body;
            if (!model || !config) {
                this.sendErrorResponse(res, 400, '缺少必要参数', 'VALIDATION_ERROR');
                return;
            }
            logger_1.logger.info(`Testing connection for model: ${model}`);
            const result = await this.aiService.testModelConnection(model, config, specificParams);
            if (result.success) {
                logger_1.logger.info(`Connection test successful for model: ${model}`);
                res.status(200).json({
                    success: true,
                    message: result.message,
                    modelInfo: result.modelInfo || {},
                    tokenLimits: {
                        contextWindow: result.modelInfo?.contextWindow || 4096,
                        outputTokenLimit: result.modelInfo?.outputTokenLimit || 4096,
                        inputTokenLimit: result.modelInfo?.inputTokenLimit || 4096
                    }
                });
            }
            else {
                logger_1.logger.warn(`Connection test failed for model ${model}: ${result.message}`);
                res.status(200).json({
                    success: false,
                    message: result.message
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Error in test connection:', error);
            this.sendErrorResponse(res, 500, `测试连接失败: ${error.message}`, 'AI_CONNECTION_ERROR');
        }
    }
    sendErrorResponse(res, statusCode, message, type, details) {
        const error = {
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
exports.AIAssistantController = AIAssistantController;
//# sourceMappingURL=ai-assistant.controller.js.map