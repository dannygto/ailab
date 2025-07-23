#!/usr/bin/env node

/**
 * 实际设备连接演示工具
 * 用于快速验证与特定设备的通信功能
 *
 * @version 1.0.0
 * @date 2025-07-23
 */

import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { EventEmitter } from 'events';

// 设备连接选项接口
interface DeviceConnectionOptions {
  host: string;
  port: number;
  secure?: boolean;
  timeout?: number;
  commandDelimiter: string;
  responseDelimiter?: string;
  encoding?: BufferEncoding;
}

// 命令执行结果接口
interface CommandResult {
  command: string;
  response: string;
  success: boolean;
  error?: string;
  startTime: number;
  endTime: number;
  executionTime: number;
}

// 设备连接器类
class DeviceConnector extends EventEmitter {
  private socket: net.Socket | null = null;
  private connected: boolean = false;
  private buffer: string = '';
  private commandQueue: Array<{
    command: string;
    resolve: (result: CommandResult) => void;
    reject: (error: Error) => void;
    startTime: number;
  }> = [];
  private options: DeviceConnectionOptions;
  private responseTimeout: NodeJS.Timeout | null = null;

  constructor(options: DeviceConnectionOptions) {
    super();
    this.options = {
      timeout: 5000,
      encoding: 'utf8',
      responseDelimiter: options.commandDelimiter,
      ...options
    };
  }

  /**
   * 连接到设备
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        resolve();
        return;
      }

      this.socket = new net.Socket();

      // 设置超时
      this.socket.setTimeout(this.options.timeout || 5000);

      // 处理数据接收
      this.socket.on('data', (data) => {
        const chunk = data.toString(this.options.encoding);
        this.buffer += chunk;
        this.processBuffer();
      });

      // 处理连接事件
      this.socket.on('connect', () => {
        this.connected = true;
        this.emit('connected');
        resolve();
      });

      // 处理错误
      this.socket.on('error', (err) => {
        const error = new Error(`连接错误: ${err.message}`);
        this.emit('error', error);
        if (!this.connected) {
          reject(error);
        }
        this.cleanup();
      });

      // 处理超时
      this.socket.on('timeout', () => {
        const error = new Error('连接超时');
        this.emit('timeout');
        if (!this.connected) {
          reject(error);
        }
        this.cleanup();
      });

      // 处理关闭
      this.socket.on('close', (hadError) => {
        this.connected = false;
        this.emit('disconnected', hadError);
        this.cleanup();
      });

      // 连接到设备
      this.socket.connect({
        host: this.options.host,
        port: this.options.port
      });
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket && this.connected) {
      this.socket.end();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * 发送命令到设备
   */
  async sendCommand(command: string, timeout?: number): Promise<CommandResult> {
    if (!this.socket || !this.connected) {
      throw new Error('未连接到设备');
    }

    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      // 将命令加入队列
      this.commandQueue.push({
        command,
        resolve,
        reject,
        startTime
      });

      // 发送命令
      const cmdString = command + this.options.commandDelimiter;
      this.socket!.write(cmdString, this.options.encoding);

      // 设置超时
      const commandTimeout = timeout || this.options.timeout || 5000;
      setTimeout(() => {
        // 查找队列中的命令
        const index = this.commandQueue.findIndex(cmd => cmd.command === command && cmd.startTime === startTime);
        if (index !== -1) {
          // 从队列中移除
          const cmd = this.commandQueue.splice(index, 1)[0];
          cmd.reject(new Error(`命令超时: ${command}`));
        }
      }, commandTimeout);
    });
  }

  /**
   * 处理接收缓冲区
   */
  private processBuffer(): void {
    if (!this.commandQueue.length) return;

    const delimiter = this.options.responseDelimiter;
    if (!delimiter) return;

    // 检查是否有完整响应
    const delimiterIndex = this.buffer.indexOf(delimiter);
    if (delimiterIndex === -1) return;

    // 提取响应
    const response = this.buffer.substring(0, delimiterIndex);
    this.buffer = this.buffer.substring(delimiterIndex + delimiter.length);

    // 处理命令队列中的第一个命令
    const cmdInfo = this.commandQueue.shift();
    if (cmdInfo) {
      const endTime = Date.now();
      cmdInfo.resolve({
        command: cmdInfo.command,
        response,
        success: true,
        startTime: cmdInfo.startTime,
        endTime,
        executionTime: endTime - cmdInfo.startTime
      });
    }

    // 继续处理缓冲区
    if (this.buffer.length > 0 && this.buffer.indexOf(delimiter) !== -1) {
      this.processBuffer();
    }
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    // 取消超时定时器
    if (this.responseTimeout) {
      clearTimeout(this.responseTimeout);
      this.responseTimeout = null;
    }

    // 拒绝所有待处理的命令
    this.commandQueue.forEach(cmd => {
      cmd.reject(new Error('连接已关闭'));
    });

    this.commandQueue = [];
    this.buffer = '';
  }
}

// 设备演示类
class DeviceDemo {
  private connector: DeviceConnector | null = null;
  private rl: readline.Interface;
  private deviceConfig: any;
  private commandHistory: CommandResult[] = [];

