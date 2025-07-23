import { USBDeviceAdapter } from './adapters/usb-adapter.js';
import { MQTTDeviceAdapter } from './adapters/mqtt-adapter.js';
const USB_DEVICE_ID = 'test-usb-device-001';
const MQTT_DEVICE_ID = 'test-mqtt-device-001';
async function testUSBAdapter() {
    console.log('--- 测试USB适配器 ---');
    const usbAdapter = new USBDeviceAdapter();
    await usbAdapter.initialize();
    const usbConfig = {
        connectionType: 'usb',
        parameters: {
            vendorId: 0x1234,
            productId: 0x5678,
            serialNumber: 'USB12345678'
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
            const result = await usbAdapter.sendCommand(USB_DEVICE_ID, {
                id: 'cmd-' + Date.now(),
                deviceId: USB_DEVICE_ID,
                command: 'TEST_CONNECTION',
                parameters: { test: true },
                timestamp: new Date().toISOString(),
                status: 'pending'
            });
            console.log('命令结果:', result);
            console.log('读取设备数据...');
            const data = await usbAdapter.readData(USB_DEVICE_ID);
            console.log('设备数据:', data);
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('断开USB设备连接...');
            const disconnected = await usbAdapter.disconnect(USB_DEVICE_ID);
            console.log(`USB设备断开${disconnected ? '成功' : '失败'}`);
        }
    }
    catch (error) {
        console.error('USB设备测试错误:', error);
    }
}
async function testMQTTAdapter() {
    console.log('\n--- 测试MQTT适配器 ---');
    const mqttAdapter = new MQTTDeviceAdapter();
    await mqttAdapter.initialize();
    const mqttConfig = {
        connectionType: 'mqtt',
        parameters: {
            brokerUrl: 'mqtt://localhost:1883',
            clientId: 'mqtt-test-client-001',
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
            const result = await mqttAdapter.sendCommand(MQTT_DEVICE_ID, {
                id: 'cmd-' + Date.now(),
                deviceId: MQTT_DEVICE_ID,
                command: 'SET_PARAMETERS',
                parameters: { interval: 5000 },
                timestamp: new Date().toISOString(),
                status: 'pending'
            });
            console.log('命令结果:', result);
            console.log('读取设备数据...');
            const data = await mqttAdapter.readData(MQTT_DEVICE_ID);
            console.log('设备数据:', data);
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('断开MQTT设备连接...');
            const disconnected = await mqttAdapter.disconnect(MQTT_DEVICE_ID);
            console.log(`MQTT设备断开${disconnected ? '成功' : '失败'}`);
        }
    }
    catch (error) {
        console.error('MQTT设备测试错误:', error);
    }
}
async function runTests() {
    try {
        await testUSBAdapter();
        await testMQTTAdapter();
        console.log('\n所有测试已完成');
    }
    catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}
runTests().catch(console.error);
//# sourceMappingURL=simple-test.js.map