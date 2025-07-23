import { Device, DeviceDataPoint, DeviceCommand } from '../../models/device.model.js';
import { DeviceManager, DeviceProtocolAdapter, DeviceConnectionConfig, DeviceConnectionState } from './types.js';
export declare class DeviceManagerImpl implements DeviceManager {
    private devices;
    private adapters;
    private deviceAdapterMap;
    private deviceConnections;
    private eventEmitter;
    constructor();
    initialize(): Promise<void>;
    setDeviceConnectionConfig(deviceId: string, config: DeviceConnectionConfig): Promise<void>;
    private getAdaptersByConnectionType;
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
    setDeviceAdapter(deviceId: string, adapterId: string, connectionConfig: DeviceConnectionConfig): Promise<void>;
    private handleAdapterEvent;
    private handleDeviceConnected;
    private handleDeviceDisconnected;
    private handleDeviceError;
}
//# sourceMappingURL=device-manager.d.ts.map