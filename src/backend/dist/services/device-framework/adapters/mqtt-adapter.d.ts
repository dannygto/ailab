import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
import { DeviceConnectionConfig } from '../types.js';
import { DeviceCommand } from '../../../models/device.model.js';
export interface MQTTDeviceConnectionConfig extends DeviceConnectionConfig {
    brokerUrl: string;
    clientId: string;
    username?: string;
    password?: string;
    baseTopic: string;
    commandTopic?: string;
    dataTopic?: string;
    statusTopic?: string;
    qos?: 0 | 1 | 2;
    connectTimeout?: number;
    reconnectPeriod?: number;
    keepalive?: number;
    clean?: boolean;
    will?: {
        topic: string;
        payload: string;
        qos?: 0 | 1 | 2;
        retain?: boolean;
    };
}
export declare class MQTTDeviceAdapter extends BaseProtocolAdapter {
    private mqttClients;
    private deviceConfigs;
    private dataIntervals;
    constructor();
    initialize(): Promise<void>;
    connect(deviceId: string, config: DeviceConnectionConfig): Promise<boolean>;
    disconnect(deviceId: string): Promise<boolean>;
    sendCommand(deviceId: string, command: DeviceCommand): Promise<any>;
    readData(deviceId: string, parameters?: any): Promise<any>;
    supportsFeature(featureName: string): boolean;
    getProtocolSpecificMethod(methodName: string): Function | null;
    private subscribeToDeviceTopics;
    private startDeviceDataSimulation;
    private stopDeviceDataSimulation;
}
//# sourceMappingURL=mqtt-adapter.d.ts.map