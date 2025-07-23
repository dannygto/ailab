import { EventEmitter } from 'events';
export var DataStorageStrategy;
(function (DataStorageStrategy) {
    DataStorageStrategy["REAL_TIME"] = "real_time";
    DataStorageStrategy["BATCH"] = "batch";
    DataStorageStrategy["THRESHOLD"] = "threshold";
    DataStorageStrategy["CHANGE"] = "change";
    DataStorageStrategy["INTERVAL"] = "interval";
    DataStorageStrategy["CUSTOM"] = "custom";
})(DataStorageStrategy || (DataStorageStrategy = {}));
export var DataCompressionAlgorithm;
(function (DataCompressionAlgorithm) {
    DataCompressionAlgorithm["NONE"] = "none";
    DataCompressionAlgorithm["DELTA"] = "delta";
    DataCompressionAlgorithm["RLE"] = "rle";
    DataCompressionAlgorithm["DICTIONARY"] = "dictionary";
    DataCompressionAlgorithm["LOSSY"] = "lossy";
    DataCompressionAlgorithm["LOSSLESS"] = "lossless";
})(DataCompressionAlgorithm || (DataCompressionAlgorithm = {}));
export class DeviceDataStorageService {
    constructor(deviceManager) {
        this.communicationService = null;
        this.eventEmitter = new EventEmitter();
        this.storageConfigs = new Map();
        this.dataBuffer = new Map();
        this.processingBatches = new Set();
        this.storageIntervals = new Map();
        this.compressionWorker = null;
        this.isCompressionWorkerBusy = false;
        this.compressionQueue = [];
        this.dataStatistics = new Map();
        this.defaultRetentionPeriod = 365;
        this.isInitialized = false;
        this.deviceManager = deviceManager;
        this.eventEmitter.setMaxListeners(100);
    }
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        console.log('初始化设备数据存储服务');
        this.setupDeviceManagerListeners();
        this.initializeCompressionWorker();
        this.setupDataCleanupTask();
        this.isInitialized = true;
    }
    setCommunicationService(service) {
        this.communicationService = service;
        if (service) {
            service.on('data-received', this.handleDataReceived.bind(this));
        }
    }
    configureDeviceStorage(config) {
        const { deviceId, storageStrategy } = config;
        if (!deviceId) {
            throw new Error('设备ID不能为空');
        }
        if (this.storageIntervals.has(deviceId)) {
            clearInterval(this.storageIntervals.get(deviceId));
            this.storageIntervals.delete(deviceId);
        }
        this.storageConfigs.set(deviceId, {
            ...config,
            batchSize: config.batchSize || 100,
            interval: config.interval || 60000,
            retentionPeriod: config.retentionPeriod || this.defaultRetentionPeriod
        });
        if (!this.dataBuffer.has(deviceId)) {
            this.dataBuffer.set(deviceId, []);
        }
        if (!this.dataStatistics.has(deviceId)) {
            this.dataStatistics.set(deviceId, this.createEmptyStatistics(deviceId));
        }
        if (storageStrategy === DataStorageStrategy.INTERVAL) {
            const interval = config.interval || 60000;
            const intervalId = setInterval(() => {
                this.flushDeviceData(deviceId);
            }, interval);
            this.storageIntervals.set(deviceId, intervalId);
        }
        this.eventEmitter.emit('storage-configured', {
            deviceId,
            config,
            timestamp: new Date().toISOString()
        });
    }
    async storeDataPoint(dataPoint) {
        const { deviceId } = dataPoint;
        if (!deviceId) {
            throw new Error('数据点缺少设备ID');
        }
        if (!this.storageConfigs.has(deviceId)) {
            this.configureDeviceStorage({
                deviceId,
                storageStrategy: DataStorageStrategy.BATCH,
                compressionAlgorithm: DataCompressionAlgorithm.NONE,
                batchSize: 100
            });
        }
        const config = this.storageConfigs.get(deviceId);
        if (this.shouldStoreDataPoint(dataPoint, config)) {
            const buffer = this.dataBuffer.get(deviceId) || [];
            buffer.push(dataPoint);
            this.dataBuffer.set(deviceId, buffer);
            this.updateStatistics(deviceId, dataPoint);
            this.eventEmitter.emit('data-point-buffered', {
                deviceId,
                dataPoint,
                timestamp: new Date().toISOString()
            });
            if (config.storageStrategy === DataStorageStrategy.BATCH &&
                buffer.length >= (config.batchSize || 100)) {
                await this.flushDeviceData(deviceId);
            }
            else if (config.storageStrategy === DataStorageStrategy.REAL_TIME) {
                await this.flushDeviceData(deviceId);
            }
            return true;
        }
        return false;
    }
    async storeDataPoints(dataPoints) {
        const deviceGroups = new Map();
        for (const dataPoint of dataPoints) {
            if (!dataPoint.deviceId) {
                continue;
            }
            const group = deviceGroups.get(dataPoint.deviceId) || [];
            group.push(dataPoint);
            deviceGroups.set(dataPoint.deviceId, group);
        }
        let totalStored = 0;
        for (const [deviceId, points] of deviceGroups.entries()) {
            if (!this.storageConfigs.has(deviceId)) {
                this.configureDeviceStorage({
                    deviceId,
                    storageStrategy: DataStorageStrategy.BATCH,
                    compressionAlgorithm: DataCompressionAlgorithm.NONE,
                    batchSize: 100
                });
            }
            const config = this.storageConfigs.get(deviceId);
            const pointsToStore = points.filter(point => this.shouldStoreDataPoint(point, config));
            if (pointsToStore.length === 0) {
                continue;
            }
            const buffer = this.dataBuffer.get(deviceId) || [];
            buffer.push(...pointsToStore);
            this.dataBuffer.set(deviceId, buffer);
            for (const point of pointsToStore) {
                this.updateStatistics(deviceId, point);
            }
            totalStored += pointsToStore.length;
            this.eventEmitter.emit('data-points-buffered', {
                deviceId,
                count: pointsToStore.length,
                timestamp: new Date().toISOString()
            });
            if (buffer.length >= (config.batchSize || 100)) {
                await this.flushDeviceData(deviceId);
            }
        }
        return totalStored;
    }
    async flushDeviceData(deviceId) {
        if (this.processingBatches.has(deviceId)) {
            return false;
        }
        const buffer = this.dataBuffer.get(deviceId);
        if (!buffer || buffer.length === 0) {
            return true;
        }
        this.processingBatches.add(deviceId);
        try {
            const config = this.storageConfigs.get(deviceId);
            const dataToStore = [...buffer];
            this.dataBuffer.set(deviceId, []);
            this.eventEmitter.emit('flush-started', {
                deviceId,
                count: dataToStore.length,
                timestamp: new Date().toISOString()
            });
            const compressedData = await this.compressData(deviceId, dataToStore, config);
            const success = await this.persistData(deviceId, compressedData, config);
            this.eventEmitter.emit('flush-completed', {
                deviceId,
                success,
                count: dataToStore.length,
                timestamp: new Date().toISOString()
            });
            return success;
        }
        catch (error) {
            const currentBuffer = this.dataBuffer.get(deviceId) || [];
            this.dataBuffer.set(deviceId, [...buffer, ...currentBuffer]);
            this.eventEmitter.emit('flush-error', {
                deviceId,
                error,
                timestamp: new Date().toISOString()
            });
            return false;
        }
        finally {
            this.processingBatches.delete(deviceId);
        }
    }
    async queryData(options) {
        await new Promise(resolve => setTimeout(resolve, 50));
        const sampleData = [];
        this.eventEmitter.emit('data-queried', {
            options,
            resultCount: sampleData.length,
            timestamp: new Date().toISOString()
        });
        return sampleData;
    }
    getDeviceStatistics(deviceId) {
        return this.dataStatistics.get(deviceId) || null;
    }
    getAllStatistics() {
        return new Map(this.dataStatistics);
    }
    async clearDeviceData(deviceId, beforeTime) {
        this.dataBuffer.set(deviceId, []);
        this.dataStatistics.set(deviceId, this.createEmptyStatistics(deviceId));
        this.eventEmitter.emit('data-cleared', {
            deviceId,
            beforeTime,
            timestamp: new Date().toISOString()
        });
        return true;
    }
    async exportData(options, format = 'json') {
        const data = await this.queryData(options);
        switch (format) {
            case 'json':
                return JSON.stringify(data);
            case 'csv':
                return this.convertToCsv(data);
            case 'excel':
                return this.convertToExcel(data);
            default:
                return JSON.stringify(data);
        }
    }
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }
    shouldStoreDataPoint(dataPoint, config) {
        if (!config) {
            return true;
        }
        switch (config.storageStrategy) {
            case DataStorageStrategy.REAL_TIME:
                return true;
            case DataStorageStrategy.BATCH:
                return true;
            case DataStorageStrategy.THRESHOLD:
                if (typeof dataPoint.value === 'number' && config.changeThreshold !== undefined) {
                    const lastDataPoint = this.getLastDataPoint(dataPoint.deviceId, dataPoint.sensorType);
                    if (!lastDataPoint || typeof lastDataPoint.value !== 'number') {
                        return true;
                    }
                    return Math.abs(dataPoint.value - lastDataPoint.value) >= config.changeThreshold;
                }
                return true;
            case DataStorageStrategy.CHANGE:
                const lastDataPoint = this.getLastDataPoint(dataPoint.deviceId, dataPoint.sensorType);
                if (!lastDataPoint) {
                    return true;
                }
                return dataPoint.value !== lastDataPoint.value;
            case DataStorageStrategy.INTERVAL:
                return true;
            case DataStorageStrategy.CUSTOM:
                if (config.customStorageFunction) {
                    return config.customStorageFunction(dataPoint);
                }
                return true;
            default:
                return true;
        }
    }
    getLastDataPoint(deviceId, sensorType) {
        const buffer = this.dataBuffer.get(deviceId) || [];
        for (let i = buffer.length - 1; i >= 0; i--) {
            if (buffer[i].sensorType === sensorType) {
                return buffer[i];
            }
        }
        return null;
    }
    createEmptyStatistics(deviceId) {
        return {
            deviceId,
            totalDataPoints: 0,
            oldestDataPoint: '',
            newestDataPoint: '',
            storageSize: 0,
            compressionRatio: 1,
            dataPointsPerDay: 0,
            sensorTypeCounts: {},
            dataQualityScore: 100
        };
    }
    updateStatistics(deviceId, dataPoint) {
        const stats = this.dataStatistics.get(deviceId) || this.createEmptyStatistics(deviceId);
        stats.totalDataPoints++;
        stats.sensorTypeCounts[dataPoint.sensorType] =
            (stats.sensorTypeCounts[dataPoint.sensorType] || 0) + 1;
        stats.newestDataPoint = dataPoint.timestamp;
        if (!stats.oldestDataPoint || dataPoint.timestamp < stats.oldestDataPoint) {
            stats.oldestDataPoint = dataPoint.timestamp;
        }
        const dataSize = JSON.stringify(dataPoint).length;
        stats.storageSize += dataSize;
        if (stats.oldestDataPoint && stats.newestDataPoint) {
            const oldestTime = new Date(stats.oldestDataPoint).getTime();
            const newestTime = new Date(stats.newestDataPoint).getTime();
            const daysDiff = Math.max(1, (newestTime - oldestTime) / (1000 * 60 * 60 * 24));
            stats.dataPointsPerDay = stats.totalDataPoints / daysDiff;
        }
        this.dataStatistics.set(deviceId, stats);
    }
    async compressData(deviceId, data, config) {
        if (!config || config.compressionAlgorithm === DataCompressionAlgorithm.NONE) {
            return data;
        }
        if (this.compressionWorker && !this.isCompressionWorkerBusy) {
            return new Promise((resolve, reject) => {
                this.isCompressionWorkerBusy = true;
                const messageHandler = (event) => {
                    this.isCompressionWorkerBusy = false;
                    this.compressionWorker.removeEventListener('message', messageHandler);
                    this.compressionWorker.removeEventListener('error', errorHandler);
                    if (event.data.error) {
                        reject(new Error(event.data.error));
                    }
                    else {
                        resolve(event.data.result);
                    }
                    this.processNextCompressionTask();
                };
                const errorHandler = (error) => {
                    this.isCompressionWorkerBusy = false;
                    this.compressionWorker.removeEventListener('message', messageHandler);
                    this.compressionWorker.removeEventListener('error', errorHandler);
                    reject(error);
                    this.processNextCompressionTask();
                };
                this.compressionWorker.addEventListener('message', messageHandler);
                this.compressionWorker.addEventListener('error', errorHandler);
                this.compressionWorker.postMessage({
                    deviceId,
                    data,
                    algorithm: config.compressionAlgorithm
                });
            });
        }
        else {
            return new Promise((resolve, reject) => {
                this.compressionQueue.push({
                    deviceId,
                    data
                });
                resolve(data);
            });
        }
    }
    processNextCompressionTask() {
        if (this.compressionQueue.length === 0 || !this.compressionWorker || this.isCompressionWorkerBusy) {
            return;
        }
        const task = this.compressionQueue.shift();
        if (!task) {
            return;
        }
        const { deviceId, data } = task;
        const config = this.storageConfigs.get(deviceId);
        this.compressData(deviceId, data, config);
    }
    initializeCompressionWorker() {
        this.compressionWorker = {
            addEventListener: (event, handler) => {
            },
            removeEventListener: (event, handler) => {
            },
            postMessage: (data) => {
                setTimeout(() => {
                    const handlers = this.compressionWorker._handlers || {};
                    const messageHandler = handlers['message'];
                    if (messageHandler) {
                        messageHandler({
                            data: {
                                result: data.data
                            }
                        });
                    }
                }, 100);
            },
            _handlers: {}
        };
    }
    setupDataCleanupTask() {
        setInterval(() => {
            this.cleanupExpiredData();
        }, 24 * 60 * 60 * 1000);
    }
    async cleanupExpiredData() {
        console.log('开始清理过期数据');
        for (const [deviceId, config] of this.storageConfigs.entries()) {
            if (!config.retentionPeriod) {
                continue;
            }
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - config.retentionPeriod);
            const cutoffTime = cutoffDate.toISOString();
            try {
                await this.clearDeviceData(deviceId, cutoffTime);
            }
            catch (error) {
                console.error(`清理设备 ${deviceId} 数据失败:`, error);
            }
        }
        console.log('过期数据清理完成');
    }
    setupDeviceManagerListeners() {
        if (!this.deviceManager) {
            return;
        }
        this.deviceManager.on('device-unregistered', (event) => {
            const deviceId = event.deviceId;
            if (this.storageIntervals.has(deviceId)) {
                clearInterval(this.storageIntervals.get(deviceId));
                this.storageIntervals.delete(deviceId);
            }
            this.flushDeviceData(deviceId).catch(error => {
                console.error(`设备注销时刷新数据失败:`, error);
            });
        });
    }
    handleDataReceived(event) {
        const { deviceId, data } = event;
        if (Array.isArray(data)) {
            const dataPoints = data.filter(item => this.isDeviceDataPoint(item));
            if (dataPoints.length > 0) {
                this.storeDataPoints(dataPoints).catch(error => {
                    console.error(`存储数据点失败:`, error);
                });
            }
        }
        else if (this.isDeviceDataPoint(data)) {
            this.storeDataPoint(data).catch(error => {
                console.error(`存储数据点失败:`, error);
            });
        }
    }
    isDeviceDataPoint(obj) {
        return obj &&
            typeof obj === 'object' &&
            typeof obj.deviceId === 'string' &&
            typeof obj.timestamp === 'string' &&
            typeof obj.sensorType === 'string' &&
            'value' in obj;
    }
    async persistData(deviceId, data, config) {
        console.log(`模拟存储设备 ${deviceId} 的 ${Array.isArray(data) ? data.length : 1} 个数据点`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
    }
    convertToCsv(data) {
        if (data.length === 0) {
            return '';
        }
        const fields = new Set();
        data.forEach(point => {
            Object.keys(point).forEach(key => fields.add(key));
            if (point.metadata) {
                Object.keys(point.metadata).forEach(key => fields.add(`metadata.${key}`));
            }
        });
        const header = Array.from(fields).join(',');
        const rows = data.map(point => {
            return Array.from(fields).map(field => {
                if (field.startsWith('metadata.')) {
                    const metaKey = field.substring('metadata.'.length);
                    return point.metadata && point.metadata[metaKey] !== undefined
                        ? JSON.stringify(point.metadata[metaKey])
                        : '';
                }
                else {
                    return point[field] !== undefined ? JSON.stringify(point[field]) : '';
                }
            }).join(',');
        });
        return [header, ...rows].join('\n');
    }
    convertToExcel(data) {
        const csv = this.convertToCsv(data);
        return Buffer.from(csv);
    }
}
//# sourceMappingURL=device-data-storage-service.js.map