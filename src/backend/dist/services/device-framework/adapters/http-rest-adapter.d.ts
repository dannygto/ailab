import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
import { DeviceConnectionConfig } from '../types.js';
import { DeviceCommand } from '../../../models/device.model.js';
export interface HttpRestDeviceConnectionConfig extends DeviceConnectionConfig {
    baseUrl: string;
    timeout?: number;
    retryCount?: number;
    retryDelay?: number;
    autoReconnect?: boolean;
    reconnectInterval?: number;
    heartbeatPath?: string;
    heartbeatInterval?: number;
    debug?: boolean;
    auth?: {
        type: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2';
        username?: string;
        password?: string;
        token?: string;
        apiKeyName?: string;
        apiKeyLocation?: 'header' | 'query' | 'cookie';
        oauthConfig?: {
            tokenUrl?: string;
            clientId?: string;
            clientSecret?: string;
            scope?: string;
        };
    };
    headers?: Record<string, string>;
    defaultContentType?: string;
    endpointMap?: {
        [endpointName: string]: {
            path: string;
            method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
            contentType?: string;
            requestTransform?: string;
            responseTransform?: string;
            queryParams?: string[];
            pathParams?: string[];
            bodyFields?: string[];
            expectedStatus?: number[];
            timeout?: number;
        };
    };
    dataTransformers?: {
        [transformerName: string]: string;
    };
}
export declare class HttpRestDeviceAdapter extends BaseProtocolAdapter {
    private httpClients;
    private deviceConfigs;
    private heartbeatTimers;
    private reconnectTimers;
    private transformerFunctions;
    private dataIntervals;
    constructor();
    initialize(): Promise<void>;
    connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean>;
    disconnect(deviceId: string): Promise<boolean>;
    sendCommand(deviceId: string, command: DeviceCommand): Promise<any>;
    readData(deviceId: string, parameters?: any): Promise<any>;
    private configureAuthentication;
    private buildUrl;
    private extractBodyData;
    private getTransformerFunction;
    private checkConnection;
    private startHeartbeat;
    private setupReconnect;
    private retryRequest;
    private setupDataSimulation;
    private generateSimulatedData;
    private initializeConnectionState;
    private updateConnectionState;
    private updateStatistics;
    private recordError;
    private emitConnectedEvent;
    private emitDisconnectedEvent;
    private emitErrorEvent;
    private emitDataReceivedEvent;
    private emitCommandCompletedEvent;
}
//# sourceMappingURL=http-rest-adapter.d.ts.map