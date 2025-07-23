/**
 * 设备通信服务测试
 */

import { DeviceManagerImpl } from '../src/services/device-framework/device-manager.js';
import { DeviceRegistrationService } from '../src/services/device-framework/device-registration-service.js';
import { DeviceCommunicationService, CommunicationMode, CommunicationPriority } from '../src/services/device-framework/device-communication-service.js';
import { ModbusDeviceAdapter } from '../src/services/device-framework/adapters/modbus-adapter.js';
import { HttpRestDeviceAdapter } from '../src/services/device-framework/adapters/http-rest-adapter.js';
import { DeviceType, DeviceConnectionStatus } from '../src/models/device.model.js';

// 创建测试设备
const testDevice = {
  id: 'test-device-001',
  name: '测试设备',
  type: DeviceType.SENSOR,
  model: 'TestSensor-1000',
  manufacturer: '测试厂商',
  description: '用于测试的传感器设备',
  connectionStatus: DeviceConnectionStatus.OFFLINE,
  location: '测试实验室',
  ipAddress: '192.168.1.100',
  macAddress: '00:11:22:33:44:55',
  firmware: 'v1.0.0',
  capabilities: ['temperature', 'humidity'],
  supportedProtocols: ['modbus', 'http'],
  dataFormats: ['json'],
  configuration: {},
  metadata: {
    precision: '0.1C'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 设备连接配置
const deviceConnectionConfig = {
  connectionType: 'modbus',
  address: '192.168.1.100',
  port: 502,
  unitId: 1,
  timeout: 3000,
  retries: 3,
  parameters: {}
};

// 测试命令
const testCommand = {
  id: 'cmd-001',
  deviceId: testDevice.id,
  command: 'read_temperature',
  parameters: {
    register: 100,
    count: 2
  },
  timestamp: new Date().toISOString(),
  status: 'pending'
};

async function runDeviceCommunicationTest() {
  console.log('开始设备通信服务测试...');

  try {
    // 创建设备管理器
    const deviceManager = new DeviceManagerImpl();
    await deviceManager.initialize();

    // 注册协议适配器
    const modbusAdapter = new ModbusDeviceAdapter();
    const httpAdapter = new HttpRestDeviceAdapter();

    deviceManager.registerAdapter(modbusAdapter);
    deviceManager.registerAdapter(httpAdapter);

    console.log('已注册协议适配器: Modbus, HTTP/REST');

    // 创建设备注册服务
    const registrationService = new DeviceRegistrationService(deviceManager);

    // 创建设备通信服务
    const communicationService = new DeviceCommunicationService(deviceManager);
    communicationService.setRegistrationService(registrationService);

    console.log('已创建设备注册服务和设备通信服务');

    // 注册测试设备
    console.log('注册测试设备...');
    await registrationService.registerDevice(testDevice, {
      validateDevice: true,
      connectionConfig: deviceConnectionConfig
    });

    console.log(`设备注册成功: ${testDevice.name} (${testDevice.id})`);

    // 连接设备
    console.log('连接设备...');
    await deviceManager.connectDevice(testDevice.id);
    console.log(`设备已连接: ${testDevice.name}`);

    // 测试同步命令发送
    console.log('测试同步命令发送...');
    try {
      const requestId = await communicationService.sendCommand({
        deviceId: testDevice.id,
        command: testCommand,
        timeout: 5000,
        retries: 2
      });

      console.log(`同步命令发送成功，请求ID: ${requestId}`);
    } catch (error) {
      console.error('同步命令发送失败:', error);
    }

    // 测试异步命令发送
    console.log('测试异步命令发送...');
    try {
      const requestId = await communicationService.sendCommand({
        deviceId: testDevice.id,
        command: {
          ...testCommand,
          id: 'cmd-002',
          command: 'read_humidity'
        },
        mode: CommunicationMode.ASYNCHRONOUS,
        priority: CommunicationPriority.HIGH,
        callback: (response, error) => {
          if (error) {
            console.error('异步命令回调错误:', error);
          } else {
            console.log('异步命令回调响应:', response);
          }
        }
      });

      console.log(`异步命令已排队，请求ID: ${requestId}`);
    } catch (error) {
      console.error('异步命令发送失败:', error);
    }

    // 测试轮询命令
    console.log('测试轮询命令...');
    try {
      const requestId = await communicationService.sendCommand({
        deviceId: testDevice.id,
        command: {
          ...testCommand,
          id: 'cmd-003',
          command: 'read_status'
        },
        mode: CommunicationMode.POLLING,
        metadata: {
          pollingInterval: 3000 // 3秒轮询一次
        }
      });

      console.log(`轮询命令已设置，请求ID: ${requestId}`);

      // 10秒后取消轮询
      setTimeout(() => {
        console.log('取消轮询命令...');
        const cancelled = communicationService.cancelRequest(requestId);
        console.log(`轮询命令取消${cancelled ? '成功' : '失败'}`);
      }, 10000);
    } catch (error) {
      console.error('轮询命令设置失败:', error);
    }

    // 获取会话信息
    setTimeout(() => {
      console.log('获取设备会话信息...');
      const session = communicationService.getDeviceSession(testDevice.id);

      if (session) {
        console.log('设备会话信息:', {
          id: session.id,
          deviceId: session.deviceId,
          status: session.status,
          startTime: session.startTime,
          requestCount: session.requests.length,
          responseCount: session.responses.length,
          statistics: session.statistics
        });
      } else {
        console.log('未找到设备会话');
      }

      // 测试完成，断开设备
      setTimeout(async () => {
        console.log('断开设备连接...');
        await deviceManager.disconnectDevice(testDevice.id);
        console.log(`设备已断开连接: ${testDevice.name}`);

        console.log('设备通信服务测试完成');
      }, 2000);
    }, 15000);

  } catch (error) {
    console.error('设备通信服务测试失败:', error);
  }
}

// 运行测试
runDeviceCommunicationTest();
