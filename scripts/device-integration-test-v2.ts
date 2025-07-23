#!/usr/bin/env node

/**
 * 实际设备集成验证增强测试脚本 V2
 *
 * 本脚本用于验证TCP/Socket协议适配器与实际设备的兼容性和性能
 * 基于现有的tcp-socket-device-integration-test.ts脚本，但添加了更全面的设备测试功能
 *
 * @version 1.0.0
 * @date 2025-07-24
 */

import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import * as os from 'os';
import { TCPSocketConnectionOptions, TCPSocketEvents } from '../src/backend/device/adapters/tcp-socket/tcp-socket-adapter';
import { TCPSocketClientImpl } from '../src/backend/device/adapters/tcp-socket/tcp-socket-client.impl';

// 命令行参数解析
interface CommandLineArgs {
  device: string;
  mode: 'test' | 'interactive';
  host?: string;
  port?: number;
  timeout: number;
  verbose: boolean;
  secure: boolean;
  outputFile?: string;
}

// 解析命令行参数
function parseArgs(): CommandLineArgs {
  const args = process.argv.slice(2);
  const result: CommandLineArgs = {
    device: 'GX-5000',
    mode: 'test',
    timeout: 5000,
    verbose: false,
    secure: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;

    const [key, value] = arg.substring(2).split('=');

    switch (key) {
      case 'device':
        result.device = value;
        break;
      case 'mode':
        result.mode = (value === 'interactive') ? 'interactive' : 'test';
        break;
      case 'host':
        result.host = value;
        break;
      case 'port':
        const portNum = parseInt(value, 10);
        if (!isNaN(portNum)) result.port = portNum;
        break;
      case 'timeout':
        const timeoutNum = parseInt(value, 10);
        if (!isNaN(timeoutNum)) result.timeout = timeoutNum;
        break;
      case 'verbose':
        result.verbose = true;
        break;
      case 'secure':
        result.secure = true;
        break;
      case 'output-file':
        result.outputFile = value;
        break;
    }
  }

  return result;
}

/**
 * 默认设备配置
 */
interface DeviceConfig extends TCPSocketConnectionOptions {
  deviceType: string;
  commandDelimiter: string;
  responseTimeout: number;
}

const DEFAULT_CONFIGS: { [key: string]: DeviceConfig } = {
  'GX-5000': {
    host: '192.168.1.100',
    port: 4001,
    deviceType: 'electronic',
    commandDelimiter: '\r\n',
    responseTimeout: 2000,
    secure: false
  },
  'OS-2500': {
    host: '192.168.1.101',
    port: 5001,
    deviceType: 'optical',
    commandDelimiter: '\n',
    responseTimeout: 5000,
    secure: false
  },
  'MC-3000': {
    host: '192.168.1.102',
    port: 6001,
    deviceType: 'mechanical',
    commandDelimiter: ';',
    responseTimeout: 3000,
    secure: false
  },
  'CH-7000': {
    host: '192.168.1.103',
    port: 7001,
    deviceType: 'chemical',
    commandDelimiter: '\r',
    responseTimeout: 4000,
    secure: false
  },
  'TH-1200': {
    host: '192.168.1.104',
    port: 8001,
    deviceType: 'thermal',
    commandDelimiter: '\r\n',
    responseTimeout: 3000,
    secure: false
  }
};

// 测试命令集
const TEST_COMMANDS: { [key: string]: Array<{command: string, description: string}> } = {
  'GX-5000': [
    { command: '*IDN?', description: '获取设备标识' },
    { command: 'MEAS:VOLT:DC?', description: '测量直流电压' },
    { command: 'MEAS:CURR:DC?', description: '测量直流电流' },
    { command: 'MEAS:RES?', description: '测量电阻' }
  ],
  'OS-2500': [
    { command: 'ID', description: '获取设备标识' },
    { command: 'SCAN', description: '执行光谱扫描' },
    { command: 'RANGE 400,700', description: '设置波长范围' },
    { command: 'DATA?', description: '获取扫描数据' }
  ],
  'MC-3000': [
    { command: 'getID', description: '获取设备标识' },
    { command: 'setForce 100', description: '设置力度' },
    { command: 'startTest', description: '开始测试' },
    { command: 'getResults', description: '获取测试结果' }
  ],
  'CH-7000': [
    { command: '?ID', description: '获取设备标识' },
    { command: 'START', description: '开始分析' },
    { command: 'SAMPLE 1', description: '选择样本' },
    { command: 'RESULTS?', description: '获取分析结果' }
  ],
  'TH-1200': [
    { command: 'ID?', description: '获取设备标识' },
    { command: 'SET TEMP=25.0', description: '设置温度' },
    { command: 'START', description: '开始测试' },
    { command: 'GET DATA', description: '获取数据' }
  ]
};

// 测试结果记录
interface TestResult {
  device: string;
  command: string;
  success: boolean;
  responseTime: number;
  error?: string;
  response?: string;
}

