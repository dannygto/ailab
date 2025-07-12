"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSystemEvent = exports.logDatabaseOperation = exports.logAssistantInteraction = exports.logApiRequest = exports.logPerformance = exports.logError = exports.logMiddleware = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const level = () => {
    const env = process.env['NODE_ENV'] || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info['timestamp']} ${info.level}: ${info.message}`));
const logDir = path_1.default.join(process.cwd(), 'logs');
const transports = [
    new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }),
    new winston_1.default.transports.File({
        filename: path_1.default.join(logDir, 'error.log'),
        level: 'error',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    }),
    new winston_1.default.transports.File({
        filename: path_1.default.join(logDir, 'combined.log'),
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    }),
];
exports.logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
});
if (process.env['NODE_ENV'] === 'development') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
const logMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
        if (res.statusCode >= 400) {
            exports.logger.warn(logMessage);
        }
        else {
            exports.logger.http(logMessage);
        }
    });
    next();
};
exports.logMiddleware = logMiddleware;
const logError = (error, context) => {
    exports.logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
        stack: error.stack,
        timestamp: new Date().toISOString(),
    });
};
exports.logError = logError;
const logPerformance = (operation, duration, metadata) => {
    exports.logger.info(`Performance: ${operation} took ${duration}ms`, {
        operation,
        duration,
        metadata,
        timestamp: new Date().toISOString(),
    });
};
exports.logPerformance = logPerformance;
const logApiRequest = (method, url, statusCode, duration, userId) => {
    exports.logger.info(`API Request: ${method} ${url} ${statusCode} ${duration}ms`, {
        method,
        url,
        statusCode,
        duration,
        userId,
        timestamp: new Date().toISOString(),
    });
};
exports.logApiRequest = logApiRequest;
const logAssistantInteraction = (userId, messageType, content, responseTime, success) => {
    exports.logger.info(`Assistant Interaction: ${messageType}`, {
        userId,
        messageType,
        content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        responseTime,
        success,
        timestamp: new Date().toISOString(),
    });
};
exports.logAssistantInteraction = logAssistantInteraction;
const logDatabaseOperation = (operation, collection, duration, success) => {
    exports.logger.debug(`Database Operation: ${operation} on ${collection}`, {
        operation,
        collection,
        duration,
        success,
        timestamp: new Date().toISOString(),
    });
};
exports.logDatabaseOperation = logDatabaseOperation;
const logSystemEvent = (event, details) => {
    exports.logger.info(`System Event: ${event}`, {
        event,
        details,
        timestamp: new Date().toISOString(),
    });
};
exports.logSystemEvent = logSystemEvent;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map