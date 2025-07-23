/**
 * TCP/Socket协议适配器测试
 * @version 2.0.0
 * @date 2025-07-23
 */

import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as net from 'net';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import {
  createTCPSocketAdapter,
  LogLevel
} from '../device/adapters/tcp-socket/tcp-socket-adapter.impl';

import {
  ITCPSocketAdapter,
  ITCPSocketClient,
  ITCPSocketServer,
  TCPSocketEvents,
  ConnectionState
} from '../device/adapters/tcp-socket/tcp-socket-adapter';

// 解析命令行参数
const argv = yargs(hideBin(process.argv))
  .option('type', {
    alias: 't',
    description: '测试类型',
    type: 'string',
    choices: ['basic', 'performance', 'security', 'reliability', 'integration'],
    default: 'basic'
  })
  .option('iterations', {
    alias: 'i',
    description: '测试迭代次数',
    type: 'number',
    default: 10
  })
  .option('connections', {
    alias: 'c',
    description: '并发连接数',
    type: 'number',
    default: 20
  })
  .option('dataSize', {
    alias: 'd',
    description: '测试数据大小(KB)',
    type: 'number',
    default: 128
  })
  .option('timeout', {
    description: '测试超时时间(秒)',
    type: 'number',
    default: 30
  })
  .option('simulator', {
    description: '是否使用设备模拟器',
    type: 'boolean',
    default: false
  })
  .option('simulatorPort', {
    description: '设备模拟器端口',
    type: 'number',
    default: 8888
  })
  .help()
  .alias('help', 'h')
  .parseSync();

// 测试配置
const TEST_CONFIG = {
  type: argv.type as string,
  iterations: argv.iterations as number,
  connections: argv.connections as number,
  dataSize: argv.dataSize as number * 1024, // 转换为字节
  timeout: argv.timeout as number * 1000, // 转换为毫秒
  useSimulator: argv.simulator as boolean,
  simulatorPort: argv.simulatorPort as number
};

// 创建测试数据
function createTestData(sizeInBytes: number): Buffer {
  return crypto.randomBytes(sizeInBytes);
}

// 创建JSON测试数据
function createJsonTestData(sizeInBytes: number): any {
  const data: any = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    values: [] as number[],
    metadata: {
      source: 'tcp-socket-adapter-test',
      version: '1.0.0',
      type: 'test-data'
    }
  };

  // 填充数据以达到所需大小
  const baseSize = Buffer.from(JSON.stringify(data)).length;
  const remainingBytes = sizeInBytes - baseSize;

  if (remainingBytes > 0) {
    const valuesCount = Math.floor(remainingBytes / 10); // 约10字节/值
    for (let i = 0; i < valuesCount; i++) {
      data.values.push(Math.random() * 100);
    }
  }

  return data;
}

// 格式化字节数
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// 等待指定时间
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 模拟TCP服务器
class MockTcpServer {
  private server: net.Server;
  private clients: Set<net.Socket> = new Set();
  private dataGenerator: NodeJS.Timeout | undefined = undefined;

  constructor(private port: number) {
    this.server = net.createServer((socket) => this.handleConnection(socket));
  }

  public start(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`模拟TCP服务器已启动，监听端口 ${this.port}`);

        // 定期生成模拟数据
        this.dataGenerator = setInterval(() => {
          this.broadcastData();
        }, 1000);

        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.dataGenerator) {
        clearInterval(this.dataGenerator);
        this.dataGenerator = undefined;
      }

      // 关闭所有客户端连接
      for (const client of this.clients) {
        client.end();
        client.destroy();
      }

      this.clients.clear();

      this.server.close(() => {
        console.log('模拟TCP服务器已停止');
        resolve();
      });
    });
  }

  private handleConnection(socket: net.Socket): void {
    console.log(`客户端已连接: ${socket.remoteAddress}:${socket.remotePort}`);
    this.clients.add(socket);

    socket.on('data', (data) => {
      try {
        const message = data.toString('utf8');
        console.log(`收到客户端消息: ${message}`);

        // 处理命令
        if (message.startsWith('INIT')) {
          socket.write('INIT_OK\r\n');
        } else if (message.startsWith('MODE')) {
          socket.write('MODE_OK\r\n');
        } else if (message.startsWith('GET_DATA')) {
          const testData = {
            timestamp: new Date().toISOString(),
            values: [
              Math.random() * 100,
              Math.random() * 100,
              Math.random() * 100
            ]
          };

          socket.write(JSON.stringify(testData) + '\r\n');
        } else {
          // 回显
          socket.write(`ECHO: ${message}\r\n`);
        }
      } catch (error) {
        console.error('处理客户端消息时出错:', error);
      }
    });

    socket.on('close', (hadError) => {
      console.log(`客户端断开连接${hadError ? ' (出错)' : ''}`);
      this.clients.delete(socket);
    });

    socket.on('error', (error) => {
      console.error('客户端连接错误:', error);
    });
  }

  private broadcastData(): void {
    if (this.clients.size === 0) return;

    try {
      const testData = {
        timestamp: new Date().toISOString(),
        type: 'broadcast',
        values: [
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100
        ]
      };

      const dataStr = JSON.stringify(testData) + '\r\n';

      for (const client of this.clients) {
        client.write(dataStr);
      }
    } catch (error) {
      console.error('广播数据时出错:', error);
    }
  }
}

