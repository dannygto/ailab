import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
import { DeviceConnectionConfig } from '../types.js';
import { DeviceCommand } from '../../../models/device.model.js';
export interface ModbusDeviceConnectionConfig extends DeviceConnectionConfig {
    mode: 'tcp' | 'rtu';
    timeout?: number;
    unitId?: number;
    retryCount?: number;
    autoReconnect?: boolean;
    reconnectInterval?: number;
    debug?: boolean;
    host?: string;
    port?: number;
    serialPort?: string;
    baudRate?: number;
    dataBits?: 7 | 8;
    stopBits?: 1 | 2;
    parity?: 'none' | 'even' | 'odd' | 'mark' | 'space';
    registerMap?: {
        [paramName: string]: {
            address: number;
            registerType: 'coil' | 'discrete' | 'input' | 'holding';
            dataType?: 'boolean' | 'int16' | 'uint16' | 'int32' | 'uint32' | 'float' | 'double' | 'string';
            length?: number;
            scaling?: number;
            byteOrder?: 'big-endian' | 'little-endian';
            wordOrder?: 'big-endian' | 'little-endian';
            accessMode?: 'read' | 'write' | 'read-write';
        };
    };
}
export declare class ModbusDeviceAdapter extends BaseProtocolAdapter {
    private modbusConnections;
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
    private readCoils;
    private readDiscreteInputs;
    private readHoldingRegisters;
    private readInputRegisters;
    private writeCoil;
    private writeCoils;
    private writeRegister;
    private writeRegisters;
    private createTcpConnection;
    private createRtuConnection;
    private processCommand;
    private handleReadCommand;
    private handleWriteCommand;
    private handleScanCommand;
    private simulateConnect;
    private simulateDisconnect;
    private setupReconnectMonitor;
    private setupDataPolling;
}
//# sourceMappingURL=modbus-adapter.d.ts.map