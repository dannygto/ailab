const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk'); // 可能需要先安装：npm install chalk

// 模拟器主脚本路径
const simulatorPath = path.join(__dirname, 'device-simulator.js');

// 获取所有模拟器配置文件
const configDir = __dirname;
const configFiles = fs.readdirSync(configDir)
  .filter(file => file.endsWith('-sim.json'))
  .map(file => path.join(configDir, file));

// 保存所有模拟器进程引用
const simulators = [];

// 启动所有模拟器
console.log(chalk.blue('=========================================='));
console.log(chalk.blue('      设备模拟器批量启动工具 v1.0         '));
console.log(chalk.blue('=========================================='));
console.log();

configFiles.forEach(configFile => {
  try {
    // 读取配置获取设备名称和端口
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    const { deviceName, port } = config;

    console.log(chalk.yellow(`正在启动 ${deviceName} 模拟器 (端口: ${port})...`));

    // 启动模拟器进程
    const simulator = spawn('node', [simulatorPath, '--config', configFile], {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false
    });

    // 保存进程引用
    simulators.push({
      process: simulator,
      name: deviceName,
      port: port
    });

    // 处理模拟器输出
    simulator.stdout.on('data', (data) => {
      console.log(chalk.green(`[${deviceName}:${port}] ${data.toString().trim()}`));
    });

    simulator.stderr.on('data', (data) => {
      console.error(chalk.red(`[${deviceName}:${port}] ERROR: ${data.toString().trim()}`));
    });

    // 处理模拟器退出
    simulator.on('close', (code) => {
      console.log(chalk.yellow(`[${deviceName}:${port}] 模拟器已关闭，退出码: ${code}`));
    });

  } catch (err) {
    console.error(chalk.red(`启动模拟器失败 (${configFile}): ${err.message}`));
  }
});

console.log();
console.log(chalk.green(`已启动 ${simulators.length} 个设备模拟器`));
console.log();

// 显示活跃模拟器状态
console.log(chalk.blue('活跃模拟器:'));
simulators.forEach(sim => {
  console.log(chalk.cyan(`- ${sim.name} (PID: ${sim.process.pid}, 端口: ${sim.port})`));
});

console.log();
console.log(chalk.yellow('按 Ctrl+C 关闭所有模拟器'));

// 优雅退出
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n正在关闭所有模拟器...'));

  // 关闭所有子进程
  simulators.forEach(sim => {
    try {
      process.kill(-sim.process.pid);
    } catch (err) {
      // 忽略错误
    }
  });

  console.log(chalk.green('所有模拟器已关闭'));
  process.exit(0);
});
