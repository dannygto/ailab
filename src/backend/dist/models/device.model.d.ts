export declare enum DeviceType {
    SENSOR = "sensor",
    METER = "meter",
    MICROSCOPE = "microscope",
    SPECTROSCOPE = "spectroscope",
    DATALOGGER = "datalogger",
    CAMERA = "camera",
    CONTROL_UNIT = "control_unit",
    OTHER = "other"
}
export declare enum DeviceConnectionStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    CONNECTING = "connecting",
    ERROR = "error",
    MAINTENANCE = "maintenance"
}
export interface Device {
    id: string;
    name: string;
    type: DeviceType;
    model: string;
    manufacturer: string;
    description: string;
    connectionStatus: DeviceConnectionStatus;
    location: string;
    ipAddress?: string;
    macAddress?: string;
    firmware?: string;
    lastMaintenance?: string;
    nextMaintenance?: string;
    capabilities: string[];
    supportedProtocols: string[];
    dataFormats: string[];
    configuration: Record<string, any>;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
export interface DeviceDataPoint {
    id: string;
    deviceId: string;
    timestamp: string;
    sensorType: string;
    value: number | string | boolean;
    unit?: string;
    quality?: number;
    metadata?: Record<string, any>;
}
export interface DeviceCommand {
    id: string;
    deviceId: string;
    command: string;
    parameters: Record<string, any>;
    timestamp: string;
    status: 'pending' | 'sent' | 'executed' | 'failed';
    result?: any;
    errorMessage?: string;
    executedAt?: string;
}
export interface DeviceSession {
    id: string;
    deviceId: string;
    userId: string;
    experimentId?: string;
    startTime: string;
    endTime?: string;
    status: 'active' | 'ended' | 'error';
    commands: DeviceCommand[];
    dataPoints: DeviceDataPoint[];
    settings: Record<string, any>;
    notes?: string;
}
export interface DeviceReservation {
    id: string;
    deviceId: string;
    userId: string;
    title: string;
    purpose: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    approvedBy?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}
export interface DeviceUsageStatistics {
    deviceId: string;
    totalSessions: number;
    totalUsageTime: number;
    totalDataPoints: number;
    averageSessionDuration: number;
    lastUsed: string;
    usageByDay: {
        date: string;
        sessions: number;
        usageTime: number;
    }[];
    usageByUser: {
        userId: string;
        sessions: number;
        usageTime: number;
    }[];
    errorRate: number;
    availability: number;
}
export interface DeviceDriver {
    id: string;
    deviceType: DeviceType;
    manufacturer: string;
    modelName: string;
    version: string;
    supportedFirmware: string[];
    communicationProtocols: string[];
    capabilities: string[];
    configurationOptions: {
        name: string;
        type: 'string' | 'number' | 'boolean' | 'enum';
        description: string;
        required: boolean;
        defaultValue?: any;
        options?: string[];
        min?: number;
        max?: number;
    }[];
    installationInstructions: string;
    documentationUrl: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=device.model.d.ts.map