import { USBDeviceAdapter } from './adapters/usb-adapter.js';
import { MQTTDeviceAdapter } from './adapters/mqtt-adapter.js';
import { DeviceConnectionEventType } from './types.js';
var DeviceType;
(function (DeviceType) {
    DeviceType["SENSOR"] = "sensor";
    DeviceType["METER"] = "meter";
    DeviceType["MICROSCOPE"] = "microscope";
    DeviceType["SPECTROSCOPE"] = "spectroscope";
    DeviceType["DATALOGGER"] = "datalogger";
    DeviceType["CAMERA"] = "camera";
    DeviceType["CONTROL_UNIT"] = "control_unit";
    DeviceType["OTHER"] = "other";
})(DeviceType || (DeviceType = {}));
var DeviceConnectionStatus;
(function (DeviceConnectionStatus) {
    DeviceConnectionStatus["ONLINE"] = "online";
    DeviceConnectionStatus["OFFLINE"] = "offline";
    DeviceConnectionStatus["CONNECTING"] = "connecting";
    DeviceConnectionStatus["ERROR"] = "error";
    DeviceConnectionStatus["MAINTENANCE"] = "maintenance";
})(DeviceConnectionStatus || (DeviceConnectionStatus = {}));
const USB_DEVICE_ID = 'test-usb-device-001';
const MQTT_DEVICE_ID = 'test-mqtt-device-001';
async function initializeDeviceManager() {
    console.log('初始化设备框架测试...');
    const usbAdapter = new USBDeviceAdapter();
    const mqttAdapter = new MQTTDeviceAdapter();
    await usbAdapter.initialize();
    await mqttAdapter.initialize();
    console.log('设备适配器初始化完成');
    return { usbAdapter, mqttAdapter };
}
async function testUSBDevice(adapters) {
    const { usbAdapter } = adapters;
    console.log('\n--- 测试USB设备连接 ---');
    const usbDevice = {
        id: USB_DEVICE_ID,
        name: '测试USB设备',
        description: '用于测试的USB设备',
        type: DeviceType.SENSOR,
        model: 'TEST-USB-001',
        manufacturer: 'Test Labs',
        connectionStatus: DeviceConnectionStatus.OFFLINE,
        location: '实验室1',
        capabilities: ['data-capture', 'real-time-monitoring'],
        supportedProtocols: ['usb'],
        dataFormats: ['json'],
        configuration: {},
        metadata: { isTest: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    console.log(`准备测试USB设备: ${USB_DEVICE_ID}`);
    const usbConfig = {
        connectionType: 'usb',
        parameters: {
            vendorId: 0x1234,
            productId: 0x5678,
            serialNumber: 'USB12345678',
            interfaceClass: 0xff,
            interfaceSubclass: 0x01,
            interfaceProtocol: 0x01,
            configurationValue: 1
        },
        timeout: 5000
    };
    try {
        console.log(`尝试连接USB设备: ${USB_DEVICE_ID}`);
        const connected = await usbAdapter.connect(USB_DEVICE_ID, usbConfig);
        console.log(`USB设备连接${connected ? '成功' : '失败'}`);
        if (connected) {
            const state = usbAdapter.getConnectionState(USB_DEVICE_ID);
            console.log('设备连接状态:', state);
            console.log('发送测试命令...');
            const cmd = {
                id: 'cmd-' + Date.now(),
                deviceId: USB_DEVICE_ID,
                command: 'TEST_CONNECTION',
                parameters: { test: true, mode: 'diagnostic' },
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            const result = await usbAdapter.sendCommand(USB_DEVICE_ID, cmd);
            console.log('命令结果:', result);
            console.log('读取设备数据...');
            const data = await usbAdapter.readData(USB_DEVICE_ID);
            console.log('设备数据:', data);
            await new Promise(resolve => setTimeout(resolve, 5000));
            console.log('断开USB设备连接...');
            const disconnected = await usbAdapter.disconnect(USB_DEVICE_ID);
            console.log(`USB设备断开${disconnected ? '成功' : '失败'}`);
        }
    }
    catch (error) {
        console.error('USB设备测试错误:', error.message);
    }
}
async function testMQTTDevice(adapters) {
    const { mqttAdapter } = adapters;
    console.log('\n--- 测试MQTT设备连接 ---');
    const mqttDevice = {
        id: MQTT_DEVICE_ID,
        name: '测试MQTT设备',
        description: '用于测试的MQTT设备',
        type: DeviceType.CONTROL_UNIT,
        model: 'TEST-MQTT-001',
        manufacturer: 'Test Labs',
        connectionStatus: DeviceConnectionStatus.OFFLINE,
        location: '实验室2',
        capabilities: ['remote-control', 'data-streaming'],
        supportedProtocols: ['mqtt'],
        dataFormats: ['json'],
        configuration: {},
        metadata: { isTest: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    console.log(`准备测试MQTT设备: ${MQTT_DEVICE_ID}`);
    const mqttConfig = {
        connectionType: 'mqtt',
        parameters: {
            brokerUrl: 'mqtt://localhost:1883',
            clientId: 'mqtt-test-client-001',
            username: 'test-user',
            password: 'test-password',
            baseTopic: 'devices/lab1/'
        },
        timeout: 5000
    };
    try {
        console.log(`尝试连接MQTT设备: ${MQTT_DEVICE_ID}`);
        const connected = await mqttAdapter.connect(MQTT_DEVICE_ID, mqttConfig);
        console.log(`MQTT设备连接${connected ? '成功' : '失败'}`);
        if (connected) {
            const state = mqttAdapter.getConnectionState(MQTT_DEVICE_ID);
            console.log('设备连接状态:', state);
            console.log('发送测试命令...');
            const cmd = {
                id: 'cmd-' + Date.now(),
                deviceId: MQTT_DEVICE_ID,
                command: 'SET_PARAMETERS',
                parameters: { interval: 5000, threshold: 25.5, mode: 'continuous' },
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            const result = await mqttAdapter.sendCommand(MQTT_DEVICE_ID, cmd);
            console.log('命令结果:', result);
            console.log('读取设备数据...');
            const data = await mqttAdapter.readData(MQTT_DEVICE_ID);
            console.log('设备数据:', data);
            await new Promise(resolve => setTimeout(resolve, 10000));
            console.log('断开MQTT设备连接...');
            const disconnected = await mqttAdapter.disconnect(MQTT_DEVICE_ID);
            console.log(`MQTT设备断开${disconnected ? '成功' : '失败'}`);
        }
    }
    catch (error) {
        console.error('MQTT设备测试错误:', error.message);
    }
}
function setupEventListeners(adapters) {
    const { usbAdapter, mqttAdapter } = adapters;
    if (usbAdapter) {
        usbAdapter.on(DeviceConnectionEventType.CONNECTED, (event) => {
            console.log(`事件: USB设备 ${event.deviceId} 已连接`);
        });
        usbAdapter.on(DeviceConnectionEventType.DISCONNECTED, (event) => {
            console.log(`事件: USB设备 ${event.deviceId} 已断开连接`);
        });
        usbAdapter.on(DeviceConnectionEventType.DATA_RECEIVED, (event) => {
            console.log(`事件: USB设备 ${event.deviceId} 数据接收`, event.data ? '数据长度: ' + JSON.stringify(event.data).length : '');
        });
        usbAdapter.on(DeviceConnectionEventType.ERROR, (event) => {
            console.log(`事件: USB设备 ${event.deviceId} 错误`, event.error?.message);
        });
    }
    if (mqttAdapter) {
        mqttAdapter.on(DeviceConnectionEventType.CONNECTED, (event) => {
            console.log(`事件: MQTT设备 ${event.deviceId} 已连接`);
        });
        mqttAdapter.on(DeviceConnectionEventType.DISCONNECTED, (event) => {
            console.log(`事件: MQTT设备 ${event.deviceId} 已断开连接`);
        });
        mqttAdapter.on(DeviceConnectionEventType.DATA_RECEIVED, (event) => {
            console.log(`事件: MQTT设备 ${event.deviceId} 数据接收`, event.data ? '数据长度: ' + JSON.stringify(event.data).length : '');
        });
        mqttAdapter.on(DeviceConnectionEventType.COMMAND_RESULT, (event) => {
            console.log(`事件: MQTT设备 ${event.deviceId} 命令结果`, event.data?.status);
        });
        mqttAdapter.on(DeviceConnectionEventType.ERROR, (event) => {
            console.log(`事件: MQTT设备 ${event.deviceId} 错误`, event.error?.message);
        });
    }
}
async function runTests() {
    try {
        const adapters = await initializeDeviceManager();
        setupEventListeners(adapters);
        await testUSBDevice(adapters);
        await testMQTTDevice(adapters);
        console.log('\n所有测试已完成');
    }
    catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}
runTests().catch(console.error);
//# sourceMappingURL=test-new.js.map