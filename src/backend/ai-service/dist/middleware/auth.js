"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiKey = exports.optionalAuth = exports.requireRole = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("@/utils/logger");
const authenticateUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: {
                    code: 401,
                    message: '缺少认证令牌',
                    type: 'AUTHENTICATION_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const token = authHeader.substring(7);
        const secret = process.env['JWT_SECRET'] || 'your-secret-key';
        jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
            if (err) {
                logger_1.logger.warn(`Invalid token: ${err.message}`);
                res.status(401).json({
                    success: false,
                    error: {
                        code: 401,
                        message: '无效的认证令牌',
                        type: 'AUTHENTICATION_ERROR',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            req.user = decoded;
            req.headers['x-user-id'] = decoded.userId;
            logger_1.logger.debug(`User authenticated: ${decoded.userId}`);
            next();
        });
    }
    catch (error) {
        logger_1.logger.error('Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: '认证服务错误',
                type: 'INTERNAL_ERROR',
            },
            timestamp: new Date().toISOString(),
        });
    }
};
exports.authenticateUser = authenticateUser;
const requireRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: {
                        code: 401,
                        message: '用户未认证',
                        type: 'AUTHENTICATION_ERROR',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const userRole = req.user.role;
            if (!roles.includes(userRole)) {
                logger_1.logger.warn(`User ${req.user.userId} attempted to access restricted resource. Role: ${userRole}, Required: ${roles.join(', ')}`);
                res.status(403).json({
                    success: false,
                    error: {
                        code: 403,
                        message: '权限不足',
                        type: 'AUTHORIZATION_ERROR',
                    },
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            logger_1.logger.debug(`User ${req.user.userId} authorized with role: ${userRole}`);
            next();
        }
        catch (error) {
            logger_1.logger.error('Role verification middleware error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 500,
                    message: '权限验证服务错误',
                    type: 'INTERNAL_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
        }
    };
};
exports.requireRole = requireRole;
const optionalAuth = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const secret = process.env['JWT_SECRET'] || 'your-secret-key';
            jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
                if (!err && decoded) {
                    req.user = decoded;
                    req.headers['x-user-id'] = decoded.userId;
                    logger_1.logger.debug(`Optional auth successful for user: ${decoded.userId}`);
                }
                next();
            });
        }
        else {
            next();
        }
    }
    catch (error) {
        logger_1.logger.error('Optional authentication middleware error:', error);
        next();
    }
};
exports.optionalAuth = optionalAuth;
const validateApiKey = (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        const validApiKey = process.env['API_KEY'];
        if (!validApiKey) {
            logger_1.logger.warn('API_KEY environment variable not set');
            next();
            return;
        }
        if (!apiKey || apiKey !== validApiKey) {
            logger_1.logger.warn(`Invalid API key attempt from ${req.ip}`);
            res.status(401).json({
                success: false,
                error: {
                    code: 401,
                    message: '无效的API密钥',
                    type: 'API_KEY_ERROR',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        logger_1.logger.debug('API key validation successful');
        next();
    }
    catch (error) {
        logger_1.logger.error('API key validation middleware error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 500,
                message: 'API密钥验证服务错误',
                type: 'INTERNAL_ERROR',
            },
            timestamp: new Date().toISOString(),
        });
    }
};
exports.validateApiKey = validateApiKey;
//# sourceMappingURL=auth.js.map