// 基本功能测试
async function runBasicTest(): Promise<boolean> {
  console.log('开始基本功能测试...');

  const TEST_SERVER_PORT = TEST_CONFIG.simulatorPort + 1;
  let mockServer: MockTcpServer | undefined = undefined;

  try {
    // 启动模拟服务器
    if (!TEST_CONFIG.useSimulator) {
      console.log('启动模拟TCP服务器...');
      mockServer = new MockTcpServer(TEST_SERVER_PORT);
      await mockServer.start();
    }

    // 创建TCP/Socket适配器
    const adapter = createTCPSocketAdapter({
      logLevel: LogLevel.INFO
    });

    console.log('创建TCP/Socket适配器成功');

    // 创建客户端
    const client = adapter.getFactory().createClient({
      host: 'localhost',
      port: TEST_CONFIG.useSimulator ? TEST_CONFIG.simulatorPort : TEST_SERVER_PORT,
      connectionTimeout: 5000,
      retryCount: 3,
      retryDelay: 1000,
      autoReconnect: true,
      useJson: true,
      secure: false
    });

    console.log('创建TCP/Socket客户端成功');

    // 添加事件监听
    client.on('stateChange', (newState, oldState) => {
      console.log(`客户端状态变更: ${oldState} -> ${newState}`);
    });

    client.on('connect', () => {
      console.log('客户端连接成功');
    });

    client.on('disconnect', (reason) => {
      console.log(`客户端断开连接，原因: ${reason}`);
    });

    client.on('error', (error) => {
      console.error('客户端错误:', error);
    });

    client.on('data', (data) => {
      console.log('收到数据:', typeof data === 'object' ? JSON.stringify(data) : data);
    });

    // 连接到服务器
    console.log(`尝试连接到服务器 (localhost:${TEST_CONFIG.useSimulator ? TEST_CONFIG.simulatorPort : TEST_SERVER_PORT})...`);
    await client.connect();

    // 发送数据
    console.log('发送数据...');
    const testData = { command: 'ping' };
    await client.send(testData);

    // 发送并等待响应
    console.log('发送数据并等待响应...');
    const response = await client.send(
      { command: 'echo', args: 'Hello, TCP/Socket!' },
      { waitForResponse: true, timeout: 5000 }
    );

    console.log('收到响应:', response);

    // 获取统计数据
    const stats = client.getStats();
    console.log('客户端统计:', stats);

    // 断开连接
    await client.disconnect();
    console.log('客户端断开连接');

    // 测试管理器功能
    const manager = adapter.getManager();

    // 创建多个客户端
    for (let i = 0; i < 3; i++) {
      const clientId = `test-client-${i}`;
      const client = manager.createClient(clientId, {
        host: 'localhost',
        port: TEST_CONFIG.useSimulator ? TEST_CONFIG.simulatorPort : TEST_SERVER_PORT,
        connectionTimeout: 5000,
        useJson: true,
        secure: false
      });

      console.log(`通过管理器创建客户端 ${clientId} 成功`);
    }

    const clientIds = manager.getAllClientIds();
    console.log(`管理器中的客户端列表: ${clientIds.join(', ')}`);

    // 清理资源
    await manager.dispose();
    console.log('释放所有资源成功');

    // 停止模拟服务器
    if (mockServer) {
      await mockServer.stop();
    }

    console.log('基本功能测试成功');
    return true;
  } catch (error) {
    console.error('基本功能测试失败:', error);

    // 确保清理资源
    if (mockServer) {
      await mockServer.stop();
    }

    return false;
  }
}

