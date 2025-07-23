import { DeviceCommand } from '../../models/device.model.js';
import { DeviceManager } from './types.js';
import { DeviceRegistrationService } from './device-registration-service.js';
export declare enum CommunicationStatus {
    IDLE = "idle",
    CONNECTING = "connecting",
    COMMUNICATING = "communicating",
    DISCONNECTING = "disconnecting",
    ERROR = "error"
}
export declare enum CommunicationMode {
    SYNCHRONOUS = "synchronous",
    ASYNCHRONOUS = "asynchronous",
    STREAMING = "streaming",
    POLLING = "polling",
    SCHEDULED = "scheduled"
}
export declare enum CommunicationPriority {
    CRITICAL = "critical",
    HIGH = "high",
    NORMAL = "normal",
    LOW = "low",
    BACKGROUND = "background"
}
export interface CommunicationRequestConfig {
    deviceId: string;
    command?: DeviceCommand;
    timeout?: number;
    retries?: number;
    priority?: CommunicationPriority;
    mode?: CommunicationMode;
    callback?: (response: any, error?: Error) => void;
    metadata?: Record<string, any>;
}
export interface CommunicationSession {
    id: string;
    deviceId: string;
    startTime: string;
    endTime?: string;
    status: CommunicationStatus;
    requests: CommunicationRequestConfig[];
    responses: Array<{
        requestId: string;
        timestamp: string;
        data: any;
        error?: Error;
    }>;
    statistics: {
        requestsSent: number;
        responsesReceived: number;
        errors: number;
        totalDataSent: number;
        totalDataReceived: number;
        averageResponseTime: number;
    };
    metadata: Record<string, any>;
}
export declare class DeviceCommunicationService {
    private deviceManager;
    private registrationService;
    private eventEmitter;
    private activeSessions;
    private pendingRequests;
    private requestQueue;
    private pollingIntervals;
    private streamingConnections;
    private isProcessingQueue;
    private maxConcurrentRequests;
    private defaultTimeout;
    private sessionTimeout;
    constructor(deviceManager: DeviceManager);
    setRegistrationService(service: DeviceRegistrationService): void;
    sendCommand(config: CommunicationRequestConfig): Promise<string>;
    cancelRequest(requestId: string): boolean;
    getSession(sessionId: string): CommunicationSession | null;
    getDeviceSession(deviceId: string): CommunicationSession | null;
    getAllSessions(): CommunicationSession[];
    closeSession(sessionId: string): boolean;
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
    private setupEventListeners;
    private createOrUpdateSession;
    private processSynchronousRequest;
    private addToQueue;
    private processQueue;
    private setupStreamingConnection;
    private setupPolling;
    private scheduleRequest;
    private getPriorityValue;
    private getDeviceSessionId;
    private handleDataReceived;
    private startQueueProcessing;
    private startSessionCleanup;
}
//# sourceMappingURL=device-communication-service.d.ts.map