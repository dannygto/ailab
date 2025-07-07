import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
declare class AIAssistantServer {
    private app;
    private server;
    private io;
    private port;
    constructor();
    private initializeMiddleware;
    private initializeRoutes;
    private initializeWebSocket;
    private initializeErrorHandling;
    start(): Promise<void>;
    private setupGracefulShutdown;
    getApp(): express.Application;
    getIO(): SocketIOServer;
}
declare const server: AIAssistantServer;
export default server;
//# sourceMappingURL=server.d.ts.map