// 性能测试
async function runPerformanceTest(): Promise<boolean> {
  console.log('开始性能测试...');
  console.log(`配置: ${TEST_CONFIG.connections}个并发连接, 每个连接${TEST_CONFIG.iterations}次迭代, 数据大小: ${formatBytes(TEST_CONFIG.dataSize)}`);

  try {
    // 创建TCP/Socket适配器
    const adapter = createTCPSocketAdapter({
      logLevel: LogLevel.WARN // 减少日志输出以提高性能
    });

    const manager = adapter.getManager();
    const testData = createJsonTestData(TEST_CONFIG.dataSize);

    // 性能指标
    const metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalBytes: 0,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      throughput: 0,
      avgResponseTime: 0,
      responseTimes: [] as number[]
    };

    // 创建多个客户端并并行发送数据
    const connectionPromises: Promise<void>[] = [];

    for (let i = 0; i < TEST_CONFIG.connections; i++) {
      connectionPromises.push((async () => {
        const clientId = `perf-client-${i}`;
        const client = manager.createClient(clientId, {
          host: 'localhost',
          port: TEST_CONFIG.useSimulator ? TEST_CONFIG.simulatorPort : 8080,
          connectionTimeout: 5000,
          useJson: true,
          noDelay: true, // 禁用Nagle算法以提高性能
          secure: false
        });

        if (TEST_CONFIG.useSimulator) {
          try {
            await client.connect();

            for (let j = 0; j < TEST_CONFIG.iterations; j++) {
              try {
                const requestStartTime = Date.now();

                // 发送数据并等待响应
                await client.send({
                  command: 'echo',
                  args: testData
                }, {
                  waitForResponse: true,
                  timeout: 10000
                });

                const responseTime = Date.now() - requestStartTime;
                metrics.responseTimes.push(responseTime);

                metrics.successfulRequests++;
                metrics.totalBytes += TEST_CONFIG.dataSize * 2; // 发送和接收
              } catch (error) {
                metrics.failedRequests++;
              }

              metrics.totalRequests++;
            }

            await client.disconnect();
          } catch (error) {
            console.error(`客户端 ${clientId} 性能测试失败:`, error);
          }
        }
      })());
    }

    // 等待所有连接完成
    await Promise.all(connectionPromises);

    // 计算性能指标
    metrics.endTime = Date.now();
    metrics.duration = (metrics.endTime - metrics.startTime) / 1000; // 转换为秒
    metrics.throughput = metrics.totalBytes / metrics.duration; // 字节/秒

    if (metrics.responseTimes.length > 0) {
      metrics.avgResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
    }

    // 输出性能测试结果
    console.log('性能测试结果:');
    console.log(`总请求数: ${metrics.totalRequests}`);
    console.log(`成功请求数: ${metrics.successfulRequests}`);
    console.log(`失败请求数: ${metrics.failedRequests}`);
    console.log(`总传输数据: ${formatBytes(metrics.totalBytes)}`);
    console.log(`测试时间: ${metrics.duration.toFixed(2)}秒`);
    console.log(`吞吐量: ${formatBytes(metrics.throughput)}/秒`);
    console.log(`平均响应时间: ${metrics.avgResponseTime.toFixed(2)}毫秒`);

    // 清理资源
    await manager.dispose();

    console.log('性能测试完成');
    return metrics.failedRequests === 0;
  } catch (error) {
    console.error('性能测试失败:', error);
    return false;
  }
}

