#!/usr/bin/env node

/**
 * 设备连接检查工具
 * 用于验证网络环境配置和设备连通性
 *
 * @version 1.0.0
 * @date 2025-07-23
 */

import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';
import * as os from 'os';
import * as dns from 'dns';
import * as childProcess from 'child_process';
import * as util from 'util';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { table } from 'table';
import chalk from 'chalk';

// 将异步操作转换为Promise
const exec = util.promisify(childProcess.exec);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// 命令行参数解析
const parseArgs = () => {
  return yargs(hideBin(process.argv))
    .option('config-dir', {
      type: 'string',
      description: '设备配置文件目录',
      default: path.join(process.cwd(), 'config', 'devices')
    })
    .option('output', {
      type: 'string',
      description: '输出报告文件路径',
      default: path.join(process.cwd(), 'reports', `network-check-${new Date().toISOString().replace(/:/g, '-')}.json`)
    })
    .option('ping', {
      type: 'boolean',
      description: '执行ping测试',
      default: true
    })
    .option('tcp', {
      type: 'boolean',
      description: '执行TCP连接测试',
      default: true
    })
    .option('latency', {
      type: 'boolean',
      description: '测试网络延迟',
      default: true
    })
    .option('timeout', {
      type: 'number',
      description: 'TCP连接超时时间(毫秒)',
      default: 5000
    })
    .option('verbose', {
      type: 'boolean',
      description: '详细输出',
      default: false
    })
    .parse();
};

// 获取本地网络信息
const getLocalNetworkInfo = async () => {
  const interfaces = os.networkInterfaces();
  const networkInfo = [];

  for (const [name, netInterface] of Object.entries(interfaces)) {
    if (netInterface) {
      for (const iface of netInterface) {
        if (iface.family === 'IPv4' && !iface.internal) {
          networkInfo.push({
            interface: name,
            address: iface.address,
            netmask: iface.netmask,
            mac: iface.mac
          });
        }
      }
    }
  }

  // 获取默认网关
  let gateway = 'Unknown';
  try {
    if (os.platform() === 'win32') {
      const { stdout } = await exec('ipconfig');
      const match = stdout.match(/Default Gateway.*?:\s*(\d+\.\d+\.\d+\.\d+)/);
      if (match && match[1]) {
        gateway = match[1];
      }
    } else {
      const { stdout } = await exec('ip route | grep default');
      const match = stdout.match(/default via (\d+\.\d+\.\d+\.\d+)/);
      if (match && match[1]) {
        gateway = match[1];
      }
    }
  } catch (error) {
    console.error('获取默认网关失败:', error.message);
  }

  return { interfaces: networkInfo, gateway };
};

// 检查DNS配置
const checkDNS = async () => {
  try {
    const servers = dns.getServers();
    return {
      servers,
      status: 'ok'
    };
  } catch (error) {
    return {
      servers: [],
      status: 'error',
      error: error.message
    };
  }
};

// 执行Ping测试
const pingHost = async (host) => {
  try {
    const pingCmd = os.platform() === 'win32'
      ? `ping -n 4 ${host}`
      : `ping -c 4 ${host}`;

    const { stdout } = await exec(pingCmd);

    // 解析ping结果
    const avgTimeMatch = stdout.match(/Average = (\d+)ms|avg.*?= .*?\/(\d+\.\d+).*/);
    const packetLossMatch = stdout.match(/(\d+)% (packet )?loss|(\d+)% 丢失/);

    const avgTime = avgTimeMatch
      ? (avgTimeMatch[1] || avgTimeMatch[2])
      : 'N/A';

    const packetLoss = packetLossMatch
      ? (packetLossMatch[1] || packetLossMatch[3])
      : 'N/A';

    return {
      host,
      status: 'reachable',
      avgTime: avgTime !== 'N/A' ? parseFloat(avgTime) : null,
      packetLoss: packetLoss !== 'N/A' ? parseInt(packetLoss, 10) : null,
      output: stdout
    };
  } catch (error) {
    return {
      host,
      status: 'unreachable',
      error: error.message
    };
  }
};

