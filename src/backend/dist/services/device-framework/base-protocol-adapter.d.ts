import { EventEmitter } from 'events';
import { DeviceProtocolAdapter, DeviceConnectionConfig, DeviceConnectionState, DeviceConnectionEventType, DeviceConnectionEvent } from './types.js';
import { DeviceCommand } from '../../models/device.model.js';
export declare abstract class BaseProtocolAdapter implements DeviceProtocolAdapter {
    readonly id: string;
    readonly name: string;
    readonly protocolName: string;
    readonly supportedConnectionTypes: string[];
    protected eventEmitter: EventEmitter;
    protected connectionStates: Map<string, DeviceConnectionState>;
    constructor(id: string, name: string, protocolName: string, supportedConnectionTypes: string[]);
    initialize(): Promise<void>;
    abstract connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean>;
    abstract disconnect(deviceId: string): Promise<boolean>;
    abstract sendCommand(deviceId: string, command: DeviceCommand): Promise<any>;
    abstract readData(deviceId: string, parameters?: any): Promise<any>;
    getConnectionState(deviceId: string): DeviceConnectionState;
    on(event: DeviceConnectionEventType, callback: (event: DeviceConnectionEvent) => void): void;
    off(event: DeviceConnectionEventType, callback: (event: DeviceConnectionEvent) => void): void;
    supportsFeature(featureName: string): boolean;
    getProtocolSpecificMethod(methodName: string): Function | null;
    protected createDefaultConnectionState(): DeviceConnectionState;
    protected initializeConnectionState(deviceId: string): void;
    protected updateConnectionState(deviceId: string, updates: Partial<DeviceConnectionState>): void;
    protected recordStatistics(deviceId: string, updates: Partial<DeviceConnectionState['statistics']>): void;
    protected recordError(deviceId: string, errorMessage: string): void;
    protected emitConnectedEvent(deviceId: string): void;
    protected emitDisconnectedEvent(deviceId: string): void;
    protected emitErrorEvent(deviceId: string, error: Error): void;
    protected emitDataReceivedEvent(deviceId: string, data: any): void;
    protected emitStateChangedEvent(deviceId: string, state: any): void;
    protected emitCommandSentEvent(deviceId: string, command: DeviceCommand): void;
    protected emitCommandResultEvent(deviceId: string, command: DeviceCommand, result: any): void;
}
//# sourceMappingURL=base-protocol-adapter.d.ts.map