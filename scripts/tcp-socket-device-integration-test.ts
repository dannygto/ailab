#!/usr/bin/env node

/**
 * TCP/Socket设备集成测试工具
 *
 * 这个工具用于测试TCP/Socket协议适配器与实际设备的集成
 *
 * @version 1.0.0
 * @date 2025-07-23
 */

import * as path from 'path';
import * as fs from 'fs';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { TCPSocketConnectionOptions, ITCPSocketClient, TCPSocketEvents } from '../src/backend/device/adapters/tcp-socket/tcp-socket-adapter';
import { TCPSocketClientImpl } from '../src/backend/device/adapters/tcp-socket/tcp-socket-adapter.impl';
import { DeviceDiscoveryService, DeviceDiscoveryEvents, DeviceType, DEFAULT_DEVICE_SIGNATURES } from '../src/backend/device/adapters/tcp-socket/device-discovery';

/**
 * 测试类型
 */
enum TestType {
  DISCOVERY = 'discovery',
  CONNECT = 'connect',
  SEND = 'send',
  RECEIVE = 'receive',
  MONITOR = 'monitor',
  FULL = 'full'
}

/**
 * 测试配置
 */
interface TestConfig {
  host?: string;
  port?: number;
  type: TestType;
  command?: string;
  timeout?: number;
  verbose: boolean;
  secure: boolean;
  discover: boolean;
  duration?: number;
  outputFile?: string;
  deviceType?: DeviceType;
}

/**
 * 解析命令行参数
 */
const parseArgs = (): TestConfig => {
  return yargs(hideBin(process.argv))
    .option('host', {
      type: 'string',
      description: '设备主机地址',
    })
    .option('port', {
      type: 'number',
      description: '设备端口号',
    })
    .option('type', {
      choices: Object.values(TestType),
      default: TestType.FULL,
      description: '测试类型',
    })
    .option('command', {
      type: 'string',
      description: '发送的命令',
    })
    .option('timeout', {
      type: 'number',
      default: 10000,
      description: '超时时间(毫秒)',
    })
    .option('verbose', {
      type: 'boolean',
      default: false,
      description: '详细输出',
    })
    .option('secure', {
      type: 'boolean',
      default: false,
      description: '使用安全连接(TLS/SSL)',
    })
    .option('discover', {
      type: 'boolean',
      default: true,
      description: '是否使用设备发现',
    })
    .option('duration', {
      type: 'number',
      description: '监控持续时间(秒)',
    })
    .option('output-file', {
      type: 'string',
      description: '输出文件路径',
    })
    .option('device-type', {
      choices: Object.values(DeviceType),
      description: '设备类型过滤',
    })
    .check((argv) => {
      // 除了发现测试外，其他测试需要指定主机和端口，除非启用设备发现
      if (argv.type !== TestType.DISCOVERY && !argv.discover && (!argv.host || !argv.port)) {
        throw new Error('必须指定主机和端口，或启用设备发现');
      }

      // 发送测试需要指定命令
      if (argv.type === TestType.SEND && !argv.command) {
        throw new Error('发送测试必须指定命令');
      }

      // 监控测试需要指定持续时间
      if (argv.type === TestType.MONITOR && !argv.duration) {
        throw new Error('监控测试必须指定持续时间');
      }

      return true;
    })
    .parse() as TestConfig;
};

/**
 * 打印分隔线
 */
const printSeparator = () => {
  console.log('='.repeat(80));
};

/**
 * 运行设备发现测试
 */
