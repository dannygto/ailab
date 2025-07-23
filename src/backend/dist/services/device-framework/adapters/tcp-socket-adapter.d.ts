import { DeviceConnectionConfig } from '../types.js';
import { DeviceCommand } from '../../../models/device.model.js';
import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
interface TcpSocketCommand {
    data: string | Buffer | Record<string, any>;
    encoding?: BufferEncoding;
    binary?: boolean;
    expectResponse?: boolean;
    responseTimeout?: number;
}
export interface TcpSocketDeviceConnectionConfig extends DeviceConnectionConfig {
    connectionType: 'tcp-socket';
    host: string;
    port: number;
    timeout?: number;
    autoReconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    keepAlive?: boolean;
    initCommands?: Array<{
        data: string | Buffer;
        encoding?: BufferEncoding;
        waitForResponse?: boolean;
        responseTimeout?: number;
    }>;
    delimiter?: string | Buffer;
    encoding?: BufferEncoding;
    binary?: boolean;
}
export declare class TcpSocketDeviceAdapter extends BaseProtocolAdapter {
    private socketConnections;
    private deviceConfigs;
    private reconnectTimers;
    private dataBuffers;
    private commandCallbacks;
    private dataIntervals;
    constructor();
    initialize(): Promise<void>;
    connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean>;
    disconnect(deviceId: string): Promise<boolean>;
    sendCommand(deviceId: string, command: DeviceCommand | TcpSocketCommand): Promise<any>;
    readData(deviceId: string, parameters?: any): Promise<any>;
    private isDeviceConnected;
    private setupSocketEventListeners;
    private handleReceivedData;
    private parseDataPackets;
    private sendInitCommands;
    private scheduleReconnect;
    private emitConnectionEvent;
    private startGeneratingMockData;
    private stopGeneratingMockData;
}
export {};
//# sourceMappingURL=tcp-socket-adapter.d.ts.map