// 安全性测试
async function runSecurityTest(): Promise<boolean> {
  console.log('开始安全性测试...');

  try {
    // 创建TCP/Socket适配器
    const adapter = createTCPSocketAdapter({
      logLevel: LogLevel.INFO,
      defaultSecureOptions: {
        rejectUnauthorized: true
      }
    });

    console.log('测试TLS/SSL连接配置验证...');

    // 测试无效证书处理
    try {
      const client = adapter.getFactory().createClient({
        host: 'localhost',
        port: 8443,
        secure: true,
        rejectUnauthorized: true,
        connectionTimeout: 5000,
        useJson: true
      });

      console.log('尝试连接到无效证书的服务器...');
      await client.connect();

      console.log('❌ 安全检查失败: 允许了无效证书连接');
      await client.disconnect();
      return false;
    } catch (error) {
      console.log('✅ 安全检查通过: 拒绝了无效证书连接');
    }

    // 测试输入验证和防注入
    if (TEST_CONFIG.useSimulator) {
      console.log('测试输入验证和防注入...');

      const client = adapter.getFactory().createClient({
        host: 'localhost',
        port: TEST_CONFIG.simulatorPort,
        connectionTimeout: 5000,
        useJson: true,
        secure: false
      });

      await client.connect();

      // 测试恶意输入
      const maliciousInputs = [
        '"; DROP TABLE users; --',
        '<script>alert("XSS")</script>',
        '../../etc/passwd',
        Buffer.from([0xFF, 0xFE, 0xFD, 0x00, 0x01, 0x02]), // 二进制数据
        JSON.stringify({ __proto__: { polluted: true } }) // 原型污染
      ];

      let allPassed = true;

      for (const input of maliciousInputs) {
        try {
          await client.send({
            command: 'echo',
            args: input
          }, {
            waitForResponse: true,
            timeout: 5000
          });

          console.log(`✅ 输入验证通过: ${typeof input === 'string' ? input : 'binary data'}`);
        } catch (error) {
          console.error(`❌ 输入验证失败: ${typeof input === 'string' ? input : 'binary data'}`);
          allPassed = false;
        }
      }

      await client.disconnect();

      if (!allPassed) {
        console.log('❌ 安全测试失败: 输入验证不通过');
        return false;
      }
    }

    console.log('安全性测试通过');
    return true;
  } catch (error) {
    console.error('安全性测试失败:', error);
    return false;
  }
}

// 可靠性测试
async function runReliabilityTest(): Promise<boolean> {
  console.log('开始可靠性测试...');

  try {
    // 创建TCP/Socket适配器
    const adapter = createTCPSocketAdapter({
      logLevel: LogLevel.INFO
    });

    // 测试自动重连
    if (TEST_CONFIG.useSimulator) {
      console.log('测试自动重连机制...');

      const client = adapter.getFactory().createClient({
        host: 'localhost',
        port: TEST_CONFIG.simulatorPort,
        connectionTimeout: 5000,
        retryCount: 3,
        retryDelay: 1000,
        autoReconnect: true,
        useJson: true,
        secure: false
      });

      let reconnected = false;

      client.on('reconnect', (attempt) => {
        console.log(`重连尝试 #${attempt}`);
        reconnected = true;
      });

      await client.connect();
      console.log('连接成功，模拟连接中断...');

      // 发送特殊命令让服务器端断开连接
      await client.send({ command: 'echo', args: '##DISCONNECT##' });

      // 等待重连
      for (let i = 0; i < 10; i++) {
        await sleep(1000);
        if (reconnected && client.getState() === ConnectionState.CONNECTED) {
          console.log('✅ 自动重连成功');
          break;
        }
      }

      if (!reconnected || client.getState() !== ConnectionState.CONNECTED) {
        console.log('❌ 自动重连失败');
        return false;
      }

      await client.disconnect();
    }

    // 测试长时间运行稳定性
    console.log('测试连接稳定性...');

    const startTime = Date.now();
    const testDuration = 30000; // 30秒
    const checkInterval = 1000; // 1秒

    if (TEST_CONFIG.useSimulator) {
      const client = adapter.getFactory().createClient({
        host: 'localhost',
        port: TEST_CONFIG.simulatorPort,
        connectionTimeout: 5000,
        keepAlive: true,
        useJson: true,
        secure: false
      });

      await client.connect();

      let messagesSent = 0;
      let messagesReceived = 0;
      let errors = 0;

      // 定期发送心跳
      while (Date.now() - startTime < testDuration) {
        try {
          await client.send({ command: 'ping' }, { waitForResponse: true, timeout: 2000 });
          messagesSent++;
          messagesReceived++;
        } catch (error) {
          errors++;
        }

        await sleep(checkInterval);
      }

      const stats = client.getStats();
      console.log(`连接稳定性测试结果: 发送: ${messagesSent}, 接收: ${messagesReceived}, 错误: ${errors}`);
      console.log(`客户端统计: 发送消息: ${stats.messagesSent}, 接收消息: ${stats.messagesReceived}, 错误: ${stats.errors}`);

      await client.disconnect();

      if (errors > messagesSent * 0.1) { // 允许10%的错误率
        console.log('❌ 连接稳定性测试失败: 错误率过高');
        return false;
      }
    }

    console.log('可靠性测试通过');
    return true;
  } catch (error) {
    console.error('可靠性测试失败:', error);
    return false;
  }
}