const runDiscoveryTest = async (config: TestConfig): Promise<void> => {
  console.log('开始设备发现测试...');
  printSeparator();

  const discoveryService = new DeviceDiscoveryService(DEFAULT_DEVICE_SIGNATURES);

  // 设置事件监听器
  discoveryService.on(DeviceDiscoveryEvents.DEVICE_FOUND, (device) => {
    console.log(`发现设备: ${device.id}`);
    if (config.verbose) {
      console.log(JSON.stringify(device, null, 2));
    } else {
      console.log(`  主机: ${device.host}`);
      console.log(`  端口: ${device.port}`);
      console.log(`  类型: ${device.type}`);
      if (device.manufacturer) console.log(`  制造商: ${device.manufacturer}`);
      if (device.model) console.log(`  型号: ${device.model}`);
    }
    printSeparator();
  });

  discoveryService.on(DeviceDiscoveryEvents.DEVICE_LOST, (deviceId) => {
    console.log(`设备离线: ${deviceId}`);
    printSeparator();
  });

  discoveryService.on(DeviceDiscoveryEvents.DISCOVERY_ERROR, (error) => {
    console.error('发现过程错误:', error);
  });

  // 开始发现过程
  await discoveryService.startDiscovery({
    scanTimeout: config.timeout,
    portRange: { start: 1024, end: 10000 } // 扫描常用端口范围
  });

  console.log('设备发现过程已启动，等待发现设备...');

  // 设置超时
  const duration = config.duration || 60; // 默认1分钟
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(`设备发现完成，共发现 ${discoveryService.getDiscoveredDevices().length} 个设备。`);
      resolve();
    }, duration * 1000);
  });

  // 停止发现过程
  await discoveryService.stopDiscovery();

  // 输出结果
  const devices = discoveryService.getDiscoveredDevices();

  if (devices.length === 0) {
    console.log('未发现任何设备');
    return;
  }

  console.log('发现的设备列表:');
  printSeparator();

  devices.forEach((device, index) => {
    console.log(`设备 ${index + 1}:`);
    console.log(`  ID: ${device.id}`);
    console.log(`  主机: ${device.host}`);
    console.log(`  端口: ${device.port}`);
    console.log(`  类型: ${device.type}`);
    if (device.manufacturer) console.log(`  制造商: ${device.manufacturer}`);
    if (device.model) console.log(`  型号: ${device.model}`);
    if (device.description) console.log(`  描述: ${device.description}`);
    console.log(`  首次发现: ${device.firstSeen.toISOString()}`);
    console.log(`  最后发现: ${device.lastSeen.toISOString()}`);
    printSeparator();
  });

  // 按类型输出统计
  const devicesByType = Object.values(DeviceType).reduce((acc, type) => {
    acc[type] = devices.filter(d => d.type === type).length;
    return acc;
  }, {} as Record<string, number>);

  console.log('设备类型统计:');
  for (const [type, count] of Object.entries(devicesByType)) {
    if (count > 0) {
      console.log(`  ${type}: ${count}台`);
    }
  }

  // 保存结果到文件
  if (config.outputFile) {
    const outputData = {
      timestamp: new Date().toISOString(),
      totalDevices: devices.length,
      devices,
      statistics: devicesByType
    };

    fs.writeFileSync(config.outputFile, JSON.stringify(outputData, null, 2));
    console.log(`结果已保存到: ${config.outputFile}`);
  }
};

/**
 * 连接到设备
 */
const connectToDevice = async (config: TestConfig): Promise<ITCPSocketClient> => {
  if (!config.host || !config.port) {
    throw new Error('连接测试必须指定主机和端口');
  }

  console.log(`连接到设备 ${config.host}:${config.port}...`);

  const connectionOptions: TCPSocketConnectionOptions = {
    host: config.host,
    port: config.port,
    connectionTimeout: config.timeout,
    keepAlive: true,
    noDelay: true
  };

  if (config.secure) {
    console.log('使用安全连接(TLS/SSL)');
    connectionOptions.secure = {
      rejectUnauthorized: false // 测试环境中允许自签名证书
    };
  }

  const client = new TCPSocketClientImpl();

  // 设置事件监听器
  client.on(TCPSocketEvents.CONNECTED, () => {
    console.log('已连接到设备');
    printSeparator();
  });

  client.on(TCPSocketEvents.DISCONNECTED, () => {
    console.log('与设备断开连接');
    printSeparator();
  });

  client.on(TCPSocketEvents.ERROR, (error) => {
    console.error('连接错误:', error);
    printSeparator();
  });

  client.on(TCPSocketEvents.DATA_RECEIVED, (data) => {
    if (config.verbose) {
      console.log('接收到数据:');
      console.log(data);
    } else {
      console.log(`接收到 ${data.length} 字节数据`);
    }
  });

  // 连接到设备
  await client.connect(connectionOptions);

  return client;
};