// 测试TCP连接
const testTcpConnection = (host, port, timeout = 5000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    let resolved = false;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      const connectTime = Date.now() - startTime;
      socket.end();
      resolved = true;
      resolve({
        host,
        port,
        status: 'connected',
        connectTime
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      if (!resolved) {
        resolved = true;
        resolve({
          host,
          port,
          status: 'timeout',
          error: `连接超时(${timeout}ms)`
        });
      }
    });

    socket.on('error', (err) => {
      socket.destroy();
      if (!resolved) {
        resolved = true;
        resolve({
          host,
          port,
          status: 'error',
          error: err.message
        });
      }
    });

    socket.connect(port, host);
  });
};

// 从配置文件加载设备信息
const loadDeviceConfigs = async (configDir) => {
  try {
    const files = fs.readdirSync(configDir).filter(file => file.endsWith('.json'));
    const devices = [];

    for (const file of files) {
      const filePath = path.join(configDir, file);
      try {
        const content = await readFile(filePath, 'utf8');
        const config = JSON.parse(content);

        if (config.connectionOptions && config.connectionOptions.host && config.connectionOptions.port) {
          devices.push({
            name: config.deviceName || path.basename(file, '.json'),
            type: config.deviceType || 'unknown',
            host: config.connectionOptions.host,
            port: config.connectionOptions.port,
            configFile: file
          });
        }
      } catch (error) {
        console.error(`读取配置文件 ${file} 失败:`, error.message);
      }
    }

    return devices;
  } catch (error) {
    console.error('加载设备配置失败:', error.message);
    return [];
  }
};

// 生成检查报告
const generateReport = (localNetwork, dnsInfo, pingResults, tcpResults) => {
  return {
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      release: os.release(),
      hostname: os.hostname()
    },
    network: localNetwork,
    dns: dnsInfo,
    pingTests: pingResults,
    tcpTests: tcpResults,
    summary: {
      totalDevices: pingResults.length,
      reachableDevices: pingResults.filter(r => r.status === 'reachable').length,
      connectableDevices: tcpResults.filter(r => r.status === 'connected').length
    }
  };
};

