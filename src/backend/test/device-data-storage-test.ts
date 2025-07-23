/**
 * 设备数据存储服务测试
 */

import { DeviceManagerImpl } from '../src/services/device-framework/device-manager.js';
import { DeviceRegistrationService } from '../src/services/device-framework/device-registration-service.js';
import { DeviceCommunicationService } from '../src/services/device-framework/device-communication-service.js';
import { DeviceDataStorageService, DataStorageStrategy, DataCompressionAlgorithm } from '../src/services/device-framework/device-data-storage-service.js';
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

// 创建测试数据点
function createTestDataPoint(deviceId: string, sensorType: string, value: number): any {
  return {
    id: `dp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    deviceId,
    timestamp: new Date().toISOString(),
    sensorType,
    value,
    unit: sensorType === 'temperature' ? '°C' : sensorType === 'humidity' ? '%' : '',
    quality: 100,
    metadata: {
      source: 'test',
      sampleRate: '1Hz'
    }
  };
}

// 生成一系列测试数据点
function generateTestData(deviceId: string, count: number): any[] {
  const data = [];
  const sensorTypes = ['temperature', 'humidity', 'pressure'];

  for (let i = 0; i < count; i++) {
    const sensorType = sensorTypes[i % sensorTypes.length];
    let value;

    switch (sensorType) {
      case 'temperature':
        value = 20 + Math.sin(i * 0.1) * 5; // 模拟温度波动
        break;
      case 'humidity':
        value = 50 + Math.sin(i * 0.05) * 10; // 模拟湿度波动
        break;
      case 'pressure':
        value = 1013 + Math.sin(i * 0.02) * 5; // 模拟气压波动
        break;
      default:
        value = Math.random() * 100;
    }

    data.push(createTestDataPoint(deviceId, sensorType, value));
  }

  return data;
}

async function runDeviceDataStorageTest() {
  console.log('开始设备数据存储服务测试...');

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

    // 创建设备数据存储服务
    const dataStorageService = new DeviceDataStorageService(deviceManager);
    await dataStorageService.initialize();
    dataStorageService.setCommunicationService(communicationService);

    console.log('已创建设备数据存储服务');

    // 设置事件监听
    dataStorageService.on('data-point-buffered', (event) => {
      console.log(`数据点已缓存: 设备ID=${event.deviceId}, 时间戳=${event.timestamp}`);
    });

    dataStorageService.on('flush-completed', (event) => {
      console.log(`数据已刷新到存储: 设备ID=${event.deviceId}, 数量=${event.count}, 时间戳=${event.timestamp}`);
    });

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

    // 配置数据存储
    console.log('配置数据存储...');
    dataStorageService.configureDeviceStorage({
      deviceId: testDevice.id,
      storageStrategy: DataStorageStrategy.BATCH,
      compressionAlgorithm: DataCompressionAlgorithm.NONE,
      batchSize: 10,
      retentionPeriod: 30 // 保留30天
    });

    console.log('数据存储已配置');

    // 测试存储单个数据点
    console.log('测试存储单个数据点...');
    const singleDataPoint = createTestDataPoint(testDevice.id, 'temperature', 23.5);
    await dataStorageService.storeDataPoint(singleDataPoint);

    // 测试批量存储数据点
    console.log('测试批量存储数据点...');
    const batchData = generateTestData(testDevice.id, 20);
    const storedCount = await dataStorageService.storeDataPoints(batchData);
    console.log(`成功存储了 ${storedCount} 个数据点`);

    // 获取设备统计信息
    console.log('获取设备统计信息...');
    const stats = dataStorageService.getDeviceStatistics(testDevice.id);
    console.log('设备数据统计:', stats);

    // 测试查询数据
    console.log('测试查询数据...');
    const queryResults = await dataStorageService.queryData({
      deviceId: testDevice.id,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 过去24小时
      endTime: new Date().toISOString(),
      sensorTypes: ['temperature']
    });

    console.log(`查询结果: ${queryResults.length} 个数据点`);

    // 测试导出数据
    console.log('测试导出数据...');
    const csvData = await dataStorageService.exportData({
      deviceId: testDevice.id,
      sensorTypes: ['temperature', 'humidity']
    }, 'csv');

    console.log('导出的CSV数据片段:');
    console.log(typeof csvData === 'string' ? csvData.substring(0, 200) + '...' : '无法显示');

    // 测试数据清除
    console.log('测试数据清除...');
    setTimeout(async () => {
      // 手动刷新数据
      await dataStorageService.flushDeviceData(testDevice.id);

      // 再次获取统计信息
      const updatedStats = dataStorageService.getDeviceStatistics(testDevice.id);
      console.log('更新后的设备数据统计:', updatedStats);

      // 清除数据
      await dataStorageService.clearDeviceData(testDevice.id);
      console.log('设备数据已清除');

      // 断开设备连接
      console.log('断开设备连接...');
      await deviceManager.disconnectDevice(testDevice.id);
      console.log(`设备已断开连接: ${testDevice.name}`);

      console.log('设备数据存储服务测试完成');
    }, 5000);

  } catch (error) {
    console.error('设备数据存储服务测试失败:', error);
  }
}

// 运行测试
runDeviceDataStorageTest();
