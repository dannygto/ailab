import { BaseProtocolAdapter } from '../base-protocol-adapter.js';
export class MQTTDeviceAdapter extends BaseProtocolAdapter {
    constructor() {
        super('mqtt-adapter', 'MQTT设备适配器', 'MQTT', ['mqtt', 'network']);
        this.mqttClients = new Map();
        this.deviceConfigs = new Map();
        this.dataIntervals = new Map();
    }
    async initialize() {
        await super.initialize();
        console.log('初始化MQTT设备适配器');
    }
    async connect(deviceId, config) {
        try {
            if (config.connectionType !== 'mqtt' && config.connectionType !== 'network') {
                throw new Error(`不支持的连接类型: ${config.connectionType}`);
            }
            if (!config.parameters) {
                throw new Error('MQTT连接配置缺少parameters对象');
            }
            const params = config.parameters;
            const mqttConfig = {
                ...config,
                brokerUrl: params.brokerUrl,
                clientId: params.clientId,
                username: params.username,
                password: params.password,
                baseTopic: params.baseTopic,
                commandTopic: params.commandTopic,
                dataTopic: params.dataTopic,
                statusTopic: params.statusTopic,
                qos: params.qos,
                connectTimeout: params.connectTimeout,
                reconnectPeriod: params.reconnectPeriod,
                keepalive: params.keepalive,
                clean: params.clean,
                will: params.will
            };
            if (!mqttConfig.brokerUrl || !mqttConfig.clientId || !mqttConfig.baseTopic) {
                throw new Error('MQTT连接配置缺少必要参数');
            }
            this.initializeConnectionState(deviceId);
            this.deviceConfigs.set(deviceId, mqttConfig);
            console.log(`正在连接MQTT设备: ${deviceId}，代理服务器: ${mqttConfig.brokerUrl}`);
            const client = {
                deviceId,
                brokerUrl: mqttConfig.brokerUrl,
                clientId: mqttConfig.clientId,
                isConnected: true,
                subscribedTopics: {},
                publish: (topic, message, options) => {
                    console.log(`MQTT设备 ${deviceId} 发布消息到主题 ${topic}: ${message}`);
                    return Promise.resolve();
                },
                subscribe: (topic, options) => {
                    console.log(`MQTT设备 ${deviceId} 订阅主题: ${topic}`);
                    client.subscribedTopics[topic] = true;
                    return Promise.resolve();
                },
                unsubscribe: (topic) => {
                    console.log(`MQTT设备 ${deviceId} 取消订阅主题: ${topic}`);
                    delete client.subscribedTopics[topic];
                    return Promise.resolve();
                },
                end: (force) => {
                    console.log(`关闭MQTT连接: ${deviceId}`);
                    return Promise.resolve();
                }
            };
            this.mqttClients.set(deviceId, client);
            this.updateConnectionState(deviceId, {
                isConnected: true,
                lastConnected: new Date().toISOString(),
                connectionAttempts: this.getConnectionState(deviceId).connectionAttempts + 1
            });
            await this.subscribeToDeviceTopics(deviceId);
            this.emitConnectedEvent(deviceId);
            this.startDeviceDataSimulation(deviceId);
            return true;
        }
        catch (error) {
            console.error(`MQTT设备连接错误: ${error.message}`);
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
            const client = this.mqttClients.get(deviceId);
            if (!client) {
                return true;
            }
            this.stopDeviceDataSimulation(deviceId);
            const config = this.deviceConfigs.get(deviceId);
            if (config && config.statusTopic) {
                const statusTopic = config.statusTopic.replace('{deviceId}', deviceId);
                await client.publish(statusTopic, JSON.stringify({ status: 'offline', timestamp: new Date().toISOString() }));
            }
            await client.end();
            this.mqttClients.delete(deviceId);
            this.updateConnectionState(deviceId, {
                isConnected: false,
                lastDisconnected: new Date().toISOString()
            });
            this.emitDisconnectedEvent(deviceId);
            return true;
        }
        catch (error) {
            console.error(`MQTT设备断开连接错误: ${error.message}`);
            this.recordError(deviceId, error.message);
            this.updateConnectionState(deviceId, { isConnected: false });
            this.mqttClients.delete(deviceId);
            this.emitErrorEvent(deviceId, error);
            return true;
        }
    }
    async sendCommand(deviceId, command) {
        try {
            const client = this.mqttClients.get(deviceId);
            if (!client || !client.isConnected) {
                throw new Error(`设备 ${deviceId} 未连接`);
            }
            const config = this.deviceConfigs.get(deviceId);
            if (!config) {
                throw new Error(`未找到设备 ${deviceId} 的配置`);
            }
            const commandTopic = config.commandTopic
                ? config.commandTopic.replace('{deviceId}', deviceId)
                : `${config.baseTopic}${deviceId}/commands`;
            const commandMessage = JSON.stringify({
                id: command.id,
                command: command.command,
                parameters: command.parameters,
                timestamp: new Date().toISOString()
            });
            await client.publish(commandTopic, commandMessage);
            this.recordStatistics(deviceId, {
                dataSent: this.getConnectionState(deviceId).statistics.dataSent + commandMessage.length,
                commandsSent: this.getConnectionState(deviceId).statistics.commandsSent + 1
            });
            this.emitCommandSentEvent(deviceId, command);
            setTimeout(() => {
                const responseTopic = `${config.baseTopic}${deviceId}/responses`;
                const result = {
                    commandId: command.id,
                    status: 'success',
                    timestamp: new Date().toISOString(),
                    data: `命令 ${command.command} 已成功执行`
                };
                const responseMessage = JSON.stringify(result);
                console.log(`MQTT设备 ${deviceId} 发布响应到主题 ${responseTopic}: ${responseMessage}`);
                this.recordStatistics(deviceId, {
                    dataReceived: this.getConnectionState(deviceId).statistics.dataReceived + responseMessage.length,
                    responsesReceived: this.getConnectionState(deviceId).statistics.responsesReceived + 1
                });
                this.emitCommandResultEvent(deviceId, command, result);
            }, 500);
            return {
                status: 'sent',
                commandId: command.id,
                timestamp: new Date().toISOString(),
                message: '命令已发送，等待设备响应'
            };
        }
        catch (error) {
            console.error(`MQTT设备命令错误: ${error.message}`);
            this.recordError(deviceId, error.message);
            this.emitErrorEvent(deviceId, error);
            throw error;
        }
    }
    async readData(deviceId, parameters) {
        try {
            const client = this.mqttClients.get(deviceId);
            if (!client || !client.isConnected) {
                throw new Error(`设备 ${deviceId} 未连接`);
            }
            const config = this.deviceConfigs.get(deviceId);
            if (!config) {
                throw new Error(`未找到设备 ${deviceId} 的配置`);
            }
            const requestTopic = `${config.baseTopic}${deviceId}/data/request`;
            const requestMessage = JSON.stringify({
                requestId: `req-${Date.now()}`,
                timestamp: new Date().toISOString(),
                parameters: parameters || {}
            });
            await client.publish(requestTopic, requestMessage);
            this.recordStatistics(deviceId, {
                dataSent: this.getConnectionState(deviceId).statistics.dataSent + requestMessage.length
            });
            const timestamp = new Date().toISOString();
            const dataPoints = [
                {
                    id: `dp-${Date.now()}`,
                    deviceId,
                    timestamp,
                    sensorType: 'temperature',
                    value: 22 + Math.random() * 8,
                    unit: '°C',
                    quality: 95 + Math.floor(Math.random() * 6)
                },
                {
                    id: `dp-${Date.now() + 1}`,
                    deviceId,
                    timestamp,
                    sensorType: 'humidity',
                    value: 45 + Math.random() * 15,
                    unit: '%',
                    quality: 90 + Math.floor(Math.random() * 11)
                },
                {
                    id: `dp-${Date.now() + 2}`,
                    deviceId,
                    timestamp,
                    sensorType: 'co2',
                    value: 400 + Math.random() * 200,
                    unit: 'ppm',
                    quality: 92 + Math.floor(Math.random() * 9)
                }
            ];
            await new Promise(resolve => setTimeout(resolve, 200));
            const responseSize = JSON.stringify(dataPoints).length;
            this.recordStatistics(deviceId, {
                dataReceived: this.getConnectionState(deviceId).statistics.dataReceived + responseSize,
                responsesReceived: this.getConnectionState(deviceId).statistics.responsesReceived + 1
            });
            return dataPoints;
        }
        catch (error) {
            console.error(`MQTT设备读取错误: ${error.message}`);
            this.recordError(deviceId, error.message);
            this.emitErrorEvent(deviceId, error);
            throw error;
        }
    }
    supportsFeature(featureName) {
        const supportedFeatures = [
            'pub-sub',
            'qos',
            'retained-messages',
            'last-will',
            'persistent-session',
            'message-filtering'
        ];
        return supportedFeatures.includes(featureName);
    }
    getProtocolSpecificMethod(methodName) {
        const methods = {
            publishMessage: (deviceId, topic, message, options) => {
                const client = this.mqttClients.get(deviceId);
                if (!client || !client.isConnected) {
                    throw new Error(`设备 ${deviceId} 未连接`);
                }
                return client.publish(topic, message, options);
            },
            subscribeTopic: (deviceId, topic, options) => {
                const client = this.mqttClients.get(deviceId);
                if (!client || !client.isConnected) {
                    throw new Error(`设备 ${deviceId} 未连接`);
                }
                return client.subscribe(topic, options);
            },
            unsubscribeTopic: (deviceId, topic) => {
                const client = this.mqttClients.get(deviceId);
                if (!client || !client.isConnected) {
                    throw new Error(`设备 ${deviceId} 未连接`);
                }
                return client.unsubscribe(topic);
            },
            updateWill: (deviceId, topic, message, options) => {
                console.log(`更新MQTT设备 ${deviceId} 的遗嘱消息`);
                return Promise.resolve(true);
            }
        };
        return methods[methodName] || null;
    }
    async subscribeToDeviceTopics(deviceId) {
        const client = this.mqttClients.get(deviceId);
        const config = this.deviceConfigs.get(deviceId);
        if (!client || !config) {
            return;
        }
        const dataTopic = config.dataTopic
            ? config.dataTopic.replace('{deviceId}', deviceId)
            : `${config.baseTopic}${deviceId}/data`;
        const statusTopic = config.statusTopic
            ? config.statusTopic.replace('{deviceId}', deviceId)
            : `${config.baseTopic}${deviceId}/status`;
        const responseTopic = `${config.baseTopic}${deviceId}/responses`;
        const errorTopic = `${config.baseTopic}${deviceId}/errors`;
        await client.subscribe(dataTopic);
        await client.subscribe(statusTopic);
        await client.subscribe(responseTopic);
        await client.subscribe(errorTopic);
        console.log(`MQTT设备 ${deviceId} 已订阅必要主题`);
        await client.publish(statusTopic, JSON.stringify({
            status: 'online',
            timestamp: new Date().toISOString(),
            deviceId
        }));
    }
    startDeviceDataSimulation(deviceId) {
        this.stopDeviceDataSimulation(deviceId);
        const config = this.deviceConfigs.get(deviceId);
        if (!config) {
            return;
        }
        const client = this.mqttClients.get(deviceId);
        if (!client) {
            return;
        }
        const dataTopic = config.dataTopic
            ? config.dataTopic.replace('{deviceId}', deviceId)
            : `${config.baseTopic}${deviceId}/data`;
        const interval = setInterval(async () => {
            const data = {
                deviceId,
                timestamp: new Date().toISOString(),
                measurements: {
                    temperature: 22 + Math.random() * 8,
                    humidity: 45 + Math.random() * 15,
                    pressure: 1010 + Math.random() * 20,
                    light: 300 + Math.random() * 700,
                    noise: 40 + Math.random() * 30
                },
                status: {
                    battery: 80 + Math.random() * 20,
                    signal: 70 + Math.random() * 30,
                    errors: []
                }
            };
            const message = JSON.stringify(data);
            await client.publish(dataTopic, message);
            this.emitDataReceivedEvent(deviceId, data);
            const dataSize = message.length;
            this.recordStatistics(deviceId, {
                dataReceived: this.getConnectionState(deviceId).statistics.dataReceived + dataSize,
                responsesReceived: this.getConnectionState(deviceId).statistics.responsesReceived + 1
            });
        }, 10000);
        this.dataIntervals.set(deviceId, interval);
    }
    stopDeviceDataSimulation(deviceId) {
        if (this.dataIntervals.has(deviceId)) {
            clearInterval(this.dataIntervals.get(deviceId));
            this.dataIntervals.delete(deviceId);
        }
    }
}
//# sourceMappingURL=mqtt-adapter.js.map