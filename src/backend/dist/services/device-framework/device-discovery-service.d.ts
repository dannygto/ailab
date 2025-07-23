import { Device } from '../../models/device.model.js';
import { DeviceDiscoveryService } from './types.js';
export declare enum NetworkDiscoveryProtocol {
    MDNS = "mdns",
    SSDP = "ssdp",
    WS_DISCOVERY = "ws-discovery",
    BLUETOOTH = "bluetooth",
    MODBUS_SCAN = "modbus-scan"
}
export interface DiscoveryOptions {
    protocols?: NetworkDiscoveryProtocol[];
    timeout?: number;
    filterCriteria?: {
        deviceTypes?: string[];
        manufacturers?: string[];
        models?: string[];
    };
    scanConfig?: {
        mdns?: {
            serviceTypes?: string[];
            domains?: string[];
        };
        ssdp?: {
            deviceTypes?: string[];
            searchTargets?: string[];
        };
        modbus?: {
            startAddress?: number;
            endAddress?: number;
            ports?: number[];
            networkRanges?: string[];
        };
        bluetooth?: {
            serviceUUIDs?: string[];
            scanMode?: 'active' | 'passive';
        };
        network?: {
            ports?: number[];
            protocols?: ('tcp' | 'udp')[];
            interfaces?: string[];
            timeout?: number;
        };
    };
}
export interface DiscoveryResult {
    protocol: NetworkDiscoveryProtocol;
    deviceInfo: {
        id?: string;
        name?: string;
        type?: string;
        model?: string;
        manufacturer?: string;
        address?: string;
        port?: number;
        services?: {
            type: string;
            port?: number;
            path?: string;
        }[];
        metadata?: Record<string, any>;
    };
    rawData: any;
    timestamp: string;
}
export declare class DeviceDiscoveryServiceImpl implements DeviceDiscoveryService {
    readonly id: string;
    readonly name: string;
    readonly supportedConnectionTypes: string[];
    private eventEmitter;
    private discoveryInProgress;
    private discoveryTimeout;
    private discoveredDevices;
    private discoveryResults;
    private discoveryProtocols;
    constructor(id?: string, name?: string);
    startDiscovery(options?: DiscoveryOptions): Promise<void>;
    stopDiscovery(): Promise<void>;
    getDiscoveredDevices(): Device[];
    getDiscoveryResults(): DiscoveryResult[];
    on(event: 'device-discovered' | 'discovery-complete' | 'error', callback: (data: any) => void): void;
    off(event: 'device-discovered' | 'discovery-complete' | 'error', callback: (data: any) => void): void;
    private startProtocolDiscovery;
    private stopProtocolDiscovery;
    private handleDiscoveryResult;
    private convertToDevice;
    private startMdnsDiscovery;
    private stopMdnsDiscovery;
    private startSsdpDiscovery;
    private stopSsdpDiscovery;
    private startModbusScan;
    private stopModbusScan;
    private startBluetoothDiscovery;
    private stopBluetoothDiscovery;
    private startWsDiscovery;
    private stopWsDiscovery;
}
//# sourceMappingURL=device-discovery-service.d.ts.map