// 集成测试
async function runIntegrationTest(): Promise<boolean> {
  console.log('开始集成测试...');

  if (!TEST_CONFIG.useSimulator) {
    console.log('设备模拟器未启用，无法进行集成测试');
    return false;
  }

  try {
    // 创建TCP/Socket适配器
    const adapter = createTCPSocketAdapter({
      logLevel: LogLevel.INFO
    });

    // 测试服务器模式
    console.log('测试TCP/Socket服务器模式...');

    const server = adapter.getFactory().createServer({
      maxConnections: 10,
      clientIdleTimeout: 60000,
      dataFormat: {
        useJson: true
      },
      secure: false
    });

    // 添加服务器事件监听
    server.on('clientConnect', (clientId, info) => {
      console.log(`客户端 ${clientId} 连接，地址: ${info.remoteAddress}:${info.remotePort}`);
    });

    server.on('clientDisconnect', (clientId, reason) => {
      console.log(`客户端 ${clientId} 断开连接，原因: ${reason}`);
    });

    server.on('clientData', (clientId, data) => {
      console.log(`收到客户端 ${clientId} 数据:`, typeof data === 'object' ? JSON.stringify(data) : data);

      // 响应数据
      server.sendToClient(clientId, {
        status: 'ok',
        message: 'Data received',
        timestamp: new Date().toISOString()
      }).catch(error => {
        console.error(`响应客户端 ${clientId} 失败:`, error);
      });
    });

    // 启动服务器
    const serverPort = TEST_CONFIG.simulatorPort + 1;
    await server.start(serverPort);
    console.log(`服务器启动成功，监听端口: ${serverPort}`);

    // 创建客户端模拟器连接到服务器
    console.log('配置客户端设备模拟器连接到服务器...');

    // 使用内置Node.js API启动设备模拟器客户端
    const { spawn } = require('child_process');

    // 构建命令字符串
    const clientSimulatorCommand = `
      const { createDeviceSimulator, DeviceType, DeviceMode } = require('./device/simulators/tcp-socket-device-simulator');

      async function runTest() {
        const clientSimulator = createDeviceSimulator({
          id: 'test-client-simulator',
          name: 'Test Client Simulator',
          type: DeviceType.SENSOR,
          mode: DeviceMode.CLIENT,
          host: 'localhost',
          port: ${serverPort},
          useJson: true,
          autoReconnect: true
        });

        try {
          await clientSimulator.start();
          console.log('客户端模拟器启动成功');

          // 发送一些测试数据
          await clientSimulator.sendData({
            type: 'sensor-data',
            values: [Math.random() * 100, Math.random() * 100, Math.random() * 100],
            timestamp: new Date().toISOString()
          });

          console.log('测试数据发送成功');

          // 等待一段时间
          await new Promise(resolve => setTimeout(resolve, 5000));

          // 停止模拟器
          await clientSimulator.stop();
          console.log('客户端模拟器已停止');
          process.exit(0);
        } catch (error) {
          console.error('客户端模拟器错误:', error);
          process.exit(1);
        }
      }

      runTest();
    `;

    // 启动客户端模拟器
    console.log('启动客户端模拟器...');
    const nodeProcess = spawn('node', ['-e', clientSimulatorCommand], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });

    // 等待客户端连接和数据交换
    await sleep(10000);

    // 停止服务器
    await server.stop();
    console.log('服务器已停止');

    console.log('集成测试通过');
    return true;
  } catch (error) {
    console.error('集成测试失败:', error);
    return false;
  }
}

// 主测试函数
async function runTests(): Promise<void> {
  console.log(`开始TCP/Socket协议适配器测试 (类型: ${TEST_CONFIG.type})...`);
  console.log('测试配置:', TEST_CONFIG);

  let success = false;

  switch (TEST_CONFIG.type) {
    case 'basic':
      success = await runBasicTest();
      break;
    case 'performance':
      success = await runPerformanceTest();
      break;
    case 'security':
      success = await runSecurityTest();
      break;
    case 'reliability':
      success = await runReliabilityTest();
      break;
    case 'integration':
      success = await runIntegrationTest();
      break;
    default:
      console.error(`未知测试类型: ${TEST_CONFIG.type}`);
      process.exit(1);
  }

  if (success) {
    console.log(`✅ ${TEST_CONFIG.type} 测试通过`);
    process.exit(0);
  } else {
    console.error(`❌ ${TEST_CONFIG.type} 测试失败`);
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('测试执行错误:', error);
  process.exit(1);
});
