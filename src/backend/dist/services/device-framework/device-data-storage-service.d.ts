import { DeviceDataPoint } from '../../models/device.model.js';
import { DeviceManager } from './types.js';
import { DeviceCommunicationService } from './device-communication-service.js';
export declare enum DataStorageStrategy {
    REAL_TIME = "real_time",
    BATCH = "batch",
    THRESHOLD = "threshold",
    CHANGE = "change",
    INTERVAL = "interval",
    CUSTOM = "custom"
}
export declare enum DataCompressionAlgorithm {
    NONE = "none",
    DELTA = "delta",
    RLE = "rle",
    DICTIONARY = "dictionary",
    LOSSY = "lossy",
    LOSSLESS = "lossless"
}
export interface DataStorageConfig {
    deviceId: string;
    storageStrategy: DataStorageStrategy;
    compressionAlgorithm: DataCompressionAlgorithm;
    batchSize?: number;
    interval?: number;
    changeThreshold?: number;
    customStorageFunction?: (data: DeviceDataPoint) => boolean;
    retentionPeriod?: number;
    maxStorageSize?: number;
    lowPrecisionStorage?: boolean;
    metadata?: Record<string, any>;
}
export interface DataQueryOptions {
    deviceId?: string;
    startTime?: string;
    endTime?: string;
    sensorTypes?: string[];
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
    includeMetadata?: boolean;
    aggregation?: {
        function: 'avg' | 'min' | 'max' | 'sum' | 'count';
        timeWindow: string;
    };
}
export interface DataStatistics {
    deviceId: string;
    totalDataPoints: number;
    oldestDataPoint: string;
    newestDataPoint: string;
    storageSize: number;
    compressionRatio: number;
    dataPointsPerDay: number;
    sensorTypeCounts: Record<string, number>;
    dataQualityScore: number;
}
export declare class DeviceDataStorageService {
    private deviceManager;
    private communicationService;
    private eventEmitter;
    private storageConfigs;
    private dataBuffer;
    private processingBatches;
    private storageIntervals;
    private compressionWorker;
    private isCompressionWorkerBusy;
    private compressionQueue;
    private dataStatistics;
    private defaultRetentionPeriod;
    private isInitialized;
    constructor(deviceManager: DeviceManager);
    initialize(): Promise<void>;
    setCommunicationService(service: DeviceCommunicationService): void;
    configureDeviceStorage(config: DataStorageConfig): void;
    storeDataPoint(dataPoint: DeviceDataPoint): Promise<boolean>;
    storeDataPoints(dataPoints: DeviceDataPoint[]): Promise<number>;
    flushDeviceData(deviceId: string): Promise<boolean>;
    queryData(options: DataQueryOptions): Promise<DeviceDataPoint[]>;
    getDeviceStatistics(deviceId: string): DataStatistics | null;
    getAllStatistics(): Map<string, DataStatistics>;
    clearDeviceData(deviceId: string, beforeTime?: string): Promise<boolean>;
    exportData(options: DataQueryOptions, format?: 'json' | 'csv' | 'excel'): Promise<string | Buffer>;
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback: (data: any) => void): void;
    private shouldStoreDataPoint;
    private getLastDataPoint;
    private createEmptyStatistics;
    private updateStatistics;
    private compressData;
    private processNextCompressionTask;
    private initializeCompressionWorker;
    private setupDataCleanupTask;
    private cleanupExpiredData;
    private setupDeviceManagerListeners;
    private handleDataReceived;
    private isDeviceDataPoint;
    private persistData;
    private convertToCsv;
    private convertToExcel;
}
//# sourceMappingURL=device-data-storage-service.d.ts.map