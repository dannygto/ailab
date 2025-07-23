import { EventEmitter } from 'events';
export var NetworkDiscoveryProtocol;
(function (NetworkDiscoveryProtocol) {
    NetworkDiscoveryProtocol["MDNS"] = "mdns";
    NetworkDiscoveryProtocol["SSDP"] = "ssdp";
    NetworkDiscoveryProtocol["WS_DISCOVERY"] = "ws-discovery";
    NetworkDiscoveryProtocol["BLUETOOTH"] = "bluetooth";
    NetworkDiscoveryProtocol["MODBUS_SCAN"] = "modbus-scan";
})(NetworkDiscoveryProtocol || (NetworkDiscoveryProtocol = {}));
export class DeviceDiscoveryServiceImpl {
    constructor(id = 'default-discovery-service', name = '设备发现服务') {
        this.discoveryInProgress = false;
        this.discoveryTimeout = null;
        this.discoveredDevices = new Map();
        this.discoveryResults = new Map();
        this.discoveryProtocols = new Map();
        this.id = id;
        this.name = name;
        this.supportedConnectionTypes = [
            'network', 'http', 'https', 'mqtt', 'bluetooth', 'modbus-tcp', 'modbus-rtu', 'websocket'
        ];
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.setMaxListeners(100);
    }
    async startDiscovery(options) {
        if (this.discoveryInProgress) {
            await this.stopDiscovery();
        }
        console.log(`开始设备发现，选项:`, options);
        this.discoveryInProgress = true;
        const mergedOptions = {
            protocols: [
                NetworkDiscoveryProtocol.MDNS,
                NetworkDiscoveryProtocol.SSDP,
                NetworkDiscoveryProtocol.MODBUS_SCAN
            ],
            timeout: 30000,
            ...options
        };
        this.discoveredDevices.clear();
        this.discoveryResults.clear();
        for (const protocol of mergedOptions.protocols || []) {
            try {
                await this.startProtocolDiscovery(protocol, mergedOptions);
            }
            catch (error) {
                console.error(`启动${protocol}发现失败:`, error);
                this.eventEmitter.emit('error', {
                    type: 'discovery-error',
                    protocol,
                    error,
                    timestamp: new Date().toISOString()
                });
            }
        }
        if (mergedOptions.timeout) {
            this.discoveryTimeout = setTimeout(() => {
                this.stopDiscovery().catch(console.error);
            }, mergedOptions.timeout);
        }
    }
    async stopDiscovery() {
        if (!this.discoveryInProgress) {
            return;
        }
        console.log('停止设备发现');
        this.discoveryInProgress = false;
        if (this.discoveryTimeout) {
            clearTimeout(this.discoveryTimeout);
            this.discoveryTimeout = null;
        }
        for (const [protocol, instance] of this.discoveryProtocols.entries()) {
            try {
                await this.stopProtocolDiscovery(protocol, instance);
            }
            catch (error) {
                console.error(`停止${protocol}发现失败:`, error);
            }
        }
        this.eventEmitter.emit('discovery-complete', {
            deviceCount: this.discoveredDevices.size,
            devices: Array.from(this.discoveredDevices.values()),
            timestamp: new Date().toISOString()
        });
    }
    getDiscoveredDevices() {
        return Array.from(this.discoveredDevices.values());
    }
    getDiscoveryResults() {
        return Array.from(this.discoveryResults.values());
    }
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }
    async startProtocolDiscovery(protocol, options) {
        console.log(`启动${protocol}协议发现`);
        switch (protocol) {
            case NetworkDiscoveryProtocol.MDNS:
                await this.startMdnsDiscovery(options);
                break;
            case NetworkDiscoveryProtocol.SSDP:
                await this.startSsdpDiscovery(options);
                break;
            case NetworkDiscoveryProtocol.MODBUS_SCAN:
                await this.startModbusScan(options);
                break;
            case NetworkDiscoveryProtocol.BLUETOOTH:
                await this.startBluetoothDiscovery(options);
                break;
            case NetworkDiscoveryProtocol.WS_DISCOVERY:
                await this.startWsDiscovery(options);
                break;
            default:
                throw new Error(`不支持的发现协议: ${protocol}`);
        }
    }
    async stopProtocolDiscovery(protocol, instance) {
        console.log(`停止${protocol}协议发现`);
        switch (protocol) {
            case NetworkDiscoveryProtocol.MDNS:
                await this.stopMdnsDiscovery(instance);
                break;
            case NetworkDiscoveryProtocol.SSDP:
                await this.stopSsdpDiscovery(instance);
                break;
            case NetworkDiscoveryProtocol.MODBUS_SCAN:
                await this.stopModbusScan(instance);
                break;
            case NetworkDiscoveryProtocol.BLUETOOTH:
                await this.stopBluetoothDiscovery(instance);
                break;
            case NetworkDiscoveryProtocol.WS_DISCOVERY:
                await this.stopWsDiscovery(instance);
                break;
            default:
                throw new Error(`不支持的发现协议: ${protocol}`);
        }
        this.discoveryProtocols.delete(protocol);
    }
    handleDiscoveryResult(result) {
        const resultKey = `${result.protocol}-${result.deviceInfo.address}-${result.deviceInfo.port || 0}`;
        this.discoveryResults.set(resultKey, result);
        try {
            const device = this.convertToDevice(result);
            if (device) {
                this.discoveredDevices.set(device.id, device);
                this.eventEmitter.emit('device-discovered', {
                    device,
                    discoveryResult: result,
                    timestamp: new Date().toISOString()
                });
            }
        }
        catch (error) {
            console.error('转换发现结果失败:', error);
        }
    }
    convertToDevice(result) {
        const { deviceInfo, protocol, timestamp } = result;
        if (!deviceInfo.address) {
            return null;
        }
        const deviceId = deviceInfo.id || `${protocol}-${deviceInfo.address}-${deviceInfo.port || 0}`;
        const device = {
            id: deviceId,
            name: deviceInfo.name || `未命名设备 ${deviceId}`,
            description: `通过${protocol}协议发现的设备`,
            type: deviceInfo.type || 'unknown',
            model: deviceInfo.model || 'unknown',
            manufacturer: deviceInfo.manufacturer || 'unknown',
            createdAt: timestamp,
            updatedAt: timestamp,
            status: 'active',
            connectionStatus: 'offline',
            metadata: {
                discoveryProtocol: protocol,
                discoveryTimestamp: timestamp,
                address: deviceInfo.address,
                port: deviceInfo.port,
                services: deviceInfo.services,
                ...deviceInfo.metadata
            }
        };
        return device;
    }
    async startMdnsDiscovery(options) {
        console.log('MDNS发现服务暂未实现，这里使用模拟数据');
        setTimeout(() => {
            if (!this.discoveryInProgress)
                return;
            for (let i = 1; i <= 3; i++) {
                const result = {
                    protocol: NetworkDiscoveryProtocol.MDNS,
                    deviceInfo: {
                        name: `模拟MDNS设备${i}`,
                        type: 'laboratory-equipment',
                        model: `MD-${100 + i}`,
                        manufacturer: 'SimuLab',
                        address: `192.168.1.${10 + i}`,
                        port: 8080,
                        services: [
                            { type: 'http', port: 8080, path: '/api' },
                            { type: 'mqtt', port: 1883 }
                        ],
                        metadata: {
                            mdnsName: `device-${i}.local`,
                            txtRecord: {
                                version: '1.0',
                                capabilities: 'sensor,actuator'
                            }
                        }
                    },
                    rawData: {},
                    timestamp: new Date().toISOString()
                };
                this.handleDiscoveryResult(result);
            }
        }, 1000);
    }
    async stopMdnsDiscovery(instance) {
    }
    async startSsdpDiscovery(options) {
        console.log('SSDP发现服务暂未实现，这里使用模拟数据');
        setTimeout(() => {
            if (!this.discoveryInProgress)
                return;
            for (let i = 1; i <= 2; i++) {
                const result = {
                    protocol: NetworkDiscoveryProtocol.SSDP,
                    deviceInfo: {
                        name: `模拟SSDP设备${i}`,
                        type: 'laboratory-equipment',
                        model: `SD-${200 + i}`,
                        manufacturer: 'SimuLab',
                        address: `192.168.1.${20 + i}`,
                        port: 80,
                        services: [
                            { type: 'http', port: 80, path: '/description.xml' }
                        ],
                        metadata: {
                            deviceType: 'urn:schemas-upnp-org:device:LabDevice:1',
                            UDN: `uuid:${Math.random().toString(36).substring(2, 15)}`
                        }
                    },
                    rawData: {},
                    timestamp: new Date().toISOString()
                };
                this.handleDiscoveryResult(result);
            }
        }, 1500);
    }
    async stopSsdpDiscovery(instance) {
    }
    async startModbusScan(options) {
        console.log('Modbus扫描服务暂未实现，这里使用模拟数据');
        setTimeout(() => {
            if (!this.discoveryInProgress)
                return;
            for (let i = 1; i <= 3; i++) {
                const result = {
                    protocol: NetworkDiscoveryProtocol.MODBUS_SCAN,
                    deviceInfo: {
                        name: `模拟Modbus设备${i}`,
                        type: 'industrial-controller',
                        model: `PLC-${300 + i}`,
                        manufacturer: 'ModControl',
                        address: `192.168.1.${30 + i}`,
                        port: 502,
                        metadata: {
                            unitId: i,
                            registerMap: {
                                holdingRegisters: [0, 10, 20, 30],
                                inputRegisters: [100, 110, 120],
                                coils: [0, 1, 2, 3, 4],
                                discreteInputs: [0, 10, 20]
                            }
                        }
                    },
                    rawData: {},
                    timestamp: new Date().toISOString()
                };
                this.handleDiscoveryResult(result);
            }
        }, 2000);
    }
    async stopModbusScan(instance) {
    }
    async startBluetoothDiscovery(options) {
        console.log('蓝牙发现服务暂未实现，这里使用模拟数据');
        setTimeout(() => {
            if (!this.discoveryInProgress)
                return;
            for (let i = 1; i <= 2; i++) {
                const result = {
                    protocol: NetworkDiscoveryProtocol.BLUETOOTH,
                    deviceInfo: {
                        name: `模拟蓝牙设备${i}`,
                        type: 'sensor',
                        model: `BT-${400 + i}`,
                        manufacturer: 'BioSense',
                        address: `00:11:22:33:44:${i < 10 ? '0' + i : i}`,
                        metadata: {
                            rssi: -70 - Math.floor(Math.random() * 20),
                            serviceUUIDs: [
                                '1809',
                                '180F'
                            ]
                        }
                    },
                    rawData: {},
                    timestamp: new Date().toISOString()
                };
                this.handleDiscoveryResult(result);
            }
        }, 2500);
    }
    async stopBluetoothDiscovery(instance) {
    }
    async startWsDiscovery(options) {
        console.log('WS-Discovery服务暂未实现，这里使用模拟数据');
        setTimeout(() => {
            if (!this.discoveryInProgress)
                return;
            for (let i = 1; i <= 1; i++) {
                const result = {
                    protocol: NetworkDiscoveryProtocol.WS_DISCOVERY,
                    deviceInfo: {
                        name: `模拟WS-Discovery设备${i}`,
                        type: 'camera',
                        model: `CAM-${500 + i}`,
                        manufacturer: 'NetVision',
                        address: `192.168.1.${40 + i}`,
                        port: 80,
                        services: [
                            { type: 'onvif', port: 80, path: '/onvif/device_service' }
                        ],
                        metadata: {
                            scopes: [
                                'onvif://www.onvif.org/type/video_encoder',
                                'onvif://www.onvif.org/Profile/Streaming'
                            ]
                        }
                    },
                    rawData: {},
                    timestamp: new Date().toISOString()
                };
                this.handleDiscoveryResult(result);
            }
        }, 3000);
    }
    async stopWsDiscovery(instance) {
    }
}
//# sourceMappingURL=device-discovery-service.js.map