  constructor() {
    // 创建命令行接口
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '设备命令> '
    });
  }

  /**
   * 加载设备配置
   */
  async loadConfig(configPath: string): Promise<boolean> {
    try {
      const configData = await fs.promises.readFile(configPath, 'utf8');
      this.deviceConfig = JSON.parse(configData);

      if (!this.deviceConfig.connectionOptions ||
          !this.deviceConfig.connectionOptions.host ||
          !this.deviceConfig.connectionOptions.port ||
          !this.deviceConfig.communicationSettings ||
          !this.deviceConfig.communicationSettings.commandDelimiter) {
        console.error('配置文件格式错误，缺少必要的连接参数');
        return false;
      }

      return true;
    } catch (error) {
      console.error('加载配置文件失败:', error);
      return false;
    }
  }

  /**
   * 连接到设备
   */
  async connectToDevice(): Promise<boolean> {
    try {
      const connectionOptions: DeviceConnectionOptions = {
        host: this.deviceConfig.connectionOptions.host,
        port: this.deviceConfig.connectionOptions.port,
        secure: this.deviceConfig.connectionOptions.secure || false,
        timeout: this.deviceConfig.connectionOptions.timeout || 5000,
        commandDelimiter: this.deviceConfig.communicationSettings.commandDelimiter,
        responseDelimiter: this.deviceConfig.communicationSettings.responseDelimiter || this.deviceConfig.communicationSettings.commandDelimiter,
        encoding: this.deviceConfig.communicationSettings.encoding || 'utf8'
      };

      console.log(`正在连接到设备 ${this.deviceConfig.deviceName} (${connectionOptions.host}:${connectionOptions.port})...`);

      this.connector = new DeviceConnector(connectionOptions);

      // 设置事件处理
      this.connector.on('connected', () => {
        console.log(`成功连接到设备 ${this.deviceConfig.deviceName}`);
      });

      this.connector.on('disconnected', (hadError) => {
        console.log(`断开与设备 ${this.deviceConfig.deviceName} 的连接${hadError ? ' (发生错误)' : ''}`);
      });

      this.connector.on('error', (error) => {
        console.error(`设备连接错误: ${error.message}`);
      });

      this.connector.on('timeout', () => {
        console.error(`设备连接超时`);
      });

      // 连接到设备
      await this.connector.connect();

      // 发送初始命令（如果有）
      if (this.deviceConfig.communicationSettings.initialCommands &&
          Array.isArray(this.deviceConfig.communicationSettings.initialCommands)) {
        console.log('发送初始化命令...');

        for (const cmdInfo of this.deviceConfig.communicationSettings.initialCommands) {
          if (cmdInfo.command) {
            console.log(`- 发送: ${cmdInfo.command}`);
            try {
              const result = await this.connector.sendCommand(cmdInfo.command);
              console.log(`- 响应: ${result.response}`);
              this.commandHistory.push(result);

              // 等待指定时间
              if (cmdInfo.waitTime) {
                await new Promise(resolve => setTimeout(resolve, cmdInfo.waitTime));
              }
            } catch (error) {
              console.error(`- 错误: ${error.message}`);
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error(`连接设备失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 启动交互式命令行
   */
  startInteractive(): void {
    console.log('\n===== 交互式设备命令演示 =====');
    console.log('输入设备命令并按回车发送，输入 "exit" 退出');
    console.log('特殊命令:');
    console.log('  .help            - 显示帮助信息');
    console.log('  .history         - 显示命令历史');
    console.log('  .testcommands    - 执行配置文件中的测试命令');
    console.log('  .exit 或 exit    - 退出程序');
    console.log('==============================\n');

    this.rl.prompt();

    this.rl.on('line', async (line) => {
      const trimmedLine = line.trim();

      if (trimmedLine === '.exit' || trimmedLine === 'exit') {
        this.close();
        return;
      }

      if (trimmedLine === '.help') {
        console.log('\n===== 帮助信息 =====');
        console.log('直接输入设备命令并按回车发送');
        console.log('特殊命令:');
        console.log('  .help            - 显示此帮助信息');
        console.log('  .history         - 显示命令历史');
        console.log('  .testcommands    - 执行配置文件中的测试命令');
        console.log('  .exit 或 exit    - 退出程序');
        console.log('====================\n');
      } else if (trimmedLine === '.history') {
        this.showCommandHistory();
      } else if (trimmedLine === '.testcommands') {
        await this.runTestCommands();
      } else if (trimmedLine && this.connector) {
        try {
          console.log(`发送: ${trimmedLine}`);
          const result = await this.connector.sendCommand(trimmedLine);
          console.log(`响应: ${result.response}`);
          console.log(`执行时间: ${result.executionTime}ms`);
          this.commandHistory.push(result);
        } catch (error) {
          console.error(`错误: ${error.message}`);
        }
      }

      this.rl.prompt();
    });

    this.rl.on('close', () => {
      this.close();
    });
  }

  /**
   * 显示命令历史
   */
  private showCommandHistory(): void {
    console.log('\n===== 命令历史 =====');
    if (this.commandHistory.length === 0) {
      console.log('无命令历史');
    } else {
      this.commandHistory.forEach((result, index) => {
        console.log(`${index + 1}. 命令: ${result.command}`);
        console.log(`   响应: ${result.response}`);
        console.log(`   执行时间: ${result.executionTime}ms`);
        console.log(`   状态: ${result.success ? '成功' : '失败'}`);
        if (result.error) {
          console.log(`   错误: ${result.error}`);
        }
        console.log('---');
      });
    }
    console.log('===================\n');
  }

  /**
   * 执行配置文件中的测试命令
   */
  private async runTestCommands(): Promise<void> {
    if (!this.deviceConfig.testCommands || !Array.isArray(this.deviceConfig.testCommands)) {
      console.log('配置文件中没有定义测试命令');
      return;
    }

    console.log('\n===== 执行测试命令 =====');

    for (const cmdInfo of this.deviceConfig.testCommands) {
      if (!cmdInfo.command || !cmdInfo.name) continue;

      // 检查是否应该跳过可选命令
      if (cmdInfo.optional) {
        const answer = await this.question(`是否执行可选命令 "${cmdInfo.name}"? (y/n) `);
        if (answer.toLowerCase() !== 'y') {
          console.log(`跳过命令: ${cmdInfo.name}\n`);
          continue;
        }
      }

      console.log(`\n执行: ${cmdInfo.name}`);
      console.log(`描述: ${cmdInfo.description || '无描述'}`);
      console.log(`命令: ${cmdInfo.command}`);

      try {
        // 执行命令并记录结果
        console.log(`发送: ${cmdInfo.command}`);
        const result = await this.connector!.sendCommand(cmdInfo.command, cmdInfo.timeout);
        console.log(`响应: ${result.response}`);
        console.log(`执行时间: ${result.executionTime}ms`);
        this.commandHistory.push(result);

        // 验证响应是否符合预期
        if (cmdInfo.expectedResponse) {
          let responseValid = false;

          if (cmdInfo.expectedResponse.startsWith('pattern:')) {
            // 使用正则表达式匹配
            const pattern = cmdInfo.expectedResponse.substring(8);
            const regex = new RegExp(pattern);
            responseValid = regex.test(result.response);
          } else {
            // 直接比较
            responseValid = result.response === cmdInfo.expectedResponse;
          }

          if (responseValid) {
            console.log('✓ 响应符合预期');
          } else {
            console.log('✗ 响应不符合预期');
            console.log(`  预期: ${cmdInfo.expectedResponse}`);
            console.log(`  实际: ${result.response}`);
          }
        }

        // 如果需要重复执行
        if (cmdInfo.repeat && cmdInfo.repeat > 1) {
          console.log(`重复执行 ${cmdInfo.repeat - 1} 次...`);

          for (let i = 1; i < cmdInfo.repeat; i++) {
            // 等待指定间隔
            if (cmdInfo.interval) {
              await new Promise(resolve => setTimeout(resolve, cmdInfo.interval));
            }

            // 执行命令
            console.log(`发送(${i+1}/${cmdInfo.repeat}): ${cmdInfo.command}`);
            const repeatResult = await this.connector!.sendCommand(cmdInfo.command, cmdInfo.timeout);
            console.log(`响应: ${repeatResult.response}`);
            this.commandHistory.push(repeatResult);
          }
        }
      } catch (error) {
        console.error(`错误: ${error.message}`);
      }

      // 命令执行后延迟
      if (cmdInfo.delay) {
        console.log(`等待 ${cmdInfo.delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, cmdInfo.delay));
      }
    }

    console.log('\n===== 测试命令执行完成 =====\n');
  }

  /**
   * 关闭连接并退出
   */
  close(): void {
    if (this.connector) {
      this.connector.disconnect();
      this.connector = null;
    }

    if (this.rl) {
      this.rl.close();
    }

    console.log('\n已断开连接并退出程序');
    process.exit(0);
  }

  /**
   * 辅助函数：请求用户输入
   */
  private question(query: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(query, answer => {
        resolve(answer);
      });
    });
  }
}

// 主函数
async function main() {
  // 解析命令行参数
  const configPath = process.argv[2];

  if (!configPath) {
    console.error('请提供设备配置文件路径');
    console.log('用法: npx ts-node device-connection-demo.ts <配置文件路径>');
    process.exit(1);
  }

  // 验证配置文件存在
  if (!fs.existsSync(configPath)) {
    console.error(`配置文件不存在: ${configPath}`);
    process.exit(1);
  }

  // 创建设备演示实例
  const demo = new DeviceDemo();

  // 加载配置
  const configLoaded = await demo.loadConfig(configPath);
  if (!configLoaded) {
    process.exit(1);
  }

  // 连接设备
  const connected = await demo.connectToDevice();
  if (!connected) {
    process.exit(1);
  }

  // 启动交互式命令行
  demo.startInteractive();
}

// 执行主函数
main().catch(error => {
  console.error('程序执行失败:', error);
  process.exit(1);
});
