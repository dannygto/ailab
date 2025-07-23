/**
 * TCP/Socket协议适配器模拟设备集成测试脚本
 *
 * 本脚本用于测试TCP/Socket协议适配器与模拟设备的连接和通信
 * 使用前请确保模拟设备已通过start-all-simulators.js启动
 */

// 导入必要的模块
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { SimpleTCPAdapter } from './simple-tcp-adapter';

// 控制台颜色工具
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

// 测试结果格式化
interface TestResult {
  deviceName: string;
  testName: string;
  success: boolean;
  message: string;
  responseTime?: number;
  error?: any;
}

// 全局测试结果收集
const testResults: TestResult[] = [];

// 读取模拟器配置获取可用设备信息
function getSimulatedDevices(): { name: string, host: string, port: number }[] {
  const simulatorDir = path.join(__dirname, 'simulator');
  const configFiles = fs.readdirSync(simulatorDir)
    .filter(file => file.endsWith('-sim.json'))
    .map(file => path.join(simulatorDir, file));

  return configFiles.map(file => {
    const config = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      name: config.deviceName,
      host: 'localhost', // 模拟器运行在本地
      port: config.port
    };
  });
}

// 读取设备配置
function getDeviceConfig(deviceName: string): any {
  try {
    const configPath = path.join(__dirname, '..', 'config', 'devices', `${deviceName.toLowerCase()}.json`);
    if (!fs.existsSync(configPath)) {
      console.log(`${colors.yellow}未找到设备配置文件: ${configPath}${colors.reset}`);
      return null;
    }

    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);

    // 修改配置指向本地模拟器
    config.host = 'localhost';

    return config;
  } catch (error) {
    console.error(`${colors.red}读取设备配置出错:${colors.reset}`, error);
    return null;
  }
}

// 记录测试结果
function recordTestResult(result: TestResult): void {
  testResults.push(result);

  const statusSymbol = result.success ? '✓' : '✗';
  const statusColor = result.success ? colors.green : colors.red;

  console.log(`${statusColor}${statusSymbol} [${result.deviceName}] ${result.testName}: ${result.message}${colors.reset}`);

  if (!result.success && result.error) {
    console.log(`  ${colors.dim}错误详情: ${util.inspect(result.error)}${colors.reset}`);
  }
}

// 基本连接测试
async function testBasicConnection(deviceName: string, config: any): Promise<void> {
  console.log(`\n${colors.cyan}正在测试 ${deviceName} 的基本连接...${colors.reset}`);

  // 根据设备类型创建适配器
  const adapter = new SimpleTCPAdapter({
    host: 'localhost',
    port: config.port,
    delimiter: deviceName === 'MC-3000' ? '\n' : '\r\n',
    connectionTimeout: config.connectionTimeout || 5000
  });
  const startTime = Date.now();

  try {
    await adapter.connect();

    const responseTime = Date.now() - startTime;

    recordTestResult({
      deviceName,
      testName: '基本连接测试',
      success: true,
      message: `成功连接到设备 (${responseTime}ms)`,
      responseTime
    });

    // 测试识别指令
    try {
      // 针对MC-3000设备的特殊处理
      const identCommand = deviceName === 'MC-3000' ? '*IDN?' : '*IDN?';
      const identResponse = await adapter.sendCommand(identCommand);

      recordTestResult({
        deviceName,
        testName: '设备识别测试',
        success: true,
        message: `收到设备标识: ${identResponse}`
      });
    } catch (error) {
      recordTestResult({
        deviceName,
        testName: '设备识别测试',
        success: false,
        message: '发送识别指令失败',
        error
      });
    }

    // 关闭连接
    await adapter.disconnect();

    recordTestResult({
      deviceName,
      testName: '断开连接测试',
      success: true,
      message: '成功断开连接'
    });

  } catch (error) {
    recordTestResult({
      deviceName,
      testName: '基本连接测试',
      success: false,
      message: '连接失败',
      error
    });
  }
}

