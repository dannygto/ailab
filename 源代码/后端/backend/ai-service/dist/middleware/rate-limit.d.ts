import { Request, Response, NextFunction } from 'express';
interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
    keyGenerator?: (req: Request) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}
export declare const rateLimit: (options: RateLimitOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rateLimitConfigs: {
    strict: {
        windowMs: number;
        max: number;
        message: string;
    };
    moderate: {
        windowMs: number;
        max: number;
        message: string;
    };
    lenient: {
        windowMs: number;
        max: number;
        message: string;
    };
    fileUpload: {
        windowMs: number;
        max: number;
        message: string;
    };
    login: {
        windowMs: number;
        max: number;
        message: string;
    };
    apiKey: {
        windowMs: number;
        max: number;
        message: string;
    };
};
export declare const userRateLimit: (options: RateLimitOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const ipRateLimit: (options: RateLimitOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const dynamicRateLimit: (baseOptions: RateLimitOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRateLimitStatus: (key: string) => Promise<{
    current: number;
    limit: number;
    remaining: number;
    resetTime: number;
}>;
export {};
//# sourceMappingURL=rate-limit.d.ts.map