/**
 * 处理器设备模拟器启动脚本
 */

const net = require('net');
const crypto = require('crypto');

// 处理器设备配置
const config = {
  id: 'proc001',
  name: 'ProcessorSimulator',
  port: 8001,
  responseDelay: 50,
  errorRate: 0.01
};

// 命令处理器
const commandHandlers = {
  '*IDN?': () => {
    return `${config.name},SIM-${config.id},SN12345,v1.0`;
  },

  'STATUS?': () => {
    return 'READY';
  },

  'PROCESS': (params) => {
    const size = parseInt(params) || 100;
    return `PROCESSING ${size} SAMPLES...COMPLETE`;
  },

  'DATA?': () => {
    // 生成模拟数据
    let data = 'DATA:';
    const samples = 100;
    for(let i = 0; i < samples; i++) {
      data += `${Math.random().toFixed(4)},`;
    }
    return data.slice(0, -1);
  },

  'HELP': () => {
    return 'Available commands: *IDN?, STATUS?, PROCESS, DATA?, HELP';
  }
};

// 创建TCP服务器
const server = net.createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[${config.id}] New connection from ${clientAddress}`);

  // 处理数据
  socket.on('data', (data) => {
    const command = data.toString().trim();
    console.log(`[${config.id}] Received command: ${command}`);

    // 模拟处理延迟
    setTimeout(() => {
      // 模拟随机错误
      if (Math.random() < config.errorRate) {
        console.log(`[${config.id}] Simulating error response`);
        socket.write(`ERROR: Command processing failed\r\n`);
        return;
      }

      // 解析命令
      const spaceIndex = command.indexOf(' ');
      let cmd, args;

      if (spaceIndex === -1) {
        cmd = command;
        args = '';
      } else {
        cmd = command.substring(0, spaceIndex);
        args = command.substring(spaceIndex + 1);
      }

      // 执行命令
      const handler = commandHandlers[cmd];
      if (handler) {
        const response = handler(args);
        console.log(`[${config.id}] Sending response: ${response.substring(0, 50)}${response.length > 50 ? '...' : ''}`);
        socket.write(`${response}\r\n`);
      } else {
        console.log(`[${config.id}] Unknown command: ${cmd}`);
        socket.write(`ERROR: Unknown command: ${cmd}\r\n`);
      }
    }, config.responseDelay);
  });

  // 处理连接关闭
  socket.on('close', (hadError) => {
    console.log(`[${config.id}] Connection closed from ${clientAddress}${hadError ? ' due to error' : ''}`);
  });

  // 处理错误
  socket.on('error', (err) => {
    console.error(`[${config.id}] Socket error: ${err.message}`);
  });
});

// 启动服务器
server.listen(config.port, () => {
  console.log(`[${config.id}] ${config.name} started on port ${config.port}`);
});

// 错误处理
server.on('error', (err) => {
  console.error(`[${config.id}] Server error: ${err.message}`);

  if (err.code === 'EADDRINUSE') {
    console.error(`[${config.id}] Port ${config.port} is already in use. Please choose another port.`);
    process.exit(1);
  }
});

// 处理程序退出
process.on('SIGINT', () => {
  console.log(`[${config.id}] Shutting down...`);
  server.close(() => {
    console.log(`[${config.id}] Server stopped`);
    process.exit(0);
  });
});

console.log(`[${config.id}] Processor simulator running. Press Ctrl+C to stop.`);
