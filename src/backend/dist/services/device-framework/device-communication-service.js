import { EventEmitter } from 'events';
import { DeviceConnectionStatus } from '../../models/device.model.js';
export var CommunicationStatus;
(function (CommunicationStatus) {
    CommunicationStatus["IDLE"] = "idle";
    CommunicationStatus["CONNECTING"] = "connecting";
    CommunicationStatus["COMMUNICATING"] = "communicating";
    CommunicationStatus["DISCONNECTING"] = "disconnecting";
    CommunicationStatus["ERROR"] = "error";
})(CommunicationStatus || (CommunicationStatus = {}));
export var CommunicationMode;
(function (CommunicationMode) {
    CommunicationMode["SYNCHRONOUS"] = "synchronous";
    CommunicationMode["ASYNCHRONOUS"] = "asynchronous";
    CommunicationMode["STREAMING"] = "streaming";
    CommunicationMode["POLLING"] = "polling";
    CommunicationMode["SCHEDULED"] = "scheduled";
})(CommunicationMode || (CommunicationMode = {}));
export var CommunicationPriority;
(function (CommunicationPriority) {
    CommunicationPriority["CRITICAL"] = "critical";
    CommunicationPriority["HIGH"] = "high";
    CommunicationPriority["NORMAL"] = "normal";
    CommunicationPriority["LOW"] = "low";
    CommunicationPriority["BACKGROUND"] = "background";
})(CommunicationPriority || (CommunicationPriority = {}));
export class DeviceCommunicationService {
    constructor(deviceManager) {
        this.registrationService = null;
        this.eventEmitter = new EventEmitter();
        this.activeSessions = new Map();
        this.pendingRequests = new Map();
        this.requestQueue = [];
        this.pollingIntervals = new Map();
        this.streamingConnections = new Map();
        this.isProcessingQueue = false;
        this.maxConcurrentRequests = 10;
        this.defaultTimeout = 30000;
        this.sessionTimeout = 300000;
        this.deviceManager = deviceManager;
        this.eventEmitter.setMaxListeners(100);
        this.setupEventListeners();
        this.startQueueProcessing();
        this.startSessionCleanup();
    }
    setRegistrationService(service) {
        this.registrationService = service;
    }
    async sendCommand(config) {
        if (!config.deviceId) {
            throw new Error('设备ID不能为空');
        }
        if (!config.command) {
            throw new Error('命令不能为空');
        }
        const device = await this.deviceManager.getDeviceById(config.deviceId);
        if (!device) {
            throw new Error(`设备ID '${config.deviceId}' 不存在`);
        }
        if (device.connectionStatus !== DeviceConnectionStatus.ONLINE) {
            throw new Error(`设备 '${config.deviceId}' 未连接，当前状态: ${device.connectionStatus}`);
        }
        const requestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const fullConfig = {
            ...config,
            timeout: config.timeout || this.defaultTimeout,
            retries: config.retries ?? 3,
            priority: config.priority || CommunicationPriority.NORMAL,
            mode: config.mode || CommunicationMode.SYNCHRONOUS,
            metadata: config.metadata || {}
        };
        this.pendingRequests.set(requestId, fullConfig);
        this.createOrUpdateSession(config.deviceId);
        switch (fullConfig.mode) {
            case CommunicationMode.SYNCHRONOUS:
                return await this.processSynchronousRequest(requestId, fullConfig);
            case CommunicationMode.ASYNCHRONOUS:
                this.addToQueue(requestId, fullConfig);
                return requestId;
            case CommunicationMode.STREAMING:
                await this.setupStreamingConnection(requestId, fullConfig);
                return requestId;
            case CommunicationMode.POLLING:
                this.setupPolling(requestId, fullConfig);
                return requestId;
            case CommunicationMode.SCHEDULED:
                this.scheduleRequest(requestId, fullConfig);
                return requestId;
            default:
                return await this.processSynchronousRequest(requestId, fullConfig);
        }
    }
    cancelRequest(requestId) {
        if (!this.pendingRequests.has(requestId)) {
            return false;
        }
        const config = this.pendingRequests.get(requestId);
        if (!config) {
            return false;
        }
        this.requestQueue = this.requestQueue.filter(item => this.pendingRequests.get(item.deviceId) !== requestId);
        if (config.mode === CommunicationMode.POLLING) {
            const intervalId = this.pollingIntervals.get(requestId);
            if (intervalId) {
                clearInterval(intervalId);
                this.pollingIntervals.delete(requestId);
            }
        }
        if (config.mode === CommunicationMode.STREAMING) {
            const connection = this.streamingConnections.get(requestId);
            if (connection) {
                if (typeof connection.close === 'function') {
                    connection.close();
                }
                else if (typeof connection.disconnect === 'function') {
                    connection.disconnect();
                }
                this.streamingConnections.delete(requestId);
            }
        }
        this.pendingRequests.delete(requestId);
        this.eventEmitter.emit('request-cancelled', {
            requestId,
            deviceId: config.deviceId,
            timestamp: new Date().toISOString()
        });
        return true;
    }
    getSession(sessionId) {
        return this.activeSessions.get(sessionId) || null;
    }
    getDeviceSession(deviceId) {
        for (const session of this.activeSessions.values()) {
            if (session.deviceId === deviceId) {
                return session;
            }
        }
        return null;
    }
    getAllSessions() {
        return Array.from(this.activeSessions.values());
    }
    closeSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return false;
        }
        for (const request of session.requests) {
            const pendingRequest = Array.from(this.pendingRequests.entries())
                .find(([_, config]) => config === request);
            if (pendingRequest) {
                this.cancelRequest(pendingRequest[0]);
            }
        }
        session.endTime = new Date().toISOString();
        session.status = CommunicationStatus.IDLE;
        this.eventEmitter.emit('session-closed', {
            sessionId,
            deviceId: session.deviceId,
            timestamp: new Date().toISOString()
        });
        this.activeSessions.delete(sessionId);
        return true;
    }
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }
    setupEventListeners() {
        if (this.deviceManager) {
            this.deviceManager.on('device-disconnected', (event) => {
                for (const [sessionId, session] of this.activeSessions.entries()) {
                    if (session.deviceId === event.deviceId) {
                        this.closeSession(sessionId);
                    }
                }
            });
            this.deviceManager.on('data-received', (event) => {
                this.handleDataReceived(event);
            });
        }
    }
    createOrUpdateSession(deviceId) {
        let existingSession = null;
        let existingSessionId = null;
        for (const [sessionId, session] of this.activeSessions.entries()) {
            if (session.deviceId === deviceId) {
                existingSession = session;
                existingSessionId = sessionId;
                break;
            }
        }
        if (existingSession && existingSessionId) {
            existingSession.metadata.lastActivity = new Date().toISOString();
            return existingSessionId;
        }
        const sessionId = `session-${deviceId}-${Date.now()}`;
        const newSession = {
            id: sessionId,
            deviceId,
            startTime: new Date().toISOString(),
            status: CommunicationStatus.IDLE,
            requests: [],
            responses: [],
            statistics: {
                requestsSent: 0,
                responsesReceived: 0,
                errors: 0,
                totalDataSent: 0,
                totalDataReceived: 0,
                averageResponseTime: 0
            },
            metadata: {
                lastActivity: new Date().toISOString(),
                createdBy: 'system'
            }
        };
        this.activeSessions.set(sessionId, newSession);
        this.eventEmitter.emit('session-created', {
            sessionId,
            deviceId,
            timestamp: new Date().toISOString()
        });
        return sessionId;
    }
    async processSynchronousRequest(requestId, config) {
        let result = null;
        let error = null;
        let retries = 0;
        const sessionId = this.getDeviceSessionId(config.deviceId);
        const session = sessionId ? this.activeSessions.get(sessionId) : null;
        if (session) {
            session.status = CommunicationStatus.COMMUNICATING;
            session.requests.push(config);
            session.statistics.requestsSent++;
        }
        this.eventEmitter.emit('request-started', {
            requestId,
            deviceId: config.deviceId,
            command: config.command,
            timestamp: new Date().toISOString()
        });
        while (retries <= config.retries) {
            try {
                const startTime = Date.now();
                result = await this.deviceManager.sendCommand(config.deviceId, config.command);
                const responseTime = Date.now() - startTime;
                if (session) {
                    session.statistics.responsesReceived++;
                    session.statistics.totalDataSent += JSON.stringify(config.command).length;
                    session.statistics.totalDataReceived += JSON.stringify(result).length;
                    const totalResponses = session.statistics.responsesReceived;
                    const currentAvg = session.statistics.averageResponseTime;
                    session.statistics.averageResponseTime =
                        (currentAvg * (totalResponses - 1) + responseTime) / totalResponses;
                    session.responses.push({
                        requestId,
                        timestamp: new Date().toISOString(),
                        data: result
                    });
                }
                this.eventEmitter.emit('request-succeeded', {
                    requestId,
                    deviceId: config.deviceId,
                    result,
                    responseTime,
                    timestamp: new Date().toISOString()
                });
                if (config.callback) {
                    config.callback(result);
                }
                break;
            }
            catch (err) {
                error = err;
                retries++;
                if (session) {
                    session.statistics.errors++;
                }
                this.eventEmitter.emit('request-failed', {
                    requestId,
                    deviceId: config.deviceId,
                    error,
                    attempt: retries,
                    maxRetries: config.retries,
                    timestamp: new Date().toISOString()
                });
                if (retries > config.retries) {
                    this.eventEmitter.emit('request-max-retries-reached', {
                        requestId,
                        deviceId: config.deviceId,
                        error,
                        timestamp: new Date().toISOString()
                    });
                    if (config.callback) {
                        config.callback(null, error);
                    }
                }
                else {
                    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                }
            }
        }
        if (session) {
            session.status = CommunicationStatus.IDLE;
        }
        this.pendingRequests.delete(requestId);
        this.eventEmitter.emit('request-completed', {
            requestId,
            deviceId: config.deviceId,
            success: !error,
            timestamp: new Date().toISOString()
        });
        if (error && !config.callback) {
            throw error;
        }
        return requestId;
    }
    addToQueue(requestId, config) {
        let inserted = false;
        const queueItem = { ...config, requestId };
        for (let i = 0; i < this.requestQueue.length; i++) {
            const item = this.requestQueue[i];
            const itemPriority = item.priority || CommunicationPriority.NORMAL;
            if (this.getPriorityValue(config.priority) > this.getPriorityValue(itemPriority)) {
                this.requestQueue.splice(i, 0, queueItem);
                inserted = true;
                break;
            }
        }
        if (!inserted) {
            this.requestQueue.push(queueItem);
        }
        this.eventEmitter.emit('request-queued', {
            requestId,
            deviceId: config.deviceId,
            priority: config.priority,
            position: this.requestQueue.findIndex(item => item === queueItem) + 1,
            queueLength: this.requestQueue.length,
            timestamp: new Date().toISOString()
        });
        if (!this.isProcessingQueue) {
            this.processQueue();
        }
    }
    async processQueue() {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }
        this.isProcessingQueue = true;
        try {
            const currentPending = this.pendingRequests.size;
            const availableSlots = Math.max(0, this.maxConcurrentRequests - currentPending);
            if (availableSlots > 0) {
                const requests = this.requestQueue.splice(0, availableSlots);
                const promises = requests.map(async (config) => {
                    const requestId = config.requestId;
                    delete config.requestId;
                    try {
                        await this.processSynchronousRequest(requestId, config);
                    }
                    catch (error) {
                        console.error(`处理请求 ${requestId} 出错:`, error);
                    }
                });
                await Promise.all(promises);
            }
        }
        finally {
            this.isProcessingQueue = false;
            if (this.requestQueue.length > 0) {
                setTimeout(() => this.processQueue(), 0);
            }
        }
    }
    async setupStreamingConnection(requestId, config) {
        try {
            const connection = {
                id: requestId,
                deviceId: config.deviceId,
                status: 'connected',
                startTime: Date.now(),
                close: () => {
                    console.log(`关闭流连接: ${requestId}`);
                    this.eventEmitter.emit('stream-closed', {
                        requestId,
                        deviceId: config.deviceId,
                        timestamp: new Date().toISOString()
                    });
                }
            };
            this.streamingConnections.set(requestId, connection);
            this.eventEmitter.emit('stream-connected', {
                requestId,
                deviceId: config.deviceId,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error(`设置流连接出错:`, error);
            throw error;
        }
    }
    setupPolling(requestId, config) {
        const interval = config.metadata?.pollingInterval || 5000;
        const intervalId = setInterval(async () => {
            try {
                const pollRequestId = `${requestId}-poll-${Date.now()}`;
                const pollConfig = {
                    ...config,
                    mode: CommunicationMode.SYNCHRONOUS
                };
                await this.processSynchronousRequest(pollRequestId, pollConfig);
            }
            catch (error) {
                console.error(`轮询请求出错:`, error);
                this.eventEmitter.emit('polling-error', {
                    requestId,
                    deviceId: config.deviceId,
                    error,
                    timestamp: new Date().toISOString()
                });
            }
        }, interval);
        this.pollingIntervals.set(requestId, intervalId);
        this.eventEmitter.emit('polling-started', {
            requestId,
            deviceId: config.deviceId,
            interval,
            timestamp: new Date().toISOString()
        });
    }
    scheduleRequest(requestId, config) {
        const scheduleTime = config.metadata?.scheduleTime || (Date.now() + 30000);
        const delay = Math.max(0, scheduleTime - Date.now());
        setTimeout(async () => {
            try {
                if (!this.pendingRequests.has(requestId)) {
                    return;
                }
                const scheduleConfig = {
                    ...config,
                    mode: CommunicationMode.SYNCHRONOUS
                };
                await this.processSynchronousRequest(requestId, scheduleConfig);
            }
            catch (error) {
                console.error(`计划请求出错:`, error);
                this.eventEmitter.emit('schedule-error', {
                    requestId,
                    deviceId: config.deviceId,
                    error,
                    timestamp: new Date().toISOString()
                });
            }
        }, delay);
        this.eventEmitter.emit('request-scheduled', {
            requestId,
            deviceId: config.deviceId,
            scheduleTime: new Date(scheduleTime).toISOString(),
            delay,
            timestamp: new Date().toISOString()
        });
    }
    getPriorityValue(priority) {
        switch (priority) {
            case CommunicationPriority.CRITICAL:
                return 4;
            case CommunicationPriority.HIGH:
                return 3;
            case CommunicationPriority.NORMAL:
                return 2;
            case CommunicationPriority.LOW:
                return 1;
            case CommunicationPriority.BACKGROUND:
                return 0;
            default:
                return 2;
        }
    }
    getDeviceSessionId(deviceId) {
        for (const [sessionId, session] of this.activeSessions.entries()) {
            if (session.deviceId === deviceId) {
                return sessionId;
            }
        }
        return null;
    }
    handleDataReceived(event) {
        const { deviceId, data } = event;
        const sessionId = this.getDeviceSessionId(deviceId);
        if (!sessionId) {
            return;
        }
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }
        session.statistics.totalDataReceived += JSON.stringify(data).length;
        this.eventEmitter.emit('data-received', {
            deviceId,
            sessionId,
            data,
            timestamp: new Date().toISOString()
        });
    }
    startQueueProcessing() {
        setInterval(() => {
            if (this.requestQueue.length > 0 && !this.isProcessingQueue) {
                this.processQueue();
            }
        }, 1000);
    }
    startSessionCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [sessionId, session] of this.activeSessions.entries()) {
                const lastActivity = new Date(session.metadata.lastActivity).getTime();
                const inactive = now - lastActivity;
                if (inactive > this.sessionTimeout) {
                    this.closeSession(sessionId);
                }
            }
        }, 60000);
    }
}
//# sourceMappingURL=device-communication-service.js.map