/**
 * 运行连接测试
 */
const runConnectionTest = async (config: TestConfig): Promise<void> => {
  console.log('开始连接测试...');
  printSeparator();

  // 如果启用设备发现，先进行发现
  if (config.discover && (!config.host || !config.port)) {
    const discoveryService = new DeviceDiscoveryService(DEFAULT_DEVICE_SIGNATURES);

    console.log('正在发现设备...');

    await discoveryService.startDiscovery({
      scanTimeout: config.timeout / 2,
      portRange: { start: 1024, end: 10000 }
    });

    // 等待一段时间以发现设备
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 10000); // 等待10秒
    });

    // 停止发现
    await discoveryService.stopDiscovery();

    // 获取发现的设备
    const devices = discoveryService.getDiscoveredDevices();

    if (devices.length === 0) {
      console.log('未发现任何设备，无法进行连接测试');
      return;
    }

    // 如果指定了设备类型，筛选该类型的设备
    let filteredDevices = devices;
    if (config.deviceType) {
      filteredDevices = devices.filter(d => d.type === config.deviceType);
      if (filteredDevices.length === 0) {
        console.log(`未发现类型为 ${config.deviceType} 的设备`);
        filteredDevices = devices; // 如果没有指定类型的设备，使用所有设备
      }
    }

    console.log(`发现了 ${filteredDevices.length} 个设备，选择第一个进行连接测试`);

    // 选择第一个设备
    const selectedDevice = filteredDevices[0];
    config.host = selectedDevice.host;
    config.port = selectedDevice.port;

    console.log(`选择设备: ${selectedDevice.id}`);
    if (selectedDevice.manufacturer) console.log(`制造商: ${selectedDevice.manufacturer}`);
    if (selectedDevice.model) console.log(`型号: ${selectedDevice.model}`);
  }

  // 连接到设备
  const client = await connectToDevice(config);

  // 获取连接状态和统计信息
  const connectionState = client.getConnectionState();
  console.log('连接状态:', connectionState);

  const stats = client.getStats();
  console.log('连接统计:');
  console.log(`  已发送字节数: ${stats.bytesSent}`);
  console.log(`  已接收字节数: ${stats.bytesReceived}`);
  console.log(`  连接次数: ${stats.connectCount}`);
  console.log(`  断开次数: ${stats.disconnectCount}`);
  console.log(`  错误次数: ${stats.errorCount}`);

  // 断开连接
  await client.disconnect();
  console.log('连接测试完成');
};

/**
 * 运行发送测试
 */
const runSendTest = async (config: TestConfig): Promise<void> => {
  if (!config.command) {
    throw new Error('发送测试必须指定命令');
  }

  console.log('开始发送测试...');
  printSeparator();

  // 连接到设备
  const client = await connectToDevice(config);

  try {
    // 发送命令
    console.log(`发送命令: ${config.command}`);
    const result = await client.send(config.command, {
      timeout: config.timeout,
      expectResponse: true
    });

    console.log('命令发送成功');

    if (result) {
      console.log('接收到响应:');
      console.log(result);
    }
  } catch (err) {
    console.error('发送命令失败:', err);
  } finally {
    // 断开连接
    await client.disconnect();
    console.log('发送测试完成');
  }
};

/**
 * 运行接收测试
 */
