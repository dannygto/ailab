/**
 * 设备框架测试脚本
 * 用于测试设备管理器和适配器功能
 */

import { DeviceManagerImpl } from './device-manager.js';
import { USBDeviceAdapter } from './adapters/usb-adapter.js';
import { MQTTDeviceAdapter } from './adapters/mqtt-adapter.js';
import { DeviceConnectionConfig, DeviceConnectionEventType } from './types.js';

// 内联设备类型定义（与models中的定义保持一致）
enum DeviceType {
  SENSOR = 'sensor',
  METER = 'meter',
  MICROSCOPE = 'microscope',
  SPECTROSCOPE = 'spectroscope',
  DATALOGGER = 'datalogger',
  CAMERA = 'camera',
  CONTROL_UNIT = 'control_unit',
  OTHER = 'other'
}

// 设备连接状态枚举（与models中的定义保持一致）
enum DeviceConnectionStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  CONNECTING = 'connecting',
  ERROR = 'error',
  MAINTENANCE = 'maintenance'
}

// 设备命令接口（简化版，仅包含测试所需的部分）
interface DeviceCommand {
  id: string;
  deviceId: string;
  command: string;
  parameters: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'sent' | 'executed' | 'failed';
  result?: any;
}

// 设备接口（简化版，仅包含测试所需的部分）
interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model?: string;
  manufacturer?: string;
  description?: string;
  connectionStatus: DeviceConnectionStatus;
  location?: string;
  supportedProtocols: string[];
  capabilities?: string[];
  dataFormats?: string[];
  configuration: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// 设备ID常量
const USB_DEVICE_ID = 'test-usb-device-001';
const MQTT_DEVICE_ID = 'test-mqtt-device-001';

// 创建并初始化设备管理器
async function initializeDeviceManager() {
  console.log('初始化设备框架测试...');

  // 创建适配器
  const usbAdapter = new USBDeviceAdapter();
  const mqttAdapter = new MQTTDeviceAdapter();

  // 初始化适配器
  await usbAdapter.initialize();
  await mqttAdapter.initialize();

  console.log('设备适配器初始化完成');

  return { usbAdapter, mqttAdapter };
}

