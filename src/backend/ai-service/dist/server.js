"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const database_1 = require("@/config/database");
const logger_1 = require("@/utils/logger");
const ai_assistant_routes_1 = __importDefault(require("@/routes/ai-assistant.routes"));
const resource_routes_1 = __importDefault(require("@/routes/resource.routes"));
dotenv_1.default.config();
class AIAssistantServer {
    constructor() {
        this.port = parseInt(process.env['PORT'] || '8001', 10);
        this.app = (0, express_1.default)();
        this.server = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.server, {
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
    initializeMiddleware() {
        this.app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        this.app.use((0, cors_1.default)({
            origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id', 'X-API-Key'],
        }));
        this.app.use((0, morgan_1.default)('combined', {
            stream: {
                write: (message) => logger_1.logger.http(message.trim()),
            },
        }));
        this.app.use(logger_1.logMiddleware);
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use('/static', express_1.default.static('public'));
        this.app.get('/health', (_req, res) => {
            res.status(200).json({
                status: 'healthy',
                service: 'ai-assistant',
                timestamp: new Date().toISOString(),
                version: process.env['npm_package_version'] || '1.0.0',
            });
        });
        this.app.get('/api/health', (_req, res) => {
            res.status(200).json({
                status: 'healthy',
                service: 'ai-assistant',
                timestamp: new Date().toISOString(),
                version: process.env['npm_package_version'] || '1.0.0',
            });
        });
    }
    initializeRoutes() {
        const apiPrefix = '/api/ai';
        this.app.use(apiPrefix, ai_assistant_routes_1.default);
        this.app.use('/api', resource_routes_1.default);
        this.app.get('/', (_req, res) => {
            res.redirect('/health');
        });
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
    initializeWebSocket() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`WebSocket client connected: ${socket.id}`);
            socket.on('authenticate', (data) => {
                try {
                    const { userId, token } = data;
                    if (userId && token) {
                        socket.data.userId = userId;
                        socket.join(`user:${userId}`);
                        logger_1.logger.info(`WebSocket client authenticated: ${userId}`);
                        socket.emit('authenticated', { success: true });
                    }
                    else {
                        socket.emit('error', { message: '认证失败' });
                    }
                }
                catch (error) {
                    logger_1.logger.error('WebSocket authentication error:', error);
                    socket.emit('error', { message: '认证服务错误' });
                }
            });
            socket.on('chat_message', async (data) => {
                try {
                    const { message } = data;
                    logger_1.logger.info(`Real-time chat message from ${socket.data.userId}: ${message.substring(0, 50)}...`);
                    socket.emit('chat_response', {
                        messageId: `msg_${Date.now()}`,
                        response: `收到您的消息: ${message}`,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    logger_1.logger.error('WebSocket chat error:', error);
                    socket.emit('error', { message: '聊天服务错误' });
                }
            });
            socket.on('disconnect', (reason) => {
                logger_1.logger.info(`WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
            });
            socket.on('error', (error) => {
                logger_1.logger.error('WebSocket error:', error);
            });
        });
        logger_1.logger.info('WebSocket server initialized');
    }
    initializeErrorHandling() {
        this.app.use((error, _req, res, _next) => {
            logger_1.logger.error('Unhandled error:', error);
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
            }
            else if (error.name === 'UnauthorizedError') {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 401,
                        message: '未授权访问',
                        type: 'UNAUTHORIZED_ERROR',
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            else {
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
    async start() {
        try {
            await database_1.DatabaseManager.getInstance().initialize();
            logger_1.logger.info('Database connections initialized');
            this.server.listen(this.port, () => {
                logger_1.logger.info(`AI Assistant Server running on port ${this.port}`);
                logger_1.logger.info(`Health check: http://localhost:${this.port}/health`);
                logger_1.logger.info(`API documentation: http://localhost:${this.port}/api/ai/health`);
            });
            this.setupGracefulShutdown();
        }
        catch (error) {
            logger_1.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}, starting graceful shutdown...`);
            this.server.close(() => {
                logger_1.logger.info('HTTP server closed');
            });
            this.io.close(() => {
                logger_1.logger.info('WebSocket server closed');
            });
            try {
                await database_1.DatabaseManager.getInstance().close();
                logger_1.logger.info('Database connections closed');
            }
            catch (error) {
                logger_1.logger.error('Error closing database connections:', error);
            }
            logger_1.logger.info('Graceful shutdown completed');
            process.exit(0);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            logger_1.logger.error('Uncaught exception:', error);
            gracefulShutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger_1.logger.error('Unhandled rejection at:', promise, 'reason:', reason);
            gracefulShutdown('unhandledRejection');
        });
    }
    getApp() {
        return this.app;
    }
    getIO() {
        return this.io;
    }
}
const server = new AIAssistantServer();
server.start().catch((error) => {
    logger_1.logger.error('Failed to start AI Assistant Server:', error);
    process.exit(1);
});
exports.default = server;
//# sourceMappingURL=server.js.map