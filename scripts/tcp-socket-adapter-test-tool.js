/**
 * TCP/Socket适配器测试工具
 *
 * 用于测试TCP/Socket适配器与模拟设备的连接
 */

const net = require('net');
const readline = require('readline');

// 测试配置
const config = {
  processor: {
    host: 'localhost',
    port: 8001,
    useJson: false
  },
  sensor: {
    host: 'localhost',
    port: 8002,
    useJson: true
  }
};

// 当前连接的设备
let currentDevice = null;
let socket = null;

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

// 显示主菜单
function showMainMenu() {
  console.log('\n===== TCP/Socket适配器测试工具 =====');
  console.log('1. 连接处理器设备');
  console.log('2. 连接传感器设备');
  console.log('3. 断开当前连接');
  console.log('4. 发送命令');
  console.log('5. 运行测试套件');
  console.log('6. 退出');
  console.log('=====================================');
  rl.prompt();
}

// 连接到设备
function connectToDevice(deviceType) {
  if (socket && !socket.destroyed) {
    console.log('请先断开当前连接');
    rl.prompt();
    return;
  }

  const deviceConfig = config[deviceType];
  if (!deviceConfig) {
    console.log(`未知设备类型: ${deviceType}`);
    rl.prompt();
    return;
  }

  console.log(`正在连接到${deviceType}设备 (${deviceConfig.host}:${deviceConfig.port})...`);

  socket = net.createConnection({
    host: deviceConfig.host,
    port: deviceConfig.port
  }, () => {
    console.log(`已连接到${deviceType}设备`);
    currentDevice = deviceType;
    rl.prompt();
  });

  // 处理数据
  socket.on('data', (data) => {
    const response = data.toString().trim();

    try {
      if (deviceConfig.useJson) {
        // 尝试解析JSON响应
        const jsonResponse = JSON.parse(response);
        console.log('收到响应:');
        console.log(JSON.stringify(jsonResponse, null, 2));
      } else {
        console.log(`收到响应: ${response}`);
      }
    } catch (err) {
      console.log(`收到响应: ${response}`);
    }

    rl.prompt();
  });

  // 处理错误
  socket.on('error', (err) => {
    console.error(`连接错误: ${err.message}`);
    socket = null;
    currentDevice = null;
    rl.prompt();
  });

  // 处理连接关闭
  socket.on('close', () => {
    console.log('连接已关闭');
    socket = null;
    currentDevice = null;
    rl.prompt();
  });
}

// 断开连接
function disconnectFromDevice() {
  if (!socket || socket.destroyed) {
    console.log('当前没有活动连接');
    rl.prompt();
    return;
  }

  socket.end();
  console.log('已断开连接');
  socket = null;
  currentDevice = null;
  rl.prompt();
}

// 发送命令
function sendCommand(command) {
  if (!socket || socket.destroyed) {
    console.log('当前没有活动连接，请先连接设备');
    rl.prompt();
    return;
  }

  const deviceConfig = config[currentDevice];

  if (deviceConfig.useJson && !command.startsWith('{')) {
    // 自动格式化为JSON格式
    const jsonCommand = JSON.stringify({
      command: command,
      params: null
    });

    console.log(`发送命令: ${jsonCommand}`);
    socket.write(jsonCommand + '\r\n');
  } else {
    console.log(`发送命令: ${command}`);
    socket.write(command + '\r\n');
  }
}

// 处理器设备测试套件
function runProcessorTestSuite() {
  if (!socket || socket.destroyed || currentDevice !== 'processor') {
    console.log('请先连接到处理器设备');
    rl.prompt();
    return;
  }

  console.log('\n===== 运行处理器设备测试套件 =====');

  const commands = [
    '*IDN?',
    'STATUS?',
    'PROCESS 200',
    'DATA?',
    'INVALID_COMMAND'
  ];

  let index = 0;

  // 发送下一个命令
  function sendNextCommand() {
    if (index >= commands.length) {
      console.log('测试套件完成');
      rl.prompt();
      return;
    }

    const command = commands[index++];
    console.log(`\n测试 ${index}/${commands.length}: ${command}`);
    sendCommand(command);

    // 等待响应后发送下一个命令
    socket.once('data', () => {
      setTimeout(sendNextCommand, 500);
    });
  }

  sendNextCommand();
}

// 传感器设备测试套件
function runSensorTestSuite() {
  if (!socket || socket.destroyed || currentDevice !== 'sensor') {
    console.log('请先连接到传感器设备');
    rl.prompt();
    return;
  }

  console.log('\n===== 运行传感器设备测试套件 =====');

  const commands = [
    'GET_DATA',
    'GET_TEMPERATURE',
    'GET_HUMIDITY',
    'SET_UPDATE_INTERVAL 2000',
    'GET_DATA',
    'INVALID_COMMAND'
  ];

  let index = 0;

  // 发送下一个命令
  function sendNextCommand() {
    if (index >= commands.length) {
      console.log('测试套件完成');
      rl.prompt();
      return;
    }

    const command = commands[index++];
    console.log(`\n测试 ${index}/${commands.length}: ${command}`);

    if (config[currentDevice].useJson) {
      // 格式化为JSON命令
      const [cmd, ...params] = command.split(' ');
      const jsonCommand = JSON.stringify({
        command: cmd,
        params: params.join(' ') || null
      });

      console.log(`发送命令: ${jsonCommand}`);
      socket.write(jsonCommand + '\r\n');
    } else {
      console.log(`发送命令: ${command}`);
      socket.write(command + '\r\n');
    }

    // 等待响应后发送下一个命令
    socket.once('data', () => {
      setTimeout(sendNextCommand, 500);
    });
  }

  sendNextCommand();
}

// 运行测试套件
function runTestSuite() {
  if (!socket || socket.destroyed) {
    console.log('当前没有活动连接，请先连接设备');
    rl.prompt();
    return;
  }

  if (currentDevice === 'processor') {
    runProcessorTestSuite();
  } else if (currentDevice === 'sensor') {
    runSensorTestSuite();
  } else {
    console.log(`未知设备类型: ${currentDevice}`);
    rl.prompt();
  }
}

// 处理命令输入
rl.on('line', (line) => {
  const input = line.trim();

  if (input === '1') {
    connectToDevice('processor');
  } else if (input === '2') {
    connectToDevice('sensor');
  } else if (input === '3') {
    disconnectFromDevice();
  } else if (input === '4') {
    if (!socket || socket.destroyed) {
      console.log('当前没有活动连接，请先连接设备');
      rl.prompt();
    } else {
      console.log(`当前连接到: ${currentDevice}`);
      rl.question('请输入要发送的命令: ', (command) => {
        sendCommand(command);
      });
      return; // 跳过prompt
    }
  } else if (input === '5') {
    runTestSuite();
  } else if (input === '6') {
    console.log('正在退出...');
    if (socket && !socket.destroyed) {
      socket.end();
    }
    rl.close();
    process.exit(0);
  } else if (input === 'help' || input === '?') {
    showMainMenu();
  } else if (input === '') {
    rl.prompt();
  } else {
    console.log(`未知命令: ${input}`);
    console.log('输入 "help" 或 "?" 显示帮助');
    rl.prompt();
  }
}).on('close', () => {
  console.log('再见!');
  process.exit(0);
});

// 启动程序
console.log('TCP/Socket适配器测试工具');
console.log('========================');
console.log('这个工具用于测试TCP/Socket适配器与模拟设备的连接');
console.log('');
showMainMenu();
