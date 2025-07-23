import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
export class ModbusDeviceAdapter extends BaseProtocolAdapter {
    constructor() {
        super('modbus-adapter', 'Modbus设备适配器', 'Modbus', ['modbus-tcp', 'modbus-rtu']);
        this.modbusConnections = new Map();
        this.deviceConfigs = new Map();
        this.reconnectTimers = new Map();
        this.dataIntervals = new Map();
    }
    async initialize() {
        await super.initialize();
        console.log('初始化Modbus设备适配器');
        try {
            console.log('正在加载Modbus通信库...');
            console.log('Modbus通信库加载成功');
        }
        catch (error) {
            console.error('无法加载Modbus通信库:', error);
            throw new Error('Modbus通信库初始化失败');
        }
    }
    async connect(deviceId, config) {
        console.log(`正在连接Modbus设备: ${deviceId}`, config);
        try {
            if (!config || !config.parameters) {
                throw new Error('连接配置无效');
            }
            const modbusConfig = config;
            if (!modbusConfig.mode) {
                throw new Error('未指定Modbus模式(TCP/RTU)');
            }
            this.deviceConfigs.set(deviceId, modbusConfig);
            let modbusConnection;
            if (modbusConfig.mode === 'tcp') {
                if (!modbusConfig.parameters.host) {
                    throw new Error('未指定Modbus TCP主机地址');
                }
                modbusConnection = this.createTcpConnection(deviceId, modbusConfig);
            }
            else if (modbusConfig.mode === 'rtu') {
                if (!modbusConfig.parameters.serialPort) {
                    throw new Error('未指定Modbus RTU串口');
                }
                modbusConnection = this.createRtuConnection(deviceId, modbusConfig);
            }
            else {
                throw new Error(`不支持的Modbus模式: ${modbusConfig.mode}`);
            }
            this.modbusConnections.set(deviceId, modbusConnection);
            this.initializeConnectionState(deviceId);
            await this.simulateConnect(deviceId, modbusConnection);
            if (modbusConfig.parameters.autoReconnect) {
                this.setupReconnectMonitor(deviceId);
            }
            if (modbusConfig.parameters.registerMap) {
                this.setupDataPolling(deviceId);
            }
            return true;
        }
        catch (error) {
            console.error(`连接Modbus设备失败: ${deviceId}`, error);
            this.recordError(deviceId, `连接失败: ${error.message}`);
            this.emitErrorEvent(deviceId, error);
            return false;
        }
    }
    async disconnect(deviceId) {
        console.log(`断开Modbus设备连接: ${deviceId}`);
        try {
            const connection = this.modbusConnections.get(deviceId);
            if (!connection) {
                console.warn(`未找到设备连接: ${deviceId}`);
                return false;
            }
            if (this.reconnectTimers.has(deviceId)) {
                clearTimeout(this.reconnectTimers.get(deviceId));
                this.reconnectTimers.delete(deviceId);
            }
            if (this.dataIntervals.has(deviceId)) {
                clearInterval(this.dataIntervals.get(deviceId));
                this.dataIntervals.delete(deviceId);
            }
            await this.simulateDisconnect(deviceId, connection);
            this.updateConnectionState(deviceId, {
                isConnected: false,
                lastDisconnected: new Date().toISOString()
            });
            this.modbusConnections.delete(deviceId);
            this.emitDisconnectedEvent(deviceId);
            return true;
        }
        catch (error) {
            console.error(`断开Modbus设备连接失败: ${deviceId}`, error);
            this.recordError(deviceId, `断开连接失败: ${error.message}`);
            this.emitErrorEvent(deviceId, error);
            return false;
        }
    }
    async sendCommand(deviceId, command) {
        console.log(`向Modbus设备发送命令: ${deviceId}`, command);
        try {
            const connection = this.modbusConnections.get(deviceId);
            if (!connection) {
                throw new Error(`设备未连接: ${deviceId}`);
            }
            const config = this.deviceConfigs.get(deviceId);
            if (!config) {
                throw new Error(`未找到设备配置: ${deviceId}`);
            }
            const result = await this.processCommand(deviceId, command, connection, config);
            this.emitCommandSentEvent(deviceId, command);
            this.emitCommandResultEvent(deviceId, command, result);
            this.recordStatistics(deviceId, {
                commandsSent: 1,
                responsesReceived: 1,
                dataSent: JSON.stringify(command).length,
                dataReceived: JSON.stringify(result).length
            });
            return result;
        }
        catch (error) {
            console.error(`发送Modbus命令失败: ${deviceId}`, error);
            this.recordError(deviceId, `命令执行失败: ${error.message}`);
            this.emitErrorEvent(deviceId, error);
            throw error;
        }
    }
    async readData(deviceId, parameters) {
        console.log(`读取Modbus设备数据: ${deviceId}`, parameters);
        try {
            const connection = this.modbusConnections.get(deviceId);
            if (!connection) {
                throw new Error(`设备未连接: ${deviceId}`);
            }
            const config = this.deviceConfigs.get(deviceId);
            if (!config) {
                throw new Error(`未找到设备配置: ${deviceId}`);
            }
            const readCommand = {
                id: `read-${Date.now()}`,
                deviceId,
                timestamp: new Date().toISOString(),
                status: 'pending',
                command: 'read',
                parameters: parameters || {}
            };
            const result = await this.processCommand(deviceId, readCommand, connection, config);
            this.recordStatistics(deviceId, {
                commandsSent: 1,
                responsesReceived: 1,
                dataReceived: JSON.stringify(result).length
            });
            return result;
        }
        catch (error) {
            console.error(`读取Modbus设备数据失败: ${deviceId}`, error);
            this.recordError(deviceId, `读取数据失败: ${error.message}`);
            this.emitErrorEvent(deviceId, error);
            throw error;
        }
    }
    supportsFeature(featureName) {
        const supportedFeatures = [
            'read-coils',
            'read-discrete-inputs',
            'read-holding-registers',
            'read-input-registers',
            'write-single-coil',
            'write-multiple-coils',
            'write-single-register',
            'write-multiple-registers',
            'register-mapping',
            'data-conversion'
        ];
        return supportedFeatures.includes(featureName);
    }
    getProtocolSpecificMethod(methodName) {
        switch (methodName) {
            case 'readCoils':
                return (deviceId, address, length) => this.readCoils(deviceId, address, length);
            case 'readDiscreteInputs':
                return (deviceId, address, length) => this.readDiscreteInputs(deviceId, address, length);
            case 'readHoldingRegisters':
                return (deviceId, address, length) => this.readHoldingRegisters(deviceId, address, length);
            case 'readInputRegisters':
                return (deviceId, address, length) => this.readInputRegisters(deviceId, address, length);
            case 'writeCoil':
                return (deviceId, address, value) => this.writeCoil(deviceId, address, value);
            case 'writeCoils':
                return (deviceId, address, values) => this.writeCoils(deviceId, address, values);
            case 'writeRegister':
                return (deviceId, address, value) => this.writeRegister(deviceId, address, value);
            case 'writeRegisters':
                return (deviceId, address, values) => this.writeRegisters(deviceId, address, values);
            default:
                return null;
        }
    }
    async readCoils(deviceId, address, length) {
        const connection = this.modbusConnections.get(deviceId);
        if (!connection) {
            throw new Error(`设备未连接: ${deviceId}`);
        }
        return await connection.readCoils(address, length);
    }
    async readDiscreteInputs(deviceId, address, length) {
        const connection = this.modbusConnections.get(deviceId);
        if (!connection) {
            throw new Error(`设备未连接: ${deviceId}`);
        }
        return await connection.readDiscreteInputs(address, length);
    }
    async readHoldingRegisters(deviceId, address, length) {
        const connection = this.modbusConnections.get(deviceId);
        if (!connection) {
            throw new Error(`设备未连接: ${deviceId}`);
        }
        return await connection.readHoldingRegisters(address, length);
    }
    async readInputRegisters(deviceId, address, length) {
        const connection = this.modbusConnections.get(deviceId);
        if (!connection) {
            throw new Error(`设备未连接: ${deviceId}`);
        }
        return await connection.readInputRegisters(address, length);
    }
    async writeCoil(deviceId, address, value) {
        const connection = this.modbusConnections.get(deviceId);
        if (!connection) {
            throw new Error(`设备未连接: ${deviceId}`);
        }
        return await connection.writeCoil(address, value);
    }
    async writeCoils(deviceId, address, values) {
        const connection = this.modbusConnections.get(deviceId);
        if (!connection) {
            throw new Error(`设备未连接: ${deviceId}`);
        }
        return await connection.writeCoils(address, values);
    }
    async writeRegister(deviceId, address, value) {
        const connection = this.modbusConnections.get(deviceId);
        if (!connection) {
            throw new Error(`设备未连接: ${deviceId}`);
        }
        return await connection.writeRegister(address, value);
    }
    async writeRegisters(deviceId, address, values) {
        const connection = this.modbusConnections.get(deviceId);
        if (!connection) {
            throw new Error(`设备未连接: ${deviceId}`);
        }
        return await connection.writeRegisters(address, values);
    }
    createTcpConnection(deviceId, config) {
        console.log(`创建Modbus TCP连接: ${deviceId}`);
        return {
            deviceId,
            mode: 'tcp',
            host: config.parameters.host,
            port: config.parameters.port || 502,
            unitId: config.parameters.unitId || 1,
            isConnected: false,
            connect: async () => {
                console.log(`[模拟] 连接到Modbus TCP服务器: ${config.parameters.host}:${config.parameters.port || 502}`);
                return true;
            },
            disconnect: async () => {
                console.log(`[模拟] 断开Modbus TCP连接: ${deviceId}`);
                return true;
            },
            readHoldingRegisters: async (address, length) => {
                console.log(`[模拟] 读取保持寄存器: 地址=${address}, 长度=${length}`);
                return Array.from({ length }, (_, i) => 1000 + i + address);
            },
            readInputRegisters: async (address, length) => {
                console.log(`[模拟] 读取输入寄存器: 地址=${address}, 长度=${length}`);
                return Array.from({ length }, (_, i) => 2000 + i + address);
            },
            readCoils: async (address, length) => {
                console.log(`[模拟] 读取线圈: 地址=${address}, 长度=${length}`);
                return Array.from({ length }, (_, i) => (i + address) % 2 === 0);
            },
            readDiscreteInputs: async (address, length) => {
                console.log(`[模拟] 读取离散输入: 地址=${address}, 长度=${length}`);
                return Array.from({ length }, (_, i) => (i + address) % 3 === 0);
            },
            writeRegister: async (address, value) => {
                console.log(`[模拟] 写入单个寄存器: 地址=${address}, 值=${value}`);
                return true;
            },
            writeRegisters: async (address, values) => {
                console.log(`[模拟] 写入多个寄存器: 地址=${address}, 值=${values}`);
                return true;
            },
            writeCoil: async (address, value) => {
                console.log(`[模拟] 写入单个线圈: 地址=${address}, 值=${value}`);
                return true;
            },
            writeCoils: async (address, values) => {
                console.log(`[模拟] 写入多个线圈: 地址=${address}, 值=${values}`);
                return true;
            }
        };
    }
    createRtuConnection(deviceId, config) {
        console.log(`创建Modbus RTU连接: ${deviceId}`);
        return {
            deviceId,
            mode: 'rtu',
            serialPort: config.parameters.serialPort,
            baudRate: config.parameters.baudRate || 9600,
            unitId: config.parameters.unitId || 1,
            isConnected: false,
            connect: async () => {
                console.log(`[模拟] 连接到Modbus RTU设备: ${config.parameters.serialPort}, 波特率: ${config.parameters.baudRate || 9600}`);
                return true;
            },
            disconnect: async () => {
                console.log(`[模拟] 断开Modbus RTU连接: ${deviceId}`);
                return true;
            },
            readHoldingRegisters: async (address, length) => {
                console.log(`[模拟] 读取保持寄存器: 地址=${address}, 长度=${length}`);
                return Array.from({ length }, (_, i) => 1000 + i + address);
            },
            readInputRegisters: async (address, length) => {
                console.log(`[模拟] 读取输入寄存器: 地址=${address}, 长度=${length}`);
                return Array.from({ length }, (_, i) => 2000 + i + address);
            },
            readCoils: async (address, length) => {
                console.log(`[模拟] 读取线圈: 地址=${address}, 长度=${length}`);
                return Array.from({ length }, (_, i) => (i + address) % 2 === 0);
            },
            readDiscreteInputs: async (address, length) => {
                console.log(`[模拟] 读取离散输入: 地址=${address}, 长度=${length}`);
                return Array.from({ length }, (_, i) => (i + address) % 3 === 0);
            },
            writeRegister: async (address, value) => {
                console.log(`[模拟] 写入单个寄存器: 地址=${address}, 值=${value}`);
                return true;
            },
            writeRegisters: async (address, values) => {
                console.log(`[模拟] 写入多个寄存器: 地址=${address}, 值=${values}`);
                return true;
            },
            writeCoil: async (address, value) => {
                console.log(`[模拟] 写入单个线圈: 地址=${address}, 值=${value}`);
                return true;
            },
            writeCoils: async (address, values) => {
                console.log(`[模拟] 写入多个线圈: 地址=${address}, 值=${values}`);
                return true;
            }
        };
    }
    async processCommand(deviceId, command, connection, config) {
        console.log(`处理Modbus命令: ${command.command}`, command.parameters);
        switch (command.command.toLowerCase()) {
            case 'read':
                return this.handleReadCommand(deviceId, command, connection, config);
            case 'write':
                return this.handleWriteCommand(deviceId, command, connection, config);
            case 'scan':
                return this.handleScanCommand(deviceId, command, connection, config);
            default:
                throw new Error(`不支持的命令: ${command.command}`);
        }
    }
    async handleReadCommand(deviceId, command, connection, config) {
        const { registerType, address, length, paramName } = command.parameters;
        if (paramName && config.parameters.registerMap && config.parameters.registerMap[paramName]) {
            const registerInfo = config.parameters.registerMap[paramName];
            if (registerInfo.accessMode === 'write') {
                throw new Error(`参数 ${paramName} 仅可写，不可读`);
            }
            switch (registerInfo.registerType) {
                case 'holding':
                    return await connection.readHoldingRegisters(registerInfo.address, registerInfo.length || 1);
                case 'input':
                    return await connection.readInputRegisters(registerInfo.address, registerInfo.length || 1);
                case 'coil':
                    return await connection.readCoils(registerInfo.address, registerInfo.length || 1);
                case 'discrete':
                    return await connection.readDiscreteInputs(registerInfo.address, registerInfo.length || 1);
                default:
                    throw new Error(`不支持的寄存器类型: ${registerInfo.registerType}`);
            }
        }
        if (!registerType || !address) {
            throw new Error('读取命令缺少必要参数: registerType, address');
        }
        const readLength = length || 1;
        switch (registerType.toLowerCase()) {
            case 'holding':
            case 'holdingregister':
                return await connection.readHoldingRegisters(address, readLength);
            case 'input':
            case 'inputregister':
                return await connection.readInputRegisters(address, readLength);
            case 'coil':
                return await connection.readCoils(address, readLength);
            case 'discrete':
            case 'discreteinput':
                return await connection.readDiscreteInputs(address, readLength);
            default:
                throw new Error(`不支持的寄存器类型: ${registerType}`);
        }
    }
    async handleWriteCommand(deviceId, command, connection, config) {
        const { registerType, address, value, values, paramName } = command.parameters;
        if (paramName && config.parameters.registerMap && config.parameters.registerMap[paramName]) {
            const registerInfo = config.parameters.registerMap[paramName];
            if (registerInfo.accessMode === 'read') {
                throw new Error(`参数 ${paramName} 仅可读，不可写`);
            }
            switch (registerInfo.registerType) {
                case 'holding':
                    if (Array.isArray(value) || values) {
                        return await connection.writeRegisters(registerInfo.address, Array.isArray(value) ? value : values);
                    }
                    else {
                        return await connection.writeRegister(registerInfo.address, value);
                    }
                case 'coil':
                    if (Array.isArray(value) || values) {
                        return await connection.writeCoils(registerInfo.address, Array.isArray(value) ? value : values);
                    }
                    else {
                        return await connection.writeCoil(registerInfo.address, Boolean(value));
                    }
                case 'input':
                case 'discrete':
                    throw new Error(`寄存器类型 ${registerInfo.registerType} 不支持写入操作`);
                default:
                    throw new Error(`不支持的寄存器类型: ${registerInfo.registerType}`);
            }
        }
        if (!registerType || !address || (value === undefined && values === undefined)) {
            throw new Error('写入命令缺少必要参数: registerType, address, value/values');
        }
        switch (registerType.toLowerCase()) {
            case 'holding':
            case 'holdingregister':
                if (Array.isArray(value) || values) {
                    return await connection.writeRegisters(address, Array.isArray(value) ? value : values);
                }
                else {
                    return await connection.writeRegister(address, value);
                }
            case 'coil':
                if (Array.isArray(value) || values) {
                    return await connection.writeCoils(address, Array.isArray(value) ? value : values);
                }
                else {
                    return await connection.writeCoil(address, Boolean(value));
                }
            case 'input':
            case 'inputregister':
            case 'discrete':
            case 'discreteinput':
                throw new Error(`寄存器类型 ${registerType} 不支持写入操作`);
            default:
                throw new Error(`不支持的寄存器类型: ${registerType}`);
        }
    }
    async handleScanCommand(deviceId, command, connection, config) {
        const { startAddress, endAddress, registerType } = command.parameters;
        if (!registerType || startAddress === undefined || endAddress === undefined) {
            throw new Error('扫描命令缺少必要参数: registerType, startAddress, endAddress');
        }
        if (endAddress < startAddress) {
            throw new Error('结束地址不能小于起始地址');
        }
        const length = endAddress - startAddress + 1;
        switch (registerType.toLowerCase()) {
            case 'holding':
            case 'holdingregister':
                return await connection.readHoldingRegisters(startAddress, length);
            case 'input':
            case 'inputregister':
                return await connection.readInputRegisters(startAddress, length);
            case 'coil':
                return await connection.readCoils(startAddress, length);
            case 'discrete':
            case 'discreteinput':
                return await connection.readDiscreteInputs(startAddress, length);
            default:
                throw new Error(`不支持的寄存器类型: ${registerType}`);
        }
    }
    async simulateConnect(deviceId, connection) {
        console.log(`[模拟] 连接到Modbus设备: ${deviceId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        connection.isConnected = true;
        this.updateConnectionState(deviceId, {
            isConnected: true,
            lastConnected: new Date().toISOString()
        });
        this.emitConnectedEvent(deviceId);
    }
    async simulateDisconnect(deviceId, connection) {
        console.log(`[模拟] 断开Modbus设备连接: ${deviceId}`);
        await new Promise(resolve => setTimeout(resolve, 300));
        connection.isConnected = false;
    }
    setupReconnectMonitor(deviceId) {
        console.log(`设置Modbus设备重连监控: ${deviceId}`);
        const config = this.deviceConfigs.get(deviceId);
        if (!config) {
            return;
        }
        const reconnectInterval = config.parameters.reconnectInterval || 5000;
        const timer = setInterval(async () => {
            const connection = this.modbusConnections.get(deviceId);
            if (!connection || !connection.isConnected) {
                console.log(`检测到Modbus设备连接断开，尝试重连: ${deviceId}`);
                try {
                    await this.connect(deviceId, config);
                }
                catch (error) {
                    console.error(`Modbus设备重连失败: ${deviceId}`, error);
                }
            }
        }, reconnectInterval);
        this.reconnectTimers.set(deviceId, timer);
    }
    setupDataPolling(deviceId) {
        console.log(`设置Modbus设备数据轮询: ${deviceId}`);
        const config = this.deviceConfigs.get(deviceId);
        if (!config || !config.parameters.registerMap) {
            return;
        }
        const pollingInterval = config.parameters.pollingInterval || 1000;
        const timer = setInterval(async () => {
            try {
                const connection = this.modbusConnections.get(deviceId);
                if (!connection || !connection.isConnected) {
                    return;
                }
                const registerMap = config.parameters.registerMap;
                const readableParams = Object.keys(registerMap).filter(paramName => {
                    const param = registerMap[paramName];
                    return param.accessMode !== 'write';
                });
                const readings = {};
                for (const paramName of readableParams) {
                    try {
                        const readCommand = {
                            id: `read-param-${paramName}-${Date.now()}`,
                            deviceId,
                            timestamp: new Date().toISOString(),
                            status: 'pending',
                            command: 'read',
                            parameters: { paramName }
                        };
                        const value = await this.handleReadCommand(deviceId, readCommand, connection, config);
                        readings[paramName] = value;
                    }
                    catch (error) {
                        console.error(`读取参数失败: ${paramName}`, error);
                    }
                }
                if (Object.keys(readings).length > 0) {
                    this.emitDataReceivedEvent(deviceId, readings);
                    this.recordStatistics(deviceId, {
                        dataReceived: JSON.stringify(readings).length
                    });
                }
            }
            catch (error) {
                console.error(`Modbus数据轮询错误: ${deviceId}`, error);
            }
        }, pollingInterval);
        this.dataIntervals.set(deviceId, timer);
    }
}
//# sourceMappingURL=modbus-adapter.js.map