// 测试设备接口
interface TestDevice {
  name: string;
  config: TCPSocketConnectionOptions;
  commands: Array<{command: string, description: string}>;
  client?: TCPSocketClientImpl;
  results: TestResult[];
}

// 读取自定义配置文件
function loadCustomConfig(deviceName: string): Partial<DeviceConfig> | null {
  const configPath = path.join(__dirname, '..', 'config', 'devices', `${deviceName.toLowerCase()}.json`);

  if (fs.existsSync(configPath)) {
    try {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (err) {
      console.error(`无法读取配置文件 ${configPath}:`, err);
    }
  }

  return null;
}

// 设置测试设备
function setupTestDevice(deviceName: string, args: CommandLineArgs): TestDevice | null {
  const defaultConfig = DEFAULT_CONFIGS[deviceName];
  if (!defaultConfig) {
    console.error(`未找到设备 ${deviceName} 的默认配置`);
    return null;
  }

  // 尝试加载自定义配置
  const customConfig = loadCustomConfig(deviceName);

  // 合并配置
  const config: TCPSocketConnectionOptions = {
    ...defaultConfig,
    ...(customConfig || {}),
    // 覆盖命令行参数指定的值
    ...(args.host ? { host: args.host } : {}),
    ...(args.port ? { port: args.port } : {}),
    ...(args.secure ? { secure: args.secure } : {})
  };

  return {
    name: deviceName,
    config,
    commands: TEST_COMMANDS[deviceName] || [],
    results: []
  };
}

// 创建TCP/Socket客户端
function createClient(device: TestDevice): boolean {
  try {
    // 创建TCP/Socket客户端
    device.client = new TCPSocketClientImpl(device.config);

    // 设置事件监听
    device.client.on(TCPSocketEvents.CONNECTED, (data: any) => {
      console.log(`已连接到设备 ${device.name}: ${data.connectionId}`);
    });

    device.client.on(TCPSocketEvents.DISCONNECTED, (data: any) => {
      console.log(`断开与设备 ${device.name} 的连接: ${data.connectionId}`);
    });

    device.client.on(TCPSocketEvents.ERROR, (data: any) => {
      console.error(`设备 ${device.name} 连接错误:`, data.error.message);
    });

    device.client.on(TCPSocketEvents.DATA_RECEIVED, (data: any) => {
      // 在特定测试命令中处理，这里仅打印调试信息
      console.debug(`从设备 ${device.name} 接收数据:`, data.data.length, '字节');
    });

    return true;
  } catch (err) {
    console.error(`创建 ${device.name} 客户端时出错:`, err);
    return false;
  }
}

// 连接到设备
async function connectToDevice(device: TestDevice): Promise<boolean> {
  if (!device.client) {
    return false;
  }

  try {
    console.log(`正在连接到设备 ${device.name} (${device.config.host}:${device.config.port})...`);
    await device.client.connect();

    const state = device.client.getConnectionState();
    console.log(`设备 ${device.name} 连接状态:`, state);

    return state === 'connected';
  } catch (err) {
    console.error(`连接到设备 ${device.name} 时出错:`, err);
    return false;
  }
}

// 执行设备命令
async function executeCommand(device: TestDevice, command: string, description: string, timeout: number): Promise<TestResult> {
  if (!device.client) {
    return {
      device: device.name,
      command,
      success: false,
      responseTime: 0,
      error: '客户端未初始化'
    };
  }

  console.log(`向设备 ${device.name} 发送命令: ${command} (${description})`);

  const startTime = Date.now();
  const result: TestResult = {
    device: device.name,
    command,
    success: false,
    responseTime: 0
  };

  try {
    // 准备命令字符串
    const config = device.config as DeviceConfig;
    const delimiter = config.commandDelimiter || '\r\n';
    const commandStr = command + delimiter;

    // 发送命令并等待响应
    const responsePromise = new Promise<string>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('命令响应超时'));
      }, timeout);

      // 设置一次性数据接收处理
      device.client?.once(TCPSocketEvents.DATA_RECEIVED, (data: any) => {
        clearTimeout(timeoutId);
        const response = data.data.toString('utf8');
        resolve(response);
      });

      // 发送命令
      device.client?.send(commandStr, { expectResponse: true })
        .catch((err: Error) => {
          clearTimeout(timeoutId);
          reject(err);
        });
    });

    // 等待响应或超时
    const response = await responsePromise;
    const endTime = Date.now();

    // 记录结果
    result.success = true;
    result.responseTime = endTime - startTime;
    result.response = response.trim();

    console.log(`命令 ${command} 成功, 响应时间: ${result.responseTime}ms`);
    console.log(`响应: ${result.response}`);

    return result;
  } catch (err) {
    const endTime = Date.now();

    // 记录错误
    result.success = false;
    result.responseTime = endTime - startTime;
    result.error = err instanceof Error ? err.message : String(err);

    console.error(`命令 ${command} 失败: ${result.error}`);
    return result;
  }
}

