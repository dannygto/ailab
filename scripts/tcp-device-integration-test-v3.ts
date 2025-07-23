/**
 * TCP Socket设备集成测试工具 V3
 * 用于测试实际设备与平台的通信和数据交换
 */

import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';

// 配置
interface DeviceConfig {
  id: string;
  name: string;
  ip: string;
  port: number;
  protocol: 'tcp';
  timeout: number;
  commandSet: CommandSet;
}

interface CommandSet {
  init: string;
  getData: string;
  control: string;
  reset: string;
  status: string;
}

// 测试结果
interface TestResult {
  deviceId: string;
  name: string;
  connectionSuccess: boolean;
  dataExchangeSuccess: boolean;
  responseTime: number;
  error?: string;
  rawResponse?: string;
  parsedData?: any;
}

// 获取设备配置
function loadDeviceConfigs(): DeviceConfig[] {
  try {
    const configPath = path.join(__dirname, '../config/devices/actual-devices.json');
    const configData = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('加载设备配置失败:', error);
    return [];
  }
}

// 测试TCP连接
async function testTcpConnection(device: DeviceConfig): Promise<TestResult> {
  const result: TestResult = {
    deviceId: device.id,
    name: device.name,
    connectionSuccess: false,
    dataExchangeSuccess: false,
    responseTime: 0
  };

  const startTime = Date.now();
  const client = new net.Socket();

  return new Promise((resolve) => {
    // 设置超时
    const timeout = setTimeout(() => {
      client.destroy();
      result.error = '连接超时';
      resolve(result);
    }, device.timeout);

    client.connect(device.port, device.ip, () => {
      console.log(`已连接到设备 ${device.name} (${device.ip}:${device.port})`);
      result.connectionSuccess = true;

      // 发送初始化命令
      const initCommand = Buffer.from(device.commandSet.init, 'hex');
      client.write(initCommand);

      // 延迟发送获取数据命令
      setTimeout(() => {
        const dataCommand = Buffer.from(device.commandSet.getData, 'hex');
        client.write(dataCommand);
      }, 500);
    });

    let responseData = Buffer.alloc(0);

    client.on('data', (data) => {
      responseData = Buffer.concat([responseData, data]);

      // 检查是否已接收完整数据
      if (responseData.length > 0) {
        clearTimeout(timeout);
        result.responseTime = Date.now() - startTime;
        result.dataExchangeSuccess = true;
        result.rawResponse = responseData.toString('hex');

        try {
          // 尝试解析数据
          result.parsedData = parseDeviceData(device.id, responseData);
        } catch (error) {
          console.error(`解析设备 ${device.name} 数据失败:`, error);
        }

        client.destroy();
        resolve(result);
      }
    });

    client.on('error', (error) => {
      clearTimeout(timeout);
      result.error = `连接错误: ${error.message}`;
      client.destroy();
      resolve(result);
    });

    client.on('close', () => {
      clearTimeout(timeout);
      if (!result.connectionSuccess) {
        result.error = '连接被关闭';
      }
      resolve(result);
    });
  });
}

// 解析设备数据
function parseDeviceData(deviceId: string, data: Buffer): any {
  // 根据设备类型进行不同的解析逻辑
  // 这里仅作示例，实际应用中需要根据设备协议进行解析

  // 常见的传感器数据解析逻辑示例
  if (deviceId.startsWith('sensor_')) {
    // 温湿度传感器
    if (deviceId.includes('temp') || deviceId.includes('hum')) {
      const temp = data[3] + data[4] / 10;
      const humidity = data[5] + data[6] / 10;
      return { temperature: temp, humidity: humidity };
    }

    // 光照传感器
    if (deviceId.includes('light')) {
      const value = (data[3] << 8) + data[4];
      return { lightIntensity: value };
    }

    // 气体传感器
    if (deviceId.includes('gas')) {
      const value = (data[3] << 8) + data[4];
      return { concentration: value };
    }
  }

  // 控制设备
  if (deviceId.startsWith('ctrl_')) {
    // 开关状态
    if (deviceId.includes('switch')) {
      return { state: data[3] === 1 ? 'on' : 'off' };
    }

    // 电机控制
    if (deviceId.includes('motor')) {
      return {
        state: data[3] === 1 ? 'running' : 'stopped',
        speed: data[4]
      };
    }
  }

  // 默认简单解析
  return {
    raw: Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' ')
  };
}

// 运行测试
async function runTests() {
  console.log('===== 开始TCP设备连接测试 =====');

  const devices = loadDeviceConfigs();

  if (devices.length === 0) {
    console.log('没有找到设备配置，请检查配置文件');
    return;
  }

  console.log(`找到 ${devices.length} 个设备配置`);

  const results: TestResult[] = [];

  for (const device of devices) {
    console.log(`正在测试设备: ${device.name} (${device.ip}:${device.port})`);
    const result = await testTcpConnection(device);
    results.push(result);

    // 打印结果
    console.log('-'.repeat(50));
    console.log(`设备ID: ${result.deviceId}`);
    console.log(`设备名称: ${result.name}`);
    console.log(`连接状态: ${result.connectionSuccess ? '成功' : '失败'}`);
    console.log(`数据交换: ${result.dataExchangeSuccess ? '成功' : '失败'}`);
    console.log(`响应时间: ${result.responseTime}ms`);

    if (result.error) {
      console.log(`错误信息: ${result.error}`);
    }

    if (result.parsedData) {
      console.log('解析数据:');
      console.log(JSON.stringify(result.parsedData, null, 2));
    }

    console.log('-'.repeat(50));
    console.log('');
  }

  // 保存测试结果
  const resultsDir = path.join(__dirname, '../tests/reports');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsPath = path.join(resultsDir, `tcp-device-test-${timestamp}.json`);

  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`测试结果已保存至: ${resultsPath}`);

  // 打印摘要
  console.log('===== 测试摘要 =====');
  console.log(`总共测试设备: ${results.length}`);
  console.log(`连接成功: ${results.filter(r => r.connectionSuccess).length}`);
  console.log(`数据交换成功: ${results.filter(r => r.dataExchangeSuccess).length}`);
  console.log(`连接失败: ${results.filter(r => !r.connectionSuccess).length}`);

  // 计算平均响应时间
  const successResults = results.filter(r => r.dataExchangeSuccess);
  if (successResults.length > 0) {
    const avgResponseTime = successResults.reduce((sum, r) => sum + r.responseTime, 0) / successResults.length;
    console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
  }
}

// 执行测试
runTests().catch(console.error);