const runReceiveTest = async (config: TestConfig): Promise<void> => {
  console.log('开始接收测试...');
  printSeparator();

  // 连接到设备
  const client = await connectToDevice(config);

  // 设置数据接收处理器
  client.on(TCPSocketEvents.DATA_RECEIVED, (data) => {
    console.log('接收到数据:');
    console.log(data);

    // 尝试解析为不同格式
    try {
      // 尝试解析为JSON
      const jsonData = JSON.parse(data);
      console.log('JSON解析结果:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch {
      // 不是JSON，尝试作为文本处理
      console.log('文本格式:');
      console.log(data);

      // 尝试解析为常见格式
      if (data.includes(',')) {
        console.log('CSV格式解析:');
        const csvRows = data.split('\n').map(row => row.split(','));
        console.table(csvRows);
      }
    }
  });

  // 如果指定了命令，先发送命令以触发设备响应
  if (config.command) {
    console.log(`发送命令: ${config.command}`);
    await client.send(config.command);
  }

  // 等待接收数据
  const duration = config.duration || 30; // 默认30秒
  console.log(`等待 ${duration} 秒接收数据...`);

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration * 1000);
  });

  // 断开连接
  await client.disconnect();
  console.log('接收测试完成');
};

/**
 * 运行监控测试
 */
