import * as net from 'net';
import { DeviceConnectionEventType } from '../types.js';
import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
export class TcpSocketDeviceAdapter extends BaseProtocolAdapter {
    constructor() {
        super('tcp-socket-adapter', 'TCP/Socket设备适配器', 'TCP/Socket', ['tcp-socket']);
        this.socketConnections = new Map();
        this.deviceConfigs = new Map();
        this.reconnectTimers = new Map();
        this.dataBuffers = new Map();
        this.commandCallbacks = new Map();
        this.dataIntervals = new Map();
    }
    async initialize() {
        await super.initialize();
        console.log('初始化TCP/Socket设备适配器');
    }
    async connect(deviceId, config) {
        if (config.connectionType !== 'tcp-socket') {
            throw new Error(`不支持的连接类型: ${config.connectionType}`);
        }
        const socketConfig = config;
        this.deviceConfigs.set(deviceId, socketConfig);
        if (!this.connectionStates.has(deviceId)) {
            this.connectionStates.set(deviceId, this.createDefaultConnectionState());
        }
        const connectionState = this.connectionStates.get(deviceId);
        connectionState.connectionAttempts++;
        if (this.socketConnections.has(deviceId)) {
            await this.disconnect(deviceId);
        }
        try {
            const socket = new net.Socket();
            const { host, port, timeout = 5000, keepAlive = true } = socketConfig;
            socket.setTimeout(timeout);
            if (keepAlive) {
                socket.setKeepAlive(true, 60000);
            }
            this.setupSocketEventListeners(deviceId, socket);
            return new Promise((resolve, reject) => {
                const onConnect = () => {
                    connectionState.isConnected = true;
                    connectionState.lastConnected = new Date().toISOString();
                    this.socketConnections.set(deviceId, socket);
                    socket.removeListener('connect', onConnect);
                    socket.removeListener('error', onError);
                    socket.removeListener('timeout', onTimeout);
                    this.sendInitCommands(deviceId, socketConfig.initCommands);
                    this.emitConnectionEvent(deviceId, DeviceConnectionEventType.CONNECTED, {
                        message: `设备 ${deviceId} 已连接到 ${host}:${port}`
                    });
                    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
                        this.startGeneratingMockData(deviceId);
                    }
                    resolve(true);
                };
                const onError = (err) => {
                    connectionState.isConnected = false;
                    connectionState.lastDisconnected = new Date().toISOString();
                    connectionState.errors.push({
                        message: `连接错误: ${err.message}`,
                        timestamp: new Date().toISOString()
                    });
                    socket.removeListener('connect', onConnect);
                    socket.removeListener('error', onError);
                    socket.removeListener('timeout', onTimeout);
                    this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
                        error: err,
                        message: `设备 ${deviceId} 连接错误: ${err.message}`
                    });
                    if (socketConfig.autoReconnect) {
                        this.scheduleReconnect(deviceId);
                    }
                    reject(err);
                };
                const onTimeout = () => {
                    connectionState.errors.push({
                        message: '连接超时',
                        timestamp: new Date().toISOString()
                    });
                    socket.removeListener('connect', onConnect);
                    socket.removeListener('error', onError);
                    socket.removeListener('timeout', onTimeout);
                    this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
                        message: `设备 ${deviceId} 连接超时`
                    });
                    socket.destroy();
                    if (socketConfig.autoReconnect) {
                        this.scheduleReconnect(deviceId);
                    }
                    reject(new Error('连接超时'));
                };
                socket.once('connect', onConnect);
                socket.once('error', onError);
                socket.once('timeout', onTimeout);
                socket.connect(port, host);
            });
        }
        catch (error) {
            connectionState.isConnected = false;
            connectionState.lastDisconnected = new Date().toISOString();
            connectionState.errors.push({
                message: `连接异常: ${error.message}`,
                timestamp: new Date().toISOString()
            });
            this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
                error,
                message: `设备 ${deviceId} 连接异常: ${error.message}`
            });
            const socketConfig = this.deviceConfigs.get(deviceId);
            if (socketConfig?.autoReconnect) {
                this.scheduleReconnect(deviceId);
            }
            throw error;
        }
    }
    async disconnect(deviceId) {
        if (this.reconnectTimers.has(deviceId)) {
            clearTimeout(this.reconnectTimers.get(deviceId));
            this.reconnectTimers.delete(deviceId);
        }
        this.stopGeneratingMockData(deviceId);
        const socket = this.socketConnections.get(deviceId);
        if (!socket) {
            return false;
        }
        if (this.commandCallbacks.has(deviceId)) {
            const callbacks = this.commandCallbacks.get(deviceId);
            callbacks.forEach(callback => {
                clearTimeout(callback.timeout);
                callback.reject(new Error('设备断开连接'));
            });
            this.commandCallbacks.delete(deviceId);
        }
        const connectionState = this.connectionStates.get(deviceId);
        if (connectionState) {
            connectionState.isConnected = false;
            connectionState.lastDisconnected = new Date().toISOString();
        }
        socket.removeAllListeners();
        return new Promise((resolve) => {
            socket.end(() => {
                socket.destroy();
                this.socketConnections.delete(deviceId);
                this.emitConnectionEvent(deviceId, DeviceConnectionEventType.DISCONNECTED, {
                    message: `设备 ${deviceId} 已断开连接`
                });
                resolve(true);
            });
        });
    }
    async sendCommand(deviceId, command) {
        if (!this.isDeviceConnected(deviceId)) {
            throw new Error(`设备 ${deviceId} 未连接`);
        }
        const socket = this.socketConnections.get(deviceId);
        const config = this.deviceConfigs.get(deviceId);
        let data;
        const tcpCommand = command;
        if (tcpCommand.binary && Buffer.isBuffer(tcpCommand.data)) {
            data = tcpCommand.data;
        }
        else if (typeof tcpCommand.data === 'string') {
            data = Buffer.from(tcpCommand.data, tcpCommand.encoding || config.encoding || 'utf8');
        }
        else if (Buffer.isBuffer(tcpCommand.data)) {
            data = tcpCommand.data;
        }
        else {
            data = Buffer.from(JSON.stringify(tcpCommand.data), tcpCommand.encoding || config.encoding || 'utf8');
        }
        const connectionState = this.connectionStates.get(deviceId);
        connectionState.statistics.dataSent += data.length;
        connectionState.statistics.commandsSent++;
        return new Promise((resolve, reject) => {
            socket.write(data, (err) => {
                if (err) {
                    connectionState.errors.push({
                        message: `发送命令错误: ${err.message}`,
                        timestamp: new Date().toISOString()
                    });
                    this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
                        error: err,
                        message: `设备 ${deviceId} 发送命令错误: ${err.message}`
                    });
                    reject(err);
                    return;
                }
                const tcpCommand = command;
                if (tcpCommand.expectResponse) {
                    if (!this.commandCallbacks.has(deviceId)) {
                        this.commandCallbacks.set(deviceId, []);
                    }
                    const timeout = setTimeout(() => {
                        const callbacks = this.commandCallbacks.get(deviceId);
                        const index = callbacks.findIndex(cb => cb.resolve === resolver);
                        if (index !== -1) {
                            callbacks.splice(index, 1);
                        }
                        connectionState.errors.push({
                            message: '命令响应超时',
                            timestamp: new Date().toISOString()
                        });
                        reject(new Error('命令响应超时'));
                    }, tcpCommand.responseTimeout || 5000);
                    const resolver = (response) => {
                        resolve(response);
                    };
                    this.commandCallbacks.get(deviceId).push({
                        resolve: resolver,
                        reject,
                        timeout
                    });
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    async readData(deviceId, parameters) {
        if (!this.isDeviceConnected(deviceId)) {
            throw new Error(`设备 ${deviceId} 未连接`);
        }
        const command = {
            data: parameters?.data || '',
            expectResponse: true,
            responseTimeout: parameters?.timeout || 5000,
            encoding: parameters?.encoding,
            binary: parameters?.binary
        };
        return this.sendCommand(deviceId, command);
    }
    isDeviceConnected(deviceId) {
        return this.socketConnections.has(deviceId) &&
            this.connectionStates.has(deviceId) &&
            this.connectionStates.get(deviceId).isConnected;
    }
    setupSocketEventListeners(deviceId, socket) {
        const config = this.deviceConfigs.get(deviceId);
        const connectionState = this.connectionStates.get(deviceId);
        socket.on('data', (data) => {
            connectionState.statistics.dataReceived += data.length;
            connectionState.statistics.responsesReceived++;
            this.handleReceivedData(deviceId, data);
        });
        socket.on('error', (err) => {
            connectionState.isConnected = false;
            connectionState.lastDisconnected = new Date().toISOString();
            connectionState.errors.push({
                message: `Socket错误: ${err.message}`,
                timestamp: new Date().toISOString()
            });
            this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
                error: err,
                message: `设备 ${deviceId} Socket错误: ${err.message}`
            });
            socket.destroy();
            this.socketConnections.delete(deviceId);
            if (config.autoReconnect) {
                this.scheduleReconnect(deviceId);
            }
        });
        socket.on('timeout', () => {
            connectionState.errors.push({
                message: 'Socket超时',
                timestamp: new Date().toISOString()
            });
            this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
                message: `设备 ${deviceId} Socket超时`
            });
            socket.destroy();
            this.socketConnections.delete(deviceId);
            connectionState.isConnected = false;
            connectionState.lastDisconnected = new Date().toISOString();
            if (config.autoReconnect) {
                this.scheduleReconnect(deviceId);
            }
        });
        socket.on('close', (hadError) => {
            if (!hadError) {
                connectionState.isConnected = false;
                connectionState.lastDisconnected = new Date().toISOString();
                this.emitConnectionEvent(deviceId, DeviceConnectionEventType.DISCONNECTED, {
                    message: `设备 ${deviceId} Socket关闭`
                });
            }
            this.socketConnections.delete(deviceId);
            if (config.autoReconnect && !hadError) {
                this.scheduleReconnect(deviceId);
            }
        });
    }
    handleReceivedData(deviceId, data) {
        const config = this.deviceConfigs.get(deviceId);
        if (!this.dataBuffers.has(deviceId)) {
            this.dataBuffers.set(deviceId, []);
        }
        this.dataBuffers.get(deviceId).push(data);
        let processedData;
        if (config.delimiter) {
            processedData = this.parseDataPackets(deviceId);
        }
        else {
            processedData = Buffer.concat(this.dataBuffers.get(deviceId));
            this.dataBuffers.set(deviceId, []);
        }
        if (processedData && (Buffer.isBuffer(processedData) && processedData.length > 0) ||
            (typeof processedData === 'string' && processedData.length > 0)) {
            let finalData;
            if (config.binary) {
                finalData = processedData;
            }
            else {
                try {
                    const textData = Buffer.isBuffer(processedData)
                        ? processedData.toString(config.encoding || 'utf8')
                        : processedData;
                    try {
                        finalData = JSON.parse(textData);
                    }
                    catch {
                        finalData = textData;
                    }
                }
                catch (err) {
                    finalData = processedData;
                }
            }
            this.emitConnectionEvent(deviceId, DeviceConnectionEventType.DATA_RECEIVED, {
                data: finalData,
                timestamp: new Date().toISOString()
            });
            if (this.commandCallbacks.has(deviceId) && this.commandCallbacks.get(deviceId).length > 0) {
                const callback = this.commandCallbacks.get(deviceId).shift();
                clearTimeout(callback.timeout);
                callback.resolve(finalData);
            }
        }
    }
    parseDataPackets(deviceId) {
        const config = this.deviceConfigs.get(deviceId);
        const buffers = this.dataBuffers.get(deviceId);
        if (!buffers || buffers.length === 0 || !config.delimiter) {
            return null;
        }
        const combinedBuffer = Buffer.concat(buffers);
        const delimiter = typeof config.delimiter === 'string'
            ? Buffer.from(config.delimiter, config.encoding || 'utf8')
            : config.delimiter;
        const delimiterIndex = combinedBuffer.indexOf(delimiter);
        if (delimiterIndex === -1) {
            return null;
        }
        const packet = combinedBuffer.slice(0, delimiterIndex);
        this.dataBuffers.set(deviceId, [combinedBuffer.slice(delimiterIndex + delimiter.length)]);
        return packet;
    }
    async sendInitCommands(deviceId, initCommands) {
        if (!initCommands || initCommands.length === 0) {
            return;
        }
        for (const cmd of initCommands) {
            try {
                const command = {
                    data: cmd.data,
                    expectResponse: cmd.waitForResponse || false,
                    responseTimeout: cmd.responseTimeout || 5000,
                    encoding: cmd.encoding
                };
                await this.sendCommand(deviceId, command);
                if (cmd.delay) {
                    await new Promise(resolve => setTimeout(resolve, cmd.delay));
                }
            }
            catch (err) {
                console.error(`设备 ${deviceId} 初始化命令失败:`, err);
            }
        }
    }
    scheduleReconnect(deviceId) {
        if (this.reconnectTimers.has(deviceId)) {
            clearTimeout(this.reconnectTimers.get(deviceId));
            this.reconnectTimers.delete(deviceId);
        }
        const config = this.deviceConfigs.get(deviceId);
        if (!config || !config.autoReconnect) {
            return;
        }
        const connectionState = this.connectionStates.get(deviceId);
        if (config.maxReconnectAttempts &&
            connectionState.connectionAttempts >= config.maxReconnectAttempts) {
            this.emitConnectionEvent(deviceId, DeviceConnectionEventType.ERROR, {
                message: `设备 ${deviceId} 重连失败: 已达到最大重连次数 ${config.maxReconnectAttempts}`
            });
            return;
        }
        const reconnectInterval = config.reconnectInterval || 5000;
        const timer = setTimeout(async () => {
            try {
                console.log(`尝试重新连接设备 ${deviceId}...`);
                await this.connect(deviceId, config);
            }
            catch (err) {
                console.error(`设备 ${deviceId} 重连失败:`, err);
            }
        }, reconnectInterval);
        this.reconnectTimers.set(deviceId, timer);
    }
    emitConnectionEvent(deviceId, eventType, data) {
        const event = {
            adapterId: this.id,
            deviceId,
            eventType,
            timestamp: new Date().toISOString(),
            ...data
        };
        this.eventEmitter.emit(eventType, event);
    }
    startGeneratingMockData(deviceId) {
        this.stopGeneratingMockData(deviceId);
        const interval = setInterval(() => {
            if (!this.isDeviceConnected(deviceId)) {
                this.stopGeneratingMockData(deviceId);
                return;
            }
            const mockData = {
                timestamp: new Date().toISOString(),
                temperature: 20 + Math.random() * 10,
                humidity: 40 + Math.random() * 20,
                pressure: 1000 + Math.random() * 50,
                deviceId
            };
            this.emitConnectionEvent(deviceId, DeviceConnectionEventType.DATA_RECEIVED, {
                data: mockData,
                timestamp: mockData.timestamp,
                mock: true
            });
        }, 5000);
        this.dataIntervals.set(deviceId, interval);
    }
    stopGeneratingMockData(deviceId) {
        if (this.dataIntervals.has(deviceId)) {
            clearInterval(this.dataIntervals.get(deviceId));
            this.dataIntervals.delete(deviceId);
        }
    }
}
//# sourceMappingURL=tcp-socket-adapter.js.map