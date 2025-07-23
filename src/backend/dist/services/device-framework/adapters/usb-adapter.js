import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
export class USBDeviceAdapter extends BaseProtocolAdapter {
    constructor() {
        super('usb-adapter', 'USB设备适配器', 'USB', ['usb', 'serial']);
        this.usbConnections = new Map();
        this.deviceConfigs = new Map();
        this.reconnectTimers = new Map();
        this.dataIntervals = new Map();
    }
    async initialize() {
        await super.initialize();
        console.log('初始化USB设备适配器');
    }
    async connect(deviceId, config) {
        try {
            if (config.connectionType !== 'usb' && config.connectionType !== 'serial') {
                throw new Error(`不支持的连接类型: ${config.connectionType}`);
            }
            if (!config.parameters) {
                throw new Error('USB连接配置缺少parameters对象');
            }
            const params = config.parameters;
            const usbConfig = {
                ...config,
                vendorId: params.vendorId,
                productId: params.productId,
                serialNumber: params.serialNumber,
                interfaceNumber: params.interfaceNumber,
                endpointIn: params.endpointIn,
                endpointOut: params.endpointOut,
                baudRate: params.baudRate,
                dataBits: params.dataBits,
                stopBits: params.stopBits,
                parity: params.parity,
                flowControl: params.flowControl,
                autoOpen: params.autoOpen
            };
            if (!usbConfig.vendorId || !usbConfig.productId) {
                throw new Error('USB连接配置缺少vendorId或productId');
            }
            this.initializeConnectionState(deviceId);
            this.deviceConfigs.set(deviceId, usbConfig);
            console.log(`正在连接USB设备: ${deviceId}，供应商ID: 0x${usbConfig.vendorId.toString(16)}，产品ID: 0x${usbConfig.productId.toString(16)}`);
            const connection = {
                deviceId,
                vendorId: usbConfig.vendorId,
                productId: usbConfig.productId,
                isOpen: true,
                buffer: Buffer.alloc(0),
                write: (data) => {
                    console.log(`USB设备 ${deviceId} 写入数据: ${data.toString('hex')}`);
                    return Promise.resolve(data.length);
                },
                read: () => {
                    const data = Buffer.from(`模拟数据从设备 ${deviceId} 读取 - ${new Date().toISOString()}`);
                    console.log(`USB设备 ${deviceId} 读取数据: ${data.toString()}`);
                    return Promise.resolve(data);
                },
                close: () => {
                    console.log(`关闭USB设备连接: ${deviceId}`);
                    return Promise.resolve();
                }
            };
            this.usbConnections.set(deviceId, connection);
            this.updateConnectionState(deviceId, {
                isConnected: true,
                lastConnected: new Date().toISOString(),
                connectionAttempts: this.getConnectionState(deviceId).connectionAttempts + 1
            });
            this.emitConnectedEvent(deviceId);
            this.startDeviceDataSimulation(deviceId);
            this.simulateConnectionStabilityIssues(deviceId);
            return true;
        }
        catch (error) {
            console.error(`USB设备连接错误: ${error.message}`);
            this.recordError(deviceId, error.message);
            this.updateConnectionState(deviceId, {
                isConnected: false,
                connectionAttempts: this.getConnectionState(deviceId).connectionAttempts + 1
            });
            this.emitErrorEvent(deviceId, error);
            return false;
        }
    }
    async disconnect(deviceId) {
        try {
            const connection = this.usbConnections.get(deviceId);
            if (!connection) {
                return true;
            }
            this.stopDeviceDataSimulation(deviceId);
            if (this.reconnectTimers.has(deviceId)) {
                clearTimeout(this.reconnectTimers.get(deviceId));
                this.reconnectTimers.delete(deviceId);
            }
            await connection.close();
            this.usbConnections.delete(deviceId);
            this.updateConnectionState(deviceId, {
                isConnected: false,
                lastDisconnected: new Date().toISOString()
            });
            this.emitDisconnectedEvent(deviceId);
            return true;
        }
        catch (error) {
            console.error(`USB设备断开连接错误: ${error.message}`);
            this.recordError(deviceId, error.message);
            this.updateConnectionState(deviceId, { isConnected: false });
            this.usbConnections.delete(deviceId);
            this.emitErrorEvent(deviceId, error);
            return true;
        }
    }
    async sendCommand(deviceId, command) {
        try {
            const connection = this.usbConnections.get(deviceId);
            if (!connection || !connection.isOpen) {
                throw new Error(`设备 ${deviceId} 未连接`);
            }
            const commandBuffer = Buffer.from(JSON.stringify(command));
            const bytesSent = await connection.write(commandBuffer);
            this.recordStatistics(deviceId, {
                dataSent: this.getConnectionState(deviceId).statistics.dataSent + bytesSent,
                commandsSent: this.getConnectionState(deviceId).statistics.commandsSent + 1
            });
            this.emitCommandSentEvent(deviceId, command);
            const result = {
                status: 'success',
                commandId: command.id,
                timestamp: new Date().toISOString(),
                data: `Command ${command.command} executed successfully`
            };
            this.emitCommandResultEvent(deviceId, command, result);
            return result;
        }
        catch (error) {
            console.error(`USB设备命令错误: ${error.message}`);
            this.recordError(deviceId, error.message);
            this.emitErrorEvent(deviceId, error);
            throw error;
        }
    }
    async readData(deviceId, parameters) {
        try {
            const connection = this.usbConnections.get(deviceId);
            if (!connection || !connection.isOpen) {
                throw new Error(`设备 ${deviceId} 未连接`);
            }
            const data = await connection.read();
            this.recordStatistics(deviceId, {
                dataReceived: this.getConnectionState(deviceId).statistics.dataReceived + data.length,
                responsesReceived: this.getConnectionState(deviceId).statistics.responsesReceived + 1
            });
            const timestamp = new Date().toISOString();
            const dataPoints = [
                {
                    id: `dp-${Date.now()}`,
                    deviceId,
                    timestamp,
                    sensorType: 'temperature',
                    value: 20 + Math.random() * 10,
                    unit: '°C'
                },
                {
                    id: `dp-${Date.now() + 1}`,
                    deviceId,
                    timestamp,
                    sensorType: 'humidity',
                    value: 40 + Math.random() * 20,
                    unit: '%'
                },
                {
                    id: `dp-${Date.now() + 2}`,
                    deviceId,
                    timestamp,
                    sensorType: 'pressure',
                    value: 1000 + Math.random() * 50,
                    unit: 'hPa'
                }
            ];
            return dataPoints;
        }
        catch (error) {
            console.error(`USB设备读取错误: ${error.message}`);
            this.recordError(deviceId, error.message);
            this.emitErrorEvent(deviceId, error);
            throw error;
        }
    }
    supportsFeature(featureName) {
        const supportedFeatures = [
            'raw-data',
            'bulk-transfer',
            'control-transfer',
            'interrupt-transfer',
            'auto-reconnect',
            'hot-plug'
        ];
        return supportedFeatures.includes(featureName);
    }
    getProtocolSpecificMethod(methodName) {
        const methods = {
            resetDevice: (deviceId) => {
                console.log(`重置USB设备: ${deviceId}`);
                return Promise.resolve(true);
            },
            getDeviceDescriptor: (deviceId) => {
                const config = this.deviceConfigs.get(deviceId);
                if (!config) {
                    return null;
                }
                return {
                    vendorId: config.vendorId,
                    productId: config.productId,
                    serialNumber: config.serialNumber || 'unknown',
                    manufacturer: 'Simulated Manufacturer',
                    product: 'Simulated USB Device'
                };
            },
            controlTransfer: (deviceId, setup, data) => {
                console.log(`USB设备 ${deviceId} 控制传输: ${JSON.stringify(setup)}`);
                return Promise.resolve(Buffer.from('控制传输响应'));
            }
        };
        return methods[methodName] || null;
    }
    startDeviceDataSimulation(deviceId) {
        this.stopDeviceDataSimulation(deviceId);
        const interval = setInterval(() => {
            const data = {
                id: `data-${Date.now()}`,
                deviceId,
                timestamp: new Date().toISOString(),
                values: {
                    temperature: 20 + Math.random() * 10,
                    humidity: 40 + Math.random() * 20,
                    light: 200 + Math.random() * 800
                }
            };
            this.emitDataReceivedEvent(deviceId, data);
            const dataSize = JSON.stringify(data).length;
            this.recordStatistics(deviceId, {
                dataReceived: this.getConnectionState(deviceId).statistics.dataReceived + dataSize,
                responsesReceived: this.getConnectionState(deviceId).statistics.responsesReceived + 1
            });
        }, 5000);
        this.dataIntervals.set(deviceId, interval);
    }
    stopDeviceDataSimulation(deviceId) {
        if (this.dataIntervals.has(deviceId)) {
            clearInterval(this.dataIntervals.get(deviceId));
            this.dataIntervals.delete(deviceId);
        }
    }
    simulateConnectionStabilityIssues(deviceId) {
        const timeout = setTimeout(async () => {
            if (this.usbConnections.has(deviceId) && this.getConnectionState(deviceId).isConnected) {
                console.log(`模拟USB设备 ${deviceId} 连接不稳定`);
                const connection = this.usbConnections.get(deviceId);
                connection.isOpen = false;
                this.updateConnectionState(deviceId, {
                    isConnected: false,
                    lastDisconnected: new Date().toISOString()
                });
                this.emitDisconnectedEvent(deviceId);
                this.recordError(deviceId, '设备连接不稳定，连接已断开');
                this.emitErrorEvent(deviceId, new Error('设备连接不稳定，连接已断开'));
                console.log(`尝试重新连接USB设备 ${deviceId}`);
                setTimeout(async () => {
                    try {
                        connection.isOpen = true;
                        this.updateConnectionState(deviceId, {
                            isConnected: true,
                            lastConnected: new Date().toISOString(),
                            connectionAttempts: this.getConnectionState(deviceId).connectionAttempts + 1
                        });
                        this.emitConnectedEvent(deviceId);
                        console.log(`USB设备 ${deviceId} 已重新连接`);
                        this.simulateConnectionStabilityIssues(deviceId);
                    }
                    catch (error) {
                        console.error(`USB设备 ${deviceId} 重新连接失败: ${error.message}`);
                    }
                }, 3000);
            }
        }, Math.random() * 60000 + 30000);
        this.reconnectTimers.set(deviceId, timeout);
    }
}
//# sourceMappingURL=usb-adapter.js.map