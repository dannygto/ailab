/**
 * Modbus协议适配器测试
 */

import { ModbusDeviceAdapter } from './adapters/modbus-adapter.js';
import { DeviceConnectionEventType } from './types.js';

async function testModbusAdapter() {
  console.log('======= 开始测试Modbus协议适配器 =======');

  // 创建适配器实例
  const modbusAdapter = new ModbusDeviceAdapter();

  // 初始化适配器
  await modbusAdapter.initialize();

  // 注册事件监听器
  modbusAdapter.on(DeviceConnectionEventType.CONNECTED, (event) => {
    console.log(`设备已连接: ${event.deviceId}, 时间: ${event.timestamp}`);
  });

  modbusAdapter.on(DeviceConnectionEventType.DISCONNECTED, (event) => {
    console.log(`设备已断开连接: ${event.deviceId}, 时间: ${event.timestamp}`);
  });

  modbusAdapter.on(DeviceConnectionEventType.ERROR, (event) => {
    console.log(`设备错误: ${event.deviceId}, 错误: ${event.error?.message}, 时间: ${event.timestamp}`);
  });

  modbusAdapter.on(DeviceConnectionEventType.DATA_RECEIVED, (event) => {
    console.log(`设备数据接收: ${event.deviceId}, 数据:`, event.data);
  });

  // 测试Modbus TCP设备
  const tcpDeviceId = 'modbus-tcp-device-1';
  const tcpConfig = {
    connectionType: 'modbus-tcp',
    mode: 'tcp',
    parameters: {
      host: '192.168.1.100',
      port: 502,
      unitId: 1,
      autoReconnect: true,
      reconnectInterval: 3000,
      // 寄存器映射
      registerMap: {
        temperature: {
          address: 100,
          registerType: 'holding',
          dataType: 'int16',
          accessMode: 'read-write'
        },
        humidity: {
          address: 101,
          registerType: 'holding',
          dataType: 'int16',
          accessMode: 'read-write'
        },
        status: {
          address: 0,
          registerType: 'coil',
          dataType: 'boolean',
          accessMode: 'read-write'
        }
      },
      // 数据轮询间隔(毫秒)
      pollingInterval: 2000
    }
  };

  console.log('连接到Modbus TCP设备...');
  const tcpConnected = await modbusAdapter.connect(tcpDeviceId, tcpConfig);
  console.log(`Modbus TCP连接结果: ${tcpConnected}`);

  // 等待连接完成
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 测试命令发送
  console.log('读取温度...');
  const temperatureReading = await modbusAdapter.sendCommand(tcpDeviceId, {
    id: 'cmd-1',
    deviceId: tcpDeviceId,
    timestamp: new Date().toISOString(),
    status: 'pending',
    command: 'read',
    parameters: {
      paramName: 'temperature'
    }
  });
  console.log('温度读数:', temperatureReading);

  console.log('设置温度...');
  const setTemperature = await modbusAdapter.sendCommand(tcpDeviceId, {
    id: 'cmd-2',
    deviceId: tcpDeviceId,
    timestamp: new Date().toISOString(),
    status: 'pending',
    command: 'write',
    parameters: {
      paramName: 'temperature',
      value: 25
    }
  });
  console.log('设置温度结果:', setTemperature);

  // 测试协议特定方法
  console.log('读取线圈...');
  const readCoilsMethod = modbusAdapter.getProtocolSpecificMethod('readCoils');
  if (readCoilsMethod) {
    const coils = await readCoilsMethod(tcpDeviceId, 0, 5);
    console.log('线圈状态:', coils);
  }

  // 测试Modbus RTU设备
  const rtuDeviceId = 'modbus-rtu-device-1';
  const rtuConfig = {
    connectionType: 'modbus-rtu',
    mode: 'rtu',
    parameters: {
      serialPort: 'COM1',
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      unitId: 1,
      autoReconnect: true
    }
  };

  console.log('连接到Modbus RTU设备...');
  const rtuConnected = await modbusAdapter.connect(rtuDeviceId, rtuConfig);
  console.log(`Modbus RTU连接结果: ${rtuConnected}`);

  // 等待连接完成
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('读取保持寄存器...');
  const holdingRegisters = await modbusAdapter.sendCommand(rtuDeviceId, {
    id: 'cmd-3',
    deviceId: rtuDeviceId,
    timestamp: new Date().toISOString(),
    status: 'pending',
    command: 'read',
    parameters: {
      registerType: 'holding',
      address: 100,
      length: 4
    }
  });
  console.log('保持寄存器读数:', holdingRegisters);

  // 测试直接读取数据方法
  console.log('直接读取数据...');
  const directReadData = await modbusAdapter.readData(rtuDeviceId, {
    registerType: 'input',
    address: 30,
    length: 2
  });
  console.log('直接读取结果:', directReadData);

  // 允许一些数据轮询发生
  console.log('等待数据轮询...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 断开连接
  console.log('断开Modbus TCP设备...');
  await modbusAdapter.disconnect(tcpDeviceId);

  console.log('断开Modbus RTU设备...');
  await modbusAdapter.disconnect(rtuDeviceId);

  console.log('======= Modbus协议适配器测试完成 =======');
}

// 运行测试
testModbusAdapter().catch(console.error);
