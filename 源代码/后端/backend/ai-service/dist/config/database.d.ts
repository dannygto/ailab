import Redis from 'redis';
export declare const connectMongoDB: () => Promise<boolean>;
export declare const createRedisClient: () => Redis.RedisClientType | null;
export declare class DatabaseManager {
    private static instance;
    private redisClient;
    private mockMode;
    private fallbackMode;
    private isInitialized;
    private constructor();
    static getInstance(): DatabaseManager;
    initialize(): Promise<void>;
    getRedisClient(): Redis.RedisClientType | any;
    private createMockRedisClient;
    close(): Promise<void>;
    getStatus(): {
        initialized: boolean;
        mockMode: boolean;
        fallbackMode: boolean;
        mongoConnected: boolean;
        redisConnected: boolean;
    };
}
export declare const checkDatabaseHealth: () => Promise<{
    status: string;
    details: {
        mongodb: {
            connected: boolean;
            readyState: number;
            mock: boolean;
        };
        redis: {
            connected: boolean;
            mock: boolean;
        };
        fallbackMode: boolean;
    };
}>;
export declare const createIndexes: () => Promise<void>;
//# sourceMappingURL=database.d.ts.map