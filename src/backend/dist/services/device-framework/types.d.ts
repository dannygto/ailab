import { Device, DeviceDataPoint, DeviceCommand } from '../../models/device.model.js';
export interface DeviceConnectionConfig {
    connectionType: string;
    parameters: Record<string, any>;
    timeout?: number;
    retryStrategy?: {
        maxRetries: number;
        retryInterval: number;
        exponentialBackoff?: boolean;
    };
    metadata?: Record<string, any>;
}
export declare enum DeviceConnectionEventType {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    ERROR = "error",
    DATA_RECEIVED = "data-received",
    STATE_CHANGED = "state-changed",
    COMMAND_SENT = "command-sent",
    COMMAND_RESULT = "command-result"
}
export interface DeviceConnectionEvent {
    type: DeviceConnectionEventType;
    deviceId: string;
    timestamp: string;
    data?: any;
    error?: Error;
}
export interface DeviceConnectionState {
    isConnected: boolean;
    lastConnected?: string;
    lastDisconnected?: string;
    connectionAttempts: number;
    errors: Array<{
        message: string;
        timestamp: string;
    }>;
    statistics: {
        dataSent: number;
        dataReceived: number;
        commandsSent: number;
        responsesReceived: number;
    };
}
export interface DeviceProtocolAdapter {
    readonly id: string;
    readonly name: string;
    readonly protocolName: string;
    readonly supportedConnectionTypes: string[];
    initialize(): Promise<void>;
    connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean>;
    disconnect(deviceId: string): Promise<boolean>;
    getConnectionState(deviceId: string): DeviceConnectionState;
    sendCommand(deviceId: string, command: DeviceCommand): Promise<any>;
    readData(deviceId: string, parameters?: any): Promise<any>;
    on(event: DeviceConnectionEventType, callback: (event: DeviceConnectionEvent) => void): void;
    off(event: DeviceConnectionEventType, callback: (event: DeviceConnectionEvent) => void): void;
    supportsFeature(featureName: string): boolean;
    getProtocolSpecificMethod(methodName: string): Function | null;
}
export interface DeviceDataConverter<RawDataType = any, StandardDataType = DeviceDataPoint> {
    readonly sourceFormat: string;
    readonly targetFormat: string;
    convert(rawData: RawDataType, deviceContext?: Device): StandardDataType | StandardDataType[];
    validateData(data: RawDataType): boolean;
    getMetadata(rawData: RawDataType): Record<string, any>;
}
export interface DeviceDiscoveryService {
    readonly id: string;
    readonly name: string;
    readonly supportedConnectionTypes: string[];
    startDiscovery(options?: Record<string, any>): Promise<void>;
    stopDiscovery(): Promise<void>;
    getDiscoveredDevices(): Device[];
    on(event: 'device-discovered' | 'discovery-complete' | 'error', callback: (data: any) => void): void;
    off(event: 'device-discovered' | 'discovery-complete' | 'error', callback: (data: any) => void): void;
}
export interface DeviceManager {
    registerDevice(device: Device): Promise<string>;
    unregisterDevice(deviceId: string): Promise<boolean>;
    getDevices(filter?: Record<string, any>): Promise<Device[]>;
    getDeviceById(deviceId: string): Promise<Device | null>;
    updateDevice(deviceId: string, updates: Partial<Device>): Promise<Device>;
    registerAdapter(adapter: DeviceProtocolAdapter): void;
    unregisterAdapter(adapterId: string): boolean;
    getAdapter(adapterId: string): DeviceProtocolAdapter | null;
    getAdapters(filter?: Record<string, any>): DeviceProtocolAdapter[];
    connectDevice(deviceId: string): Promise<boolean>;
    disconnectDevice(deviceId: string): Promise<boolean>;
    getDeviceConnectionState(deviceId: string): DeviceConnectionState;
    sendCommand(deviceId: string, command: DeviceCommand): Promise<any>;
    getDeviceData(deviceId: string, options?: Record<string, any>): Promise<DeviceDataPoint[]>;
    on(eventType: string, callback: (event: any) => void): void;
    off(eventType: string, callback: (event: any) => void): void;
}
//# sourceMappingURL=types.d.ts.map