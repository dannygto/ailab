import { Device } from '../../models/device.model.js';
import { DeviceManager, DeviceConnectionConfig, DeviceDiscoveryService } from './types.js';
import { DiscoveryResult } from './device-discovery-service.js';
export interface DeviceRegistrationOptions {
    autoConnect?: boolean;
    validateDevice?: boolean;
    overwriteExisting?: boolean;
    connectionConfig?: DeviceConnectionConfig;
    metadata?: Record<string, any>;
}
export interface DeviceValidationResult {
    isValid: boolean;
    reasons?: string[];
    warnings?: string[];
    recommendations?: string[];
}
export declare class DeviceRegistrationService {
    private deviceManager;
    private discoveryService;
    private eventEmitter;
    private registeredDevices;
    private pendingRegistrations;
    private autoDiscoveryInterval;
    private validationResults;
    constructor(deviceManager: DeviceManager);
    setDiscoveryService(discoveryService: DeviceDiscoveryService): void;
    registerDevice(device: Device, options?: DeviceRegistrationOptions): Promise<string>;
    unregisterDevice(deviceId: string): Promise<boolean>;
    getRegisteredDevices(): Promise<Device[]>;
    getDeviceDetails(deviceId: string): Promise<Device | null>;
    updateDeviceDetails(deviceId: string, updates: Partial<Device>): Promise<Device>;
    validateDevice(device: Device): Promise<DeviceValidationResult>;
    registerDiscoveredDevices(discoveryResults: DiscoveryResult[], options?: DeviceRegistrationOptions): Promise<string[]>;
    startAutoDiscoveryAndRegistration(interval?: number, options?: DeviceRegistrationOptions): Promise<void>;
    stopAutoDiscoveryAndRegistration(): Promise<void>;
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
    private setupDeviceManagerListeners;
    private setupDiscoveryServiceListeners;
    private convertDiscoveryResultToDevice;
}
//# sourceMappingURL=device-registration-service.d.ts.map