// 运行设备测试
async function runDeviceTest(device: TestDevice, args: CommandLineArgs): Promise<boolean> {
  if (!createClient(device)) {
    console.error(`无法创建设备 ${device.name} 的客户端`);
    return false;
  }

  if (!await connectToDevice(device)) {
    console.error(`无法连接到设备 ${device.name}`);
    return false;
  }

  console.log(`开始对设备 ${device.name} 进行测试...`);

  // 执行所有命令
  for (const cmd of device.commands) {
    const result = await executeCommand(device, cmd.command, cmd.description, args.timeout);
    device.results.push(result);

    // 命令之间添加延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 断开连接
  if (device.client) {
    await device.client.disconnect();
  }

  // 统计结果
  const successCount = device.results.filter(r => r.success).length;
  const totalCount = device.results.length;
  const successRate = (successCount / totalCount) * 100;

  console.log(`设备 ${device.name} 测试完成: ${successCount}/${totalCount} 成功 (${successRate.toFixed(2)}%)`);

  return successRate >= 80; // 至少80%的命令成功视为测试通过
}

// 保存测试结果
function saveTestResults(device: TestDevice, outputFile?: string): void {
  const resultsDir = path.join(__dirname, '..', 'logs', 'test-results');

  // 确保目录存在
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // 确定输出文件路径
  let resultsFile: string;
  if (outputFile) {
    resultsFile = path.isAbsolute(outputFile) ? outputFile : path.join(process.cwd(), outputFile);
  } else {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    resultsFile = path.join(resultsDir, `${device.name}-${timestamp}.json`);
  }

  // 准备测试结果报告
  const report = {
    device: device.name,
    timestamp: new Date().toISOString(),
    config: device.config,
    results: device.results,
    summary: {
      totalCommands: device.results.length,
      successCount: device.results.filter(r => r.success).length,
      failureCount: device.results.filter(r => !r.success).length,
      averageResponseTime: device.results.reduce((sum, r) => sum + r.responseTime, 0) / device.results.length
    },
    system: {
      os: `${os.type()} ${os.release()}`,
      hostname: os.hostname(),
      timestamp: new Date().toISOString()
    }
  };

  // 保存报告
  fs.writeFileSync(resultsFile, JSON.stringify(report, null, 2));
  console.log(`测试结果已保存到: ${resultsFile}`);
}

// 交互式命令行界面
function startInteractiveConsole(device: TestDevice, args: CommandLineArgs): void {
  if (!device.client) {
    console.error('客户端未初始化，无法启动交互式控制台');
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`======== ${device.name} 交互式控制台 ========`);
  console.log('输入命令发送到设备，输入"exit"退出');
  console.log('预设命令:');
  device.commands.forEach((cmd, index) => {
    console.log(`  ${index + 1}. ${cmd.command} - ${cmd.description}`);
  });
  console.log('=======================================');

  const promptUser = () => {
    rl.question('> ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        await device.client?.disconnect();
        rl.close();
        process.exit(0);
        return;
      }

      // 检查是否是预设命令的索引
      const cmdIndex = parseInt(input, 10);
      if (!isNaN(cmdIndex) && cmdIndex > 0 && cmdIndex <= device.commands.length) {
        const cmd = device.commands[cmdIndex - 1];
        await executeCommand(device, cmd.command, cmd.description, args.timeout);
      } else {
        // 直接执行输入的命令
        await executeCommand(device, input, '用户输入命令', args.timeout);
      }

      promptUser();
    });
  };

  promptUser();
}

// 主函数
async function main(): Promise<void> {
  console.log('TCP/Socket协议适配器实际设备集成验证工具');
  console.log('版本: 1.0.0');
  console.log('日期: 2025-07-24');
  console.log('----------------------------------------');

  // 解析命令行参数
  const args = parseArgs();

  // 设置测试设备
  const device = setupTestDevice(args.device, args);
  if (!device) {
    console.error('设置测试设备失败，退出');
    process.exit(1);
  }

  if (args.verbose) {
    console.log('使用配置:', JSON.stringify(device.config, null, 2));
  }

  // 根据模式执行操作
  if (args.mode === 'test') {
    // 自动测试模式
    const testPassed = await runDeviceTest(device, args);
    saveTestResults(device, args.outputFile);

    if (testPassed) {
      console.log(`设备 ${device.name} 测试通过!`);
      process.exit(0);
    } else {
      console.error(`设备 ${device.name} 测试失败!`);
      process.exit(1);
    }
  } else if (args.mode === 'interactive') {
    // 交互式模式
    if (!createClient(device)) {
      console.error('创建客户端失败，退出');
      process.exit(1);
    }

    if (!await connectToDevice(device)) {
      console.error('连接设备失败，退出');
      process.exit(1);
    }

    startInteractiveConsole(device, args);
  } else {
    console.error(`未知模式: ${args.mode}，支持的模式: test, interactive`);
    process.exit(1);
  }
}

// 执行主函数
main().catch(err => {
  console.error('执行过程中出错:', err);
  process.exit(1);
});