// 测试USB设备连接
async function testUSBDevice(adapters: { usbAdapter: USBDeviceAdapter; mqttAdapter: MQTTDeviceAdapter }) {
  const { usbAdapter } = adapters;
  console.log('\n--- 测试USB设备连接 ---');

  // 创建一个USB设备
  const usbDevice: Partial<Device> = {
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

  // 创建USB连接配置
  const usbConfig: DeviceConnectionConfig = {
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

    // 连接设备
    const connected = await usbAdapter.connect(USB_DEVICE_ID, usbConfig);
    console.log(`USB设备连接${connected ? '成功' : '失败'}`);

    if (connected) {
      // 获取设备状态
      const state = usbAdapter.getConnectionState(USB_DEVICE_ID);
      console.log('设备连接状态:', state);

      // 发送测试命令
      console.log('发送测试命令...');
      const cmd: DeviceCommand = {
        id: 'cmd-' + Date.now(),
        deviceId: USB_DEVICE_ID,
        command: 'TEST_CONNECTION',
        parameters: { test: true, mode: 'diagnostic' },
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      const result = await usbAdapter.sendCommand(USB_DEVICE_ID, cmd);
      console.log('命令结果:', result);

      // 读取数据
      console.log('读取设备数据...');
      const data = await usbAdapter.readData(USB_DEVICE_ID);
      console.log('设备数据:', data);

      // 等待一会儿，模拟设备使用
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 断开连接
      console.log('断开USB设备连接...');
      const disconnected = await usbAdapter.disconnect(USB_DEVICE_ID);
      console.log(`USB设备断开${disconnected ? '成功' : '失败'}`);
    }
  } catch (error) {
    console.error('USB设备测试错误:', error.message);
  }
}

// 测试MQTT设备连接
async function testMQTTDevice(adapters: { usbAdapter: USBDeviceAdapter; mqttAdapter: MQTTDeviceAdapter }) {
  const { mqttAdapter } = adapters;
  console.log('\n--- 测试MQTT设备连接 ---');

  // 创建一个MQTT设备
  const mqttDevice: Partial<Device> = {
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

  // 创建MQTT连接配置
  const mqttConfig: DeviceConnectionConfig = {
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

    // 连接设备
    const connected = await mqttAdapter.connect(MQTT_DEVICE_ID, mqttConfig);
    console.log(`MQTT设备连接${connected ? '成功' : '失败'}`);

    if (connected) {
      // 获取设备状态
      const state = mqttAdapter.getConnectionState(MQTT_DEVICE_ID);
      console.log('设备连接状态:', state);

      // 发送测试命令
      console.log('发送测试命令...');
      const cmd: DeviceCommand = {
        id: 'cmd-' + Date.now(),
        deviceId: MQTT_DEVICE_ID,
        command: 'SET_PARAMETERS',
        parameters: { interval: 5000, threshold: 25.5, mode: 'continuous' },
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      const result = await mqttAdapter.sendCommand(MQTT_DEVICE_ID, cmd);
      console.log('命令结果:', result);

      // 读取数据
      console.log('读取设备数据...');
      const data = await mqttAdapter.readData(MQTT_DEVICE_ID);
      console.log('设备数据:', data);

      // 等待一会儿，模拟设备使用
      await new Promise(resolve => setTimeout(resolve, 10000));

      // 断开连接
      console.log('断开MQTT设备连接...');
      const disconnected = await mqttAdapter.disconnect(MQTT_DEVICE_ID);
      console.log(`MQTT设备断开${disconnected ? '成功' : '失败'}`);
    }
  } catch (error) {
    console.error('MQTT设备测试错误:', error.message);
  }
}

// 测试事件处理
function setupEventListeners(adapters: { usbAdapter: USBDeviceAdapter; mqttAdapter: MQTTDeviceAdapter }) {
  const { usbAdapter, mqttAdapter } = adapters;

  if (usbAdapter) {
    // 设备连接事件
    usbAdapter.on(DeviceConnectionEventType.CONNECTED, (event) => {
      console.log(`事件: USB设备 ${event.deviceId} 已连接`);
    });

    // 设备断开连接事件
    usbAdapter.on(DeviceConnectionEventType.DISCONNECTED, (event) => {
      console.log(`事件: USB设备 ${event.deviceId} 已断开连接`);
    });

    // 设备数据接收事件
    usbAdapter.on(DeviceConnectionEventType.DATA_RECEIVED, (event) => {
      console.log(`事件: USB设备 ${event.deviceId} 数据接收`, event.data ? '数据长度: ' + JSON.stringify(event.data).length : '');
    });

    // 设备错误事件
    usbAdapter.on(DeviceConnectionEventType.ERROR, (event) => {
      console.log(`事件: USB设备 ${event.deviceId} 错误`, event.error?.message);
    });
  }

  if (mqttAdapter) {
    // 设备连接事件
    mqttAdapter.on(DeviceConnectionEventType.CONNECTED, (event) => {
      console.log(`事件: MQTT设备 ${event.deviceId} 已连接`);
    });

    // 设备断开连接事件
    mqttAdapter.on(DeviceConnectionEventType.DISCONNECTED, (event) => {
      console.log(`事件: MQTT设备 ${event.deviceId} 已断开连接`);
    });

    // 设备数据接收事件
    mqttAdapter.on(DeviceConnectionEventType.DATA_RECEIVED, (event) => {
      console.log(`事件: MQTT设备 ${event.deviceId} 数据接收`, event.data ? '数据长度: ' + JSON.stringify(event.data).length : '');
    });

    // 设备命令结果事件
    mqttAdapter.on(DeviceConnectionEventType.COMMAND_RESULT, (event) => {
      console.log(`事件: MQTT设备 ${event.deviceId} 命令结果`, event.data?.status);
    });

    // 设备错误事件
    mqttAdapter.on(DeviceConnectionEventType.ERROR, (event) => {
      console.log(`事件: MQTT设备 ${event.deviceId} 错误`, event.error?.message);
    });
  }
}

// 主测试函数
async function runTests() {
  try {
    // 初始化设备管理器
    const adapters = await initializeDeviceManager();

    // 设置事件监听
    setupEventListeners(adapters);

    // 测试USB设备
    await testUSBDevice(adapters);

    // 测试MQTT设备
    await testMQTTDevice(adapters);

    console.log('\n所有测试已完成');

  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
runTests().catch(console.error);
