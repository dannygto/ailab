"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRateLimitStatus = exports.dynamicRateLimit = exports.ipRateLimit = exports.userRateLimit = exports.rateLimitConfigs = exports.rateLimit = void 0;
const database_1 = require("@/config/database");
const logger_1 = require("@/utils/logger");
const defaultKeyGenerator = (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
};
const rateLimit = (options) => {
    return async (req, res, next) => {
        try {
            const { windowMs, max, message = '请求过于频繁，请稍后再试', keyGenerator = defaultKeyGenerator, skipSuccessfulRequests = false, skipFailedRequests = false, } = options;
            const key = keyGenerator(req);
            const redis = database_1.DatabaseManager.getInstance().getRedisClient();
            const rateLimitKey = `rate_limit:${key}`;
            const now = Date.now();
            const windowStart = now - windowMs;
            const requests = await redis.zRangeByScore(rateLimitKey, windowStart, '+inf');
            await redis.zRemRangeByScore(rateLimitKey, '-inf', windowStart - 1);
            if (requests.length >= max) {
                logger_1.logger.warn(`Rate limit exceeded for ${key}: ${requests.length}/${max} requests in ${windowMs}ms`);
                const oldestRequest = await redis.zRange(rateLimitKey, 0, 0, { WITHSCORES: true });
                const resetTime = oldestRequest.length > 0 ?
                    parseInt(oldestRequest[0].score) + windowMs - now :
                    windowMs;
                res.status(429).json({
                    success: false,
                    error: {
                        code: 429,
                        message,
                        type: 'RATE_LIMIT_ERROR',
                        details: {
                            limit: max,
                            windowMs,
                            resetTime,
                            retryAfter: Math.ceil(resetTime / 1000),
                        },
                    },
                    timestamp: new Date().toISOString(),
                });
                res.setHeader('Retry-After', Math.ceil(resetTime / 1000));
                res.setHeader('X-RateLimit-Limit', max);
                res.setHeader('X-RateLimit-Remaining', 0);
                res.setHeader('X-RateLimit-Reset', new Date(now + resetTime).toISOString());
                return;
            }
            await redis.zAdd(rateLimitKey, { score: now, value: now.toString() });
            await redis.expire(rateLimitKey, Math.ceil(windowMs / 1000));
            const remaining = max - requests.length - 1;
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
            res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
            const originalSend = res.send;
            res.send = function (data) {
                const statusCode = res.statusCode;
                if (skipSuccessfulRequests && statusCode < 400) {
                }
                else if (skipFailedRequests && statusCode >= 400) {
                }
                else {
                    redis.zAdd(rateLimitKey, { score: now, value: now.toString() }).catch((err) => {
                        logger_1.logger.error('Error recording rate limit request:', err);
                    });
                }
                return originalSend.call(this, data);
            };
            logger_1.logger.debug(`Rate limit check passed for ${key}: ${requests.length + 1}/${max} requests`);
            next();
        }
        catch (error) {
            logger_1.logger.error('Rate limit middleware error:', error);
            next();
        }
    };
};
exports.rateLimit = rateLimit;
exports.rateLimitConfigs = {
    strict: {
        windowMs: 60 * 1000,
        max: 5,
        message: '请求过于频繁，请等待1分钟后重试',
    },
    moderate: {
        windowMs: 60 * 1000,
        max: 30,
        message: '请求过于频繁，请稍后再试',
    },
    lenient: {
        windowMs: 60 * 1000,
        max: 100,
        message: '请求过于频繁，请稍后再试',
    },
    fileUpload: {
        windowMs: 60 * 60 * 1000,
        max: 10,
        message: '文件上传过于频繁，请等待1小时后重试',
    },
    login: {
        windowMs: 60 * 60 * 1000,
        max: 5,
        message: '登录尝试过于频繁，请等待1小时后重试',
    },
    apiKey: {
        windowMs: 60 * 1000,
        max: 1000,
        message: 'API调用过于频繁，请稍后再试',
    },
};
const userRateLimit = (options) => {
    const userKeyGenerator = (req) => {
        const userId = req.user?.userId || req.headers['x-user-id'];
        return userId || req.ip || 'anonymous';
    };
    return (0, exports.rateLimit)({
        ...options,
        keyGenerator: userKeyGenerator,
    });
};
exports.userRateLimit = userRateLimit;
const ipRateLimit = (options) => {
    const ipKeyGenerator = (req) => {
        return req.ip ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            'unknown';
    };
    return (0, exports.rateLimit)({
        ...options,
        keyGenerator: ipKeyGenerator,
    });
};
exports.ipRateLimit = ipRateLimit;
const dynamicRateLimit = (baseOptions) => {
    return async (req, res, next) => {
        try {
            const userRole = req.user?.role || 'anonymous';
            let adjustedOptions = { ...baseOptions };
            switch (userRole) {
                case 'admin':
                    adjustedOptions.max = Math.floor(baseOptions.max * 3);
                    break;
                case 'teacher':
                    adjustedOptions.max = Math.floor(baseOptions.max * 2);
                    break;
                case 'student':
                    break;
                default:
                    adjustedOptions.max = Math.floor(baseOptions.max * 0.5);
                    break;
            }
            const rateLimitMiddleware = (0, exports.rateLimit)(adjustedOptions);
            await rateLimitMiddleware(req, res, next);
        }
        catch (error) {
            logger_1.logger.error('Dynamic rate limit error:', error);
            next();
        }
    };
};
exports.dynamicRateLimit = dynamicRateLimit;
const getRateLimitStatus = async (key) => {
    try {
        const redis = database_1.DatabaseManager.getInstance().getRedisClient();
        const rateLimitKey = `rate_limit:${key}`;
        const now = Date.now();
        const windowMs = 60 * 1000;
        const windowStart = now - windowMs;
        const requests = await redis.zRangeByScore(rateLimitKey, windowStart, '+inf');
        const limit = 30;
        return {
            current: requests.length,
            limit,
            remaining: Math.max(0, limit - requests.length),
            resetTime: now + windowMs,
        };
    }
    catch (error) {
        logger_1.logger.error('Error getting rate limit status:', error);
        return {
            current: 0,
            limit: 30,
            remaining: 30,
            resetTime: Date.now() + 60000,
        };
    }
};
exports.getRateLimitStatus = getRateLimitStatus;
//# sourceMappingURL=rate-limit.js.map