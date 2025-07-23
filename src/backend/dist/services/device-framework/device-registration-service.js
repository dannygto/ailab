import { EventEmitter } from 'events';
import { DeviceType, DeviceConnectionStatus } from '../../models/device.model.js';
export class DeviceRegistrationService {
    constructor(deviceManager) {
        this.discoveryService = null;
        this.eventEmitter = new EventEmitter();
        this.registeredDevices = new Map();
        this.pendingRegistrations = new Map();
        this.autoDiscoveryInterval = null;
        this.validationResults = new Map();
        this.deviceManager = deviceManager;
        this.eventEmitter.setMaxListeners(100);
        this.setupDeviceManagerListeners();
    }
    setDiscoveryService(discoveryService) {
        this.discoveryService = discoveryService;
        this.setupDiscoveryServiceListeners();
    }
    async registerDevice(device, options) {
        console.log(`注册设备: ${device.name} (${device.id})`, options);
        const mergedOptions = {
            autoConnect: false,
            validateDevice: true,
            overwriteExisting: false,
            ...options
        };
        const existingDevice = await this.deviceManager.getDeviceById(device.id);
        if (existingDevice) {
            if (!mergedOptions.overwriteExisting) {
                throw new Error(`设备ID '${device.id}' 已存在`);
            }
            if (existingDevice.connectionStatus === DeviceConnectionStatus.ONLINE) {
                await this.deviceManager.disconnectDevice(device.id);
            }
            await this.deviceManager.updateDevice(device.id, {
                ...device,
                updatedAt: new Date().toISOString()
            });
        }
        else {
            if (mergedOptions.validateDevice) {
                const validationResult = await this.validateDevice(device);
                this.validationResults.set(device.id, validationResult);
                if (!validationResult.isValid) {
                    throw new Error(`设备验证失败: ${validationResult.reasons?.join(', ')}`);
                }
            }
            this.pendingRegistrations.set(device.id, device);
            await this.deviceManager.registerDevice(device);
        }
        this.registeredDevices.set(device.id, device);
        if (mergedOptions.connectionConfig) {
            await this.deviceManager.setDeviceConnectionConfig(device.id, mergedOptions.connectionConfig);
        }
        if (mergedOptions.autoConnect && mergedOptions.connectionConfig) {
            try {
                await this.deviceManager.connectDevice(device.id);
            }
            catch (error) {
                console.error(`自动连接设备失败: ${device.id}`, error);
            }
        }
        this.pendingRegistrations.delete(device.id);
        this.eventEmitter.emit('device-registered', {
            deviceId: device.id,
            device,
            options: mergedOptions,
            timestamp: new Date().toISOString()
        });
        return device.id;
    }
    async unregisterDevice(deviceId) {
        console.log(`注销设备: ${deviceId}`);
        const result = await this.deviceManager.unregisterDevice(deviceId);
        if (result) {
            this.registeredDevices.delete(deviceId);
            this.validationResults.delete(deviceId);
            this.eventEmitter.emit('device-unregistered', {
                deviceId,
                timestamp: new Date().toISOString()
            });
        }
        return result;
    }
    async getRegisteredDevices() {
        return await this.deviceManager.getDevices();
    }
    async getDeviceDetails(deviceId) {
        return await this.deviceManager.getDeviceById(deviceId);
    }
    async updateDeviceDetails(deviceId, updates) {
        const updatedDevice = await this.deviceManager.updateDevice(deviceId, updates);
        this.registeredDevices.set(deviceId, updatedDevice);
        this.eventEmitter.emit('device-updated', {
            deviceId,
            updates,
            device: updatedDevice,
            timestamp: new Date().toISOString()
        });
        return updatedDevice;
    }
    async validateDevice(device) {
        console.log(`验证设备: ${device.name} (${device.id})`);
        const result = {
            isValid: true,
            reasons: [],
            warnings: [],
            recommendations: []
        };
        if (!device.id) {
            result.isValid = false;
            result.reasons.push('设备ID不能为空');
        }
        if (!device.name) {
            result.isValid = false;
            result.reasons.push('设备名称不能为空');
        }
        if (!device.type) {
            result.warnings.push('未指定设备类型');
            result.recommendations.push('建议指定设备类型以便更好地管理');
        }
        if (!device.manufacturer) {
            result.warnings.push('未指定制造商');
        }
        if (!device.model) {
            result.warnings.push('未指定设备型号');
        }
        if (!device.metadata?.status) {
            result.warnings.push('未指定设备状态');
            result.recommendations.push('建议设置设备状态为"active"');
        }
        return result;
    }
    async registerDiscoveredDevices(discoveryResults, options) {
        console.log(`批量注册发现的设备: ${discoveryResults.length}个设备`);
        const registeredIds = [];
        for (const result of discoveryResults) {
            try {
                const device = this.convertDiscoveryResultToDevice(result);
                if (!device)
                    continue;
                const deviceId = await this.registerDevice(device, options);
                registeredIds.push(deviceId);
            }
            catch (error) {
                console.error(`注册发现的设备失败:`, error);
            }
        }
        return registeredIds;
    }
    async startAutoDiscoveryAndRegistration(interval = 300000, options) {
        if (!this.discoveryService) {
            throw new Error('未设置设备发现服务');
        }
        console.log(`开始自动发现并注册设备，间隔: ${interval}ms`);
        if (this.autoDiscoveryInterval) {
            clearInterval(this.autoDiscoveryInterval);
        }
        await this.discoveryService.startDiscovery();
        this.autoDiscoveryInterval = setInterval(async () => {
            try {
                await this.discoveryService.startDiscovery();
            }
            catch (error) {
                console.error('自动发现设备失败:', error);
            }
        }, interval);
    }
    async stopAutoDiscoveryAndRegistration() {
        console.log('停止自动发现并注册设备');
        if (this.autoDiscoveryInterval) {
            clearInterval(this.autoDiscoveryInterval);
            this.autoDiscoveryInterval = null;
        }
        if (this.discoveryService) {
            await this.discoveryService.stopDiscovery();
        }
    }
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }
    setupDeviceManagerListeners() {
    }
    setupDiscoveryServiceListeners() {
        if (!this.discoveryService)
            return;
        this.discoveryService.on('device-discovered', async (event) => {
            if (!event.device)
                return;
            this.eventEmitter.emit('device-discovered', event);
            try {
                const existingDevice = await this.deviceManager.getDeviceById(event.device.id);
                if (!existingDevice) {
                    await this.registerDevice(event.device, {
                        autoConnect: false,
                        validateDevice: true
                    });
                }
            }
            catch (error) {
                console.error(`自动注册发现的设备失败: ${event.device.id}`, error);
            }
        });
        this.discoveryService.on('discovery-complete', (event) => {
            this.eventEmitter.emit('discovery-complete', event);
        });
        this.discoveryService.on('error', (event) => {
            this.eventEmitter.emit('discovery-error', event);
        });
    }
    convertDiscoveryResultToDevice(result) {
        const { deviceInfo, protocol, timestamp } = result;
        if (!deviceInfo.address) {
            return null;
        }
        const deviceId = deviceInfo.id || `${protocol}-${deviceInfo.address}-${deviceInfo.port || 0}`;
        let deviceType = DeviceType.OTHER;
        if (deviceInfo.type) {
            switch (deviceInfo.type.toLowerCase()) {
                case 'sensor':
                case 'sensors':
                    deviceType = DeviceType.SENSOR;
                    break;
                case 'actuator':
                case 'controller':
                case 'control':
                    deviceType = DeviceType.CONTROL_UNIT;
                    break;
                case 'camera':
                case 'imaging':
                    deviceType = DeviceType.CAMERA;
                    break;
                case 'display':
                case 'screen':
                    deviceType = DeviceType.OTHER;
                    break;
                case 'laboratory-equipment':
                case 'lab-equipment':
                    deviceType = DeviceType.OTHER;
                    break;
                case 'industrial-controller':
                case 'plc':
                    deviceType = DeviceType.CONTROL_UNIT;
                    break;
                default:
                    deviceType = DeviceType.OTHER;
            }
        }
        const device = {
            id: deviceId,
            name: deviceInfo.name || `未命名设备 ${deviceId}`,
            description: `通过${protocol}协议发现的设备`,
            type: deviceType,
            model: deviceInfo.model || 'unknown',
            manufacturer: deviceInfo.manufacturer || 'unknown',
            createdAt: timestamp,
            updatedAt: timestamp,
            connectionStatus: DeviceConnectionStatus.OFFLINE,
            metadata: {
                status: 'active',
                discoveryProtocol: protocol,
                discoveryTimestamp: timestamp,
                address: deviceInfo.address,
                port: deviceInfo.port,
                services: deviceInfo.services,
                ...deviceInfo.metadata
            },
            capabilities: [],
            supportedProtocols: [],
            dataFormats: [],
            configuration: {},
            location: ''
        };
        return device;
    }
}
//# sourceMappingURL=device-registration-service.js.map