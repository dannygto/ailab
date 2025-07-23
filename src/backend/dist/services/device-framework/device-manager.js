import { EventEmitter } from 'events';
import { DeviceConnectionStatus } from '../../models/device.model.js';
import { DeviceConnectionEventType } from './types.js';
export class DeviceManagerImpl {
    constructor() {
        this.devices = new Map();
        this.adapters = new Map();
        this.deviceAdapterMap = new Map();
        this.deviceConnections = new Map();
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.setMaxListeners(100);
    }
    async initialize() {
        console.log('初始化设备管理器');
        for (const adapter of this.adapters.values()) {
            await adapter.initialize();
        }
    }
    async setDeviceConnectionConfig(deviceId, config) {
        if (!this.devices.has(deviceId)) {
            throw new Error(`设备 ${deviceId} 不存在`);
        }
        this.deviceConnections.set(deviceId, config);
        const adapters = this.getAdaptersByConnectionType(config.connectionType);
        if (adapters.length > 0) {
            this.deviceAdapterMap.set(deviceId, adapters[0].id);
        }
        else {
            throw new Error(`没有找到支持连接类型 ${config.connectionType} 的适配器`);
        }
    }
    getAdaptersByConnectionType(connectionType) {
        const result = [];
        for (const adapter of this.adapters.values()) {
            if (adapter.supportedConnectionTypes.includes(connectionType)) {
                result.push(adapter);
            }
        }
        return result;
    }
    async registerDevice(device) {
        if (this.devices.has(device.id)) {
            throw new Error(`Device with ID ${device.id} already exists`);
        }
        this.devices.set(device.id, {
            ...device,
            connectionStatus: DeviceConnectionStatus.OFFLINE,
            updatedAt: new Date().toISOString()
        });
        this.eventEmitter.emit('device-registered', { deviceId: device.id, device });
        return device.id;
    }
    async unregisterDevice(deviceId) {
        if (!this.devices.has(deviceId)) {
            return false;
        }
        if (this.devices.get(deviceId)?.connectionStatus === DeviceConnectionStatus.ONLINE) {
            await this.disconnectDevice(deviceId);
        }
        this.devices.delete(deviceId);
        this.deviceAdapterMap.delete(deviceId);
        this.deviceConnections.delete(deviceId);
        this.eventEmitter.emit('device-unregistered', { deviceId });
        return true;
    }
    async getDevices(filter) {
        const devices = Array.from(this.devices.values());
        if (!filter) {
            return devices;
        }
        return devices.filter(device => {
            for (const [key, value] of Object.entries(filter)) {
                if (device[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    }
    async getDeviceById(deviceId) {
        return this.devices.get(deviceId) || null;
    }
    async updateDevice(deviceId, updates) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        const updatedDevice = {
            ...device,
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.devices.set(deviceId, updatedDevice);
        this.eventEmitter.emit('device-updated', { deviceId, device: updatedDevice });
        return updatedDevice;
    }
    registerAdapter(adapter) {
        if (this.adapters.has(adapter.id)) {
            throw new Error(`Adapter with ID ${adapter.id} already exists`);
        }
        this.adapters.set(adapter.id, adapter);
        adapter.on(DeviceConnectionEventType.CONNECTED, this.handleAdapterEvent.bind(this));
        adapter.on(DeviceConnectionEventType.DISCONNECTED, this.handleAdapterEvent.bind(this));
        adapter.on(DeviceConnectionEventType.ERROR, this.handleAdapterEvent.bind(this));
        adapter.on(DeviceConnectionEventType.DATA_RECEIVED, this.handleAdapterEvent.bind(this));
        adapter.on(DeviceConnectionEventType.STATE_CHANGED, this.handleAdapterEvent.bind(this));
        this.eventEmitter.emit('adapter-registered', { adapterId: adapter.id, adapter });
    }
    unregisterAdapter(adapterId) {
        const adapter = this.adapters.get(adapterId);
        if (!adapter) {
            return false;
        }
        const deviceUsingAdapter = Array.from(this.deviceAdapterMap.entries())
            .find(([_, adId]) => adId === adapterId);
        if (deviceUsingAdapter) {
            throw new Error(`Cannot unregister adapter ${adapterId} as it is in use by device ${deviceUsingAdapter[0]}`);
        }
        adapter.off(DeviceConnectionEventType.CONNECTED, this.handleAdapterEvent.bind(this));
        adapter.off(DeviceConnectionEventType.DISCONNECTED, this.handleAdapterEvent.bind(this));
        adapter.off(DeviceConnectionEventType.ERROR, this.handleAdapterEvent.bind(this));
        adapter.off(DeviceConnectionEventType.DATA_RECEIVED, this.handleAdapterEvent.bind(this));
        adapter.off(DeviceConnectionEventType.STATE_CHANGED, this.handleAdapterEvent.bind(this));
        this.adapters.delete(adapterId);
        this.eventEmitter.emit('adapter-unregistered', { adapterId });
        return true;
    }
    getAdapter(adapterId) {
        return this.adapters.get(adapterId) || null;
    }
    getAdapters(filter) {
        const adapters = Array.from(this.adapters.values());
        if (!filter) {
            return adapters;
        }
        return adapters.filter(adapter => {
            for (const [key, value] of Object.entries(filter)) {
                if (adapter[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    }
    async connectDevice(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        if (device.connectionStatus === DeviceConnectionStatus.ONLINE) {
            return true;
        }
        const adapterId = this.deviceAdapterMap.get(deviceId);
        const connectionConfig = this.deviceConnections.get(deviceId);
        if (!adapterId || !connectionConfig) {
            throw new Error(`No adapter or connection configuration found for device ${deviceId}`);
        }
        const adapter = this.adapters.get(adapterId);
        if (!adapter) {
            throw new Error(`Adapter with ID ${adapterId} not found`);
        }
        await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.CONNECTING });
        try {
            const success = await adapter.connect(deviceId, connectionConfig);
            if (success) {
                await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.ONLINE });
                return true;
            }
            else {
                await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.ERROR });
                return false;
            }
        }
        catch (error) {
            await this.updateDevice(deviceId, {
                connectionStatus: DeviceConnectionStatus.ERROR,
                metadata: {
                    ...device.metadata,
                    lastError: error.message,
                    lastErrorTime: new Date().toISOString()
                }
            });
            throw error;
        }
    }
    async disconnectDevice(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        if (device.connectionStatus === DeviceConnectionStatus.OFFLINE) {
            return true;
        }
        const adapterId = this.deviceAdapterMap.get(deviceId);
        if (!adapterId) {
            throw new Error(`No adapter found for device ${deviceId}`);
        }
        const adapter = this.adapters.get(adapterId);
        if (!adapter) {
            throw new Error(`Adapter with ID ${adapterId} not found`);
        }
        try {
            const success = await adapter.disconnect(deviceId);
            await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.OFFLINE });
            return success;
        }
        catch (error) {
            await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.OFFLINE });
            console.error(`Error disconnecting device ${deviceId}:`, error);
            return false;
        }
    }
    getDeviceConnectionState(deviceId) {
        if (!this.devices.has(deviceId)) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        const adapterId = this.deviceAdapterMap.get(deviceId);
        if (!adapterId) {
            return {
                isConnected: false,
                connectionAttempts: 0,
                errors: [],
                statistics: {
                    dataSent: 0,
                    dataReceived: 0,
                    commandsSent: 0,
                    responsesReceived: 0
                }
            };
        }
        const adapter = this.adapters.get(adapterId);
        if (!adapter) {
            throw new Error(`Adapter with ID ${adapterId} not found`);
        }
        return adapter.getConnectionState(deviceId);
    }
    async sendCommand(deviceId, command) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        if (device.connectionStatus !== DeviceConnectionStatus.ONLINE) {
            throw new Error(`Device ${deviceId} is not online`);
        }
        const adapterId = this.deviceAdapterMap.get(deviceId);
        if (!adapterId) {
            throw new Error(`No adapter found for device ${deviceId}`);
        }
        const adapter = this.adapters.get(adapterId);
        if (!adapter) {
            throw new Error(`Adapter with ID ${adapterId} not found`);
        }
        try {
            return await adapter.sendCommand(deviceId, command);
        }
        catch (error) {
            console.error(`Error sending command to device ${deviceId}:`, error);
            throw error;
        }
    }
    async getDeviceData(deviceId, options) {
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        if (device.connectionStatus !== DeviceConnectionStatus.ONLINE) {
            throw new Error(`Device ${deviceId} is not online`);
        }
        const adapterId = this.deviceAdapterMap.get(deviceId);
        if (!adapterId) {
            throw new Error(`No adapter found for device ${deviceId}`);
        }
        const adapter = this.adapters.get(adapterId);
        if (!adapter) {
            throw new Error(`Adapter with ID ${adapterId} not found`);
        }
        try {
            const rawData = await adapter.readData(deviceId, options);
            return rawData;
        }
        catch (error) {
            console.error(`Error getting data from device ${deviceId}:`, error);
            throw error;
        }
    }
    on(eventType, callback) {
        this.eventEmitter.on(eventType, callback);
    }
    off(eventType, callback) {
        this.eventEmitter.off(eventType, callback);
    }
    async setDeviceAdapter(deviceId, adapterId, connectionConfig) {
        if (!this.devices.has(deviceId)) {
            throw new Error(`Device with ID ${deviceId} not found`);
        }
        if (!this.adapters.has(adapterId)) {
            throw new Error(`Adapter with ID ${adapterId} not found`);
        }
        const currentAdapterId = this.deviceAdapterMap.get(deviceId);
        if (currentAdapterId && currentAdapterId !== adapterId) {
            const device = this.devices.get(deviceId);
            if (device.connectionStatus === DeviceConnectionStatus.ONLINE) {
                await this.disconnectDevice(deviceId);
            }
        }
        this.deviceAdapterMap.set(deviceId, adapterId);
        this.deviceConnections.set(deviceId, connectionConfig);
        this.eventEmitter.emit('device-adapter-updated', {
            deviceId,
            adapterId,
            connectionConfig
        });
    }
    handleAdapterEvent(event) {
        const deviceId = event.deviceId;
        if (!this.devices.has(deviceId)) {
            console.warn(`Received event for unknown device ID: ${deviceId}`);
            return;
        }
        switch (event.type) {
            case DeviceConnectionEventType.CONNECTED:
                this.handleDeviceConnected(deviceId);
                break;
            case DeviceConnectionEventType.DISCONNECTED:
                this.handleDeviceDisconnected(deviceId);
                break;
            case DeviceConnectionEventType.ERROR:
                this.handleDeviceError(deviceId, event.error);
                break;
            case DeviceConnectionEventType.DATA_RECEIVED:
                this.eventEmitter.emit('device-data-received', {
                    deviceId,
                    data: event.data,
                    timestamp: event.timestamp
                });
                break;
            case DeviceConnectionEventType.STATE_CHANGED:
                this.eventEmitter.emit('device-state-changed', {
                    deviceId,
                    state: event.data,
                    timestamp: event.timestamp
                });
                break;
        }
        this.eventEmitter.emit('device-event', event);
    }
    async handleDeviceConnected(deviceId) {
        try {
            await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.ONLINE });
        }
        catch (error) {
            console.error(`Error updating device ${deviceId} status:`, error);
        }
    }
    async handleDeviceDisconnected(deviceId) {
        try {
            await this.updateDevice(deviceId, { connectionStatus: DeviceConnectionStatus.OFFLINE });
        }
        catch (error) {
            console.error(`Error updating device ${deviceId} status:`, error);
        }
    }
    async handleDeviceError(deviceId, error) {
        try {
            const device = this.devices.get(deviceId);
            await this.updateDevice(deviceId, {
                connectionStatus: DeviceConnectionStatus.ERROR,
                metadata: {
                    ...device.metadata,
                    lastError: error.message,
                    lastErrorTime: new Date().toISOString()
                }
            });
        }
        catch (err) {
            console.error(`Error updating device ${deviceId} error status:`, err);
        }
    }
}
//# sourceMappingURL=device-manager.js.map