// 保存报告到文件
const saveReport = async (report, outputPath) => {
  try {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await writeFile(outputPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(chalk.green(`报告已保存到: ${outputPath}`));
    return true;
  } catch (error) {
    console.error('保存报告失败:', error.message);
    return false;
  }
};

// 显示网络信息表格
const displayNetworkInfo = (networkInfo) => {
  console.log(chalk.cyan.bold('\n本地网络信息:'));

  const interfaceData = [
    [chalk.bold('接口名称'), chalk.bold('IP地址'), chalk.bold('子网掩码'), chalk.bold('MAC地址')]
  ];

  for (const iface of networkInfo.interfaces) {
    interfaceData.push([
      iface.interface,
      iface.address,
      iface.netmask,
      iface.mac
    ]);
  }

  console.log(table(interfaceData));
  console.log(chalk.cyan(`默认网关: ${networkInfo.gateway}`));
  console.log(chalk.cyan(`DNS服务器: ${dns.getServers().join(', ')}`));
};

// 显示Ping测试结果表格
const displayPingResults = (results) => {
  console.log(chalk.cyan.bold('\nPing测试结果:'));

  const data = [
    [chalk.bold('设备'), chalk.bold('状态'), chalk.bold('平均延迟'), chalk.bold('丢包率')]
  ];

  for (const result of results) {
    data.push([
      result.host,
      result.status === 'reachable'
        ? chalk.green('可达')
        : chalk.red('不可达'),
      result.status === 'reachable'
        ? `${result.avgTime}ms`
        : '-',
      result.status === 'reachable'
        ? `${result.packetLoss}%`
        : '-'
    ]);
  }

  console.log(table(data));
};

// 显示TCP连接测试结果表格
const displayTcpResults = (results) => {
  console.log(chalk.cyan.bold('\nTCP连接测试结果:'));

  const data = [
    [chalk.bold('设备'), chalk.bold('端口'), chalk.bold('状态'), chalk.bold('连接时间')]
  ];

  for (const result of results) {
    data.push([
      result.host,
      result.port,
      result.status === 'connected'
        ? chalk.green('成功')
        : chalk.red('失败'),
      result.status === 'connected'
        ? `${result.connectTime}ms`
        : result.error || '-'
    ]);
  }

  console.log(table(data));
};

// 显示设备状态摘要
const displaySummary = (pingResults, tcpResults) => {
  const totalDevices = pingResults.length;
  const reachableDevices = pingResults.filter(r => r.status === 'reachable').length;
  const connectableDevices = tcpResults.filter(r => r.status === 'connected').length;

  console.log(chalk.cyan.bold('\n测试摘要:'));
  console.log(chalk.cyan(`总设备数: ${totalDevices}`));
  console.log(chalk.cyan(`Ping可达设备: ${reachableDevices}/${totalDevices} (${Math.round(reachableDevices/totalDevices*100)}%)`));
  console.log(chalk.cyan(`TCP可连接设备: ${connectableDevices}/${totalDevices} (${Math.round(connectableDevices/totalDevices*100)}%)`));

  if (reachableDevices === totalDevices && connectableDevices === totalDevices) {
    console.log(chalk.green.bold('\n所有设备都可访问，网络环境配置正确！'));
  } else if (reachableDevices === totalDevices && connectableDevices < totalDevices) {
    console.log(chalk.yellow.bold('\n所有设备Ping可达，但部分设备TCP连接失败。请检查防火墙配置或设备端口设置。'));
  } else if (reachableDevices < totalDevices) {
    console.log(chalk.red.bold('\n部分设备Ping不可达。请检查网络连接、IP地址配置或设备电源状态。'));
  }
};

// 主函数
const main = async () => {
  try {
    const args = parseArgs();

    console.log(chalk.cyan.bold('==================================='));
    console.log(chalk.cyan.bold('      设备连接检查工具 v1.0.0      '));
    console.log(chalk.cyan.bold('==================================='));
    console.log(chalk.cyan(`运行时间: ${new Date().toLocaleString()}`));

    // 获取本地网络信息
    console.log(chalk.cyan('\n获取本地网络信息...'));
    const localNetwork = await getLocalNetworkInfo();
    displayNetworkInfo(localNetwork);

    // 检查DNS配置
    console.log(chalk.cyan('\n检查DNS配置...'));
    const dnsInfo = await checkDNS();

    // 加载设备配置
    console.log(chalk.cyan('\n加载设备配置...'));
    const devices = await loadDeviceConfigs(args['config-dir']);
    console.log(chalk.green(`找到 ${devices.length} 个设备配置`));

    if (devices.length === 0) {
      console.log(chalk.yellow('没有找到设备配置，退出检查。'));
      return;
    }

    // 执行Ping测试
    const pingResults = [];
    if (args.ping) {
      console.log(chalk.cyan('\n执行Ping测试...'));
      for (const device of devices) {
        console.log(`Ping ${device.name} (${device.host})...`);
        const result = await pingHost(device.host);
        result.deviceName = device.name;
        result.deviceType = device.type;
        pingResults.push(result);
      }

      displayPingResults(pingResults);
    }

    // 执行TCP连接测试
    const tcpResults = [];
    if (args.tcp) {
      console.log(chalk.cyan('\n执行TCP连接测试...'));
      for (const device of devices) {
        console.log(`连接 ${device.name} (${device.host}:${device.port})...`);
        const result = await testTcpConnection(device.host, device.port, args.timeout);
        result.deviceName = device.name;
        result.deviceType = device.type;
        tcpResults.push(result);
      }

      displayTcpResults(tcpResults);
    }

    // 显示摘要
    displaySummary(pingResults, tcpResults);

    // 生成报告
    const report = generateReport(localNetwork, dnsInfo, pingResults, tcpResults);
    await saveReport(report, args.output);

  } catch (error) {
    console.error('执行检查时出错:', error);
  }
};

// 执行主函数
main();
