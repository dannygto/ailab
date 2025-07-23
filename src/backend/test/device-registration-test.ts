/**
 * 设备注册服务测试
 */

import { DeviceManagerImpl } from '../src/services/device-framework/device-manager.js';
import { DeviceRegistrationService } from '../src/services/device-framework/device-registration-service.js';
import { DeviceDiscoveryServiceImpl } from '../src/services/device-framework/device-discovery-service.js';
import { ModbusDeviceAdapter } from '../src/services/device-framework/adapters/modbus-adapter.js';
import { HttpRestDeviceAdapter } from '../src/services/device-framework/adapters/http-rest-adapter.js';
import { DeviceType, DeviceConnectionStatus } from '../src/models/device.model.js';

// 创建测试设备数据
const testDevices = [
  {
    id: 'device-001',
    name: '温度传感器',
    type: DeviceType.SENSOR,
    model: 'TempSensor-2000',
    manufacturer: '科学仪器有限公司',
    description: '高精度温度传感器',
    connectionStatus: DeviceConnectionStatus.OFFLINE,
    location: '实验室A',
    ipAddress: '192.168.1.100',
    macAddress: '00:1A:2B:3C:4D:5E',
    firmware: 'v1.2.3',
    capabilities: ['temperature', 'humidity'],
    supportedProtocols: ['modbus', 'http'],
    dataFormats: ['json', 'csv'],
    configuration: {},
    metadata: {
      precision: '0.1C',
      range: '-40C to 80C'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'device-002',
    name: '气体分析仪',
    type: DeviceType.SPECTROSCOPE,
    model: 'GasAnalyzer-500',
    manufacturer: '分析仪器制造商',
    description: '气体成分分析仪',
    connectionStatus: DeviceConnectionStatus.OFFLINE,
    location: '实验室B',
    ipAddress: '192.168.1.101',
    macAddress: '00:1A:2B:3C:4D:5F',
    firmware: 'v2.0.1',
    capabilities: ['gas_analysis', 'air_quality'],
    supportedProtocols: ['modbus', 'http'],
    dataFormats: ['json', 'xml'],
    configuration: {},
    metadata: {
      gases: ['O2', 'CO2', 'CO', 'N2']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 创建设备连接配置
const modbusConnectionConfig = {
  connectionType: 'modbus',
  address: '192.168.1.100',
  port: 502,
  unitId: 1,
  timeout: 3000,
  retries: 3
};

const httpConnectionConfig = {
  connectionType: 'http',
  baseUrl: 'http://192.168.1.101:8080/api',
  auth: {
    type: 'basic',
    username: 'admin',
    password: 'password'
  },
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
};

async function runDeviceRegistrationTest() {
  console.log('开始设备注册服务测试...');

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

    // 创建设备发现服务
    const discoveryService = new DeviceDiscoveryServiceImpl();
    registrationService.setDiscoveryService(discoveryService);

    console.log('已创建设备注册服务和设备发现服务');

    // 注册测试设备
    console.log('开始注册测试设备...');

    // 注册第一个设备（温度传感器）
    const device1Id = await registrationService.registerDevice(testDevices[0], {
      validateDevice: true,
      connectionConfig: modbusConnectionConfig
    });

    console.log(`注册成功: ${testDevices[0].name} (${device1Id})`);

    // 注册第二个设备（气体分析仪）
    const device2Id = await registrationService.registerDevice(testDevices[1], {
      validateDevice: true,
      connectionConfig: httpConnectionConfig
    });

    console.log(`注册成功: ${testDevices[1].name} (${device2Id})`);

    // 获取所有已注册设备
    const registeredDevices = await registrationService.getRegisteredDevices();
    console.log(`已注册设备数量: ${registeredDevices.length}`);

    // 尝试连接设备
    console.log('尝试连接设备...');

    try {
      // 连接第一个设备
      await deviceManager.connectDevice(device1Id);
      console.log(`设备连接成功: ${testDevices[0].name}`);
    } catch (error) {
      console.error(`设备连接失败: ${testDevices[0].name}`, error.message);
    }

    try {
      // 连接第二个设备
      await deviceManager.connectDevice(device2Id);
      console.log(`设备连接成功: ${testDevices[1].name}`);
    } catch (error) {
      console.error(`设备连接失败: ${testDevices[1].name}`, error.message);
    }

    // 更新设备信息
    console.log('更新设备信息...');

    await registrationService.updateDeviceDetails(device1Id, {
      firmware: 'v1.2.4',
      metadata: {
        ...testDevices[0].metadata,
        lastCalibration: new Date().toISOString()
      }
    });

    console.log(`设备信息已更新: ${testDevices[0].name}`);

    // 获取更新后的设备信息
    const updatedDevice = await registrationService.getDeviceDetails(device1Id);
    console.log('更新后的设备信息:', updatedDevice.firmware, updatedDevice.metadata);

    // 模拟发现新设备
    console.log('模拟设备发现...');

    // 启动自动发现
    await registrationService.startAutoDiscoveryAndRegistration(30000);
    console.log('已启动自动设备发现');

    // 等待10秒后停止自动发现
    setTimeout(async () => {
      await registrationService.stopAutoDiscoveryAndRegistration();
      console.log('已停止自动设备发现');

      // 注销设备
      console.log('注销设备...');

      const unregisterResult1 = await registrationService.unregisterDevice(device1Id);
      console.log(`设备注销${unregisterResult1 ? '成功' : '失败'}: ${testDevices[0].name}`);

      const unregisterResult2 = await registrationService.unregisterDevice(device2Id);
      console.log(`设备注销${unregisterResult2 ? '成功' : '失败'}: ${testDevices[1].name}`);

      console.log('设备注册服务测试完成');
    }, 10000);

  } catch (error) {
    console.error('设备注册服务测试失败:', error);
  }
}

// 运行测试
runDeviceRegistrationTest();
