/**
 * 设备框架测试脚本
 * 用于测试设备管理器和适配器功能
 */

import { DeviceManagerImpl } from './device-manager.js';
import { USBDeviceAdapter } from './adapters/usb-adapter.js';
import { MQTTDeviceAdapter } from './adapters/mqtt-adapter.js';
import { DeviceConnectionConfig } from './types.js';

// 创建并初始化设备管理器
async function initializeDeviceManager() {
  console.log('初始化设备框架测试...');

  // 创建设备管理器实例
  const deviceManager = new DeviceManagerImpl();

  // 创建并注册适配器
  const usbAdapter = new USBDeviceAdapter();
  const mqttAdapter = new MQTTDeviceAdapter();

  // 注册适配器
  deviceManager.registerAdapter(usbAdapter);
  deviceManager.registerAdapter(mqttAdapter);

  // 初始化设备管理器
  await deviceManager.initialize();

  console.log('设备管理器初始化完成，已注册适配器：', deviceManager.getAdapters().map(a => a.id));

  return deviceManager;
}// 测试USB设备连接
async function testUSBDevice(deviceManager: DeviceManager) {
  console.log('\n--- 测试USB设备连接 ---');

  // 创建USB设备配置
  const usbConfig: DeviceConnectionConfig = {
    connectionType: 'usb',
    deviceId: 'test-usb-device-001',
    vendorId: 0x1234,
    productId: 0x5678,
    serialNumber: 'USB12345678',
    interfaceClass: 0xff,
    interfaceSubclass: 0x01,
    interfaceProtocol: 0x01,
    configurationValue: 1,
    timeout: 5000
  };

  // 连接USB设备
  try {
    console.log(`尝试连接USB设备: ${usbConfig.deviceId}`);

    const connected = await deviceManager.connectDevice(usbConfig.deviceId, usbConfig);
    console.log(`USB设备连接${connected ? '成功' : '失败'}`);

    if (connected) {
      // 获取设备状态
      const state = deviceManager.getDeviceConnectionState(usbConfig.deviceId);
      console.log('设备连接状态:', state);

      // 发送测试命令
      console.log('发送测试命令...');
      const result = await deviceManager.sendCommand(usbConfig.deviceId, {
        id: 'cmd-' + Date.now(),
        deviceId: usbConfig.deviceId,
        command: 'TEST_CONNECTION',
        parameters: { test: true, mode: 'diagnostic' }
      });
      console.log('命令结果:', result);

      // 读取数据
      console.log('读取设备数据...');
      const data = await deviceManager.readData(usbConfig.deviceId);
      console.log('设备数据:', data);

      // 等待一会儿，模拟设备使用
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 断开连接
      console.log('断开USB设备连接...');
      const disconnected = await deviceManager.disconnectDevice(usbConfig.deviceId);
      console.log(`USB设备断开${disconnected ? '成功' : '失败'}`);
    }
  } catch (error) {
    console.error('USB设备测试错误:', error.message);
  }
}

// 测试MQTT设备连接
async function testMQTTDevice(deviceManager: DeviceManager) {
  console.log('\n--- 测试MQTT设备连接 ---');

  // 创建MQTT设备配置
  const mqttConfig: DeviceConnectionConfig = {
    connectionType: 'mqtt',
    deviceId: 'test-mqtt-device-001',
    brokerUrl: 'mqtt://localhost:1883',
    clientId: 'mqtt-test-client-001',
    username: 'test-user',
    password: 'test-password',
    baseTopic: 'devices/lab1/',
    connectTimeout: 5000,
    reconnectPeriod: 1000,
    qos: 1
  };

  // 连接MQTT设备
  try {
    console.log(`尝试连接MQTT设备: ${mqttConfig.deviceId}`);

    const connected = await deviceManager.connectDevice(mqttConfig.deviceId, mqttConfig);
    console.log(`MQTT设备连接${connected ? '成功' : '失败'}`);

    if (connected) {
      // 获取设备状态
      const state = deviceManager.getDeviceConnectionState(mqttConfig.deviceId);
      console.log('设备连接状态:', state);

      // 发送测试命令
      console.log('发送测试命令...');
      const result = await deviceManager.sendCommand(mqttConfig.deviceId, {
        id: 'cmd-' + Date.now(),
        deviceId: mqttConfig.deviceId,
        command: 'SET_PARAMETERS',
        parameters: { interval: 5000, threshold: 25.5, mode: 'continuous' }
      });
      console.log('命令结果:', result);

      // 读取数据
      console.log('读取设备数据...');
      const data = await deviceManager.readData(mqttConfig.deviceId);
      console.log('设备数据:', data);

      // 等待一会儿，模拟设备使用
      await new Promise(resolve => setTimeout(resolve, 10000));

      // 断开连接
      console.log('断开MQTT设备连接...');
      const disconnected = await deviceManager.disconnectDevice(mqttConfig.deviceId);
      console.log(`MQTT设备断开${disconnected ? '成功' : '失败'}`);
    }
  } catch (error) {
    console.error('MQTT设备测试错误:', error.message);
  }
}

// 测试事件处理
function setupEventListeners(deviceManager: DeviceManager) {
  // 设备连接事件
  deviceManager.on('device:connected', (deviceId) => {
    console.log(`事件: 设备 ${deviceId} 已连接`);
  });

  // 设备断开连接事件
  deviceManager.on('device:disconnected', (deviceId) => {
    console.log(`事件: 设备 ${deviceId} 已断开连接`);
  });

  // 设备数据接收事件
  deviceManager.on('device:data', (deviceId, data) => {
    console.log(`事件: 设备 ${deviceId} 数据接收`, data ? '数据长度: ' + JSON.stringify(data).length : '');
  });

  // 设备命令发送事件
  deviceManager.on('device:command:sent', (deviceId, command) => {
    console.log(`事件: 命令已发送到设备 ${deviceId}`, command.command);
  });

  // 设备命令结果事件
  deviceManager.on('device:command:result', (deviceId, command, result) => {
    console.log(`事件: 设备 ${deviceId} 命令结果`, command.command, result.status);
  });

  // 设备错误事件
  deviceManager.on('device:error', (deviceId, error) => {
    console.log(`事件: 设备 ${deviceId} 错误`, error.message);
  });
}

// 主测试函数
async function runTests() {
  try {
    // 初始化设备管理器
    const deviceManager = await initializeDeviceManager();

    // 设置事件监听
    setupEventListeners(deviceManager);

    // 测试USB设备
    await testUSBDevice(deviceManager);

    // 测试MQTT设备
    await testMQTTDevice(deviceManager);

    console.log('\n所有测试已完成');

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
runTests().catch(console.error);