const runMonitorTest = async (config: TestConfig): Promise<void> => {
  if (!config.duration) {
    throw new Error('监控测试必须指定持续时间');
  }

  console.log(`开始监控测试，持续 ${config.duration} 秒...`);
  printSeparator();

  // 连接到设备
  const client = await connectToDevice(config);

  // 收集统计数据
  let dataPoints = 0;
  let totalBytesReceived = 0;
  let maxResponseTime = 0;
  let minResponseTime = Number.MAX_SAFE_INTEGER;
  let totalResponseTime = 0;

  // 记录起始时间
  const startTime = Date.now();

  // 设置数据接收处理器
  client.on(TCPSocketEvents.DATA_RECEIVED, (data) => {
    const now = Date.now();
    dataPoints++;
    totalBytesReceived += data.length;

    // 计算距离起始时间的秒数
    const elapsedSeconds = (now - startTime) / 1000;

    console.log(`[${elapsedSeconds.toFixed(1)}s] 接收到 ${data.length} 字节数据`);

    if (config.verbose) {
      console.log(data);
    }
  });

  // 如果指定了命令，每隔一段时间发送一次
  if (config.command) {
    console.log(`将每隔5秒发送命令: ${config.command}`);

    const interval = setInterval(async () => {
      try {
        const sendStartTime = Date.now();
        console.log(`发送命令: ${config.command}`);
        await client.send(config.command as string);
        const responseTime = Date.now() - sendStartTime;

        // 更新响应时间统计
        totalResponseTime += responseTime;
        maxResponseTime = Math.max(maxResponseTime, responseTime);
        minResponseTime = Math.min(minResponseTime, responseTime);

        console.log(`命令响应时间: ${responseTime}ms`);
      } catch (err) {
        console.error('发送命令失败:', err);
      }
    }, 5000);

    // 在测试结束时清除定时器
    setTimeout(() => {
      clearInterval(interval);
    }, config.duration * 1000);
  }

  // 等待指定的时间
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, config.duration * 1000);
  });

  // 断开连接
  await client.disconnect();

  // 计算监控统计信息
  const totalDuration = (Date.now() - startTime) / 1000;
  const bytesPerSecond = totalBytesReceived / totalDuration;
  const avgResponseTime = dataPoints > 0 ? totalResponseTime / dataPoints : 0;

  console.log('监控测试完成');
  printSeparator();
  console.log('监控统计:');
  console.log(`  总持续时间: ${totalDuration.toFixed(1)}秒`);
  console.log(`  数据点数量: ${dataPoints}`);
  console.log(`  总接收字节数: ${totalBytesReceived}`);
  console.log(`  每秒接收字节数: ${bytesPerSecond.toFixed(2)}`);

  if (config.command) {
    console.log(`  平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`  最大响应时间: ${maxResponseTime}ms`);
    console.log(`  最小响应时间: ${minResponseTime === Number.MAX_SAFE_INTEGER ? 'N/A' : minResponseTime + 'ms'}`);
  }

  const stats = client.getStats();
  console.log(`  已发送字节数: ${stats.bytesSent}`);
  console.log(`  已接收字节数: ${stats.bytesReceived}`);
  console.log(`  连接次数: ${stats.connectCount}`);
  console.log(`  断开次数: ${stats.disconnectCount}`);
  console.log(`  错误次数: ${stats.errorCount}`);

  // 保存结果到文件
  if (config.outputFile) {
    const outputData = {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      dataPoints,
      totalBytesReceived,
      bytesPerSecond,
      avgResponseTime,
      maxResponseTime,
      minResponseTime: minResponseTime === Number.MAX_SAFE_INTEGER ? null : minResponseTime,
      stats
    };

    fs.writeFileSync(config.outputFile, JSON.stringify(outputData, null, 2));
    console.log(`结果已保存到: ${config.outputFile}`);
  }
};

/**
 * 运行完整测试
 */
const runFullTest = async (config: TestConfig): Promise<void> => {
  console.log('开始全面测试...');
  printSeparator();

  // 1. 首先运行发现测试
  config.duration = 30; // 设置发现持续时间为30秒
  await runDiscoveryTest(config);
  printSeparator();

  // 如果没有指定主机和端口，使用发现到的第一个设备
  if ((!config.host || !config.port) && config.discover) {
    console.log('使用发现到的设备进行后续测试...');

    const discoveryService = new DeviceDiscoveryService(DEFAULT_DEVICE_SIGNATURES);

    await discoveryService.startDiscovery({
      scanTimeout: config.timeout / 2,
      portRange: { start: 1024, end: 10000 }
    });

    // 等待发现设备
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 10000);
    });

    // 获取设备列表
    const devices = discoveryService.getDiscoveredDevices();
    await discoveryService.stopDiscovery();

    if (devices.length === 0) {
      console.log('未发现任何设备，无法进行后续测试');
      return;
    }

    // 选择第一个设备
    const selectedDevice = devices[0];
    config.host = selectedDevice.host;
    config.port = selectedDevice.port;

    console.log(`选择设备: ${selectedDevice.id}`);
    if (selectedDevice.manufacturer) console.log(`制造商: ${selectedDevice.manufacturer}`);
    if (selectedDevice.model) console.log(`型号: ${selectedDevice.model}`);
  }

  if (!config.host || !config.port) {
    console.log('未指定设备地址，跳过后续测试');
    return;
  }

  // 2. 然后运行连接测试
  await runConnectionTest(config);
  printSeparator();

  // 3. 然后运行发送测试
  if (config.command) {
    await runSendTest(config);
    printSeparator();
  } else {
    console.log('未指定命令，跳过发送测试');
  }

  // 4. 然后运行接收测试
  config.duration = 15; // 设置接收持续时间为15秒
  await runReceiveTest(config);
  printSeparator();

  // 5. 最后运行监控测试
  config.duration = 30; // 设置监控持续时间为30秒
  await runMonitorTest(config);

  console.log('全面测试完成');
};

/**
 * 主函数
 */
const main = async () => {
  try {
    const config = parseArgs();

    console.log('TCP/Socket设备集成测试工具');
    console.log(`测试类型: ${config.type}`);
    if (config.host) console.log(`主机: ${config.host}`);
    if (config.port) console.log(`端口: ${config.port}`);
    printSeparator();

    switch (config.type) {
      case TestType.DISCOVERY:
        await runDiscoveryTest(config);
        break;

      case TestType.CONNECT:
        await runConnectionTest(config);
        break;

      case TestType.SEND:
        await runSendTest(config);
        break;

      case TestType.RECEIVE:
        await runReceiveTest(config);
        break;

      case TestType.MONITOR:
        await runMonitorTest(config);
        break;

      case TestType.FULL:
        await runFullTest(config);
        break;

      default:
        console.error(`未知测试类型: ${config.type}`);
        process.exit(1);
    }

    process.exit(0);
  } catch (err) {
    console.error('测试过程中出现错误:');
    console.error(err);
    process.exit(1);
  }
};

// 执行主函数
main().catch((err) => {
  console.error('未捕获的错误:');
  console.error(err);
  process.exit(1);
});