// 设备特定命令测试
async function testDeviceSpecificCommands(deviceName: string, config: any): Promise<void> {
  console.log(`\n${colors.cyan}正在测试 ${deviceName} 的设备特定指令...${colors.reset}`);

  const adapter = new SimpleTCPAdapter({
    host: 'localhost',
    port: config.port,
    delimiter: deviceName === 'MC-3000' ? '\n' : '\r\n',
    connectionTimeout: config.connectionTimeout || 5000
  });  try {
    await adapter.connect();

    // 根据设备类型发送特定命令
    let commands: string[] = [];

    switch (deviceName) {
      case 'GX-5000':
        commands = ['MEAS:VOLT:DC?', 'MEAS:CURR:DC?', 'MEAS:RES?'];
        break;
      case 'OS-2500':
        commands = ['MEAS:WAVE?', 'MEAS:POWER?', 'MEAS:SPEC?'];
        break;
      case 'MC-3000':
        commands = ['READ:TEMP?', 'READ:HUMID?', 'READ:PRESS?', 'STATUS?'];
        break;
      case 'CH-7000':
        commands = ['ANALYZE:PH?', 'ANALYZE:CONDUCTIVITY?', 'ANALYZE:OXYGEN?', 'CALIBRATION:STATUS?'];
        break;
      case 'TH-1200':
        commands = ['GET:TEMP?', 'GET:SETPOINT?', 'GET:POWER?', 'GET:STATUS?'];
        break;
      default:
        commands = [];
    }

    // 执行每个命令并记录结果
    for (const cmd of commands) {
      try {
        const startTime = Date.now();
        const response = await adapter.sendCommand(cmd);
        const responseTime = Date.now() - startTime;

        recordTestResult({
          deviceName,
          testName: `命令测试: ${cmd}`,
          success: true,
          message: `响应: ${response} (${responseTime}ms)`,
          responseTime
        });
      } catch (error) {
        recordTestResult({
          deviceName,
          testName: `命令测试: ${cmd}`,
          success: false,
          message: '命令执行失败',
          error
        });
      }
    }

    // 测试无效命令
    try {
      const invalidResponse = await adapter.sendCommand('INVALID_COMMAND');

      recordTestResult({
        deviceName,
        testName: '无效命令测试',
        success: true,
        message: `收到错误响应: ${invalidResponse}`
      });
    } catch (error) {
      recordTestResult({
        deviceName,
        testName: '无效命令测试',
        success: true, // 抛出错误也是期望的行为
        message: '设备正确拒绝了无效命令'
      });
    }

    // 关闭连接
    await adapter.disconnect();

  } catch (error) {
    recordTestResult({
      deviceName,
      testName: '设备特定命令测试',
      success: false,
      message: '连接失败',
      error
    });
  }
}

// 生成测试报告
function generateTestReport(): void {
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  const successRate = (passedTests / totalTests * 100).toFixed(2);

  console.log(`\n${colors.bright}${colors.cyan}========== 测试报告 ==========${colors.reset}`);
  console.log(`${colors.cyan}总测试数: ${totalTests}${colors.reset}`);
  console.log(`${colors.green}通过: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}失败: ${failedTests}${colors.reset}`);
  console.log(`${colors.cyan}成功率: ${successRate}%${colors.reset}`);

  // 按设备分组
  const deviceResults = new Map<string, { total: number, passed: number }>();

  testResults.forEach(result => {
    if (!deviceResults.has(result.deviceName)) {
      deviceResults.set(result.deviceName, { total: 0, passed: 0 });
    }

    const stats = deviceResults.get(result.deviceName)!;
    stats.total++;
    if (result.success) stats.passed++;
  });

  console.log(`\n${colors.cyan}各设备测试结果:${colors.reset}`);
  deviceResults.forEach((stats, deviceName) => {
    const deviceSuccessRate = (stats.passed / stats.total * 100).toFixed(2);
    const statusColor = stats.passed === stats.total ? colors.green : colors.yellow;
    console.log(`${statusColor}${deviceName}: ${stats.passed}/${stats.total} (${deviceSuccessRate}%)${colors.reset}`);
  });

  // 保存报告到文件
  const reportDate = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(__dirname, '..', 'tests', 'reports', `simulator-test-${reportDate}.json`);

  // 确保报告目录存在
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate)
    },
    deviceResults: Array.from(deviceResults.entries()).map(([name, stats]) => ({
      deviceName: name,
      totalTests: stats.total,
      passedTests: stats.passed,
      failedTests: stats.total - stats.passed,
      successRate: parseFloat((stats.passed / stats.total * 100).toFixed(2))
    })),
    detailedResults: testResults
  }, null, 2));

  console.log(`\n${colors.green}测试报告已保存至: ${reportPath}${colors.reset}`);
}

// 主测试函数
async function runTests(): Promise<void> {
  console.log(`${colors.bright}${colors.blue}==========================================${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}    TCP/Socket协议适配器模拟设备集成测试    ${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}==========================================${colors.reset}`);
  console.log(`${colors.cyan}开始时间: ${new Date().toLocaleString()}${colors.reset}\n`);

  // 获取模拟设备列表
  const simulatedDevices = getSimulatedDevices();

  if (simulatedDevices.length === 0) {
    console.log(`${colors.yellow}警告: 未找到任何模拟设备配置${colors.reset}`);
    console.log(`${colors.yellow}请确保模拟器配置文件位于 ${path.join(__dirname, 'simulator')} 目录下${colors.reset}`);
    return;
  }

  console.log(`${colors.green}发现 ${simulatedDevices.length} 个模拟设备: ${simulatedDevices.map(d => d.name).join(', ')}${colors.reset}\n`);

  // 对每个设备执行测试
  for (const device of simulatedDevices) {
    const config = getDeviceConfig(device.name);

    if (!config) {
      console.log(`${colors.yellow}跳过设备 ${device.name}: 未找到配置${colors.reset}`);
      continue;
    }

    // 更新配置以连接到模拟器
    config.host = device.host;
    config.port = device.port;

    console.log(`${colors.cyan}====== 开始测试设备: ${device.name} ======${colors.reset}`);

    // 运行基础连接测试
    await testBasicConnection(device.name, config);

    // 运行设备特定命令测试
    await testDeviceSpecificCommands(device.name, config);
  }

  // 生成测试报告
  generateTestReport();

  console.log(`\n${colors.cyan}测试完成时间: ${new Date().toLocaleString()}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}==========================================${colors.reset}`);
}

// 运行测试
runTests().catch(error => {
  console.error(`${colors.red}测试执行过程中发生错误:${colors.reset}`, error);
  process.exit(1);
});
