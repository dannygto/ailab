import winston from 'winston';
export declare const logger: winston.Logger;
export declare const logMiddleware: (req: any, res: any, next: any) => void;
export declare const logError: (error: Error, context?: string) => void;
export declare const logPerformance: (operation: string, duration: number, metadata?: any) => void;
export declare const logApiRequest: (method: string, url: string, statusCode: number, duration: number, userId?: string) => void;
export declare const logAssistantInteraction: (userId: string, messageType: string, content: string, responseTime: number, success: boolean) => void;
export declare const logDatabaseOperation: (operation: string, collection: string, duration: number, success: boolean) => void;
export declare const logSystemEvent: (event: string, details?: any) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map