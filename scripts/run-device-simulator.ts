#!/usr/bin/env node

/**
 * TCP/Socket设备模拟器启动脚本
 *
 * 用于启动设备模拟器并进行模拟测试
 *
 * @version 1.0.0
 * @date 2025-07-23
 */

import * as path from 'path';
import * as fs from 'fs';
import * as yargs from 'yargs/yargs';
import * as colors from 'colors/safe';
import {
  createDeviceSimulator,
  DeviceType,
  DeviceMode,
  DeviceOptions,
  IDeviceSimulator
} from '../src/backend/device/simulators/tcp-socket-device-simulator';// 解析命令行参数
const argv = yargs(process.argv.slice(2))
  .usage('Usage: $0 [options]')
  .option('config', {
    alias: 'c',
    description: '设备配置文件路径',
    type: 'string'
  })
  .option('type', {
    alias: 't',
    description: '设备类型 (sensor, actuator, controller, analyzer, generic)',
    type: 'string',
    choices: Object.values(DeviceType)
  })
  .option('mode', {
    alias: 'm',
    description: '设备模式 (client, server)',
    type: 'string',
    choices: Object.values(DeviceMode),
    default: 'server'
  })
  .option('port', {
    alias: 'p',
    description: '服务器端口或客户端连接端口',
    type: 'number',
    default: 8888
  })
  .option('host', {
    alias: 'h',
    description: '客户端模式下的连接主机地址',
    type: 'string',
    default: 'localhost'
  })
  .option('secure', {
    alias: 's',
    description: '是否使用TLS/SSL安全连接',
    type: 'boolean',
    default: false
  })
  .option('json', {
    alias: 'j',
    description: '是否使用JSON格式通信',
    type: 'boolean',
    default: false
  })
  .option('responseDelay', {
    alias: 'd',
    description: '模拟响应延迟 (毫秒)',
    type: 'number',
    default: 50
  })
  .option('errorRate', {
    alias: 'e',
    description: '模拟错误率 (0-100)',
    type: 'number',
    default: 0
  })
  .option('count', {
    alias: 'n',
    description: '启动设备数量',
    type: 'number',
    default: 1
  })
  .option('basePort', {
    description: '多设备模式下的起始端口号',
    type: 'number'
  })
  .option('verbose', {
    alias: 'v',
    description: '显示详细日志',
    type: 'boolean',
    default: false
  })
  .help()
  .alias('help', '?')
  .version()
  .alias('version', 'V')
  .argv;

// 日志级别
const verbose = argv.verbose;

// 日志函数
function log(message: string, level: 'info' | 'error' | 'warn' | 'success' = 'info') {
  const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);

  let coloredMessage: string;
  switch (level) {
    case 'error':
      coloredMessage = colors.red(message);
      break;
    case 'warn':
      coloredMessage = colors.yellow(message);
      break;
    case 'success':
      coloredMessage = colors.green(message);
      break;
    default:
      coloredMessage = colors.cyan(message);
  }

  console.log(`[${timestamp}] ${coloredMessage}`);
}

// 详细日志
function logVerbose(message: string) {
  if (verbose) {
    console.log(colors.gray(message));
  }
}

// 创建设备选项
function createDeviceOptions(index: number = 0): DeviceOptions {
  const deviceId = `dev-${index.toString().padStart(3, '0')}`;
  const deviceName = `${argv.type || 'generic'}-simulator-${index + 1}`;
  const port = argv.basePort ? argv.basePort + index : argv.port;

  const options: DeviceOptions = {
    id: deviceId,
    name: deviceName,
    type: (argv.type as DeviceType) || DeviceType.GENERIC,
    mode: (argv.mode as DeviceMode) || DeviceMode.SERVER,
    port: port,
    secure: argv.secure,
    useJson: argv.json,
    responseDelay: argv.responseDelay,
    simulatedErrorRate: argv.errorRate / 100, // 转换为0-1范围
    autoReconnect: true,
    reconnectDelay: 5000,
    maxReconnectAttempts: 10,
    keepAlive: true
  };

  // 客户端模式需要主机地址
  if (options.mode === DeviceMode.CLIENT) {
    options.host = argv.host;
  }

  // 安全连接需要证书配置
  if (options.secure) {
    const certsDir = path.resolve(__dirname, '../config/ssl');
    try {
      if (fs.existsSync(certsDir)) {
        options.cert = path.join(certsDir, 'device.cert');
        options.key = path.join(certsDir, 'device.key');
        options.ca = [path.join(certsDir, 'ca.cert')];
      } else {
        log(`证书目录不存在: ${certsDir}，将使用自签名证书`, 'warn');
        // 这里可以添加自签名证书生成逻辑
      }
    } catch (err) {
      log(`读取证书失败: ${err}`, 'error');
    }
  }

  return options;
}

