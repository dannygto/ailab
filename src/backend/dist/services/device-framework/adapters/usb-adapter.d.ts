import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
import { DeviceConnectionConfig } from '../types.js';
import { DeviceCommand } from '../../../models/device.model.js';
export interface USBDeviceConnectionConfig extends DeviceConnectionConfig {
    vendorId: number;
    productId: number;
    serialNumber?: string;
    interfaceNumber?: number;
    endpointIn?: number;
    endpointOut?: number;
    baudRate?: number;
    dataBits?: number;
    stopBits?: number;
    parity?: string;
    flowControl?: boolean;
    autoOpen?: boolean;
}
export declare class USBDeviceAdapter extends BaseProtocolAdapter {
    private usbConnections;
    private deviceConfigs;
    private reconnectTimers;
    private dataIntervals;
    constructor();
    initialize(): Promise<void>;
    connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean>;
    disconnect(deviceId: string): Promise<boolean>;
    sendCommand(deviceId: string, command: DeviceCommand): Promise<any>;
    readData(deviceId: string, parameters?: any): Promise<any>;
    supportsFeature(featureName: string): boolean;
    getProtocolSpecificMethod(methodName: string): Function | null;
    private startDeviceDataSimulation;
    private stopDeviceDataSimulation;
    private simulateConnectionStabilityIssues;
}
//# sourceMappingURL=usb-adapter.d.ts.map