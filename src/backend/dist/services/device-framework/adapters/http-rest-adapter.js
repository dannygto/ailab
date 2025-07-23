import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
import { DeviceConnectionEventType } from '../types.js';
import axios from 'axios';
export class HttpRestDeviceAdapter extends BaseProtocolAdapter {
    constructor() {
        super('http-rest-adapter', 'HTTP/REST设备适配器', 'HTTP/REST', ['http', 'https', 'rest-api']);
        this.httpClients = new Map();
        this.deviceConfigs = new Map();
        this.heartbeatTimers = new Map();
        this.reconnectTimers = new Map();
        this.transformerFunctions = new Map();
        this.dataIntervals = new Map();
    }
    async initialize() {
        await super.initialize();
        console.log('初始化HTTP/REST设备适配器');
        try {
            console.log('验证HTTP客户端库...');
            if (typeof axios !== 'function') {
                throw new Error('HTTP客户端库不可用');
            }
            console.log('HTTP/REST通信库初始化成功');
        }
        catch (error) {
            console.error('HTTP/REST通信库初始化失败:', error);
            throw new Error('HTTP/REST通信库初始化失败');
        }
    }
    async connect(deviceId, config) {
        console.log(`正在连接HTTP/REST设备: ${deviceId}`, config);
        try {
            if (!config || !config.parameters) {
                throw new Error('连接配置无效');
            }
            const httpConfig = config;
            if (!httpConfig.parameters.baseUrl) {
                throw new Error('未指定API基础URL');
            }
            this.deviceConfigs.set(deviceId, httpConfig);
            const axiosConfig = {
                baseURL: httpConfig.parameters.baseUrl,
                timeout: httpConfig.parameters.timeout || 10000,
                headers: {
                    'Content-Type': httpConfig.parameters.defaultContentType || 'application/json',
                    ...httpConfig.parameters.headers
                }
            };
            if (httpConfig.parameters.auth) {
                this.configureAuthentication(axiosConfig, httpConfig.parameters.auth);
            }
            const httpClient = axios.create(axiosConfig);
            httpClient.interceptors.request.use((config) => {
                if (httpConfig.parameters.debug) {
                    console.log(`[${deviceId}] 发送请求:`, config.method?.toUpperCase(), config.url);
                }
                return config;
            }, (error) => {
                console.error(`[${deviceId}] 请求错误:`, error);
                return Promise.reject(error);
            });
            httpClient.interceptors.response.use((response) => {
                if (httpConfig.parameters.debug) {
                    console.log(`[${deviceId}] 收到响应:`, response.status, response.config.url);
                }
                this.updateStatistics(deviceId, 0, JSON.stringify(response.data).length, 0, 1);
                return response;
            }, async (error) => {
                console.error(`[${deviceId}] 响应错误:`, error.message);
                this.recordError(deviceId, `HTTP错误: ${error.message}`);
                if (httpConfig.parameters.retryCount && error.config) {
                    return this.retryRequest(error, deviceId, httpConfig.parameters);
                }
                return Promise.reject(error);
            });
            this.httpClients.set(deviceId, httpClient);
            this.initializeConnectionState(deviceId);
            const isConnected = await this.checkConnection(deviceId, httpClient, httpConfig.parameters);
            if (!isConnected) {
                throw new Error('设备连接检测失败');
            }
            if (httpConfig.parameters.heartbeatPath && httpConfig.parameters.heartbeatInterval) {
                this.startHeartbeat(deviceId, httpClient, httpConfig.parameters);
            }
            if (httpConfig.parameters.endpointMap) {
                this.setupDataSimulation(deviceId);
            }
            return true;
        }
        catch (error) {
            console.error(`连接HTTP/REST设备失败: ${deviceId}`, error);
            this.recordError(deviceId, `连接失败: ${error.message}`);
            this.emitErrorEvent(deviceId, error);
            const httpConfig = this.deviceConfigs.get(deviceId);
            if (httpConfig?.parameters.autoReconnect) {
                this.setupReconnect(deviceId);
            }
            return false;
        }
    }
    async disconnect(deviceId) {
        console.log(`断开HTTP/REST设备连接: ${deviceId}`);
        try {
            if (this.heartbeatTimers.has(deviceId)) {
                clearInterval(this.heartbeatTimers.get(deviceId));
                this.heartbeatTimers.delete(deviceId);
            }
            if (this.reconnectTimers.has(deviceId)) {
                clearTimeout(this.reconnectTimers.get(deviceId));
                this.reconnectTimers.delete(deviceId);
            }
            if (this.dataIntervals.has(deviceId)) {
                clearInterval(this.dataIntervals.get(deviceId));
                this.dataIntervals.delete(deviceId);
            }
            this.httpClients.delete(deviceId);
            this.updateConnectionState(deviceId, {
                isConnected: false,
                lastDisconnected: new Date().toISOString()
            });
            this.emitDisconnectedEvent(deviceId);
            return true;
        }
        catch (error) {
            console.error(`断开HTTP/REST设备连接失败: ${deviceId}`, error);
            this.recordError(deviceId, `断开连接失败: ${error.message}`);
            return false;
        }
    }
    async sendCommand(deviceId, command) {
        console.log(`向HTTP/REST设备发送命令: ${deviceId}`, command);
        try {
            if (!this.httpClients.has(deviceId)) {
                throw new Error('设备未连接');
            }
            const httpClient = this.httpClients.get(deviceId);
            const httpConfig = this.deviceConfigs.get(deviceId);
            if (!httpConfig?.parameters.endpointMap) {
                throw new Error('未配置API端点映射');
            }
            const endpointName = command.command;
            const endpoint = httpConfig.parameters.endpointMap[endpointName];
            if (!endpoint) {
                throw new Error(`未找到命令对应的API端点: ${endpointName}`);
            }
            const requestConfig = {
                method: endpoint.method,
                url: this.buildUrl(endpoint.path, command.parameters, endpoint),
                timeout: endpoint.timeout || httpConfig.parameters.timeout
            };
            if (endpoint.contentType) {
                requestConfig.headers = {
                    'Content-Type': endpoint.contentType
                };
            }
            if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && endpoint.bodyFields) {
                if (endpoint.requestTransform && httpConfig.parameters.dataTransformers) {
                    const transformer = this.getTransformerFunction(deviceId, endpoint.requestTransform, httpConfig.parameters.dataTransformers);
                    if (transformer) {
                        requestConfig.data = transformer(command.parameters);
                    }
                    else {
                        requestConfig.data = this.extractBodyData(command.parameters, endpoint.bodyFields);
                    }
                }
                else {
                    requestConfig.data = this.extractBodyData(command.parameters, endpoint.bodyFields);
                }
            }
            if (httpConfig.parameters.debug) {
                console.log(`[${deviceId}] 发送命令请求:`, requestConfig);
            }
            this.updateStatistics(deviceId, requestConfig.data ? JSON.stringify(requestConfig.data).length : 0, 0, 1, 0);
            const response = await httpClient.request(requestConfig);
            if (endpoint.expectedStatus && !endpoint.expectedStatus.includes(response.status)) {
                throw new Error(`意外的响应状态码: ${response.status}`);
            }
            let result = response.data;
            if (endpoint.responseTransform && httpConfig.parameters.dataTransformers) {
                const transformer = this.getTransformerFunction(deviceId, endpoint.responseTransform, httpConfig.parameters.dataTransformers);
                if (transformer) {
                    result = transformer(response.data);
                }
            }
            if (httpConfig.parameters.debug) {
                console.log(`[${deviceId}] 命令响应:`, result);
            }
            this.emitCommandCompletedEvent(deviceId, command, result);
            return result;
        }
        catch (error) {
            console.error(`发送命令失败: ${deviceId}`, error);
            this.recordError(deviceId, `命令失败: ${error.message}`);
            this.emitErrorEvent(deviceId, error, command);
            throw error;
        }
    }
    async readData(deviceId, parameters) {
        console.log(`从HTTP/REST设备读取数据: ${deviceId}`, parameters);
        try {
            if (!this.httpClients.has(deviceId)) {
                throw new Error('设备未连接');
            }
            const httpClient = this.httpClients.get(deviceId);
            const httpConfig = this.deviceConfigs.get(deviceId);
            if (!httpConfig?.parameters.endpointMap) {
                throw new Error('未配置API端点映射');
            }
            const endpointName = parameters?.endpoint || 'readData';
            const endpoint = httpConfig.parameters.endpointMap[endpointName];
            if (!endpoint) {
                throw new Error(`未找到数据读取端点: ${endpointName}`);
            }
            const requestConfig = {
                method: endpoint.method,
                url: this.buildUrl(endpoint.path, parameters, endpoint),
                timeout: endpoint.timeout || httpConfig.parameters.timeout
            };
            if (httpConfig.parameters.debug) {
                console.log(`[${deviceId}] 发送数据读取请求:`, requestConfig);
            }
            const response = await httpClient.request(requestConfig);
            if (endpoint.expectedStatus && !endpoint.expectedStatus.includes(response.status)) {
                throw new Error(`意外的响应状态码: ${response.status}`);
            }
            let result = response.data;
            if (endpoint.responseTransform && httpConfig.parameters.dataTransformers) {
                const transformer = this.getTransformerFunction(deviceId, endpoint.responseTransform, httpConfig.parameters.dataTransformers);
                if (transformer) {
                    result = transformer(response.data);
                }
            }
            if (httpConfig.parameters.debug) {
                console.log(`[${deviceId}] 数据读取响应:`, result);
            }
            this.emitDataReceivedEvent(deviceId, result);
            return result;
        }
        catch (error) {
            console.error(`读取数据失败: ${deviceId}`, error);
            this.recordError(deviceId, `数据读取失败: ${error.message}`);
            this.emitErrorEvent(deviceId, error);
            throw error;
        }
    }
    configureAuthentication(axiosConfig, auth) {
        switch (auth.type) {
            case 'basic':
                if (auth.username && auth.password) {
                    axiosConfig.auth = {
                        username: auth.username,
                        password: auth.password
                    };
                }
                break;
            case 'bearer':
                if (auth.token) {
                    if (!axiosConfig.headers)
                        axiosConfig.headers = {};
                    axiosConfig.headers['Authorization'] = `Bearer ${auth.token}`;
                }
                break;
            case 'api-key':
                if (auth.token) {
                    const keyName = auth.apiKeyName || 'X-API-Key';
                    switch (auth.apiKeyLocation) {
                        case 'header':
                            if (!axiosConfig.headers)
                                axiosConfig.headers = {};
                            axiosConfig.headers[keyName] = auth.token;
                            break;
                        case 'query':
                            if (!axiosConfig.params)
                                axiosConfig.params = {};
                            axiosConfig.params[keyName] = auth.token;
                            break;
                        case 'cookie':
                            if (!axiosConfig.headers)
                                axiosConfig.headers = {};
                            axiosConfig.headers['Cookie'] = `${keyName}=${auth.token}`;
                            break;
                        default:
                            if (!axiosConfig.headers)
                                axiosConfig.headers = {};
                            axiosConfig.headers[keyName] = auth.token;
                    }
                }
                break;
            case 'oauth2':
                console.log('OAuth2认证需要在实际项目中实现');
                break;
            case 'none':
            default:
                break;
        }
    }
    buildUrl(path, params, endpoint) {
        let url = path;
        if (endpoint.pathParams && params) {
            for (const param of endpoint.pathParams) {
                if (params[param] !== undefined) {
                    url = url.replace(`{${param}}`, encodeURIComponent(params[param]));
                }
            }
        }
        if (endpoint.queryParams && params) {
            const queryParams = [];
            for (const param of endpoint.queryParams) {
                if (params[param] !== undefined) {
                    queryParams.push(`${encodeURIComponent(param)}=${encodeURIComponent(params[param])}`);
                }
            }
            if (queryParams.length > 0) {
                url += url.includes('?') ? '&' : '?';
                url += queryParams.join('&');
            }
        }
        return url;
    }
    extractBodyData(params, bodyFields) {
        if (!params)
            return {};
        const bodyData = {};
        for (const field of bodyFields) {
            if (params[field] !== undefined) {
                bodyData[field] = params[field];
            }
        }
        return bodyData;
    }
    getTransformerFunction(deviceId, transformerName, transformers) {
        const cacheKey = `${deviceId}:${transformerName}`;
        if (this.transformerFunctions.has(cacheKey)) {
            return this.transformerFunctions.get(cacheKey);
        }
        const transformerCode = transformers[transformerName];
        if (!transformerCode) {
            console.error(`未找到转换器: ${transformerName}`);
            return null;
        }
        try {
            const transformerFunction = new Function('data', transformerCode);
            this.transformerFunctions.set(cacheKey, transformerFunction);
            return transformerFunction;
        }
        catch (error) {
            console.error(`创建转换器函数失败: ${transformerName}`, error);
            return null;
        }
    }
    async checkConnection(deviceId, httpClient, config) {
        try {
            const path = config.heartbeatPath || '/';
            const response = await httpClient.get(path);
            const connected = response.status >= 200 && response.status < 300;
            if (connected) {
                this.updateConnectionState(deviceId, {
                    isConnected: true,
                    lastConnected: new Date().toISOString()
                });
                this.emitConnectedEvent(deviceId);
            }
            return connected;
        }
        catch (error) {
            console.error(`连接检测失败: ${deviceId}`, error);
            this.recordError(deviceId, `连接检测失败: ${error.message}`);
            return false;
        }
    }
    startHeartbeat(deviceId, httpClient, config) {
        if (this.heartbeatTimers.has(deviceId)) {
            clearInterval(this.heartbeatTimers.get(deviceId));
        }
        const timer = setInterval(async () => {
            try {
                const connected = await this.checkConnection(deviceId, httpClient, config);
                if (!connected && config.autoReconnect) {
                    this.setupReconnect(deviceId);
                }
            }
            catch (error) {
                console.error(`心跳检测失败: ${deviceId}`, error);
                this.recordError(deviceId, `心跳检测失败: ${error.message}`);
                if (config.autoReconnect) {
                    this.setupReconnect(deviceId);
                }
            }
        }, config.heartbeatInterval || 30000);
        this.heartbeatTimers.set(deviceId, timer);
    }
    setupReconnect(deviceId) {
        if (this.reconnectTimers.has(deviceId)) {
            clearTimeout(this.reconnectTimers.get(deviceId));
        }
        const config = this.deviceConfigs.get(deviceId);
        if (!config)
            return;
        const timer = setTimeout(async () => {
            console.log(`尝试重新连接设备: ${deviceId}`);
            try {
                await this.connect(deviceId, config);
            }
            catch (error) {
                console.error(`重新连接失败: ${deviceId}`, error);
                this.recordError(deviceId, `重新连接失败: ${error.message}`);
                this.setupReconnect(deviceId);
            }
        }, config.parameters.reconnectInterval || 5000);
        this.reconnectTimers.set(deviceId, timer);
    }
    async retryRequest(error, deviceId, config) {
        if (!config.retryCount || !error.config) {
            return Promise.reject(error);
        }
        const retryCount = error.config.__retryCount || 0;
        if (retryCount >= config.retryCount) {
            return Promise.reject(error);
        }
        error.config.__retryCount = retryCount + 1;
        await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000));
        console.log(`重试请求(${error.config.__retryCount}/${config.retryCount}): ${deviceId} ${error.config.url}`);
        const httpClient = this.httpClients.get(deviceId);
        if (!httpClient) {
            return Promise.reject(new Error('设备未连接'));
        }
        return httpClient.request(error.config);
    }
    setupDataSimulation(deviceId) {
        if (this.dataIntervals.has(deviceId)) {
            clearInterval(this.dataIntervals.get(deviceId));
        }
        const config = this.deviceConfigs.get(deviceId);
        if (!config)
            return;
        const interval = setInterval(() => {
            const data = this.generateSimulatedData(deviceId, config);
            this.emitDataReceivedEvent(deviceId, data);
        }, 5000);
        this.dataIntervals.set(deviceId, interval);
    }
    generateSimulatedData(deviceId, config) {
        if (!config.parameters.endpointMap) {
            return {};
        }
        const simulatedData = {
            deviceId,
            timestamp: new Date().toISOString(),
            values: {}
        };
        for (const [endpointName, endpoint] of Object.entries(config.parameters.endpointMap)) {
            if (endpoint.method === 'GET') {
                if (endpointName.includes('temperature')) {
                    simulatedData.values[endpointName] = Math.round((20 + Math.random() * 15) * 10) / 10;
                }
                else if (endpointName.includes('humidity')) {
                    simulatedData.values[endpointName] = Math.round((30 + Math.random() * 50) * 10) / 10;
                }
                else if (endpointName.includes('pressure')) {
                    simulatedData.values[endpointName] = Math.round((980 + Math.random() * 40) * 10) / 10;
                }
                else if (endpointName.includes('status')) {
                    simulatedData.values[endpointName] = Math.random() > 0.2 ? 'online' : 'busy';
                }
                else if (endpointName.includes('power')) {
                    simulatedData.values[endpointName] = Math.round(Math.random() * 100);
                }
                else {
                    simulatedData.values[endpointName] = Math.round(Math.random() * 100);
                }
            }
        }
        return simulatedData;
    }
    initializeConnectionState(deviceId) {
        this.connectionStates.set(deviceId, {
            deviceId,
            isConnected: false,
            connectionAttempts: 0,
            lastConnectionAttempt: new Date().toISOString(),
            errors: [],
            statistics: {
                dataSent: 0,
                dataReceived: 0,
                commandsSent: 0,
                responsesReceived: 0
            }
        });
    }
    updateConnectionState(deviceId, updates) {
        const currentState = this.getConnectionState(deviceId);
        const newState = {
            ...currentState,
            ...updates
        };
        this.connectionStates.set(deviceId, newState);
    }
    updateStatistics(deviceId, sentBytes, receivedBytes, commandsSent, responsesReceived) {
        const currentState = this.getConnectionState(deviceId);
        const newStatistics = {
            dataSent: currentState.statistics.dataSent + sentBytes,
            dataReceived: currentState.statistics.dataReceived + receivedBytes,
            commandsSent: currentState.statistics.commandsSent + commandsSent,
            responsesReceived: currentState.statistics.responsesReceived + responsesReceived
        };
        this.updateConnectionState(deviceId, {
            statistics: newStatistics
        });
    }
    recordError(deviceId, errorMessage) {
        const currentState = this.getConnectionState(deviceId);
        const errors = [
            ...currentState.errors,
            {
                timestamp: new Date().toISOString(),
                message: errorMessage
            }
        ];
        if (errors.length > 10) {
            errors.shift();
        }
        this.updateConnectionState(deviceId, { errors });
    }
    emitConnectedEvent(deviceId) {
        const event = {
            deviceId,
            connectionType: 'http-rest',
            eventType: DeviceConnectionEventType.CONNECTED,
            timestamp: new Date().toISOString()
        };
        this.eventEmitter.emit(DeviceConnectionEventType.CONNECTED, event);
    }
    emitDisconnectedEvent(deviceId) {
        const event = {
            deviceId,
            connectionType: 'http-rest',
            eventType: DeviceConnectionEventType.DISCONNECTED,
            timestamp: new Date().toISOString()
        };
        this.eventEmitter.emit(DeviceConnectionEventType.DISCONNECTED, event);
    }
    emitErrorEvent(deviceId, error, command) {
        const event = {
            deviceId,
            connectionType: 'http-rest',
            eventType: DeviceConnectionEventType.ERROR,
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack
            },
            command
        };
        this.eventEmitter.emit(DeviceConnectionEventType.ERROR, event);
    }
    emitDataReceivedEvent(deviceId, data) {
        const event = {
            deviceId,
            connectionType: 'http-rest',
            eventType: DeviceConnectionEventType.DATA_RECEIVED,
            timestamp: new Date().toISOString(),
            data
        };
        this.eventEmitter.emit(DeviceConnectionEventType.DATA_RECEIVED, event);
    }
    emitCommandCompletedEvent(deviceId, command, result) {
        const event = {
            deviceId,
            connectionType: 'http-rest',
            eventType: DeviceConnectionEventType.COMMAND_COMPLETED,
            timestamp: new Date().toISOString(),
            command,
            data: result
        };
        this.eventEmitter.emit(DeviceConnectionEventType.COMMAND_COMPLETED, event);
    }
}
//# sourceMappingURL=http-rest-adapter.js.map