// 从配置文件加载设备选项
function loadDeviceOptionsFromConfig(configPath: string): DeviceOptions[] {
  try {
    const configFile = path.resolve(configPath);
    if (!fs.existsSync(configFile)) {
      throw new Error(`配置文件不存在: ${configFile}`);
    }

    const content = fs.readFileSync(configFile, 'utf8');
    const config = JSON.parse(content);

    // 单个设备配置
    if (!Array.isArray(config)) {
      return [config as DeviceOptions];
    }

    // 多个设备配置
    return config as DeviceOptions[];
  } catch (err) {
    log(`加载配置文件失败: ${err}`, 'error');
    process.exit(1);
  }
}

// 主函数
async function main() {
  log('TCP/Socket设备模拟器启动中...', 'info');

  try {
    let deviceOptionsList: DeviceOptions[] = [];

    if (argv.config) {
      // 从配置文件加载
      deviceOptionsList = loadDeviceOptionsFromConfig(argv.config);
      log(`从配置文件加载了 ${deviceOptionsList.length} 个设备配置`, 'info');
    } else {
      // 使用命令行参数创建
      const count = Math.max(1, Math.min(100, argv.count)); // 限制1-100之间
      for (let i = 0; i < count; i++) {
        deviceOptionsList.push(createDeviceOptions(i));
      }
      log(`创建了 ${count} 个设备配置`, 'info');
    }

    // 创建并启动设备
    const devices: DeviceSimulator[] = [];

    for (const options of deviceOptionsList) {
      const device = new DeviceSimulator(options);

      // 设置事件监听
      device.on('stateChange', (state) => {
        log(`设备 ${options.id} (${options.name}) 状态变更: ${state}`, 'info');
      });

      device.on('error', (err) => {
        log(`设备 ${options.id} 错误: ${err}`, 'error');
      });

      device.on('data', (data) => {
        logVerbose(`设备 ${options.id} 收到数据: ${typeof data === 'object' ? JSON.stringify(data) : data}`);
      });

      device.on('connect', () => {
        log(`设备 ${options.id} 连接成功`, 'success');
      });

      device.on('disconnect', () => {
        log(`设备 ${options.id} 断开连接`, 'warn');
      });

      // 启动设备
      await device.start();
      devices.push(device);

      log(`设备 ${options.id} (${options.name}) 启动成功 - ${options.mode}模式, 端口: ${options.port}`, 'success');
    }

    // 设置进程退出处理
    const cleanup = async () => {
      log('正在关闭设备模拟器...', 'info');

      for (const device of devices) {
        try {
          await device.stop();
          const info = device.getInfo();
          log(`设备 ${info.id} 已停止`, 'info');
        } catch (err) {
          log(`停止设备 ${device.getInfo().id} 失败: ${err}`, 'error');
        }
      }

      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // 定期输出状态
    setInterval(() => {
      if (verbose) {
        log('====== 设备状态 ======', 'info');
        for (const device of devices) {
          const info = device.getInfo();
          log(`设备 ${info.id} (${info.name}):`);
          log(`  状态: ${info.state}`);
          log(`  运行时间: ${Math.floor(info.uptime / 1000)} 秒`);
          log(`  消息: 已发送=${info.stats.messagesSent}, 已接收=${info.stats.messagesReceived}`);
          log(`  数据: 已发送=${info.stats.bytesSent}字节, 已接收=${info.stats.bytesReceived}字节`);
          log(`  错误: ${info.stats.errors}`);
        }
      }
    }, 30000); // 每30秒输出一次

    log(`${devices.length} 个设备模拟器已启动并运行中`, 'success');
    log('按 Ctrl+C 停止', 'info');
  } catch (err) {
    log(`启动设备模拟器失败: ${err}`, 'error');
    process.exit(1);
  }
}

// 执行主函数
main();
